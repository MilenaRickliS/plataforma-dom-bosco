import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


let mockVerifyIdToken;
let mockGet;

jest.unstable_mockModule("firebase-admin", () => {
  mockVerifyIdToken = jest.fn();
  mockGet = jest.fn();

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      credential: { cert: jest.fn() },
      auth: jest.fn(() => ({
        verifyIdToken: mockVerifyIdToken,
      })),
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: mockGet,
        })),
      })),
    },
  };
});


const admin = (await import("firebase-admin")).default;
const { default: handler } = await import("../../src/api/auth.js");

describe("API - Autenticação de Login", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "POST",
      body: { idToken: "fakeToken" },
    });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  test("Deve retornar 200 e os dados do usuário com token válido", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "teste@dom.com" });

    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            email: "teste@dom.com",
            role: "admin",
            nome: "Milena",
            foto: "foto.png",
            ultimoLogin: "2025-11-12",
          }),
        },
      ],
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toMatchObject({
      email: "teste@dom.com",
      role: "admin",
      nome: "Milena",
    });
  });

  test("Deve retornar 401 se o token for inválido", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Token inválido"));

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data.message).toBe("Token inválido");
  });

  test("Deve retornar 403 se o usuário não existir no banco", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "naoexiste@teste.com" });
    mockGet.mockResolvedValue({ empty: true });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(403);
    expect(data.message).toBe("Usuário não encontrado no banco");
  });

  test("Deve retornar 400 se o token não for fornecido", async () => {
    req = httpMocks.createRequest({ method: "POST", body: {} });
    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(400);
    expect(data.message).toBe("Token não fornecido");
  });

  test("Deve retornar 405 se o método não for POST", async () => {
    req = httpMocks.createRequest({ method: "GET" });
    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(405);
    expect(data.message).toBe("Método não permitido");
  });
});
