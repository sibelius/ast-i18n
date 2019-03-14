import React from "react";

const Simple = ({enabled, text}) => (
  <div>
    <span>{"My simple text"}</span>
    <span>{enabled ? "OK" : "Not OK"}</span>
    <span>{text && text}</span>
  </div>
);

export default Simple;