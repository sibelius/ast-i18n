import React from 'react';

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
    <span>Simple text</span>
    <Custom title='Custom name' />
  </div>
);

export default Simple;
