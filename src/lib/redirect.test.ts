import { describe, expect, it } from 'vitest';

import { safeRedirect } from './redirect';

describe('safeRedirect', () => {
  it.each([
    '/dashboard',
    '/dashboard/manage/users',
    '/oauth/consent?authorization_id=abc12345',
  ])('allows %s', (path) => {
    expect(safeRedirect(path)).toBe(path);
  });

  it('trims whitespace', () => {
    expect(safeRedirect('  /dashboard/account  ')).toBe('/dashboard/account');
  });

  // Anything that could send people off-site after login must fall back.
  it.each([
    'https://evil.example',
    '//evil.example/dashboard',
    '/login',
    '/oauth/consent',
    'javascript:alert(1)',
    '',
    null,
    undefined,
    42,
  ])('rejects %s', (value) => {
    expect(safeRedirect(value)).toBe('/dashboard');
  });
});
