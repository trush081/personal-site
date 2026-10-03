import { hasRole, type AuthState, type Role } from '@/lib/auth';
import sections from '@/lib/sections';

export interface NavLink {
  label: string;
  href: string;
  role?: Role; // minimum role needed to see it (default: any signed-in user)
}

export interface NavItem extends NavLink {
  children?: NavLink[];
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
    label: 'Account',
    href: '/dashboard/account',
    children: [
      { label: 'Settings', href: '/dashboard/account' },
      { label: 'Users', href: '/dashboard/account/users', role: 'owner' },
    ],
  },
];

const visible = (auth: AuthState) => (link: NavLink) => hasRole(auth, link.role ?? 'user');

export const navFor = (auth: AuthState): NavItem[] => navItems
  .filter(visible(auth))
  .map((item) => {
    const children = item.children?.filter(visible(auth));
    // Hide a submenu that would only repeat the parent link.
    return { ...item, children: children && children.length > 1 ? children : undefined };
  });

export default navItems;
