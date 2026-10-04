import { hasRole, type AuthState, type Role } from '@/lib/auth';
import { appHref, opensInNewTab, type App } from '@/lib/apps';
import sections from '@/lib/sections';

export interface NavLink {
  label: string;
  href: string;
  role?: Role; // minimum role needed to see it (default: any signed-in user)
  external?: boolean; // opens in a new tab
}

export interface NavItem extends NavLink {
  children?: NavLink[];
  alwaysOpen?: boolean; // show children even when the item isn't active
}

// The dashboard's left-hand menu. To add a tool: create a page under
// src/app/dashboard/<name>/ and add an entry here with the minimum role allowed to see it.
// Pages must also check the role themselves (see requireRole in src/lib/auth.ts).
const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard' },
  {
    label: 'Site content',
    href: '/dashboard/content',
    role: 'admin',
    children: sections.map((s) => ({ label: s.title, href: `/dashboard/content/${s.key}` })),
  },
  {
    label: 'Manage',
    href: '/dashboard/manage',
    role: 'owner',
    children: [
      { label: 'Apps', href: '/dashboard/manage/apps' },
      { label: 'Groups', href: '/dashboard/manage/groups' },
      { label: 'Users', href: '/dashboard/manage/users' },
    ],
  },
  { label: 'Account', href: '/dashboard/account' },
];

const visible = (auth: AuthState) => (link: NavLink) => hasRole(auth, link.role ?? 'user');

export const navFor = (auth: AuthState, apps: App[] = []): NavItem[] => {
  const items = navItems
    .filter(visible(auth))
    .map((item) => ({ ...item, children: item.children?.filter(visible(auth)) }));

  // The apps this person can open, right after Overview.
  if (apps.length) {
    items.splice(1, 0, {
      label: 'Apps',
      href: '/dashboard/apps',
      alwaysOpen: true,
      children: apps.map((app) => ({ label: app.name, href: appHref(app), external: opensInNewTab(app) })),
    });
  }
  return items;
};

export default navItems;
