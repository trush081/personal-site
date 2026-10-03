'use client';

import { useState, useTransition } from 'react';
import dayjs from 'dayjs';

import { deleteUser, setUserRole } from '@/lib/actions/users';

export interface UserRow {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
}

const UsersTable = ({ users, currentUserId, canDelete }: {
  users: UserRow[];
  currentUserId: string;
  canDelete: boolean;
}) => {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage({ ok: result.ok, text: result.ok ? result.message ?? 'Done.' : result.error ?? 'Something went wrong.' });
    });
  };

  return (
    <>
      <div className="table-wrapper">
        <table className="dashboard-users">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const locked = user.id === currentUserId || user.role === 'owner';
              return (
                <tr key={user.id}>
                  <td>{user.email}{user.id === currentUserId && ' (you)'}</td>
                  <td>
                    {locked ? user.role : (
                      <select
                        aria-label={`Role for ${user.email}`}
                        value={user.role}
                        disabled={pending}
                        onChange={(e) => run(() => setUserRole(user.id, e.target.value))}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td>{dayjs(user.created_at).format('MMM D, YYYY')}</td>
                  <td>
                    {!locked && canDelete && (
                      <button
                        type="button"
                        className="small"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm(`Delete ${user.email}? This cannot be undone.`)) {
                            run(() => deleteUser(user.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {message && <p className={message.ok ? 'dashboard-ok' : 'dashboard-error'} role="status">{message.text}</p>}
    </>
  );
};

export default UsersTable;
