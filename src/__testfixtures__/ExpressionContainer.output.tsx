import React from "react";

import { useTranslation } from 'react-i18next';

const Simple = ({enabled, text}) => {
  const { t } = useTranslation();

  return (
    <div>
      <span>{t('my_simple_text')}</span>
      <span>{enabled ? t('ok') : t('not_ok')}</span>
      <span>{text && text}</span>
    </div>
  );
};

export default Simple;