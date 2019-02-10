import React from 'react';

type CustomProps = {
  name: string,
}
const Custom = (props: CustomProps) => {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  )
}

const Simple = () => (
  <div>
    <span>{t('simple_text')}</span>
    <Custom name={t('custom_name')} />
  </div>
);
