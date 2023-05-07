import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Button, ConfigProvider, Radio, Checkbox } from "antd";

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider
    theme={{
      components: {
        Radio: {
          colorPrimary: "#00b96b"
        }
      }
    }}
  >
    <Radio>Radio</Radio>
    <Checkbox>Checkbox</Checkbox>
    <Component {...pageProps} />
  </ConfigProvider>
);

export default App;
