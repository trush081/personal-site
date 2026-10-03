import type { AuthState } from '@/lib/auth';
import sections from '@/lib/sections';

export type Role = 'user' | 'admin';

export interface NavItem {
  label: string;
  href: string;
  roles: Role[]; // who can see it
  children?: { label: string; href: string }[];
}

// The dashboard's left-hand menu. To add a tool: create a page under
// src/app/dashboard/<name>/ and add an entry here with the roles allowed to see it.
// Pages must also check the role themselves (see requireRole in src/lib/auth.ts).
const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', roles: ['user', 'admin'] },
  {
    label: 'Site content',
    href: '/dashboard/content',
    roles: ['admin'],
    children: sections.map((s) => ({ label: s.title, href: `/dashboard/content/${s.key}` })),
  },
  { label: 'Account', href: '/dashboard/account', roles: ['user', 'admin'] },
];

export const navFor = (auth: AuthState) => (
  auth.status === 'signed-out' ? [] : navItems.filter((item) => item.roles.includes(auth.status as Role))
);

export default navItems;
