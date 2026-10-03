import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';
import Education from '@/components/Resume/Education';
import Experience from '@/components/Resume/Experience';
import Skills from '@/components/Resume/Skills';
import Courses from '@/components/Resume/Courses';
import References from '@/components/Resume/References';

import { getContent } from '@/lib/content';
import defaultCourses from '@/data/resume/courses';
import defaultDegrees from '@/data/resume/degrees';
import defaultPositions from '@/data/resume/positions';
import { skills as defaultSkills, buildCategories } from '@/data/resume/skills';

export const metadata: Metadata = {
  title: 'Resume',
  description: "Trenton Rush's Resume.",
};

const sections = [
  'Education',
  'Experience',
  'Skills',
  'Courses',
  'References',
];

const Resume = async () => {
  const [courses, degrees, positions, skills] = await Promise.all([
    getContent('courses', defaultCourses),
    getContent('degrees', defaultDegrees),
    getContent('positions', defaultPositions),
    getContent('skills', defaultSkills),
  ]);
  const categories = buildCategories(skills);

  return (
    <Main>
      <article className="post" id="resume">
        <header>
          <div className="title">
            <h2><Link href="/resume">Resume</Link></h2>
            <div className="link-container">
              {sections.map((sec) => (
                <h4 key={sec}>
                  <a href={`#${sec.toLowerCase()}`}>{sec}</a>
                </h4>))}
            </div>
          </div>
        </header>
        <Education data={degrees} />
        <Experience data={positions} />
        <Skills skills={skills} categories={categories} />
        <Courses data={courses} />
        <References />
      </article>
    </Main>
  );
};

export default Resume;
