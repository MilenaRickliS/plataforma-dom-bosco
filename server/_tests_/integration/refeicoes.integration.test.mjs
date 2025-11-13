
import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


const mockAdd = jest.fn(async (data) => ({ id: "fake123", data }));
const mockGet = jest.fn(async () => ({
  docs: [
    {
      id: "1",
      data: () => ({ pesoPrato: 0.5, pesoTotal: 10, totalPessoas: 5, criadoManual: true }),
    },
    {
      id: "2",
      data: () => ({ pesoPrato: 0.6, pesoTotal: 8, totalPessoas: 4, criadoManual: false }),
    },
  ],
}));
const mockOrderBy = jest.fn(() => ({ get: mockGet }));
const mockLimit = jest.fn(() => ({ get: mockGet }));
const mockDoc = jest.fn(() => ({
  get: jest.fn().mockResolvedValue({
    exists: true,
    data: () => ({ aberto: true, totalPessoas: 2, pesoTotal: 15 }),
  }),
  set: jest.fn(),
  update: jest.fn(),
}));
const mockRunTransaction = jest.fn(async (fn) =>
  fn({
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ aberto: true, totalPessoas: 3, pesoTotal: 20 }),
    }),
    set: jest.fn(),
  })
);
const fakeFieldValue = { serverTimestamp: jest.fn(() => new Date()) };

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  const fakeCollection = jest.fn(() => ({
    add: mockAdd,
    get: mockGet,
    orderBy: mockOrderBy,
    limit: mockLimit,
    doc: mockDoc,
  }));

  const fakeFirestoreInstance = {
    collection: fakeCollection,
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
const { default: handler } = await import("../../src/api/balanca.js");


describe("Integração - API /refeicoes", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });

  
  test("POST /?tipo=cicloManual cria registro manual", async () => {
    req.method = "POST";
    req.query = { tipo: "cicloManual" };
    req.body = { dataInicio: "2025-01-01", dataFim: "2025-01-02" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.sucesso).toBe(true);
    expect(mockAdd).toHaveBeenCalled();
  });

  
  test("GET /?tipo=ciclos lista registros de ciclos", async () => {
    req.method = "GET";
    req.query = { tipo: "ciclos" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.sucesso).toBe(true);
    expect(Array.isArray(data.ciclos)).toBe(true);
    expect(data.ciclos.length).toBeGreaterThan(0);
  });

 
  test("GET /?tipo=relatorio retorna totais corretos", async () => {
    req.method = "GET";
    req.query = { tipo: "relatorio" };

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.sucesso).toBe(true);
    expect(data.estatisticas.totalCiclos).toBeGreaterThan(0);
    expect(data.estatisticas.pessoasTotal).toBeGreaterThan(0);
    expect(data.estatisticas.pesoTotal).toBeGreaterThan(0);
  });
});
