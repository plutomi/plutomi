import "../styles/globals.css";
import NextApp, { type AppContext, type AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
      fontFamily: `${inter.style.fontFamily}, sans-serif`,
      colors: {
        brand: [
          "#e2ecff",
          "#b3c7ff",
          "#82a1fc",
          "#517cfa",
          "#2356f8",
          "#0c3dde",
          "#052fae",
          "#01227d",
          "#00144d",
          "#00071f"
        ]
      },
      primaryColor: "brand"
    }}
  >
    <Notifications position="top-center" />

    <Component {...pageProps} className={inter.className} />
  </MantineProvider>
);

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps
  };
};

export default App;
