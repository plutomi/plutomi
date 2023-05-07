import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider>
    <Component {...pageProps} />
  </ConfigProvider>
);

export default App;
