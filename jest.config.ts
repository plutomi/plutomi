import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  collectCoverage: true,
  // TODO: Exclude from build
  verbose: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary"],
  projects: ["<rootDir>", "<rootDir>/packages/*"],
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/packages/infra/cdk.out*"]
};

export default jestConfig;
