import { describe, expect, it } from 'vitest';

import { validateWorkspaceUrl } from './validation';

describe('workspace URL validation', () => {
  it('requires a value', () => {
    expect(validateWorkspaceUrl('   ')).toEqual({ code: 'required' });
  });

  it('rejects malformed and unsupported URLs', () => {
    expect(validateWorkspaceUrl('example.com')).toEqual({ code: 'invalid' });
    expect(validateWorkspaceUrl('ftp://example.com/file')).toEqual({ code: 'protocol' });
  });

  it('rejects embedded credentials before the request reaches the API', () => {
    expect(validateWorkspaceUrl('https://user:secret@example.com')).toEqual({
      code: 'credentials',
    });
  });

  it('normalizes valid HTTP and HTTPS URLs', () => {
    expect(validateWorkspaceUrl(' https://example.com/catalog ')).toEqual({
      normalizedUrl: 'https://example.com/catalog',
    });
    expect(validateWorkspaceUrl('http://example.com')).toEqual({
      normalizedUrl: 'http://example.com/',
    });
  });
});
