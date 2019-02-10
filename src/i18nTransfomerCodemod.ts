import { API, FileInfo, Options, StringLiteral } from 'jscodeshift';
import { getStableString } from './stableString';
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
      // TODO - use j.jsxExpressionContainer
      if (path.node.value && path.node.value.trim()) {
        path.node.value = `{t('${getStableString(path.node.value)}')}`
      }
    });

  //<Comp name='Awesome' />
  root
    .find(j.JSXAttribute)
    .filter(path => {
      return path.node.value.type === 'StringLiteral';
    })
    .forEach(path => {

      path.node.value = j.jsxExpressionContainer(
        j.callExpression(
          j.identifier('t'),
          [j.stringLiteral(getStableString(path.node.value.value))],
        )
      );
    });

  // print
  return root.toSource(printOptions);
}

module.exports = transform;
module.exports.parser = 'tsx';
