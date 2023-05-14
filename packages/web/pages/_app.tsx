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
      globalStyles: (theme) => ({
        body: {
          ...theme.fn.fontStyles(),
          backgroundColor: theme.colors["cool-gray"][0]
        }
      }),

      fontFamily: `${inter.style.fontFamily}, sans-serif`,
      colors: {
        brand: [
          "#e3f2ff",
          "#bbd4f8",
          "#92b8ed",
          "#699ce3",
          "#3f7fda",
          "#2566c0",
          "#1a4f96",
          "#10396d",
          "#042244",
          "#000b1c"
        ],
        "cool-gray": [
          "#edf2f7",
          "#cdd8e3",
          "#adbed1",
          "#8ba5c0",
          "#698bb0",
          "#517297",
          "#405875",
          "#2e3f52",
          "#1b2632",
          "#080d12"
        ]
      },
      primaryColor: "brand",
      primaryShade: 4
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
