# AST i18n

The objective of this tool is to make easy to migrate an existing codebase to use i18n

## How it works
- it gets a list of files from the command line
- it runs a babel plugin transform to find all string inside JSXText
- it generates a stable key for the extracted strings
- it generates i18n files format based on this map
- it modify your existing code to use i18n library of your preference

## Example

Before this transform
```jsx
import React from 'react';

const Simple = () => (
  <span>My simple text</span>
);
```

After this transform
```jsx
import React from 'react';
import { withTranslation } from 'react-i18next'

const Simple = ({ t }) => (
  <span>{t('my_simple_text')}</span>
);
```

## Usage of string extractor
```bash
yarn start --src=myapp/src
```

- It will generate a resource.jsx file, like the below:
```jsx
export default {
  translation: {
   'ok': `ok`,
   'cancelar': `cancelar`,
   'continuar': `continuar`,
   'salvar': `salvar`,
   'endereco': `endereço:`,
   'troca_de_senha': `troca de senha`,
   'dados_pessoais': `dados pessoais`,
   [key]: 'value',
  }
}
```

### How to use resource with react-i18next?
- rename resource.tsx to your main language, like en.ts
- create other resource languages based on the generated one

```jsx
import en from './en';

i18n.use(LanguageDetector).init({
  resources: {
    en,
  },
  fallbackLng: 'ptBR',
  debug: false,

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
  },

  react: {
    wait: true,
  },
});
```

## Usage of i18n codemod
```bash
npm i -g jscodeshift

jscodeshift -t src/i18nTransfomerCodemod.ts PATH_TO_FILES
```

## How to customize blacklist
Use ast.config.js to customize blacklist for jsx attribute name and call expression calle

```jsx
module.exports = {
  blackListJsxAttributeName: [
    'type',
    'id',
    'name',
    'children',
    'labelKey',
    'valueKey',
    'labelValue',
    'className',
    'color',
    'key',
    'size',
    'charSet',
    'content',
  ],
  blackListCallExpressionCalle: [
    't',
    '_interopRequireDefault',
    'require',
    'routeTo',
    'format',
    'importScripts',
    'buildPath',
    'createLoadable',
    'import',
    'setFieldValue',
  ],
};
```
