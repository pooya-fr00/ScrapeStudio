import { describe, expect, it } from 'vitest';

import { AppError } from '../errors';
import { createAnonymousIdentityHash } from './identity';

describe('anonymous identity hashing', () => {
  it('creates a stable salted hash without exposing the raw IP', async () => {
    const request = new Request('https://api.example.com', {
      headers: {
        'CF-Connecting-IP': '203.0.113.42',
        'X-ScrapeStudio-Client': '64f3e5d8-f8ad-4d38-9a9b-45e6f80171db',
      },
    });

    const first = await createAnonymousIdentityHash(request, 'a-secure-test-salt-value');
    const second = await createAnonymousIdentityHash(request, 'a-secure-test-salt-value');

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain('203.0.113.42');
  });

  it('changes when the salt or browser identity changes', async () => {
    const first = new Request('https://api.example.com', {
      headers: { 'X-ScrapeStudio-Client': '64f3e5d8-f8ad-4d38-9a9b-45e6f80171db' },
    });
    const second = new Request('https://api.example.com', {
      headers: { 'X-ScrapeStudio-Client': '17ca6821-e6de-4663-8d45-789a0cc5f40e' },
    });

    await expect(createAnonymousIdentityHash(first, 'a-secure-test-salt-value')).resolves.not.toBe(
      await createAnonymousIdentityHash(second, 'a-secure-test-salt-value'),
    );
  });

  it('fails closed when the deployment salt is missing', async () => {
    try {
      await createAnonymousIdentityHash(new Request('https://api.example.com'), undefined);
      throw new Error('Expected hashing to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('SERVICE_LIMIT_REACHED');
    }
  });
});
