import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
      primaryColor: "indigo"
    }}
  >
    <Notifications position="top-center" />

    <Component {...pageProps} className={inter.className} />
  </MantineProvider>
);

export default App;
