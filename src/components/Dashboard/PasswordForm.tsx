'use client';

import { useActionState } from 'react';

import { changePassword } from '@/lib/actions/auth';

const PasswordForm = () => {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    // key resets the inputs after a successful change
    <form action={action} className="dashboard-form" key={state?.ok ? 'done' : 'form'}>
      <div>
        <label htmlFor="current">Current password
          <input id="current" name="current" type="password" autoComplete="current-password" required />
        </label>
      </div>
      <div>
        <label htmlFor="password">New password
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
        </label>
      </div>
      <div>
        <label htmlFor="confirm">Confirm new password
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
        </label>
      </div>
      {state?.error && <p className="dashboard-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="dashboard-ok" role="status">{state.message}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Updating…' : 'Change password'}</button>
    </form>
  );
};

export default PasswordForm;
