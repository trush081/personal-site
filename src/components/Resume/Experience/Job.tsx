import type { Position } from '@/data/resume/positions';

const Job = ({ data }: { data: Position }) => (
  <article className="jobs-container">
    <header>
      <h4>{data.link ? <a href={data.link}>{data.company}</a> : data.company} - {data.position}</h4>
      <p className="daterange"> {data.daterange}</p>
    </header>
    <ul className="points">
      {data.points.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  </article>
);

export default Job;
