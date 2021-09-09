// import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import { Provider } from "next-auth/client";
import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
}
