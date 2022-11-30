import React from 'react';
import { Link } from 'react-router-dom';

import Main from '../layouts/Main';
import ContactForm from '../components/Forms/Test';

const Test = () => (
  <Main
    title="Test"
    description="Test"
  >
    <article className="post markdown" id="about">
      <header>
        <div className="title">
          <h2 data-testid="heading"><Link to="/test">Test</Link></h2>
        </div>
      </header>
      <ContactForm />
    </article>
  </Main>
);

export default Test;
