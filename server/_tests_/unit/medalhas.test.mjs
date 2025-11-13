import { jest } from "@jest/globals";
import httpMocks from "node-mocks-http";

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) }));


jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(() => jest.fn()),
    },
    config: jest.fn(),
  },
}));


let mockGet, mockAdd, mockSet, mockDelete, mockDoc, mockCollection, mockWhere, mockBatch;

jest.unstable_mockModule("../../src/firebaseAdmin.js", () => {
  mockGet = jest.fn();
  mockAdd = jest.fn().mockResolvedValue({ id: "medal123" });
  mockSet = jest.fn();
  mockDelete = jest.fn();
  mockWhere = jest.fn().mockReturnThis();
  mockDoc = jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockSet,
    delete: mockDelete,
  }));
  mockCollection = jest.fn(() => ({
    add: mockAdd,
    doc: mockDoc,
    get: mockGet,
    where: mockWhere,
    orderBy: jest.fn().mockReturnThis(),
  }));

  mockBatch = {
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(),
  };

  return {
    default: {
      apps: [],
      initializeApp: jest.fn(),
      firestore: Object.assign(jest.fn(() => ({
        collection: mockCollection,
        batch: () => mockBatch,
      })), {
        FieldValue: {
          serverTimestamp: jest.fn(() => new Date()),
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
const { v2: cloudinary } = await import("cloudinary");
const { default: handler } = await import("../../src/api/medalhas.js");


describe("API - Medalhas", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

 
    test("Criação de medalha (template)", async () => {
    req.method = "POST";
    req.url = "/api/medalhas/templates";
    req.body = {
        title: "Medalha Ouro",
        ownerProfessorId: "prof1",
        unique: true,
        category: "esforço",
        color: "#FFD700",
    };
    req.file = { buffer: Buffer.from("fake-image") };

    const mockUploadStream = jest.fn((opts, cb) => {
        cb(null, { secure_url: "https://cloudinary.com/fake.jpg" });
        return { end: jest.fn() };
    });
    cloudinary.uploader.upload_stream.mockImplementation(mockUploadStream);

    mockAdd.mockResolvedValueOnce({
        id: "tpl123",
        get: jest.fn().mockResolvedValue({
        data: () => ({
            title: "Medalha Ouro",
            imageUrl: "https://cloudinary.com/fake.jpg",
        }),
        }),
    });

    const handlerPromise = handler(req, res);
    await Promise.resolve(handlerPromise);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data.id).toBe("tpl123");
    expect(data.imageUrl).toContain("cloudinary.com");
    }, 10000); 

 
  test("Atribuição de medalha a alunos", async () => {
    req.method = "POST";
    req.url = "/api/medalhas/atribuir";
    req.body = {
      professorId: "prof1",
      templateId: "tpl123",
      alunos: ["a1", "a2"],
      comment: "Destaque da semana",
    };

    
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        title: "Medalha Ouro",
        unique: false,
      }),
    });

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(mockBatch.set).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();
    expect(data.awarded).toBe(2);
  });

  
  test("Remoção/desvinculação de medalha", async () => {
    req.method = "DELETE";
    req.url = "/api/medalhas/aluno/award/award123";

    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ studentId: "a1", templateId: "tpl123" }),
    });

    await handler(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
  });
});
