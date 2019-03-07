import React, { useState } from "react";

export default function SiteFooter() {
  const [text] = useState("Something something");
  return (
    <>
      {text}
      <span>My simple text</span>
    </>
  );
}
