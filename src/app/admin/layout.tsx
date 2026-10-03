import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import Main from '@/components/Template/Main';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <Main fullPage>
    <article className="post" id="admin">
      {children}
    </article>
  </Main>
);

export default AdminLayout;
