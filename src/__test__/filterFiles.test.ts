import { filterFiles, DEFAULT_TEST_FILE_REGEX } from "../filterFiles";

const mockFilesPath = [
  "src/__test__/filterFiles.test.ts",
  "src/__test__/generateResources.spec.ts",
  "src/__testfixtures__/CallExpression.input.tsx",
  "src/__testfixtures__/CallExpression.output.tsx",
  "src/userArgv.js",
  "src/visitorChecks.ts",
  "src/run.ex",
];

const shellFindMock = () => mockFilesPath;
const filterFilesWithShell = filterFiles(shellFindMock);

describe("filterFiles", () => {
  it(`should receive a path and return a list of files with (js|ts|tsx) extension and ignore files that match with ${DEFAULT_TEST_FILE_REGEX}`, () => {
    const files = filterFilesWithShell("./src");

    expect(files).toStrictEqual([
      "src/__testfixtures__/CallExpression.input.tsx",
      "src/__testfixtures__/CallExpression.output.tsx",
      "src/userArgv.js",
      "src/visitorChecks.ts",
    ]);
  });

  it("should receive a path, a custom regex and return a list of files with (js|ts|tsx) extension and ignore the files that match with regex", () => {
    const files = filterFilesWithShell("./src", "/(__testfixtures__|__test__)/");

    expect(files).toStrictEqual([
      "src/userArgv.js",
      "src/visitorChecks.ts",
    ]);
  });
});
