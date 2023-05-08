import { colors } from "@/utils";
import { Html, Head, Main, NextScript } from "next/document";
import React from "react";

const sharedStyle: React.CSSProperties = {
  height: "100%",
  backgroundColor: colors.background
};

const Document = () => (
  <Html lang="en" style={{ ...sharedStyle }}>
    <Head />
    <body
      style={{
        ...sharedStyle,
        margin: 0
      }}
    >
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
