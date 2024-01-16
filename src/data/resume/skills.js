// TODO: Add Athletic Skills, Office Skills,
// Data Engineering, Data Science, ML Engineering, ... ?

const skills = [
  {
    title: 'Java',
    competency: 5,
    category: ['Languages', 'JVM', 'Backend Development'],
  },
  {
    title: 'Spring Boot',
    competency: 4,
    category: ['Web Development', 'Frameworks', 'Backend Development', 'JVM'],
  },
  {
    title: 'Google Cloud Platform (GCP)',
    competency: 4,
    category: ['Web Development', 'Cloud'],
  },
  {
    title: 'C++',
    competency: 4,
    category: ['Languages', 'Backend Development'],
  },
  {
    title: 'C',
    competency: 4,
    category: ['Languages', 'Backend Development'],
  },
  {
    title: 'HTML',
    competency: 3,
    category: ['Web Development', 'Languages'],
  },
  {
    title: 'JavaScript',
    competency: 2,
    category: ['Web Development', 'Languages'],
  },
  {
    title: 'CSS',
    competency: 2,
    category: ['Web Development', 'Languages'],
  },
  {
    title: 'Python',
    competency: 3,
    category: ['Languages', 'Backend Development'],
  },
  {
    title: 'Agile',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'SQL',
    competency: 2,
    category: ['Languages', 'Database'],
  },
  {
    title: 'Firebase',
    competency: 3,
    category: ['Database'],
  },
  {
    title: 'Mongo DB',
    competency: 2,
    category: ['Database'],
  },
  {
    title: 'Git',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Jira',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Confluence',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Bitbucket',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Github',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Jenkins',
    competency: 3,
    category: ['Methodologies and Tools'],
  },
  {
    title: 'Terraform',
    competency: 4,
    category: ['Methodologies and Tools', 'Languages'],
  },
  {
    title: 'React JS',
    competency: 2,
    category: ['Frameworks', 'Web Development'],
  },
  {
    title: 'Angular',
    competency: 2,
    category: ['Frameworks', 'Web Development'],
  },
].map((skill) => ({ ...skill, category: skill.category.sort() }));

// this is a list of colors that I like. The length should be == to the
// number of categories. Re-arrange this list until you find a pattern you like.
const colors = [
  '#c6757b',
  '#c67500',
  '#989aff',
  '#016d01',
  '#6d0201',
  '#a9a88e',
  '#006f6f',
  '#70016f',
];

const categories = [
  ...new Set(skills.reduce((acc, { category }) => acc.concat(category), [])),
]
  .sort()
  .map((category, index) => ({
    name: category,
    color: colors[index],
  }));

export { categories, skills };
