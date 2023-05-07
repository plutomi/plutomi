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
        colorPrimary: "#1e4aa2",
        fontSize: 16,
        colorSuccess: "#12c924",
        colorWarning: "#ff7b00",
        colorError: "#ff3336",
        colorInfo: "#2d8cef",
        colorTextBase: "#141415",
        colorBgBase: "#ffffff",
        fontSizeHeading1: 54,
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
