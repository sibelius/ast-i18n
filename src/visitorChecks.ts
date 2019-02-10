import { CallExpression } from '@babel/types';
import { NodePath } from '@babel/traverse';

export const hasStringLiteralArguments = (path: NodePath<CallExpression>) => {
  const { callee } = path.node;

  if (callee.type === 'Identifier') {
    const { callee } = path.node;

    const blackListCalle = ['t', '_interopRequireDefault', 'require'];

    if (blackListCalle.indexOf(callee.name) > -1) {
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
