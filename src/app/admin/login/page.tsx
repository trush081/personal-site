import { redirect } from 'next/navigation';

import LoginForm from '@/components/Admin/LoginForm';
import { getAuthState } from '@/lib/auth';

const Login = async () => {
  if ((await getAuthState()).status !== 'signed-out') redirect('/admin');

  return (
    <>
      <header>
        <div className="title">
          <h2>Admin</h2>
          <p>Sign in to edit the site</p>
        </div>
      </header>
      <LoginForm />
    </>
  );
};

export default Login;
