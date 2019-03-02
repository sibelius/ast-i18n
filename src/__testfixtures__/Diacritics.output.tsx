import React from 'react';

import { useTranslation } from 'react-i18next';

const Simple = () => {
  const { t } = useTranslation();
  return <span>{t('ola_antonio')}</span>;
};

export default Simple;