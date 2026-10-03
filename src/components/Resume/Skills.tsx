'use client';

import { useState } from 'react';

import CategoryButton from './Skills/CategoryButton';
import SkillBar from './Skills/SkillBar';
import type { Category, Skill } from '@/data/resume/skills';

interface SkillsProps {
  skills?: Skill[];
  categories?: Category[];
}

const Skills = ({ skills = [], categories = [] }: SkillsProps) => {
  // null means the 'All' button is active
  const [active, setActive] = useState<string | null>(null);

  const labels = ['All', ...categories.map((cat) => cat.name)];

  // Toggle button that was clicked. Fall back to 'All' if it was already active.
  const handleClick = (label: string) => {
    setActive((prev) => (label === 'All' || label === prev ? null : label));
  };

  const rows = [...skills].sort((a, b) => {
    let ret = 0;
    if (a.competency > b.competency) ret = -1;
    else if (a.competency < b.competency) ret = 1;
    else if (a.category[0] > b.category[0]) ret = -1;
    else if (a.category[0] < b.category[0]) ret = 1;
    else if (a.title > b.title) ret = 1;
    else if (a.title < b.title) ret = -1;
    return ret;
  }).filter((skill) => (active === null || skill.category.includes(active)));

  return (
    <div className="skills">
      <div className="link-to" id="skills" />
      <div className="title">
        <h3>Skills</h3>
        <p>Note: These skill are based on my most familiar(5) to least(1).
          I try to add anything I have possibly used for at least a month.
        </p>
      </div>
      <div className="skill-button-container">
        {labels.map((label) => (
          <CategoryButton
            label={label}
            key={label}
            active={label === (active ?? 'All')}
            handleClick={handleClick}
          />
        ))}
      </div>
      <div className="skill-row-container">
        {rows.map((skill) => (
          <SkillBar
            categories={categories}
            data={skill}
            key={skill.title}
          />
        ))}
      </div>
    </div>
  );
};

export default Skills;
