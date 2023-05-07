import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider
    theme={{
      token: {
        fontFamily: inter.style.fontFamily
      }
    }}
  >
    <Component {...pageProps} className={inter.className} />
  </ConfigProvider>
);

export default App;
