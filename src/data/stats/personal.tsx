import type { ReactNode } from 'react';

import Age from '@/components/Stats/Age';

export interface Stat {
  key: string;
  label: string;
  value: ReactNode;
  link?: string;
  format?: (value: ReactNode) => ReactNode;
}

const data: Stat[] = [
  {
    key: 'age',
    label: 'Current age',
    value: <Age />,
  },
  {
    key: 'countries',
    label: 'Countries visited',
    value: 2,
    link:
      '', // TODO Put Map to reference
  },
  {
    key: 'location',
    label: 'Current city',
    value: 'Richardson, TX',
  },
  {
    key: 'boulders',
    label: 'Boulders climbed this year',
    value: 215,
  },
];

export default data;
