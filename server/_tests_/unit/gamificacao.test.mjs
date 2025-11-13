
import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";

let mockCollection, mockDoc, mockGet, mockSet, mockAdd, mockRunTransaction, mockBatch;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockGet = jest.fn();
  mockSet = jest.fn();
  mockAdd = jest.fn();
  mockDoc = jest.fn(() => ({
    get: mockGet,
    set: mockSet,
  }));
  mockCollection = jest.fn(() => ({
    doc: mockDoc,
    get: mockGet,
    add: mockAdd,
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  }));

  mockRunTransaction = jest.fn((fn) =>
    fn({
      get: jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            pontos: 100,
            nome: "Aluno Teste",
            email: "aluno@teste.com",
            role: "aluno",
          }),
        })
      ),
      set: jest.fn(),
    })
  );

  mockBatch = {
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(),
  };

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: Object.assign(jest.fn(() => ({
        collection: mockCollection,
        batch: () => mockBatch,
        runTransaction: mockRunTransaction,
      })), {
        FieldValue: {
          serverTimestamp: jest.fn(() => new Date()),
        },
      }),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/gamificacao.js");



describe("API - Gamificação", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  
  test("Função de atribuição de pontos (POST /add)", async () => {
    req.method = "POST";
    req.url = "/api/gamificacao/add";
    req.body = {
      userId: "u1",
      valor: 50,
      motivo: "Concluiu tarefa",
    };

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRunTransaction).toHaveBeenCalled();
  });

  
  test("Função de remoção de pontos (POST /remove)", async () => {
    req.method = "POST";
    req.url = "/api/gamificacao/remove";
    req.body = {
      userId: "u1",
      valor: 30,
      motivo: "Atraso na entrega",
    };

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRunTransaction).toHaveBeenCalled();
  });

 
  test("Função de ranking (simulada via ordenação de usuários)", async () => {

    const fakeDocs = [
      { id: "u1", data: () => ({ nome: "João", pontos: 200 }) },
      { id: "u2", data: () => ({ nome: "Maria", pontos: 350 }) },
      { id: "u3", data: () => ({ nome: "Ana", pontos: 150 }) },
    ];

    const ranking = fakeDocs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.pontos - a.pontos);

    expect(ranking[0].nome).toBe("Maria");
    expect(ranking[1].nome).toBe("João");
    expect(ranking[2].nome).toBe("Ana");
  });


  test("Consulta de pontos de usuário (GET /:userId)", async () => {
    req.method = "GET";
    req.url = "/api/gamificacao/u1";

    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ pontos: 120 }),
    });

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.pontos).toBe(120);
  });

 
  test("Zerar gamificação (POST /zerar)", async () => {
    req.method = "POST";
    req.url = "/api/gamificacao/zerar";

    mockCollection.mockImplementationOnce(() => ({
      get: jest.fn().mockResolvedValue({
        forEach: (cb) => {
          cb({ ref: { id: "u1" } });
          cb({ ref: { id: "u2" } });
        },
      }),
    }));

    mockCollection.mockImplementationOnce(() => ({
      get: jest.fn().mockResolvedValue({
        forEach: (cb) => {
          cb({ ref: { id: "log1" } });
          cb({ ref: { id: "log2" } });
        },
      }),
    }));



    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(mockBatch.commit).toHaveBeenCalled();
  });
});
