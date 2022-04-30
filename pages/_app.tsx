import WarningBanner from '../components/WarningBanner';
import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import '../styles/globals.css';
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <div>
      {router.asPath === '/faq' ? null : <WarningBanner />}
      <Component {...pageProps} />
    </div>
  );
}
