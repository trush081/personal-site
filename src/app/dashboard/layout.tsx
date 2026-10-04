import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import SideMenu from '@/components/Dashboard/SideMenu';
import { requireRole } from '@/lib/auth';
import { navFor } from '@/lib/dashboard-nav';

export const metadata: Metadata = {
  title: {
    template: '%s | Overview',
    default: 'Overview',
  },
  robots: { index: false, follow: false },
};

// Signed-in area: just the side menu and content, without the public site's header.
const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const auth = await requireRole('user');

  return (
    <div className="dashboard-shell">
      <SideMenu items={navFor(auth)} email={auth.email} role={auth.status} />
      <main className="dashboard-main">
        <article className="post dashboard-content">
          {children}
        </article>
      </main>
    </div>
  );
};

export default DashboardLayout;
