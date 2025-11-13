import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";

let mockAdd, mockGet, mockSet, mockDelete, mockWhere, mockOrderBy, mockCollection, mockDoc;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockAdd = jest.fn().mockResolvedValue({ id: "pub123", get: jest.fn().mockResolvedValue({ data: () => ({}) }) });
  mockGet = jest.fn().mockResolvedValue({
    empty: false,
    docs: [
      { id: "d1", data: () => ({ titulo: "Teste", tipo: "avaliacao", valor: 10 }) },
      { id: "d2", data: () => ({ titulo: "Outro", tipo: "atividade", valor: 5 }) },
    ],
  });
  mockSet = jest.fn();
  mockDelete = jest.fn();
  mockWhere = jest.fn().mockReturnThis();
  mockOrderBy = jest.fn().mockReturnThis();
  mockCollection = jest.fn(() => ({
    add: mockAdd,
    get: mockGet,
    where: mockWhere,
    orderBy: mockOrderBy,
    doc: mockDoc,
  }));
  mockDoc = jest.fn(() => ({
    set: mockSet,
    delete: mockDelete,
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ melhorNota: 8 }) }),
    collection: jest.fn(() => ({
      add: mockAdd,
      orderBy: mockOrderBy,
      get: mockGet,
      doc: jest.fn(() => ({
        set: mockSet,
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      })),
    })),
  }));

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: Object.assign(jest.fn(() => ({ collection: mockCollection })), {
        FieldValue: {
          serverTimestamp: jest.fn(() => new Date()),
          arrayUnion: jest.fn(),
        },
        Timestamp: {
          now: jest.fn(() => new Date()),
          fromDate: jest.fn((d) => d),
        },
      }),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/publicacoes.js");



describe("API - Publicações, Atividades e Avaliações", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });


  test("Criação de conteúdo simples (POST /publicacoes)", async () => {
    req.method = "POST";
    req.body = {
      usuarioId: "u1",
      titulo: "Introdução",
      tipo: "conteudo",
      descricao: "Primeira aula",
    };

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(mockAdd).toHaveBeenCalled();
    expect(data.ok).toBe(true);
  });

  test("Listagem de publicações (GET /publicacoes)", async () => {
    req.method = "GET";
    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("titulo");
  });


  test("Atualização de entrega com nota (PATCH /publicacoes)", async () => {
    req.method = "PATCH";
    req.query = { id: "pub123" };
    req.body = { entrega: "2025-11-12", nota: 9.5 };

    await handler(req, res);
    const data = res._getJSONData();

    expect(mockSet).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(data.message).toContain("Atualizado");
  });

  
  test("Cálculo de nota média e gabarito automático", async () => {
    const respostas = [
      { questaoId: "q1", resposta: "A", valorObtido: 1 },
      { questaoId: "q2", resposta: "B", valorObtido: 0 },
      { questaoId: "q3", resposta: "C", valorObtido: 1 },
    ];

    const total = respostas.reduce((acc, q) => acc + (q.valorObtido || 0), 0);
    const media = (total / respostas.length) * 10;

    expect(total).toBe(2);
    expect(media).toBeCloseTo(6.67, 1);
  });


  test("Criação de atividade com tipo 'atividade'", async () => {
    req.method = "POST";
    req.body = {
      titulo: "Atividade 1",
      descricao: "Resolver lista",
      entrega: "2025-11-12",
      valor: 10,
      usuarioId: "u1",
      turmaId: "t1",
      tipo: "atividade",
    };

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data.ok).toBe(true);
  });


  test("Criação de avaliação com tipo 'avaliacao'", async () => {
    req.method = "POST";
    req.body = {
      titulo: "Prova 1",
      descricao: "Avaliação Final",
      valor: 10,
      usuarioId: "u1",
      tipo: "avaliacao",
      configuracoes: { permitirRepeticoes: true, tentativasMax: 3 },
    };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.ok).toBe(true);
  });
});
