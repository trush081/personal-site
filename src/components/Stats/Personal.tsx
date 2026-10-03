import Table from './Table';
import { getContent } from '@/lib/content';
import fallback from '@/data/stats/personal';

const PersonalStats = async () => {
  const data = await getContent('stats', fallback);

  return (
    <>
      <h3>Some stats about me</h3>
      <Table data={data} />
    </>
  );
};

export default PersonalStats;
