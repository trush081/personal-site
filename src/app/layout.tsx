import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { GoogleAnalytics } from '@next/third-parties/google';
import { config } from '@fortawesome/fontawesome-svg-core';

import 'normalize.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/static/css/main.scss'; // All of our styles

// FontAwesome's CSS is imported above, so don't inject it again at runtime.
config.autoAddCss = false;

// Self-hosted (latin subset, from Fontsource; OFL licenses alongside the files) so builds
// don't download from Google Fonts, which made CI fail intermittently.
const sourceSans = localFont({
  src: [
    { path: '../static/fonts/source-sans-3-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../static/fonts/source-sans-3-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-source-sans',
  display: 'swap',
});

const raleway = localFont({
  src: [
    { path: '../static/fonts/raleway-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../static/fonts/raleway-latin-800-normal.woff2', weight: '800', style: 'normal' },
    { path: '../static/fonts/raleway-latin-900-normal.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-raleway',
  display: 'swap',
});

const { NEXT_PUBLIC_GA_ID } = process.env;

// Pages are static; refresh them periodically so edits made directly in the
// database show up even without the admin area's on-demand revalidation.
export const revalidate = 300;

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
