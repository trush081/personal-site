import Job from './Experience/Job';
import type { Position } from '@/data/resume/positions';

const Experience = ({ data = [] }: { data?: Position[] }) => (
  <div className="experience">
    <div className="link-to" id="experience" />
    <div className="title">
      <h3>Experience</h3>
    </div>
    {data.map((job) => (
      <Job
        data={job}
        key={job.company}
      />
    ))}
  </div>
);

export default Experience;
