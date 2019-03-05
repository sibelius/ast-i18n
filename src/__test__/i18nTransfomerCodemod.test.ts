import { defineTest } from '../../test/testUtils';

describe('i18nTransformerCodemod', () => {
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Classes');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Diacritics');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'ExpressionContainer');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Functional');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Props');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Tsx');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Yup');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'CallExpression');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Imported');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'WithHoc');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'NoChange');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Hooks');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Classnames');
  defineTest(__dirname, 'i18nTransformerCodemod', null, 'Svg');
});
