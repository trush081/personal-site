// Server actions are public endpoints, so each one must check the caller's role itself.
// This calls every exported owner/admin action as a caller one role too low and checks
// that it refuses before touching Supabase. A new action that forgets its check fails here.
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from '@/lib/auth';

const auth = vi.hoisted(() => ({ state: { status: 'signed-out' } as AuthState }));
const supabase = vi.hoisted(() => ({ server: vi.fn(), admin: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ default: supabase.server }));
vi.mock('@/lib/supabase/admin', () => ({ default: supabase.admin, isAdminApiConfigured: () => true }));
vi.mock('@/lib/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/auth')>()),
  getAuthState: async () => auth.state,
}));

const modules = {
  owner: {
    manage: await import('./manage'),
    users: await import('./users'),
  },
  admin: {
    content: await import('./content'),
  },
};

const tooLow: Record<'owner' | 'admin', AuthState[]> = {
  owner: [{ status: 'signed-out' }, { status: 'user', userId: 'u' }, { status: 'admin', userId: 'a' }],
  admin: [{ status: 'signed-out' }, { status: 'user', userId: 'u' }],
};

const actions = (Object.keys(modules) as ('owner' | 'admin')[]).flatMap((role) => (
  Object.entries(modules[role]).flatMap(([file, mod]) => Object.entries(mod)
    .filter(([, fn]) => typeof fn === 'function')
    .map(([name, fn]) => ({ role, label: `${file}.${name}`, fn: fn as (...args: unknown[]) => Promise<unknown> })))
));

beforeEach(() => {
  supabase.server.mockReset().mockImplementation(() => { throw new Error('Supabase used before the role check'); });
  supabase.admin.mockReset().mockImplementation(() => { throw new Error('Admin client used before the role check'); });
});

describe('server action authorization', () => {
  it('finds the actions', () => {
    expect(actions.length).toBeGreaterThan(5);
  });

  describe.each(actions)('$label (needs $role)', ({ role, fn }) => {
    it.each(tooLow[role])('refuses $status', async (state) => {
      auth.state = state;
      // Every action takes either (id, ...) or (prevState, formData); pass plausible values for both.
      const form = new FormData();
      form.set('id', '00000000-0000-0000-0000-000000000000');
      await expect(fn('00000000-0000-0000-0000-000000000000', form)).resolves.toEqual({ ok: false, error: 'Not authorized.' });
      expect(supabase.server).not.toHaveBeenCalled();
      expect(supabase.admin).not.toHaveBeenCalled();
    });
  });
});
