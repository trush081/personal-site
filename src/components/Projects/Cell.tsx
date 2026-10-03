import dayjs from 'dayjs';

import type { Project } from '@/data/projects';

const Cell = ({ data }: { data: Project }) => (
  <div className="cell-container">
    <article className="mini-post">
      <header>
        <h3><a href={data.link}>{data.title}</a></h3>
        <time className="published">{dayjs(data.date).format('MMMM, YYYY')}</time>
      </header>
      <a href={data.link} className="image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.title} />
      </a>
      <div className="description">
        <p>{data.desc}</p>
      </div>
    </article>
  </div>
);

export default Cell;
