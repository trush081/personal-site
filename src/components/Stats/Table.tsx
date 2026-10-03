import TableRow from './TableRow';
import type { Stat } from '@/data/stats/personal';

const Table = ({ data }: { data: Stat[] }) => (
  <table>
    <tbody>
      {data.map((pair) => (
        <TableRow
          format={pair.format}
          key={pair.label}
          label={pair.label}
          link={pair.link}
          value={pair.value}
        />
      ))}
    </tbody>
  </table>
);

export default Table;
