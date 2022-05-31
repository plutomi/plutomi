import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import WarningBanner from '../components/WarningBanner';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <div>
      {router.asPath !== '/faq' && <WarningBanner />}
      <Component {...pageProps} />
    </div>
  );
}
