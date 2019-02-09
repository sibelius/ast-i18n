import childProcess from 'child_process';
import path from 'path';
import find from 'find';
import fs from 'fs';

import '../i18nTransfomerCodemod'

const getFixturesTest = () => {
  // find all fixtures
  const fixturesDir = path.join(__dirname, './fixtures');
  const fixtures = find.fileSync(fixturesDir);

  let fixturesTest: string[][] = [];
  const inputRegex = /(.+)\.input\.tsx$/;

  fixtures.map(filename => {
    const match = inputRegex.exec(filename);

    if (match) {
      const outputFileName = `${match[1]}.output.tsx`;
      try {
        const stats = fs.statSync(outputFileName);
        if (stats.isFile()) {
          fixturesTest = [
            ...fixturesTest,
            [
              filename,
              outputFileName,
            ],
          ];
        }
      } catch (e) {}
    }
  });

  return fixturesTest;
};

describe('integration', () => {

  const transformerPath = path.join(__dirname, '../i18nTransfomerCodemod');

  const fixturesTest = getFixturesTest();
  test.each(fixturesTest)(
    `.integration`, (input, output) => {
      console.log(`${path.basename(input)} -> ${path.basename(output)} `)

      const cp = childProcess.spawnSync('jscodeshift', [
        input,
        '-p',
        '-d',
        '-s',
        `-t ${transformerPath}.ts`
      ], {
        encoding: 'utf8',
        shell: true,
      });

      const transformed = cp.output[1];

      const expected = fs.readFileSync(output, 'utf8');

      expect(transformed.trim()).toEqual(expected.trim());
    },
  );
});
