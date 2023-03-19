/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  silent: false,
  verbose: true,
  // For ERROR: jest-haste-map: Haste module naming collision: plutomi
  // The following files share their name; please adjust your hasteImpl:
  modulePathIgnorePatterns: ['./cdk.out/*'],
};
