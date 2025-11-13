import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";
import { v4 as uuidv4 } from "uuid";



let mockCollection, mockDoc, mockWhere, mockAdd, mockUpdate, mockGet, mockFieldValue;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockAdd = jest.fn(async (data) => ({ id: "turma123", data }));
  mockUpdate = jest.fn();
  mockGet = jest.fn();
  mockWhere = jest.fn(() => ({
    limit: jest.fn(() => ({ get: mockGet })),
    get: mockGet,
  }));
  mockDoc = jest.fn(() => ({
    id: "turma123",
    get: mockGet,
    update: mockUpdate,
    delete: jest.fn(),
  }));
  mockCollection = jest.fn(() => ({
    add: mockAdd,
    doc: mockDoc,
    where: mockWhere,
    get: mockGet,
  }));
  mockFieldValue = {
    arrayUnion: jest.fn(),
  };

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: jest.fn(() => ({
        collection: mockCollection,
        FieldValue: mockFieldValue,
      })),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/turmas.js");



describe("Integração - API /turmas", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });


  test("POST /turmas/criar cria nova turma com professor", async () => {
    req.method = "POST";
    req.url = "/turmas/criar";
    req.body = {
      nomeTurma: "Matemática Avançada",
      materia: "Matemática",
      imagem: "img.png",
      professorId: "prof123",
    };

    
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ nome: "Prof. João", foto: "foto.png" }),
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("codigo");
    expect(mockAdd).toHaveBeenCalled();
  });

 
  test("GET /turmas/:id retorna detalhes da turma e alunos", async () => {
    req.method = "GET";
    req.query = { id: "turma123" };

    
    mockGet
      .mockResolvedValueOnce({
        exists: true,
        id: "turma123",
        data: () => ({
          nomeTurma: "História",
          materia: "História",
          professorId: "prof123",
          alunos: ["aluno1"],
        }),
      })
     
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ nome: "Prof. Maria", foto: "foto.jpg" }),
      });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.nomeTurma).toBe("História");
    expect(data.professorNome).toBe("Prof. Maria");
  });


  test("PATCH /turmas?action=arquivar arquiva turma corretamente", async () => {
    req.method = "PATCH";
    req.url = "/turmas";
    req.query = { id: "turma123", action: "arquivar" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.message).toMatch(/arquivada com sucesso/i);
    expect(mockUpdate).toHaveBeenCalledWith({ arquivada: true });
  });
});
