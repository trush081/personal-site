import Link from 'next/link';

import AccountLink from './AccountLink';
import Hamburger from './Hamburger';
import routes from '@/data/routes';

// Websites Navbar, displays routes defined in 'src/data/routes'
const Navigation = () => (
  <header id="header">
    <h1 className="index-link">
      {routes.filter((l) => l.index).map((l) => (
        <Link key={l.label} href={l.path}>{l.label}</Link>
      ))}
    </h1>
    <nav className="links">
      <ul>
        {routes.filter((l) => !l.index).map((l) => (
          <li key={l.label}>
            <Link href={l.path}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
    <nav className="account-link">
      <AccountLink />
    </nav>
    <Hamburger />
  </header>
);

export default Navigation;
