import React, { useState } from "react";

import { useTranslation } from 'react-i18next';

const SiteHeader = () => {
  const { t } = useTranslation();
  const [number] = useState(42);
  return (
    <span>{t('my_simple_text', {
        arg0: number
      })}<span>{t('other_text')}</span>{t('even_more_text')}</span>
  );
};

export default SiteHeader;