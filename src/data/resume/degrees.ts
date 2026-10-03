export interface Degree {
  school: string;
  degree: string;
  link: string;
  year: number;
}

const degrees: Degree[] = [
  {
    school: 'University of Kentucky College of Engineering',
    degree: 'B.S. Computer Science',
    link: 'https://www.uky.edu/academics/bachelors/college-engineering/computer-science',
    year: 2022,
  },
];

export default degrees;
