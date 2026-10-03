import type { Metadata } from 'next';
import Link from 'next/link';

import { requireRole } from '@/lib/auth';
import sections from '@/lib/sections';

export const metadata: Metadata = { title: 'Site content' };

const Content = async () => {
  await requireRole('admin');

  return (
    <>
      <header>
        <div className="title">
          <h2>Site content</h2>
          <p>Choose a section to edit. Changes go live right away.</p>
        </div>
      </header>
      <ul className="dashboard-sections">
        {sections.map((s) => (
          <li key={s.key}>
            <h3><Link href={`/dashboard/content/${s.key}`}>{s.title}</Link></h3>
            <p>{s.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Content;
