/*
get list of files from command line
parse each file to find JSXText (where the translable string should be extracted from)
generate a stable key for each string
generate i18n files based on this
 */
import shell from 'shelljs';
import * as babel from '@babel/core';
import fs  from 'graceful-fs';
import yargs from 'yargs';
import BabelPluginI18n from './BabelPluginI18n';

export const processFiles = (files: string[]) => {
  let phrases = [];
  for (const filename of files) {
    const source = fs.readFileSync(filename, 'utf8');

    babel.transformSync(source, {
      ast: false,
      code: false,
      plugins: [BabelPluginI18n],
      // TODO - add StringExtractPlugin
      // plugins: SyntaxPlugins.list.concat([[fbt, options]]),
      sourceType: 'unambiguous',
      filename,
    });

    const newPhrases = BabelPluginI18n.getExtractedStrings();

    phrases = [
      ...phrases,
      ...newPhrases,
    ];
  }

  console.log('all collected texts');
  console.log(phrases);
};

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
processFiles(jsFiles);
