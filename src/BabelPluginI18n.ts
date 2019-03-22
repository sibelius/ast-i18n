import { PluginObj } from '@babel/core';
import { getStableKey, getStableValue } from './stableString';
import {
  hasStringLiteralArguments,
  hasStringLiteralJSXAttribute,
  isSvgElementAttribute
} from "./visitorChecks";

let keyMaxLength = 40;
let phrases: string[] = [];
let i18nMap = {};

const addPhrase = (str: string) => {
  const key = getStableKey(str, keyMaxLength);
  const value = getStableValue(str);

  if (!key || !value) {
    return null;
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
          const values = addPhrase(node.value);

          if (!values) {
            return;
          }

          path.node.value = `t('${values.key}')`
        }
      },
      JSXAttribute(path) {
        const { node } = path;

        if (hasStringLiteralJSXAttribute(path) && !isSvgElementAttribute(path)) {
          addPhrase(node.value.value);
        }
      },
      JSXExpressionContainer(path) {
        const { node } = path;

        if (node.expression.type === 'StringLiteral') {
          addPhrase(path.node.expression.value);
        } else if (node.expression.type === 'ConditionalExpression') {
          let expression = path.node.expression;
          if (expression.consequent.type === 'StringLiteral') {
            addPhrase(expression.consequent.value)
          }
          if (expression.alternate.type === 'StringLiteral') {
            addPhrase(expression.alternate.value);
          }
        }
      },
      CallExpression(path) {
        if (hasStringLiteralArguments(path)) {
          for (const arg of path.node.arguments) {
            if (arg.type === 'StringLiteral') {
              addPhrase(arg.value)
            }

            if (arg.type === 'ObjectExpression') {
              if (arg.properties.length === 0) {
                continue;
              }

              for (const prop of arg.properties) {
                if (prop.value && prop.value.type === 'StringLiteral') {
                  addPhrase(prop.value.value);
                }
              }
            }
          }
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
