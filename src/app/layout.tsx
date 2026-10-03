import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Raleway, Source_Sans_3 } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { config } from '@fortawesome/fontawesome-svg-core';

import 'normalize.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/static/css/main.scss'; // All of our styles

// FontAwesome's CSS is imported above, so don't inject it again at runtime.
config.autoAddCss = false;

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-source-sans',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '800', '900'],
  variable: '--font-raleway',
});

const { NEXT_PUBLIC_GA_ID } = process.env;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trentonrush.com'),
  title: {
    template: '%s | Trenton Rush',
    default: 'Trenton Rush',
  },
  description: "Trenton Rush's personal website.",
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico' },
      { url: '/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/images/favicon/apple-touch-icon.png',
  },
  manifest: '/images/favicon/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" className={`${sourceSans.variable} ${raleway.variable}`}>
    <body>
      {children}
    </body>
    {NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={NEXT_PUBLIC_GA_ID} />}
  </html>
);

export default RootLayout;
