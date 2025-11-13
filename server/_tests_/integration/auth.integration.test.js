
import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";


let mockVerifyIdToken, mockCollection, mockWhere, mockLimit, mockGet;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockVerifyIdToken = jest.fn();
  mockGet = jest.fn();
  mockLimit = jest.fn(() => ({ get: mockGet }));
  mockWhere = jest.fn(() => ({ limit: mockLimit }));

  mockCollection = jest.fn(() => ({
    where: mockWhere,
    limit: mockLimit,
    get: mockGet,
  }));

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      auth: jest.fn(() => ({
        verifyIdToken: mockVerifyIdToken,
      })),
      firestore: jest.fn(() => ({
        collection: mockCollection,
      })),
    },
  };
});


const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/auth.js"); 



describe("Integração - Autenticação /login", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });


  test("POST /login retorna 200 com token válido", async () => {
    req.method = "POST";
    req.body = { idToken: "token_valido" };

   
    mockVerifyIdToken.mockResolvedValue({
      email: "teste@exemplo.com",
    });

    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            email: "teste@exemplo.com",
            role: "admin",
            nome: "Usuário Teste",
            foto: "foto.png",
            ultimoLogin: "2025-01-01",
          }),
        },
      ],
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.email).toBe("teste@exemplo.com");
    expect(data.role).toBe("admin");
    expect(mockVerifyIdToken).toHaveBeenCalledWith("token_valido");
  });


  test("POST /login retorna 401 com token inválido", async () => {
    req.method = "POST";
    req.body = { idToken: "token_invalido" };

    mockVerifyIdToken.mockRejectedValue(new Error("Token inválido"));

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data.message).toBe("Token inválido");
  });
});
