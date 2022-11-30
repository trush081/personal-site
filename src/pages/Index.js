import React from 'react';
import { Link } from 'react-router-dom';

import Main from '../layouts/Main';

const Index = () => (
  <Main
    description={"Trenton Rush's personal website. Kentucky based University of Kentucky graduate."}
  >
    <article className="post" id="index">
      <header>
        <div className="title">
          <h2 data-testid="heading"><Link to="/">About this site</Link></h2>
          <p>
            A beautiful, responsive, statically-generated,
            react application written with modern Javascript.
          </p>
        </div>
      </header>
      <p> Welcome to my portfolio site. Please feel free to read more <Link to="/about">about me</Link>,
        or you can check out my {' '}
        <Link to="/resume">resume</Link>, {' '}
        <Link to="/projects">projects</Link>, {' '}
        view <Link to="/stats">personal statistics</Link>, {' '}
        or <Link to="/contact">contact</Link> me.
      </p>
      <p> I am definitly no expert in front-end development, so I must give credit to the original developer <a href="https://github.com/mldangelo/personal-site">here</a>. However, I have put my own spin on things.</p>
    </article>
  </Main>
);

export default Index;
