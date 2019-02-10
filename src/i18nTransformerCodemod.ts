import { API, FileInfo, Options, JSCodeshift } from 'jscodeshift';
import { getStableKey } from './stableString';
import { hasStringLiteralArguments } from './visitorChecks';

const tCallExpression = (j: JSCodeshift, key: string) => {
  return j.callExpression(
          j.identifier('t'),
          [j.stringLiteral(key)],
        );
};

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
        tCallExpression(j, key),
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

      path.node.expression = tCallExpression(j, key);
    });

  // Yup.string().required('this field is required')
  // showSnackbar({ message: 'ok' })
  root
    .find(j.CallExpression)
    .filter(path => hasStringLiteralArguments(path))
    .forEach(path => {
      if (hasStringLiteralArguments(path)) {
        path.node.arguments = path.node.arguments.map(arg => {
          if (arg.type === 'StringLiteral') {
            const key = getStableKey(arg.value);

            return tCallExpression(j, key)
          }

          if (arg.type === 'ObjectExpression') {
            arg.properties = arg.properties.map(prop => {
              if (prop.value && prop.value.type === 'StringLiteral') {

                const key = getStableKey(prop.value.value);
                prop.value = tCallExpression(j, key);
              }
              return prop;
            });
          }

          return arg;
        })
      }
    });

  // print
  return root.toSource(printOptions);
}

module.exports = transform;
module.exports.parser = 'tsx';
