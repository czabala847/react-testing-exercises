module.exports = {
  testEnvironment: "jest-fixed-jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  transformIgnorePatterns: [
    String.raw`/node_modules/(?!(\.pnpm|react-router|cookie-es|rettime|headers-polyfill|until-async|@open-draft))`,
  ],
  transform: {
    "^.+\\.[cm]?[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/src/test-mocks/styleMock.js",
  },
};
