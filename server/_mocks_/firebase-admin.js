const mockVerifyIdToken = jest.fn();
const mockCollection = jest.fn(() => ({
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
}));

const admin = {
  apps: [],
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
  firestore: jest.fn(() => ({
    collection: mockCollection,
  })),
};

export default admin;
