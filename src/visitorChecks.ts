import { Visitor } from '@babel/core';
import { CallExpression } from '@babel/types';

export const isYupRequiredCall = (path: Visitor<CallExpression>) => {
  if (path.node.callee.type === 'MemberExpression') {
    const { property } = path.node.callee;

    if (property.type === 'Identifier' && property.name === 'required') {
      if (path.node.arguments.length === 1) {
        if (path.node.arguments[0].type === 'StringLiteral') {
          return true;
        }
      }

      return  true;
    }
  }
  return  false;
};
