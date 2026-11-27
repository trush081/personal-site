import { describe, expect, it } from 'vitest';

import { baseUrl, describeScopes, findCallbackConflicts, isAuthorizationId } from './oauth';

describe('findCallbackConflicts', () => {
  const shared = 'https://abc.supabase.co/auth/v1/callback';
  const others = [
    { name: 'Granite', oauth_redirect_uris: [shared, 'https://granite.example/cb'] },
    { name: 'Legacy', oauth_redirect_uris: null },
  ];

  it('reports a callback URL another app already uses', () => {
    expect(findCallbackConflicts([shared], others)).toEqual([{ uri: shared, appName: 'Granite' }]);
  });

  it('allows URLs nobody else uses', () => {
    expect(findCallbackConflicts(['https://new.example/cb'], others)).toEqual([]);
  });

  it('is exact: a different path or host is not a conflict', () => {
    expect(findCallbackConflicts(['https://abc.supabase.co/auth/v1/callback/'], others)).toEqual([]);
    expect(findCallbackConflicts(['https://xyz.supabase.co/auth/v1/callback'], others)).toEqual([]);
  });
});

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
