import { PluginObj } from '@babel/core';
import { getStableKey, getStableValue } from './stableString';

let phrases: string[] = [];
let i18nMap = {};

function BabelPluginI18n(): PluginObj {
  return {
    name: 'i18n',
    visitor: {
      JSXText(path) {
        const { node } = path;

        if (node.value && node.value.trim()) {
          phrases = [
            ...phrases,
            node.value,
          ];

          const key = getStableKey(node.value);

          i18nMap[key] = getStableValue(node.value);

          path.node.value = `t('${key}')`
        }
      }
    }
  }
}

BabelPluginI18n.getExtractedStrings = () => phrases;
BabelPluginI18n.getI18Map = () => i18nMap;

export default BabelPluginI18n;
