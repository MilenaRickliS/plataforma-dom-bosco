import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";

jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(() => jest.fn()),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
    config: jest.fn(),
  },
}));

let mockCollection, mockGet, mockSet, mockUpdate, mockDelete, mockWhere, mockAuth;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {

  mockGet = jest.fn();
  mockSet = jest.fn();
  mockUpdate = jest.fn();
  mockDelete = jest.fn();
  mockWhere = jest.fn().mockReturnThis();

  mockCollection = jest.fn(() => ({
    where: mockWhere,
    limit: jest.fn().mockReturnThis(),
    get: mockGet,
    doc: jest.fn(() => ({
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    })),
  }));

  mockAuth = {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      auth: jest.fn(() => mockAuth),
      firestore: jest.fn(() => ({
        collection: mockCollection,
      })),
    },
  };
});

jest.unstable_mockModule("busboy", () => {
  return {
    default: jest.fn(() => {
      const handlers = {};
      return {
        on: (event, cb) => {
          handlers[event] = cb;
          if (event === "finish") {
           
            setImmediate(() => cb());
          }
        },
      };
    }),
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { v2: cloudinary } = await import("cloudinary");
const { default: handler } = await import("../../src/api/usuarios.js");

describe("API - Usuários", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

 
  test("GET - Retorna lista de usuários", async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: "1", data: () => ({ nome: "João", role: "aluno" }) },
        { id: "2", data: () => ({ nome: "Maria", role: "professor" }) },
      ],
    });

    req.method = "GET";
    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].nome).toBe("João");
  });


  test("POST - Criação de usuário com campos obrigatórios", async () => {
    req.method = "POST";
    req.headers = { "content-type": "multipart/form-data" };
    req.pipe = jest.fn(); 

  
    mockAuth.createUser.mockResolvedValue({ uid: "123" });

    
    mockGet.mockResolvedValue({ docs: [] });

    await handler(req, res);

    expect(res.statusCode).toBe(400); 
    expect(res._getJSONData().message).toContain("E-mail e senha obrigatórios");
  });

  test("PUT - Edição de usuário existente", async () => {
    req.method = "PUT";
    req.query = { emailOriginal: "joao@teste.com" };
    req.headers = { "content-type": "multipart/form-data" };
    req.pipe = jest.fn();

    
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            nome: "João",
            role: "aluno",
            foto: "",
          }),
          ref: { update: mockUpdate },
        },
      ],
    });

    await handler(req, res);

    expect(mockUpdate).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain("Usuário atualizado com sucesso");
  });

 
  test("DELETE - Exclusão de usuário existente", async () => {
    req.method = "DELETE";
    req.query = { email: "teste@dom.com" };

   
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "1",
          data: () => ({
            email: "teste@dom.com",
            foto: "https://cloudinary.com/usuarios/foto.png",
          }),
        },
      ],
    });

    mockAuth.getUserByEmail.mockResolvedValue({ uid: "123" });
    mockAuth.deleteUser.mockResolvedValue({});

    await handler(req, res);

    expect(mockAuth.deleteUser).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toContain("Usuário e foto excluídos");
  });

 
  test("GET - Retorno filtrado por tipo (aluno/professor/admin)", async () => {
    const mockDocs = [
      { id: "1", data: () => ({ nome: "Aluno 1", role: "aluno" }) },
      { id: "2", data: () => ({ nome: "Prof 1", role: "professor" }) },
      { id: "3", data: () => ({ nome: "Admin 1", role: "admin" }) },
    ];
    mockGet.mockResolvedValue({ docs: mockDocs });

    req.method = "GET";
    await handler(req, res);

    const data = res._getJSONData();
    const alunos = data.filter((u) => u.role === "aluno");
    const profs = data.filter((u) => u.role === "professor");
    const admins = data.filter((u) => u.role === "admin");

    expect(alunos.length).toBe(1);
    expect(profs.length).toBe(1);
    expect(admins.length).toBe(1);
  });
});
