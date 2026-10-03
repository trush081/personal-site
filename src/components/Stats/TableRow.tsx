import type { Stat } from '@/data/stats/personal';

const TableRow = ({
  label, link, value = null, format = (x) => x,
}: Omit<Stat, 'key'>) => (
  <tr>
    <td width="70%">{label}</td>
    <td>{link ? <a href={link}>{format(value)}</a> : format(value)}</td>
  </tr>
);

export default TableRow;
