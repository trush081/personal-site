export interface Stat {
  key: string;
  label: string;
  value: string;
  link?: string;
  // 'age' renders a live-ticking age computed from the birth time, ignoring `value`
  kind?: 'text' | 'age';
}

const data: Stat[] = [
  {
    key: 'age',
    label: 'Current age',
    value: '',
    kind: 'age',
  },
  {
    key: 'countries',
    label: 'Countries visited',
    value: '2',
    link: '', // TODO Put Map to reference
  },
  {
    key: 'location',
    label: 'Current city',
    value: 'Richardson, TX',
  },
  {
    key: 'boulders',
    label: 'Boulders climbed this year',
    value: '215',
  },
];

export default data;
