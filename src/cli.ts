import yargs from 'yargs';
import shell from 'shelljs';

import { generateResources } from './generateResources';

type Argv = {
  src: string,
  keyMaxLength: number,
  ignoreFilesRegex: string;
}

const DEFAULT_TEST_FILE_REGEX = '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx|jsx)?$';

export const run = (argv: Argv) => {
  argv = yargs(argv || process.argv.slice(2))
    .usage(
      'Extract all string inside JSXElement'
    )
    .default('src', process.cwd())
    .describe(
      'src',
      'The source to collect strings'
    )
    .default('keyMaxLength', 40)
    .describe(
      'src',
      'The source to collect strings'
    )
    .default('ignoreFilesRegex', DEFAULT_TEST_FILE_REGEX)
    .describe(
      'ignoreFilesRegex',
      `The regex to ignore files in the source.\nThe files with this match is ignored by default:\n${DEFAULT_TEST_FILE_REGEX}`
    )
    .argv;
  
  const ignoreFilesRegex = new RegExp(argv.ignoreFilesRegex);
  const jsFiles = shell.find(argv.src).filter(path => /\.(js|ts|tsx)$/.test(path) && !ignoreFilesRegex.test(path));

  generateResources(jsFiles, argv.keyMaxLength);
};
