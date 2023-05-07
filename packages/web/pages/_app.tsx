import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider
    theme={{
      token: {
        fontFamily: inter.style.fontFamily,
        colorPrimary: "#6657e4",
        fontSize: 16,
        colorSuccess: "#38ed4a",
        colorWarning: "#ff7b00",
        colorError: "#ff3336",
        colorInfo: "#3783ed",
        colorTextBase: "#141415",
        colorBgBase: "#ffffff",
        fontSizeHeading1: 64,
        fontSizeHeading2: 48,
        fontSizeHeading3: 36,
        fontSizeHeading4: 28,
        fontSizeHeading5: 22
      }
    }}
  >
    <Component {...pageProps} className={inter.className} />
  </ConfigProvider>
);

export default App;
