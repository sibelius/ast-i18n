/*
get list of files from command line
parse each file to find JSXText (where the translable string should be extracted from)
generate a stable key for each string
generate i18n files based on this
 */
import shell from 'shelljs';
import yargs from 'yargs';

import { generateResources } from './generateResources';


const argv = yargs
  .usage(
    'Extract all string inside JSXElement'
  )
  .default('src', process.cwd())
  .describe(
    'src',
    'The source to collect strings'
  )
  .argv;

const jsFiles = shell.find(argv.src).filter(path => /\.(js|ts|tsx)$/.test(path));
generateResources(jsFiles);
