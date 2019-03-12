import cosmiconfig from 'cosmiconfig';

const explorer = cosmiconfig('ast');

type ASTConfig = {
  blackListJsxAttributeName: string[],
  blackListCallExpressionCalle: string[],
}

const defaultConfig: ASTConfig = {
  blackListJsxAttributeName: [
    'type',
    'id',
    'name',
    'children',
    'labelKey',
    'valueKey',
    'labelValue',
    'className',
  ],
  blackListCallExpressionCalle: [
    't',
    '_interopRequireDefault',
    'require',
    'routeTo',
    'format',
    'importScripts',
  ],
};

let config: ASTConfig | null = null;

export const getAstConfig = (): ASTConfig => {
  if (config) {
    return config;
  }

  const result = explorer.searchSync();

  if (result) {
    config = {
      ...defaultConfig,
      ...result.config,
    };

    return config;
  }

  config = defaultConfig;

  return config;
};
