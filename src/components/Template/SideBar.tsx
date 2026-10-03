import Link from 'next/link';

import ContactIcons from '../Contact/ContactIcons';
import Greetings from '../Sidebar/Greetings';
import LearnMore from '../Sidebar/LearnMore';

const SideBar = () => (
  <section id="sidebar">
    <section id="intro">
      <Link href="/" className="logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/me.jpg" alt="" />
      </Link>
      <header>
        <h2>Trenton Rush</h2>
        <p><a href="mailto:trush081@gmail.com">Trush081@gmail.com</a></p>
      </header>
    </section>

    <section className="blurb">
      <h2>About</h2>
      <p><Greetings />
        I am a <a href="https://www.uky.edu/">University of Kentucky</a> graduate in the College of Engineering, and
        currently employed by <a href="https://www.papajohns.com">Papa Johns International</a>.
      </p>
      <ul className="actions">
        <li>
          <LearnMore />
        </li>
      </ul>
    </section>

    <section id="footer">
      <ContactIcons />
      <p className="copyright">Trenton Rush <Link href="/">TrentonRush.com</Link>.</p>
      <p className="copyright">&copy; Credit to <a href="https://www.mldangelo.com">mldangelo.com</a>.</p>
    </section>
  </section>
);

export default SideBar;
