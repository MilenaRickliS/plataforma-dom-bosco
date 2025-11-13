
import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


let mockCollection, mockDoc, mockWhere, mockAdd, mockGet, mockOrderBy, mockSet, mockDelete;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockAdd = jest.fn(async (data) => ({ id: "pub123", data }));
  mockSet = jest.fn(async () => ({}));
  mockGet = jest.fn(async () => ({
    exists: true,
    id: "pub123",
    data: () => ({
      titulo: "Atividade de Matemática",
      tipo: "avaliacao",
      usuarioId: "prof1",
    }),
  }));
  mockOrderBy = jest.fn(() => ({ get: mockGet }));
  mockWhere = jest.fn(() => ({ orderBy: mockOrderBy, get: mockGet }));
  mockDoc = jest.fn(() => ({
    id: "pub123",
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: mockGet,
        set: mockSet,
        collection: jest.fn(() => ({
          add: mockAdd,
          doc: jest.fn(() => ({ set: mockSet })),
          orderBy: jest.fn(() => ({ get: mockGet })),
        })),
      })),
      add: mockAdd,
      get: mockGet,
      orderBy: jest.fn(() => ({ get: mockGet })),
    })),
  }));
  mockCollection = jest.fn(() => ({
    add: mockAdd,
    where: mockWhere,
    orderBy: mockOrderBy,
    doc: mockDoc,
    get: mockGet,
  }));

  
  const fakeTimestamp = {
    now: jest.fn(() => new Date()),
    fromDate: jest.fn((d) => d),
  };
  const fakeFieldValue = { arrayUnion: jest.fn() };

  const fakeFirestore = jest.fn(() => ({
    collection: mockCollection,
    FieldValue: fakeFieldValue,
    Timestamp: fakeTimestamp,
  }));

  
  fakeFirestore.Timestamp = fakeTimestamp;
  fakeFirestore.FieldValue = fakeFieldValue;

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: fakeFirestore,
      auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
      })),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handlerPublicacoes } = await import("../../src/api/publicacoes.js");
const { default: handlerRespostas } = await import("../../src/api/respostas.js");



describe("Integração - API /publicacoes e /respostas", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });

 
  test("POST /publicacoes cria nova atividade", async () => {
    req.method = "POST";
    req.body = {
      usuarioId: "prof1",
      titulo: "Prova de Matemática",
      tipo: "avaliacao",
    };

    await handlerPublicacoes(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.ok).toBe(true);
    expect(data.id).toBe("pub123");
    expect(mockAdd).toHaveBeenCalled();
  });

 
  test("GET /publicacoes retorna lista e detalhes corretos", async () => {
    req.method = "GET";
    req.query = { tipo: "avaliacao" };

    mockGet.mockResolvedValueOnce({
      docs: [
        { id: "pub123", data: () => ({ titulo: "Prova 1", tipo: "avaliacao" }) },
        { id: "pub124", data: () => ({ titulo: "Prova 2", tipo: "avaliacao" }) },
      ],
    });

    await handlerPublicacoes(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].titulo).toBe("Prova 1");
  });


  test("POST /respostas salva resposta do aluno", async () => {
    req.method = "POST";
    req.body = {
      avaliacaoId: "pub123",
      alunoId: "aluno1",
      questoes: [
        { questaoId: "q1", resposta: "A", valorObtido: 1 },
        { questaoId: "q2", resposta: "B", valorObtido: 0 },
      ],
      notaTotal: 1,
    };

    await handlerRespostas(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.ok).toBe(true);
    expect(data.message).toMatch(/sucesso/i);
    expect(mockAdd).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalled();
  });
});
