'use client';

import { useState } from 'react';
import Link from 'next/link';

import routes from '@/data/routes';

const Hamburger = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="hamburger-container">
      <nav className="main" id="hambuger-nav">
        <ul>
          {open ? (
            <li className="menu close-menu">
              <div role="button" tabIndex={0} onClick={() => setOpen(false)} onKeyDown={(e) => e.key === 'Enter' && setOpen(false)} className="menu-hover" aria-label="Close menu">&#10005;</div>
            </li>
          ) : (
            <li className="menu open-menu">
              <div role="button" tabIndex={0} onClick={() => setOpen(true)} onKeyDown={(e) => e.key === 'Enter' && setOpen(true)} className="menu-hover" aria-label="Open menu">&#9776;</div>
            </li>
          )}
        </ul>
      </nav>
      <div className={`bm-overlay${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />
      <div className={`bm-menu-wrap${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="bm-menu">
          <nav className="bm-item-list">
            <ul className="hamburger-ul">
              {routes.map((l) => (
                <li key={l.label}>
                  <Link href={l.path} onClick={() => setOpen(false)} tabIndex={open ? undefined : -1}>
                    <h3 className={l.index ? 'index-li' : undefined}>{l.label}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Hamburger;
