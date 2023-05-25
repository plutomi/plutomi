import "../styles/globals.css";
import NextApp, { type AppContext, type AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const colors = {
  bg: "#fbfbfd"
};

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    {/* The rest of your application */}

    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        globalStyles: (theme) => ({
          body: {
            ...theme.fn.fontStyles(),
            backgroundColor: colors.bg
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
          ]
        },
        primaryColor: "brand",
        primaryShade: 4,
        components: {
          Anchor: {
            defaultProps: {
              color: "brand.4"
            }
          },
          Header: {
            defaultProps: {
              style: {
                backgroundColor: colors.bg
              }
            }
          }
        }
      }}
    >
      <Notifications position="top-center" />
      <Component {...pageProps} className={inter.className} />
    </MantineProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps
  };
};

export default App;
