import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  collectCoverage: true,
  // TODO: Exclude from build
  verbose: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary"],
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/packages/infra/cdk.out*"]
};

export default jestConfig;
