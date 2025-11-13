import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";

let mockCollection, mockAdd, mockGet, mockDoc, mockSet, mockRunTransaction;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
 
  const fakeUserData = { nome: "Aluno Teste", email: "aluno@teste.com", role: "aluno", pontos: 100 };

  mockSet = jest.fn();
  mockAdd = jest.fn(async (data) => ({ id: "log123", data }));
  mockGet = jest.fn(async () => ({
    exists: true,
    data: () => fakeUserData,
    docs: [
      { id: "1", data: () => ({ tipo: "ganho", valor: 10, motivo: "Teste" }) },
      { id: "2", data: () => ({ tipo: "perda", valor: 5, motivo: "Erro" }) },
    ],
  }));

  mockDoc = jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: jest.fn(),
    delete: jest.fn(),
  }));

  mockCollection = jest.fn((colName) => ({
    doc: mockDoc,
    add: mockAdd,
    get: mockGet,
    where: jest.fn(() => ({ get: mockGet })),
  }));

  mockRunTransaction = jest.fn(async (fn) =>
    fn({
      get: jest.fn().mockResolvedValue({ exists: true, data: () => fakeUserData }),
      set: mockSet,
    })
  );

  const fakeFieldValue = {
    serverTimestamp: jest.fn(() => new Date()),
  };

  const fakeFirestoreInstance = {
    collection: mockCollection,
    runTransaction: mockRunTransaction,
    FieldValue: fakeFieldValue,
  };

  const fakeFirestore = jest.fn(() => fakeFirestoreInstance);
  fakeFirestore.FieldValue = fakeFieldValue;

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: fakeFirestore,
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/gamificacao.js");

describe("Integração - API /gamificacao", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });

  test("PATCH /add adiciona pontos ao usuário", async () => {
    req.method = "POST";
    req.url = "/add";
    req.body = { userId: "user1", valor: 20, motivo: "Atividade concluída" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRunTransaction).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
  });

  test("PATCH /remove remove pontos do usuário", async () => {
    req.method = "POST";
    req.url = "/remove";
    req.body = { userId: "user1", valor: 10, motivo: "Erro na atividade" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRunTransaction).toHaveBeenCalled();
  });

 
  test("GET /logs retorna histórico de gamificação", async () => {
    req.method = "GET";
    req.url = "/logs/user1";
    req.query = { userId: "user1" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.pontos).toBeDefined();
    expect(mockGet).toHaveBeenCalled();
  });
});
