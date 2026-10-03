'use client';

import { useActionState } from 'react';

import { createUser } from '@/lib/actions/users';

const AddUserForm = () => {
  const [state, action, pending] = useActionState(createUser, undefined);

  return (
    // key resets the inputs after a user is added
    <form action={action} className="dashboard-form" key={state?.ok ? state.message : 'form'}>
      <div>
        <label htmlFor="new-email">Email
          <input id="new-email" name="email" type="email" autoComplete="off" required />
        </label>
      </div>
      <div>
        <label htmlFor="new-password">Temporary password
          <input id="new-password" name="password" type="text" autoComplete="off" minLength={10} required />
        </label>
      </div>
      <div>
        <label htmlFor="new-role">Role
          <select id="new-role" name="role" defaultValue="user">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>
      </div>
      {state?.error && <p className="dashboard-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="dashboard-ok" role="status">{state.message}</p>}
      <button type="submit" disabled={pending}>{pending ? 'Adding…' : 'Add user'}</button>
    </form>
  );
};

export default AddUserForm;
