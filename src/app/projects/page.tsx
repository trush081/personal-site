import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';
import Cell from '@/components/Projects/Cell';
import data from '@/data/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description: "Learn about Trenton Rush's projects.",
};

const Projects = () => (
  <Main>
    <article className="post" id="projects">
      <header>
        <div className="title">
          <h2><Link href="/projects">Projects</Link></h2>
          <p>Some random Applications and Projects that i&apos;ve worked on</p>
        </div>
      </header>
      {data.map((project) => (
        <Cell
          data={project}
          key={project.title}
        />
      ))}
    </article>
  </Main>
);

export default Projects;
