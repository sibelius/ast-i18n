import { PluginObj } from '@babel/core';
import { getStableString } from './stableString';

let phrases: string[] = [];

function BabelPluginI18n(): PluginObj {
  return {
    name: 'i18n',
    visitor: {
      JSXText(path) {
        const { node } = path;

        if (node.value) {
          phrases = [
            ...phrases,
            node.value,
          ];

          path.node.value = `t('${getStableString(node.value)}')`
        }
      }
    }
  }
}

BabelPluginI18n.getExtractedStrings = () => phrases;

export default BabelPluginI18n;
