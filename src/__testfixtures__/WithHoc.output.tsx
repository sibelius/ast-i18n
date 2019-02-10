import React from 'react';
import { withSnackbar } from 'snackbar';

import { withTranslation } from 'react-i18next';

const Simple = () => (
  <span>{t('my_simple_text')}</span>
);

export default withTranslation()(withSnackbar(Simple));
