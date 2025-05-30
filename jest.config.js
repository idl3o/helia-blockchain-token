/**
 * Jest configuration for Helia Blockchain Token
 */

module.exports = {
  testMatch: ["**/*.test.js"],
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testTimeout: 30000
};
