import { PluginObj } from '@babel/core';
import { getStableKey, getStableValue } from './stableString';

let keyMaxLength = 40;
let phrases: string[] = [];
let i18nMap = {};

function BabelPluginI18n(): PluginObj {
  return {
    name: 'i18n',
    visitor: {
      JSXText(path) {
        const { node } = path;

        if (node.value && node.value.trim()) {
          const key = getStableKey(node.value, keyMaxLength);
          const value = getStableValue(node.value);

          if (!key || !value) {
            return;
          }

          i18nMap[key] = value;
          phrases = [
            ...phrases,
            value,
          ];

          path.node.value = `t('${key}')`
        }
      }
    }
  }
}

BabelPluginI18n.setMaxKeyLength = (maxLength: number) => {
  keyMaxLength = maxLength;
}
BabelPluginI18n.getExtractedStrings = () => phrases;
BabelPluginI18n.getI18Map = () => i18nMap;

export default BabelPluginI18n;
