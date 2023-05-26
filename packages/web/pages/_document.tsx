import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { createGetInitialProps } from "@mantine/next";

const getInitialProps = createGetInitialProps();

// eslint-disable-next-line @typescript-eslint/naming-convention
export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html
        style={{
          height: "100%",
          margin: 0,
          padding: 0
        }}
      >
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>
        <body
          style={{
            height: "100%",
            margin: 0,
            padding: 0
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
