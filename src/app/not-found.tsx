import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 Not Found',
  description: 'The content you are looking for cannot be found.',
};

const PageNotFound = () => (
  <div className="not-found">
    <h1>Page Not Found</h1>
    <p>Return <Link href="/">home</Link>.</p>
  </div>
);

export default PageNotFound;
