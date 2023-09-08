import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  collectCoverage: true,
  verbose: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary"],
  preset: "ts-jest",
  testPathIgnorePatterns: ["dist", "node_modules"]
};

export default jestConfig;
