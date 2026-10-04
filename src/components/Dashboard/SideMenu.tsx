'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { signOut } from '@/lib/actions/auth';
import type { NavItem, NavLink } from '@/lib/dashboard-nav';

const MenuLink = ({ link, active }: { link: NavLink; active: boolean }) => {
  if (link.external || /^https?:\/\//.test(link.href)) {
    return (
      <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}>
        {link.label}{link.external && <span aria-hidden="true"> &#8599;</span>}
      </a>
    );
  }
  return <Link href={link.href} className={active ? 'active' : undefined}>{link.label}</Link>;
};

const SideMenu = ({ items, email, role }: { items: NavItem[]; email?: string; role: string }) => {
  const pathname = usePathname();
  const isActive = (href: string) => (
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  );

  return (
    <aside className="dashboard-menu">
      <div className="dashboard-user">
        <span className="dashboard-email">{email}</span>
        <span className="dashboard-role">{role}</span>
      </div>
      <nav aria-label="Dashboard">
        <ul>
          {items.map((item) => {
            const open = item.alwaysOpen || isActive(item.href);
            return (
              <li key={item.href}>
                {item.alwaysOpen
                  ? <span className="dashboard-menu-heading">{item.label}</span>
                  : <MenuLink link={item} active={isActive(item.href)} />}
                {item.children && item.children.length > 0 && open && (
                  <ul className="dashboard-submenu">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <MenuLink link={child} active={isActive(child.href)} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="dashboard-footer">
        <Link href="/" className="dashboard-back">&larr; View site</Link>
        <form action={signOut}>
          <button type="submit" className="small">Sign out</button>
        </form>
      </div>
    </aside>
  );
};

export default SideMenu;
