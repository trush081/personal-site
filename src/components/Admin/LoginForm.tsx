'use client';

import { useActionState } from 'react';

import { signIn } from '@/app/admin/actions';

const LoginForm = () => {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="admin-form">
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
      {state?.error && <p className="admin-error" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
};

export default LoginForm;
