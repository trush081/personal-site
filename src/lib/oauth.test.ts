import { describe, expect, it } from 'vitest';

import { baseUrl, describeScopes, isAuthorizationId } from './oauth';

describe('isAuthorizationId', () => {
  it('accepts the expected shape', () => {
    expect(isAuthorizationId('abc_DEF-1234')).toBe(true);
  });

  it.each(['short', 'has space 1234', 'semi;colon1234', '../../etc/passwd', 'a'.repeat(201), 123, null])(
    'rejects %s',
    (value) => expect(isAuthorizationId(value)).toBe(false),
  );
});

describe('baseUrl', () => {
  it('drops the query string and hash', () => {
    expect(baseUrl('https://app.example.com/auth/callback?code=x&state=y#z')).toBe('https://app.example.com/auth/callback');
  });

  it('returns an empty string for invalid URLs', () => {
    expect(baseUrl('not a url')).toBe('');
  });
});

describe('describeScopes', () => {
  it('labels known scopes and passes unknown ones through', () => {
    expect(describeScopes('openid  email custom')).toEqual(['Confirm who you are', 'Your email address', 'custom']);
  });
});
