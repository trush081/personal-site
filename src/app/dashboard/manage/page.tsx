import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth';

const Manage = async () => {
  await requireRole('owner');
  redirect('/dashboard/manage/apps');
};

export default Manage;
