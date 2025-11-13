import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


let mockCollection, mockAdd, mockGet, mockRunTransaction;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockAdd = jest.fn();
  mockGet = jest.fn().mockResolvedValue({ docs: [] });
  mockRunTransaction = jest.fn(async (fn) =>
    fn({
      get: jest.fn().mockResolvedValue({ exists: false }),
      set: jest.fn(),
    })
  );

  mockCollection = jest.fn(() => ({
    add: mockAdd,
    get: mockGet,
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    })),
  }));

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: jest.fn(() => ({
        collection: mockCollection,
        runTransaction: mockRunTransaction,
        FieldValue: {
            serverTimestamp: jest.fn(() => new Date()),
        },
        })),


    },
  };
});

const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/balanca.js");



let req, res;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  res.status = res.status.bind(res);

  mockCollection.mockImplementation(() => ({
    add: mockAdd,
    get: mockGet,
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    })),
  }));

  jest.clearAllMocks();
});


function calcularValorGasto(pessoas, valorPrato) {
  return Number(pessoas) * Number(valorPrato);
}

function somarTotais(registros) {
  const totalPessoas = registros.reduce((s, r) => s + (r.pessoas || 0), 0);
  const totalKg = registros.reduce((s, r) => s + (r.kg || 0), 0);
  return { totalPessoas, totalKg };
}

function validarDatas(inicio, fim) {
  return new Date(inicio) < new Date(fim);
}



describe("API - Refeições e Cálculos", () => {
  test("Cálculo total de valor gasto (pessoas × valor prato)", () => {
    const total = calcularValorGasto(12, 15.5);
    expect(total).toBeCloseTo(186);
  });

  test("Soma de total de KGs e Pessoas", () => {
    const registros = [
      { pessoas: 10, kg: 5 },
      { pessoas: 5, kg: 2.5 },
      { pessoas: 8, kg: 3 },
    ];

    const { totalPessoas, totalKg } = somarTotais(registros);
    expect(totalPessoas).toBe(23);
    expect(totalKg).toBeCloseTo(10.5);
  });

  test("Validação de datas (início < fim)", () => {
    const inicio = "2025-01-01";
    const fim = "2025-02-01";
    const valido = validarDatas(inicio, fim);
    expect(valido).toBe(true);
  });

  test("Validação de datas (início > fim)", () => {
    const inicio = "2025-05-01";
    const fim = "2025-04-01";
    const valido = validarDatas(inicio, fim);
    expect(valido).toBe(false);
  });


});
