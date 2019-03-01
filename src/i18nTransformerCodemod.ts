import { API, FileInfo, Options, JSCodeshift, Collection } from 'jscodeshift';
import { getStableKey } from './stableString';
import { hasStringLiteralArguments, hasStringLiteralJSXAttribute } from './visitorChecks';

const tCallExpression = (j: JSCodeshift, key: string) => {
  return j.callExpression(
          j.identifier('t'),
          [j.stringLiteral(key)],
        );
};

const getImportStatement = (useHoc: boolean = true, useHooks: boolean = false) => {
  if (useHoc && !useHooks) {
    return `import { withTranslation } from 'react-i18next';`;
  }

  if (useHooks && !useHoc) {
    return `import { useTranslation } from 'react-i18next';`;
  }

  return `import { useTranslation, withTranslation } from 'react-i18next';`;
};

const addI18nImport = (j: JSCodeshift, root: Collection<any>) => {
  // TODO - handle hoc or hooks based on file
  const statement = getImportStatement();

  // check if there is a react-i18next import already
  const reactI18nNextImports = root
    .find(j.ImportDeclaration)
    .filter(path => path.node.source.value === 'react-i18next');

  if (reactI18nNextImports.length > 0) {
    return;
  }

  const imports = root.find(j.ImportDeclaration);

  if(imports.length > 0){
     j(imports.at(imports.length-1).get()).insertAfter(statement); // after the imports
  }else{
     root.get().node.program.body.unshift(statement); // begining of file
  }
};

function transform(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift; // alias the jscodeshift API
  if (file.path.endsWith('.spec.js') || file.path.endsWith('.test.js')) {
    return;
  }
  const root = j(file.source); // parse JS code into an AST

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: false,
    // TODO make this configurable
    lineTerminator: '\n'
  };

  let hasI18nUsage = false;

  //<span>test</span>
  root
    .find(j.JSXText)
    .forEach(path => {
      const key = getStableKey(path.node.value);
      hasI18nUsage = true;

      // TODO - use j.jsxExpressionContainer
      if (path.node.value && path.node.value.trim()) {
        path.node.value = `{t('${key}')}`
      }
    });

  //<Comp name='Awesome' />
  root
    .find(j.JSXAttribute)
    .filter(path => hasStringLiteralJSXAttribute(path))
    .forEach(path => {
      const key = getStableKey(path.node.value.value);
      hasI18nUsage = true;

      path.node.value = j.jsxExpressionContainer(
        tCallExpression(j, key),
      );
    });

  //<Comp name={'Awesome'} />
  root
    .find(j.JSXExpressionContainer)
    .filter(path => {
      return path.node.expression && path.node.expression.type === 'StringLiteral'
    })
    .forEach(path => {
      const key = getStableKey(path.node.expression.value);
      hasI18nUsage = true;

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
            hasI18nUsage = true;

            return tCallExpression(j, key)
          }

          if (arg.type === 'ObjectExpression') {
            arg.properties = arg.properties.map(prop => {
              if (prop.value && prop.value.type === 'StringLiteral') {

                const key = getStableKey(prop.value.value);
                prop.value = tCallExpression(j, key);
                hasI18nUsage = true;
              }
              return prop;
            });
          }

          return arg;
        })
      }
    });

  if (hasI18nUsage) {
    // export default withTranslation()(Component)
    root
      .find(j.ExportDefaultDeclaration)
      .filter(path => {
        return path.node.declaration.type === 'Identifier' || path.node.declaration.type === 'CallExpression';
      })
      .forEach(path => {
        if (path.node.declaration.type === 'Identifier') {
          path.node.declaration = j.callExpression(
            j.callExpression(
              j.identifier('withTranslation'),
              [],
            ),
            [
              j.identifier(path.node.declaration.name),
            ],
          );
          return;
        }

        if (path.node.declaration.type === 'CallExpression') {
          if (path.node.declaration.callee.name === 'withTranslate') {
            return;
          }

          path.node.declaration = j.callExpression(
            j.callExpression(
              j.identifier('withTranslation'),
              [],
            ),
            [
              path.node.declaration,
            ],
          );
        }
      });

    addI18nImport(j, root);
    // print
    return root.toSource(printOptions);
  }
}

module.exports = transform;
module.exports.parser = 'tsx';
