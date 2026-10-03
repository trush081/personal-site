import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';

export const metadata: Metadata = {
  description: "Trenton Rush's personal website. Kentucky based University of Kentucky graduate.",
  alternates: { canonical: '/' },
};

const Index = () => (
  <Main>
    <article className="post" id="index">
      <header>
        <div className="title">
          <h2><Link href="/">About this site</Link></h2>
          <p>
            A beautiful, responsive, statically-generated,
            Next.js application written with modern TypeScript.
          </p>
        </div>
      </header>
      <p> Welcome to my portfolio site. Please feel free to read more <Link href="/about">about me</Link>,
        or you can check out my {' '}
        <Link href="/resume">resume</Link>, {' '}
        <Link href="/projects">projects</Link>, {' '}
        view <Link href="/stats">personal statistics</Link>, {' '}
        or <Link href="/contact">contact</Link> me.
      </p>
      <p> I am definitly no expert in front-end development, so I must give credit to the original developer <a href="https://github.com/mldangelo/personal-site">here</a>. However, I have put my own spin on things.</p>
    </article>
  </Main>
);

export default Index;
