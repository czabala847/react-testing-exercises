module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  transformIgnorePatterns: [
    String.raw`/node_modules/(?!(\.pnpm|react-router|cookie-es))`,
  ],
  transform: {
    "^.+\\.[cm]?[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/test-mocks/styleMock.js",
  },
};
