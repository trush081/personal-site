import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import Main from '@/components/Template/Main';
import LoginForm from '@/components/Dashboard/LoginForm';
import { getAuthState } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

const Login = async ({ searchParams }: { searchParams: Promise<{ next?: string }> }) => {
  const { next } = await searchParams;
  if ((await getAuthState()).status !== 'signed-out') redirect('/dashboard');

  return (
    <Main fullPage>
      <article className="post" id="login">
        <header>
          <div className="title">
            <h2>Sign in</h2>
            <p>Sign in to your dashboard</p>
          </div>
        </header>
        <LoginForm next={next} />
      </article>
    </Main>
  );
};

export default Login;
