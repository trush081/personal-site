import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import Main from '@/components/Template/Main';
import SideMenu from '@/components/Dashboard/SideMenu';
import { requireRole } from '@/lib/auth';
import { navFor } from '@/lib/dashboard-nav';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'Dashboard',
  },
  robots: { index: false, follow: false },
};

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const auth = await requireRole('user');

  return (
    <Main fullPage>
      <div className="dashboard">
        <SideMenu items={navFor(auth)} email={auth.email} role={auth.status} />
        <article className="post dashboard-content">
          {children}
        </article>
      </div>
    </Main>
  );
};

export default DashboardLayout;
