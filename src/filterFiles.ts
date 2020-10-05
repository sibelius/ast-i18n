export const DEFAULT_TEST_FILE_REGEX =
  "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx|jsx)?$";

type ShellFind = (...path: Array<string | string[]>) => string[];

export const filterFiles = (shellFind: ShellFind) => (
  path: string,
  ignoreFilesRegex?: string
) => {
  const regex = new RegExp(ignoreFilesRegex || DEFAULT_TEST_FILE_REGEX);
  return shellFind(path).filter(
    (path) => /\.(js|ts|tsx)$/.test(path) && !regex.test(path)
  );
};
