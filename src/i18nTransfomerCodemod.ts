import { API, FileInfo, Options, StringLiteral } from 'jscodeshift';
import { getStableKey } from './stableString';
import path from 'ast-types/lib/path';

function transform(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift; // alias the jscodeshift API
  const root = j(file.source); // parse JS code into an AST

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  //<span>test</span>
  root
    .find(j.JSXText)
    .forEach(path => {
      const key = getStableKey(path.node.value);

      // TODO - use j.jsxExpressionContainer
      if (path.node.value && path.node.value.trim()) {
        path.node.value = `{t('${key}')}`
      }
    });

  //<Comp name='Awesome' />
  root
    .find(j.JSXAttribute)
    .filter(path => {
      return path.node.value.type === 'StringLiteral';
    })
    .forEach(path => {
      const key = getStableKey(path.node.value.value);

      path.node.value = j.jsxExpressionContainer(
        j.callExpression(
          j.identifier('t'),
          [j.stringLiteral(key)],
        )
      );
    });

  //<Comp name={'Awesome'} />
  root
    .find(j.JSXExpressionContainer)
    .filter(path => {
      return path.node.expression.type === 'StringLiteral'
    })
    .forEach(path => {
      const key = getStableKey(path.node.expression.value);

      path.node.expression = j.callExpression(
          j.identifier('t'),
          [j.stringLiteral(key)],
        );
    });


  // print
  return root.toSource(printOptions);
}

module.exports = transform;
module.exports.parser = 'tsx';
