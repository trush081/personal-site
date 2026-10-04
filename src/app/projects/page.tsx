import type { Metadata } from 'next';
import Link from 'next/link';

import Main from '@/components/Template/Main';
import AppCell from '@/components/Projects/AppCell';
import Cell from '@/components/Projects/Cell';
import { getContent, getPublicApps } from '@/lib/content';
import fallback from '@/data/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description: "Learn about Trenton Rush's projects.",
};

const Projects = async () => {
  const [data, apps] = await Promise.all([getContent('projects', fallback), getPublicApps()]);

  return (
    <Main>
      <article className="post" id="projects">
        <header>
          <div className="title">
            <h2><Link href="/projects">Projects</Link></h2>
            <p>Some random Applications and Projects that I&apos;ve worked on</p>
          </div>
        </header>
        {data.map((project) => (
          <Cell
            data={project}
            key={project.title}
          />
        ))}
        {apps.map((app) => <AppCell app={app} key={app.slug} />)}
        {data.length === 0 && apps.length === 0 && <p>New projects are on the way. Check back soon!</p>}
      </article>
    </Main>
  );
};

export default Projects;
