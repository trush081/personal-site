import { readFileSync } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';

import SectionEditor from '@/components/Dashboard/SectionEditor';
import { requireRole } from '@/lib/auth';
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

export const generateMetadata = async ({ params }: { params: Promise<{ section: string }> }) => {
  const { section } = await params;
  return { title: getSection(section)?.title ?? 'Site content' };
};

const EditSection = async ({ params }: { params: Promise<{ section: string }> }) => {
  const { section: key } = await params;

  await requireRole('admin');

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
      <SectionEditor section={section} initial={initial} />
    </>
  );
};

export default EditSection;
