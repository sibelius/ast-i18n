import React from 'react';

import { useTranslation } from 'react-i18next';

const Simple = () => {
  const { t } = useTranslation();
  return <span>{t('my_simple_text')}</span>;
};

export default Simple;