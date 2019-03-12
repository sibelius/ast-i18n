import fs from 'graceful-fs';
import * as babel from '@babel/core';
import prettier, { Options } from 'prettier';

import BabelPluginI18n from './BabelPluginI18n';

import babelConfig from '../babel.config.js';

export const resource = (i18nResource: {[key: string]: string}) => {
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

const prettierDefaultConfig: Options = {
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  parser: 'babel',
};

export const getResourceSource = (i18nResource: {[key: string]: string}) => {
  const source = resource(i18nResource);

  return prettier.format(source, prettierDefaultConfig);
};

export const generateResources = (files: string[], keyMaxLength: number = 40) => {
  BabelPluginI18n.setMaxKeyLength(keyMaxLength);

  let phrases = [];
  for (const filename of files) {
    const source = fs.readFileSync(filename, 'utf8');

    try {
      babel.transformSync(source, {
        ast: false,
        code: true,
        plugins: [...babelConfig.plugins, BabelPluginI18n],
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

  // tslint:disable-next-line
  console.log('generate resource file: resource.tsx');

  return i18nMap;
};
