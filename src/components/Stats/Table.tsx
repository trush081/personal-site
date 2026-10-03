import Age from './Age';
import type { Stat } from '@/data/stats/personal';

const Table = ({ data }: { data: Stat[] }) => (
  <table>
    <tbody>
      {data.map((stat) => {
        const value = stat.kind === 'age' ? <Age /> : stat.value;
        return (
          <tr key={stat.key}>
            <td width="70%">{stat.label}</td>
            <td>{stat.link ? <a href={stat.link}>{value}</a> : value}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export default Table;
