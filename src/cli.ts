import yargs from 'yargs';
import shell from 'shelljs';

import { generateResources } from './generateResources';
import { filterFiles, DEFAULT_TEST_FILE_REGEX } from './filterFiles';

type Argv = {
  src: string,
  keyMaxLength: number,
  ignoreFilesRegex: string;
}

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
  
  const jsFiles = filterFiles(shell.find)(argv.src, argv.ignoreFilesRegex);

  generateResources(jsFiles, argv.keyMaxLength);
};
