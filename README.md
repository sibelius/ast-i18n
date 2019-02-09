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
  <span>t('my_simple_text'</span>
);
```

## Usage of string extractor
```bash
yarn start --src=fixtures
```

### Usage of i18n codemod
```bash
npm i -g jscodeshift

jscodeshift -t src/src/i18nTransfomerCodemod.ts PATH_TO_FILES
```
