/*
get list of files from command line
parse each file to find JSXText (where the translable string should be extracted from)
generate a stable key for each string
generate i18n files based on this
 */
import shell from 'shelljs';
import * as babel from '@babel/core';
import fs  from 'graceful-fs';

export const processFiles = async (files: string[]) => {
  for (const filename of files) {
    const source = fs.readFileSync(filename, 'utf8');

    babel.transformSync(source, {
      ast: false,
      code: false,
      // TODO - add StringExtractPlugin
      // plugins: SyntaxPlugins.list.concat([[fbt, options]]),
      sourceType: 'unambiguous',
      filename,
    });
  }
};

(async () => {
  // TODO - get this from command line
  const src = './fixtures';

  const jsFiles = shell.find(src).filter(path => /\.(js|ts|tsx)$/.test(path));

  await processFiles(jsFiles);
})();
