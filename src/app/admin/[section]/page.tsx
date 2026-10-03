import { readFileSync } from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import SectionEditor from '@/components/Admin/SectionEditor';
import { getAuthState } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { getSection } from '@/lib/sections';
import contact from '@/data/contact';
import projects from '@/data/projects';
import courses from '@/data/resume/courses';
import degrees from '@/data/resume/degrees';
import positions from '@/data/resume/positions';
import { skills } from '@/data/resume/skills';
import stats from '@/data/stats/personal';

// Shown when a section has not been saved to the database yet.
const defaults: Record<string, unknown> = {
  about: { markdown: readFileSync(path.join(process.cwd(), 'src/data/about.md'), 'utf8') },
  positions,
  degrees,
  courses,
  skills,
  projects,
  contact,
  stats,
};

const EditSection = async ({ params }: { params: Promise<{ section: string }> }) => {
  const { section: key } = await params;

  const auth = await getAuthState();
  if (auth.status === 'signed-out') redirect('/admin/login');
  if (auth.status !== 'admin') redirect('/admin');

  const section = getSection(key);
  if (!section) notFound();

  const initial = await getContent(key, defaults[key]);

  return (
    <>
      <header>
        <div className="title">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
      </header>
      <p><Link href="/admin">&larr; All sections</Link></p>
      <SectionEditor section={section} initial={initial} />
    </>
  );
};

export default EditSection;
