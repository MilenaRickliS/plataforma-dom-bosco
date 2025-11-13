export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  moduleFileExtensions: ["js", "jsx"],
  setupFiles: ["<rootDir>/_tests_/setupTests.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  roots: ["<rootDir>/_tests_"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@babel/runtime)/)",
  ],
};
