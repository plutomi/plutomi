import {
  ExclamationCircleIcon,
  SpeakerphoneIcon,
  XIcon,
} from "@heroicons/react/outline";
import { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
