import path from "path";

import { generateResources } from '../generateResources';

const defineTest = (dirName: string, testFilePrefix: string) => {
  const testName = `extra string from ${testFilePrefix}`;

  it(testName, () => {
    const fixtureDir = path.join(dirName, '..', '__testfixtures__');
    const inputPath = path.join(fixtureDir, testFilePrefix + '.input.tsx');

    const files = [inputPath];
    const i18nMap = generateResources(files);

    expect(i18nMap).toMatchSnapshot();
  });
};

describe('generateResources', () => {
  defineTest(__dirname, 'Classes');
});
