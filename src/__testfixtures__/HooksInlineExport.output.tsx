import React, { useState } from "react";

import { useTranslation } from 'react-i18next';

export default function SiteFooter() {
  const { t } = useTranslation();
  const [text] = useState(t('something_something'));
  return <>
    {text}
    <span>{t('my_simple_text')}</span>
  </>;
}