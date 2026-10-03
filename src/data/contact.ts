import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons/faEnvelope';
// See https://fontawesome.com/icons?d=gallery&s=brands,regular&m=free
// to add other icons.
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ContactLink {
  link: string;
  label: string;
  icon: IconDefinition;
}

const data: ContactLink[] = [
  {
    link: 'https://github.com/trush081',
    label: 'Github',
    icon: faGithub,
  },
  {
    link: 'https://www.linkedin.com/in/trenton-rush-2552b41b9/',
    label: 'LinkedIn',
    icon: faLinkedinIn,
  },
  {
    link: 'mailto:trush081@gmail.com',
    label: 'Email',
    icon: faEnvelope,
  },
];

export default data;
