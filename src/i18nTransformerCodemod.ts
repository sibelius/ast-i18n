import { API, FileInfo, Options, JSCodeshift, Collection } from 'jscodeshift';
import { getStableKey } from './stableString';
import { hasStringLiteralArguments, hasStringLiteralJSXAttribute } from './visitorChecks';
import { CallExpression, ImportDeclaration, JSXAttribute, JSXText } from "@babel/types";
import { JSXExpressionContainer } from "ast-types/gen/nodes";
import { NodePath } from "ast-types";

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

const addI18nImport = (j: JSCodeshift, root: Collection<any>, {useHooks, useHoc}: any) => {
  // TODO - handle hoc or hooks based on file
  const statement = getImportStatement(useHoc, useHooks);

  // check if there is a react-i18next import already
  const reactI18nNextImports = root
    .find(j.ImportDeclaration)
    .filter((path : NodePath<ImportDeclaration>) => path.node.source.value === 'react-i18next');

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

  hasI18nUsage = translateJsxContent(j, root) || hasI18nUsage;
  hasI18nUsage = translateJsxProps(j, root) || hasI18nUsage;
  hasI18nUsage = translateFunctionArguments(j, root) || hasI18nUsage;

  if (hasI18nUsage) {
    // export default withTranslation()(Component)
    let hooksUsed = false;
    let hocUsed = false;
    root
      .find(j.ExportDefaultDeclaration)
      .filter(path => {
        return path.node.declaration.type === 'Identifier' || path.node.declaration.type === 'CallExpression';
      })
      .forEach(path => {
        if (path.node.declaration.type === 'Identifier') {
          const exportedName = path.node.declaration.name;
          const functions = findFunctionByIdentifier(j, exportedName, root);
          let hookFound = addUseHookToFunctionBody(
            j, functions
          );

          if(!hookFound) {
            hocUsed = true;
            path.node.declaration = withTranslationHoc(j, j.identifier(path.node.declaration.name));
          } else {
            hooksUsed = true;
          }
          return;
        }

        if (path.node.declaration.type === 'CallExpression') {
          if (path.node.declaration.callee.name === 'withTranslate') {
            return;
          }

          path.node.declaration.arguments.forEach(identifier => {
            const functions = findFunctionByIdentifier(j, identifier.name, root);
            hooksUsed = addUseHookToFunctionBody(j, functions) || hooksUsed;
          });

          if (!hooksUsed) {
            hooksUsed = true;
            path.node.declaration = withTranslationHoc(j, path.node.declaration);
          }
        }
      });

    addI18nImport(j, root, {useHooks: hooksUsed, useHoc: hocUsed});
    // print
    return root.toSource(printOptions);
  }
}

function useTranslateHook(j: JSCodeshift) {
  return j.variableDeclaration('const',
    [j.variableDeclarator(
      j.identifier('{ t }'),
      j.identifier('useTranslation()')
    )]
  );
}

function findFunctionByIdentifier(j: JSCodeshift, identifier: string, root: Collection<any>) {
  return root.find(j.Function)
    .filter((p: NodePath<Function>) => {
      if (j.FunctionDeclaration.check(p.node)) {
        return p.node.id.name === identifier;
      }
      return p.parent.value.id && p.parent.value.id.name === identifier;
    });
}

function addUseHookToFunctionBody(j: JSCodeshift, functions: Collection<any>) {
  let hookFound = false;
    functions
    .every(n => {
      hookFound = true;
      const body = n.node.body;
      n.node.body =  j.BlockStatement.check(body)
        ? j.blockStatement([useTranslateHook(j), ...body.body])
        : j.blockStatement([useTranslateHook(j), j.returnStatement(body)])
    });
  return hookFound;
}

// Yup.string().required('this field is required')
// showSnackbar({ message: 'ok' })
function translateFunctionArguments(j: JSCodeshift, root: Collection<any>) {
  let hasI18nUsage = false;
  root
    .find(j.CallExpression)
    .filter((path: NodePath<CallExpression, CallExpression>) => !['classNames'].includes(path.value.callee.name))
    .filter((path: NodePath<CallExpression>) => hasStringLiteralArguments(path))
    .forEach((path: NodePath<CallExpression, CallExpression>) => {
      if (hasStringLiteralArguments(path)) {
        path.node.arguments = path.node.arguments.map(arg => {
          if (arg.type === 'StringLiteral' && arg.value) {
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

  return hasI18nUsage;
}

//<span>test</span>
function translateJsxContent(j: JSCodeshift, root: Collection<any>) {
  let hasI18nUsage = false;
  root
    .find(j.JSXText)
    .forEach((path: NodePath<JSXText>) => {
      const key = getStableKey(path.node.value);

      // TODO - use j.jsxExpressionContainer
      if (path.node.value && path.node.value.trim()) {
        path.node.value = `{t('${key}')}`;
        hasI18nUsage = true;
      }
    });
  return hasI18nUsage;
}

function translateJsxProps(j: JSCodeshift, root: Collection<any>) {
  let hasI18nUsage = false;
  //<Comp name='Awesome' />
  root
    .find(j.JSXAttribute)
    .filter((path: NodePath<JSXAttribute>) => hasStringLiteralJSXAttribute(path))
    .forEach((path: NodePath<JSXAttribute>) => {
      const key = getStableKey(path.node.value.value);
      hasI18nUsage = true;

      path.node.value = j.jsxExpressionContainer(
        tCallExpression(j, key),
      );
    });

  //<Comp name={'Awesome'} />
  root
    .find(j.JSXExpressionContainer)
    .filter((path: NodePath<JSXExpressionContainer>) => {
      return path.node.expression && path.node.expression.type === 'StringLiteral'
    })
    .forEach(path => {
      const key = getStableKey(path.node.expression.value);
      hasI18nUsage = true;

      path.node.expression = tCallExpression(j, key);
    });

  return hasI18nUsage;
}

function withTranslationHoc(j: JSCodeshift, identifier: any) {
  return j.callExpression(
    j.callExpression(
      j.identifier('withTranslation'),
      [],
    ),
    [
      identifier
    ],
  )
}


module.exports = transform;
module.exports.parser = 'tsx';
