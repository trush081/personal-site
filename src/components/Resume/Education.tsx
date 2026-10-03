import Degree from './Education/Degree';
import type { Degree as DegreeData } from '@/data/resume/degrees';

const Education = ({ data = [] }: { data?: DegreeData[] }) => (
  <div className="education">
    <div className="link-to" id="education" />
    <div className="title">
      <h3>Education</h3>
    </div>
    {data.map((degree) => (
      <Degree
        data={degree}
        key={degree.school}
      />
    ))}
  </div>
);

export default Education;
