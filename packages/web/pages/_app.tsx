import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <Component {...pageProps} className={inter.className} />
  </MantineProvider>
);

export default App;
