'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { signOut } from '@/lib/actions/auth';
import type { NavItem } from '@/lib/dashboard-nav';

const SideMenu = ({ items, email, role }: { items: NavItem[]; email?: string; role: string }) => {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="dashboard-menu">
      <div className="dashboard-user">
        <span className="dashboard-email">{email}</span>
        <span className="dashboard-role">{role}</span>
      </div>
      <nav aria-label="Dashboard">
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={isActive(item.href) ? 'active' : undefined}>
                {item.label}
              </Link>
              {item.children && isActive(item.href) && (
                <ul className="dashboard-submenu">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className={pathname === child.href ? 'active' : undefined}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
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
