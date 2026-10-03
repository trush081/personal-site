'use client';

import { useActionState } from 'react';

import { signIn } from '@/lib/actions/auth';

const LoginForm = ({ next }: { next?: string }) => {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="dashboard-form">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email">Email
          <input id="email" name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <div>
        <label htmlFor="password">Password
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </label>
      </div>
      {state?.error && <p className="dashboard-error" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
};

export default LoginForm;
