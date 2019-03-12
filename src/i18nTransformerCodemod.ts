import { API, FileInfo, Options, JSCodeshift, Collection } from 'jscodeshift';
import { getStableKey } from './stableString';
import { hasStringLiteralArguments, hasStringLiteralJSXAttribute, isSvgElement } from "./visitorChecks";
import { CallExpression, ImportDeclaration, JSXAttribute, JSXText } from "@babel/types";
import {
  ConditionalExpression,
  JSXElement,
  JSXExpressionContainer
} from "ast-types/gen/nodes";
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
        let exportDeclaration = path.node.declaration;
        return j.Identifier.check(exportDeclaration)
          || j.CallExpression.check(exportDeclaration)
          || j.FunctionDeclaration.check(exportDeclaration);
      })
      .forEach(path => {
        let exportDeclaration = path.node.declaration;

        if (j.Identifier.check(exportDeclaration)) {
          const exportedName = exportDeclaration.name;
          const functions = findFunctionByIdentifier(j, exportedName, root);
          let hookFound = addUseHookToFunctionBody(
            j, functions
          );

          if(!hookFound) {
            hocUsed = true;
            path.node.declaration = withTranslationHoc(j, j.identifier(exportDeclaration.name));
            const classDeclaration = root.find(j.ClassDeclaration, (n) => n.id.name === exportDeclaration.name)
              .nodes()[0];
            if (classDeclaration) {
               const renderMethod = classDeclaration.body.body.find(
                 n => j.ClassMethod.check(n) && n.key.name === 'render'
               );
               if (renderMethod) {
                 renderMethod.body = j.blockStatement([
                   createTranslationDefinition(j),
                   ...renderMethod.body.body
                 ])
               }
            }

          } else {
            hooksUsed = true;
          }
          return;
        }
        else if (j.CallExpression.check(exportDeclaration)) {
          if (exportDeclaration.callee.name === 'withTranslate') {
            return;
          }

          exportDeclaration.arguments.forEach(identifier => {
            const functions = findFunctionByIdentifier(j, identifier.name, root);
            hooksUsed = addUseHookToFunctionBody(j, functions) || hooksUsed;
          });

          if (!hooksUsed) {
            hooksUsed = true;
            path.node.declaration = withTranslationHoc(j, exportDeclaration);
          }
        } else if (j.FunctionDeclaration.check(exportDeclaration)) {
          hooksUsed = true;
          exportDeclaration.body = j.blockStatement([createUseTranslationCall(j), ...exportDeclaration.body.body])
        }
      });

    addI18nImport(j, root, {useHooks: hooksUsed, useHoc: hocUsed});
    // print
    return root.toSource(printOptions);
  }
}

function createUseTranslationCall(j: JSCodeshift) {
  return j.variableDeclaration('const',
    [j.variableDeclarator(
      j.identifier('{ t }'),
      j.callExpression(j.identifier('useTranslation'), [])
    )]
  );
}

function createTranslationDefinition(j: JSCodeshift) {
  return j.variableDeclaration('const',
    [j.variableDeclarator(
      j.identifier('{ t }'),
      j.memberExpression(j.thisExpression(), j.identifier('props'))
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
        ? j.blockStatement([createUseTranslationCall(j), ...body.body])
        : j.blockStatement([createUseTranslationCall(j), j.returnStatement(body)])
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
  root.find(j.JSXElement)
    .forEach((n: NodePath<JSXElement>) => {
      const jsxContentNodes =  n.value.children;
      let text = '';
      let translateArgs = [];
      let newChildren = [];
      for(let i = 0; i < jsxContentNodes.length; i++) {
        const element = jsxContentNodes[i];
        if (j.JSXText.check(element)) {
          if (element.value.trim().length > 0) {
          text += element.value;
          } else {
            newChildren.push(element);
          }
          continue;
        } else if (j.JSXExpressionContainer.check(element)) {
          translateArgs.push(element.expression);
          continue;
        }
        if (text.trim().length > 0) {
          hasI18nUsage = true;
          newChildren.push(buildTranslationWithArgumentsCall(
            j, translateArgs, text.trim()
          ));
        }
        text = '';
        translateArgs = [];
        newChildren.push(element);
        }

      if (text.trim().length > 0) {
        hasI18nUsage = true;
        newChildren.push(buildTranslationWithArgumentsCall(
          j, translateArgs, text.trim()
        ));
      }
      if (newChildren.length > 0) {
        //n.value.children = newChildren;
        n.replace(
          j.jsxElement(
            n.node.openingElement, n.node.closingElement,
            newChildren
          )
        )
      }
    });

  root
    .find(j.JSXText)
    .filter((path: NodePath<JSXText>) => path.node.value && path.node.value.trim())
    .replaceWith((path: NodePath<JSXText>) => {
      hasI18nUsage = true;
      const key = getStableKey(path.node.value);
      return j.jsxExpressionContainer(j.callExpression(j.identifier('t'), [j.literal(key)]))
    });
  return hasI18nUsage;
}

function translateJsxProps(j: JSCodeshift, root: Collection<any>) {
  let hasI18nUsage = false;
  //<Comp name='Awesome' />
  root
    .find(j.JSXElement)
    .filter((path: NodePath<JSXElement>) => !isSvgElement(path))
    .find(j.JSXAttribute)
    .filter((path: NodePath<JSXAttribute>) => hasStringLiteralJSXAttribute(path))
    .forEach((path: NodePath<JSXAttribute>) => {
      if (!path.node.value || !path.node.value.value) {
        return;
      }
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
      return path.node.expression && j.StringLiteral.check(path.node.expression)
    })
    .forEach(path => {
      const key = getStableKey(path.node.expression.value);
      hasI18nUsage = true;

      path.node.expression = tCallExpression(j, key);
    });

  //<Comp name={bool ? 'aaa' : 'bbb'} />
  root
    .find(j.JSXExpressionContainer)
    .filter((path: NodePath<JSXExpressionContainer>) => {
      return path.node.expression && j.ConditionalExpression.check(path.node.expression)
    })
    .forEach(((path: NodePath<ConditionalExpression>) => {
      let expression = path.value.expression;
      if (j.Literal.check(expression.consequent)) {
        hasI18nUsage = true;
        const key = getStableKey(expression.consequent.value);
        expression.consequent = tCallExpression(j, key);
      }
      if (j.Literal.check(expression.alternate)) {
        hasI18nUsage = true;
        const key = getStableKey(expression.alternate.value);
        expression.alternate = tCallExpression(j, key);
      }
      hasI18nUsage = true;
    }));

  return hasI18nUsage;
}

function buildTranslationWithArgumentsCall(j: JSCodeshift, translateArgs: any, text: string) {
    const translationCallArguments = [
      j.literal(getStableKey(text)),
    ] as any;
    if (translateArgs.length > 0) {
      translationCallArguments.push(
        j.objectExpression(
          translateArgs.map((expression: any, index: any) =>
            j.property('init', j.identifier('arg' + index), expression )
          )
        )
      )
    }
    return j.jsxExpressionContainer(
        j.callExpression(j.identifier('t'), translationCallArguments));
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
