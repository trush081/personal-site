// Icon names are resolved in src/components/Contact/icons.ts.
export interface ContactLink {
  link: string;
  label: string;
  icon: string;
}

const data: ContactLink[] = [
  {
    link: 'https://github.com/trush081',
    label: 'Github',
    icon: 'github',
  },
  {
    link: 'https://www.linkedin.com/in/trenton-rush-2552b41b9/',
    label: 'LinkedIn',
    icon: 'linkedin',
  },
  {
    link: 'mailto:trush081@gmail.com',
    label: 'Email',
    icon: 'email',
  },
];

export default data;
