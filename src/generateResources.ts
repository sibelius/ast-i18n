import fs from 'graceful-fs';
import * as babel from '@babel/core';
import BabelPluginI18n from './BabelPluginI18n';

import babelConfig from '../babel.config.js';

const resource = (i18nResource: {[key: string]: string}) => {
  const formatted = Object.keys(i18nResource)
    .map(key => `   '${key}': \`${i18nResource[key]}\``)
    .join(',\n');

  return `export default {
  translation: {
  ${formatted}
  }
}
`
};

export const generateResources = (files: string[]) => {
  let phrases = [];
  for (const filename of files) {
    const source = fs.readFileSync(filename, 'utf8');

    try {
      babel.transformSync(source, {
        ast: false,
        code: true,
        plugins: [...babelConfig.plugins, BabelPluginI18n],
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
    } catch (err) {
      console.log('err: ', filename, err);
    }
  }

  const i18nMap = BabelPluginI18n.getI18Map();

  fs.writeFileSync('resource.tsx', resource(i18nMap));

  console.log('all collected texts');
  console.log(phrases);
};
