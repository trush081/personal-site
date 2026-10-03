import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signOut } from './actions';
import { getAuthState } from '@/lib/auth';
import sections from '@/lib/sections';

const Admin = async () => {
  const auth = await getAuthState();
  if (auth.status === 'signed-out') redirect('/admin/login');

  if (auth.status === 'user') {
    return (
      <>
        <header>
          <div className="title">
            <h2>Admin</h2>
            <p>Not authorized</p>
          </div>
        </header>
        <p>{auth.email} is signed in but does not have admin access.</p>
        <form action={signOut}><button type="submit">Sign out</button></form>
      </>
    );
  }

  return (
    <>
      <header>
        <div className="title">
          <h2>Admin</h2>
          <p>Choose a section to edit. Changes go live right away.</p>
        </div>
      </header>
      <ul className="admin-sections">
        {sections.map((s) => (
          <li key={s.key}>
            <h3><Link href={`/admin/${s.key}`}>{s.title}</Link></h3>
            <p>{s.description}</p>
          </li>
        ))}
      </ul>
      <p className="admin-signed-in">Signed in as {auth.email}</p>
      <form action={signOut}><button type="submit">Sign out</button></form>
    </>
  );
};

export default Admin;
