import React from 'react';

import { withTranslation } from 'react-i18next';

type CustomProps = {
  title: string,
}
const Custom = (props: CustomProps) => {
  return (
    <div>
      <span>{props.title}</span>
    </div>
  )
}

const Simple = () => (
  <div>
    <span>{t('simple_text')}</span>
    <Custom title={t('custom_name')} />
  </div>
);

export default withTranslation()(Simple);
