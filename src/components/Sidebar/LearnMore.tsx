'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LearnMore = () => {
  const pathname = usePathname();

  return pathname.startsWith('/resume')
    ? <Link href="/about" className="button">About Me</Link>
    : <Link href="/resume" className="button">Learn More</Link>;
};

export default LearnMore;
