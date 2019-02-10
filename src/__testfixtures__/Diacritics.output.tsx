import React from 'react';

import { withTranslation } from 'react-i18next';

const Simple = () => (
  <span>{t('ola_antonio')}</span>
);

export default withTranslation()(Simple);
