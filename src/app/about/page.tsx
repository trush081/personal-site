import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import Main from '@/components/Template/Main';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Trenton Rush',
};

// Used if the database has no About content yet.
const fallback = {
  markdown: readFileSync(path.join(process.cwd(), 'src/data/about.md'), 'utf8'),
};

const About = async () => {
  const { markdown } = await getContent('about', fallback);
  const count = markdown.split(/\s+/)
    .map((s) => s.replace(/\W/g, ''))
    .filter((s) => s.length).length;

  return (
    <Main>
      <article className="post markdown" id="about">
        <header>
          <div className="title">
            <h2><Link href="/about">About Me</Link></h2>
            <p>(in about {count} words)</p>
          </div>
        </header>
        <ReactMarkdown
          components={{
            // Use client-side navigation for links within the site
            a: ({ href = '', children }) => (href.startsWith('/')
              ? <Link href={href}>{children}</Link>
              : <a href={href}>{children}</a>),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </Main>
  );
};

export default About;
