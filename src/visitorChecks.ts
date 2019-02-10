import { CallExpression, JSXAttribute } from '@babel/types';
import { NodePath } from '@babel/traverse';

const blackListJsxAttributeName = [
  'type',
  'id',
  'name',
  'children',
  'labelKey',
  'labelValue',
  'className',
];

export const hasStringLiteralJSXAttribute = (path: NodePath<JSXAttribute>) => {
  if (!path.node.value) {
    return false;
  }

  if (path.node.value.type !== 'StringLiteral') {
    return false;
  }

  if (blackListJsxAttributeName.indexOf(path.node.name.name) > -1) {
    return false;
  }

  return true;
};

const blackListCallExpressionCalle = [
  't',
  '_interopRequireDefault',
  'require',
  'routeTo',
  'format',
  'importScripts',
];
export const hasStringLiteralArguments = (path: NodePath<CallExpression>) => {
  const { callee } = path.node;

  if (callee.type === 'Identifier') {
    const { callee } = path.node;

    if (blackListCallExpressionCalle.indexOf(callee.name) > -1) {
      return false;
    }
  }

  if (callee.type === 'MemberExpression') {
    const { property } = path.node.callee;

    if (property && property.type === 'Identifier' && property.name === 'required') {
      if (path.node.arguments.length === 1) {
        if (path.node.arguments[0].type === 'StringLiteral') {
          return true;
        }
      }

      return  true;
    }

    // do not convert react expressions
    return false;
  }

  if (path.node.arguments.length === 0) {
    return false;
  }

  for (const arg of path.node.arguments) {
    // myFunc('ok')
    if (arg.type === 'StringLiteral') {
      return true;
    }

    // showSnackbar({ message: 'ok' });
    if (arg.type === 'ObjectExpression') {
      if (arg.properties.length === 0) {
        continue;
      }

      for (const prop of arg.properties) {
        if (prop.value && prop.value.type === 'StringLiteral') {
          return true;
        }
      }
    }

    // myFunc(['ok', 'blah']) - should we handle this case?
  }

  return  false;
};
