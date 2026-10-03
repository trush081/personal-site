import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';
import Personal from '@/components/Stats/Personal';

export const metadata: Metadata = {
  title: 'Stats',
  description: 'Some statistics about Trenton Rush and trentonrush.com',
};

const Stats = () => (
  <Main>
    <article className="post" id="stats">
      <header>
        <div className="title">
          <h2><Link href="/stats">Stats</Link></h2>
        </div>
      </header>
      <Personal />
    </article>
  </Main>
);

export default Stats;
