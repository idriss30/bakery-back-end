module.exports = {
  testEnvironment: "node",
  globalSetup: "<rootDir>/database/migrateDatabase.js",
  setupFilesAfterEnv: [
    "jest-extended/all",
    "<rootDir>/database/truncateTables.js",
    "<rootDir>/database/seedUser.js",
    "<rootDir>/database/disconnectDb.js",
  ],
};
