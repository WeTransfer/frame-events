import type { Config } from "jest";

const config: Config = {
  displayName: "frame-events",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageReporters: ["text", "text-summary"],
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 90,
  //     statements: 90,
  //   },
  // },
};

export default config;
