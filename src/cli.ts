import yargs from 'yargs';
import shell from 'shelljs';

import { generateResources } from './generateResources';

type Argv = {
  src: string,
  keyMaxLength: number,
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
    .argv;

  const jsFiles = shell.find(argv.src).filter(path => /\.(js|ts|tsx)$/.test(path));

  generateResources(jsFiles, argv.keyMaxLength);
};
