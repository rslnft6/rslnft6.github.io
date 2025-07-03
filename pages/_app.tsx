import '../styles/globals.css';
import type { AppProps } from "next/app";
import '../data/i18n';
import { BackgroundProvider, useBackground } from '../components/BackgroundProvider';
import MarqueeBar from '../components/MarqueeBar';

function BackgroundLayout({ children }: { children: React.ReactNode }) {
  const bg = useBackground();
  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: bg ? `url(${bg}) center center / cover no-repeat fixed` : '#181c2a',
      transition: 'background 0.7s cubic-bezier(.4,2,.3,1)',
      position: 'relative',
    }}>
      <div style={{position:'absolute',inset:0,background:'rgba(24,28,42,0.55)',zIndex:0}} />
      <div style={{position:'relative',zIndex:1}}>{children}</div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <BackgroundProvider>
      <MarqueeBar />
      <BackgroundLayout>
        <Component {...pageProps} />
      </BackgroundLayout>
    </BackgroundProvider>
  );
}
