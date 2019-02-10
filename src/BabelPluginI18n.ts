import { PluginObj } from '@babel/core';
import { getStableKey, getStableValue } from './stableString';
import { isYupRequiredCall } from './visitorChecks';

let keyMaxLength = 40;
let phrases: string[] = [];
let i18nMap = {};

const addPhrase = (str: string) => {
  const key = getStableKey(str, keyMaxLength);
  const value = getStableValue(str);

  if (!key || !value) {
    return;
  }

  i18nMap[key] = value;
  phrases = [
    ...phrases,
    value,
  ];

  return { key, value };
};

function BabelPluginI18n(): PluginObj {
  return {
    name: 'i18n',
    visitor: {
      JSXText(path) {
        const { node } = path;

        if (node.value && node.value.trim()) {
          const { key } = addPhrase(node.value);

          if (!key) {
            return;
          }

          path.node.value = `t('${key}')`
        }
      },
      JSXAttribute(path) {
        const { node } = path;

        if (node.value.type === 'StringLiteral') {
          addPhrase(node.value.value);
        }
      },
      JSXExpressionContainer(path) {
        const { node } = path;

        if (node.expression.type === 'StringLiteral') {
          addPhrase(path.node.expression.value);
        }
      },
      CallExpression(path) {
        if (isYupRequiredCall(path)) {
          addPhrase(path.node.arguments[0].value)
        }
      }
    }
  }
}

BabelPluginI18n.clear = () => {
  phrases = [];
  i18nMap = {};
};
BabelPluginI18n.setMaxKeyLength = (maxLength: number) => {
  keyMaxLength = maxLength;
};
BabelPluginI18n.getExtractedStrings = () => phrases;
BabelPluginI18n.getI18Map = () => i18nMap;

export default BabelPluginI18n;
