import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ default: vi.fn() }));

const { hasRole } = await import('./auth');

const as = (status: 'user' | 'admin' | 'owner') => ({ status, userId: 'u1' });

describe('hasRole', () => {
  it('never grants anything to signed-out visitors', () => {
    expect(hasRole({ status: 'signed-out' }, 'user')).toBe(false);
  });

  it('ranks owner > admin > user', () => {
    expect(hasRole(as('user'), 'user')).toBe(true);
    expect(hasRole(as('user'), 'admin')).toBe(false);
    expect(hasRole(as('admin'), 'admin')).toBe(true);
    expect(hasRole(as('admin'), 'owner')).toBe(false);
    expect(hasRole(as('owner'), 'admin')).toBe(true);
    expect(hasRole(as('owner'), 'owner')).toBe(true);
  });
});
