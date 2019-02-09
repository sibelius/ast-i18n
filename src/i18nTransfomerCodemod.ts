import { API, FileInfo, Options } from 'jscodeshift';
import { getStableString } from './stableString';

function transform(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift; // alias the jscodeshift API
  const root = j(file.source); // parse JS code into an AST

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  root
    .find(j.JSXText)
    .forEach((path) => {
      if (path.node.value && path.node.value.trim()) {
        path.node.value = `{t('${getStableString(path.node.value)}')}`
      }
    });

  // print
  return root.toSource(printOptions);
}

module.exports = transform;
module.exports.parser = 'tsx';
