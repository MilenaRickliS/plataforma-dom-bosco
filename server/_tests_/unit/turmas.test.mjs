import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


jest.unstable_mockModule("uuid", () => ({
  v4: jest.fn(() => "abc123-def456"),
}));


let mockGet, mockAdd, mockUpdate, mockDelete, mockDoc, mockCollection, mockWhere, mockAuth;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockGet = jest.fn();
  mockAdd = jest.fn().mockResolvedValue({ id: "turma123" });
  mockUpdate = jest.fn();
  mockDelete = jest.fn();
  mockWhere = jest.fn().mockReturnThis();

  mockDoc = jest.fn(() => ({
    get: mockGet,
    set: jest.fn(),
    update: mockUpdate,
    delete: mockDelete,
  }));

  mockCollection = jest.fn(() => ({
    doc: mockDoc,
    add: mockAdd,
    get: mockGet,
    where: mockWhere,
    limit: jest.fn().mockReturnThis(),
  }));

  mockAuth = {};

 
  const mockArrayUnion = jest.fn((value) => ["EXISTENTE", value]);

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      auth: jest.fn(() => mockAuth),
      firestore: Object.assign(jest.fn(() => ({ collection: mockCollection })), {
        FieldValue: { arrayUnion: mockArrayUnion },
      }),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { v4: uuidv4 } = await import("uuid");
const { default: handler } = await import("../../src/api/turmas.js");

describe("API - Turmas", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  
  test("POST /criar - Criação de turma gera código/link único", async () => {

    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ nome: "Prof Teste", foto: "foto.png" }),
    });

    req.method = "POST";
    req.url = "/api/turmas/criar";
    req.body = {
      nomeTurma: "Matemática",
      materia: "Álgebra",
      professorId: "prof123",
    };

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(mockAdd).toHaveBeenCalled();
    expect(typeof data.codigo).toBe("string");
    expect(data.codigo.length).toBe(6); 
  });


  test("POST /ingressar - Associação aluno à turma", async () => {
    req.method = "POST";
    req.url = "/api/turmas/ingressar";
    req.body = { codigo: "TURMA1", alunoId: "aluno1" };

  
    mockWhere.mockReturnValueOnce({
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "turma1",
            data: () => ({ professorId: "profX" }),
          },
        ],
      }),
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.message).toContain("Aluno adicionado");
    expect(admin.firestore.FieldValue.arrayUnion).toHaveBeenCalledWith("aluno1");
  });


  test("PATCH /arquivar - Arquivamento de turma", async () => {
    req.method = "PATCH";
    req.url = "/api/turmas/arquivar";
    req.query = { id: "turma123" };

    await handler(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({ arquivada: true });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain("arquivada");
  });


  test("PATCH /desarquivar - Reativação de turma", async () => {
    req.method = "PATCH";
    req.url = "/api/turmas/desarquivar";
    req.query = { id: "turma123" };

    await handler(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({ arquivada: false });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain("desarquivada");
  });


  test("DELETE / - Exclusão de turma sem alunos", async () => {
    req.method = "DELETE";
    req.query = { id: "turma123" };


    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ alunos: [] }),
    });

    await handler(req, res);

    expect(mockDelete).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain("Turma excluída");
  });
});
