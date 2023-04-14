import "../styles/globals.css";
import type { AppProps } from "next/app";

export const App = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
);
