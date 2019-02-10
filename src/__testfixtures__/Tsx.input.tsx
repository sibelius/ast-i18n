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
    <span>Simple text</span>
    <Custom name='Custom name' />
  </div>
);
