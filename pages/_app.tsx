import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import '../styles/globals.css';
import { WarningBanner } from '../components/WarningBanner';
import 'antd/dist/antd.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <div className="App">
      {router.asPath !== '/faq' && <WarningBanner />}
      <Component {...pageProps} />
    </div>
  );
}
