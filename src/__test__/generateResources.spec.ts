import path from "path";

import { generateResources, getResourceSource } from '../generateResources';
import fs from "fs";
import BabelPluginI18n from '../BabelPluginI18n';

const defineTest = (dirName: string, testFilePrefix: string, only: boolean = false) => {
  const testName = `extra string from ${testFilePrefix}`;

  const myIt = only ? it.only : it;

  myIt(testName, () => {
    const fixtureDir = path.join(dirName, '..', '__testfixtures__');
    const inputPath = path.join(fixtureDir, testFilePrefix + '.input.tsx');
    const expectedOutput = fs.readFileSync(
      path.join(fixtureDir, testFilePrefix + '.resource.tsx'),
      'utf8'
    );

    const files = [inputPath];
    const i18nMap = generateResources(files);

    expect(getResourceSource(i18nMap).trim()).toEqual(expectedOutput.trim());
  });
};

describe('generateResources', () => {
  beforeEach(() => {
    BabelPluginI18n.clear();
  });

  defineTest(__dirname, 'Classes');
  defineTest(__dirname, 'Diacritics');
  defineTest(__dirname, 'ExpressionContainer');
  defineTest(__dirname, 'Functional');
  defineTest(__dirname, 'Props');
  defineTest(__dirname, 'Tsx');
  defineTest(__dirname, 'Yup');
});
