import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";



let mockCollection, mockWhere, mockGet;
let mockCreateUser, mockGetUserByEmail, mockUpdateUser, mockDeleteUser;

jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        const stream = {
          end: (buf) => cb(null, { secure_url: "https://cloudinary.com/foto_teste.jpg" }),
        };
        return stream;
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
    config: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockGet = jest.fn();
  mockWhere = jest.fn(() => ({
    get: mockGet,
    limit: jest.fn(() => ({ get: mockGet })),
  }));

  mockCollection = jest.fn(() => ({
    where: mockWhere,
    get: mockGet,
    doc: jest.fn(() => ({
      id: "id_teste",
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    add: jest.fn(),
  }));

  mockCreateUser = jest.fn().mockResolvedValue({ uid: "uid_teste" });
  mockGetUserByEmail = jest.fn().mockResolvedValue({ uid: "uid_teste" });
  mockUpdateUser = jest.fn().mockResolvedValue();
  mockDeleteUser = jest.fn().mockResolvedValue();

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      auth: jest.fn(() => ({
        createUser: mockCreateUser,
        getUserByEmail: mockGetUserByEmail,
        updateUser: mockUpdateUser,
        deleteUser: mockDeleteUser,
      })),
      firestore: jest.fn(() => ({
        collection: mockCollection,
      })),
    },
  };
});


jest.unstable_mockModule("busboy", () => ({
  default: jest.fn(() => ({
    on: (event, fn) => {
      if (event === "field") {
        fn("email", "novo@teste.com");
        fn("senha", "123456");
        fn("nome", "Novo User");
      }

      
      if (event === "file") {
        const fakeFile = {
          on: (ev, cb) => {
            if (ev === "data") cb(Buffer.from("fake image"));
            if (ev === "end") cb();
          },
        };
        fn("foto", fakeFile);
      }

      if (event === "finish") setTimeout(fn, 10);
    },
  })),
}));


const { v2: cloudinary } = await import("cloudinary");
const admin = (await import("../../src/firebaseAdmin.js")).default;
const { default: handler } = await import("../../src/api/usuarios.js");


describe("Integração - Usuários API", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    req.pipe = jest.fn(); 
    res = httpMocks.createResponse();
    res.status = res.status.bind(res);
    jest.clearAllMocks();
  });


  test("GET /usuarios retorna lista de usuários", async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: "1", data: () => ({ nome: "Alice", email: "a@a.com" }) },
        { id: "2", data: () => ({ nome: "Bob", email: "b@b.com" }) },
      ],
    });

    req.method = "GET";
    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].nome).toBe("Alice");
    expect(data[1].email).toBe("b@b.com");
  });


  test("POST /usuarios cria novo usuário", async () => {
    req.method = "POST";
    req.headers = { "content-type": "multipart/form-data; boundary=----fake" };
    req.pipe = jest.fn(); 

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.message).toMatch(/sucesso/i);
    expect(mockCreateUser).toHaveBeenCalled();
  });

 
  test("PUT /usuarios atualiza nome e foto", async () => {
    req.method = "PUT";
    req.query = { emailOriginal: "existente@teste.com" };
    req.headers = { "content-type": "multipart/form-data; boundary=----fake" };
    req.pipe = jest.fn();

    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            nome: "Antigo Nome",
            role: "aluno",
            foto: "https://cloudinary.com/foto_antiga.jpg",
          }),
          ref: { update: jest.fn() },
        },
      ],
    });

    await handler(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.message).toMatch(/atualizado com sucesso/i);
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
  });
});
