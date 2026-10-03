import Link from 'next/link';
import dayjs from 'dayjs';

import { requireRole } from '@/lib/auth';
import { navFor } from '@/lib/dashboard-nav';
import { getSection } from '@/lib/sections';
import createClient from '@/lib/supabase/server';

const Overview = async () => {
  const auth = await requireRole('user');
  const tools = navFor(auth).filter((item) => item.href !== '/dashboard');

  let recent: { key: string; updated_at: string }[] = [];
  if (auth.status === 'admin') {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_content')
      .select('key, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    recent = data ?? [];
  }

  return (
    <>
      <header>
        <div className="title">
          <h2>Dashboard</h2>
          <p>Welcome back{auth.email ? `, ${auth.email}` : ''}</p>
        </div>
      </header>

      <div className="dashboard-cards">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="dashboard-card">
            <h3>{tool.label}</h3>
            {tool.children && <p>{tool.children.length} sections</p>}
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="dashboard-recent">
          <h3>Recently updated</h3>
          <ul>
            {recent.map((row) => (
              <li key={row.key}>
                <Link href={`/dashboard/content/${row.key}`}>{getSection(row.key)?.title ?? row.key}</Link>
                <span>{dayjs(row.updated_at).format('MMM D, YYYY h:mm A')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default Overview;
