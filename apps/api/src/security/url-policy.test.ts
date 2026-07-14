import { describe, expect, it } from 'vitest';

import { AppError } from '../errors';
import { validatePublicUrl } from './url-policy';

function expectCode(input: string, code: AppError['code']): void {
  try {
    validatePublicUrl(input);
    throw new Error(`Expected ${input} to be rejected`);
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
  }
}

describe('public URL policy', () => {
  it.each([
    ['https://example.com/path?q=1', 'https://example.com/path?q=1'],
    ['HTTP://EXAMPLE.COM./page', 'http://example.com/page'],
    ['http://example.com:80/', 'http://example.com/'],
    ['https://93.184.216.34/', 'https://93.184.216.34/'],
    ['https://[2606:4700:4700::1111]/', 'https://[2606:4700:4700::1111]/'],
  ])('accepts and normalizes public targets', (input, normalized) => {
    expect(validatePublicUrl(input).url.toString()).toBe(normalized);
  });

  it.each(['ftp://example.com', 'file:///etc/passwd', 'data:text/html,hello'])(
    'rejects unsupported protocols',
    (input) => expectCode(input, 'UNSUPPORTED_PROTOCOL'),
  );

  it.each(['https://user@example.com', 'https://user:password@example.com', 'not a URL'])(
    'rejects malformed or credentialed URLs',
    (input) => expectCode(input, 'INVALID_URL'),
  );

  it.each(['https://example.com:22', 'http://example.com:8080'])(
    'rejects nonstandard ports',
    (input) => expectCode(input, 'BLOCKED_PORT'),
  );

  it.each([
    'http://localhost',
    'http://api.localhost',
    'http://printer.local',
    'http://service.internal',
    'http://metadata.google.internal',
    'http://metadata',
    'http://intranet',
  ])('rejects local and internal hostnames', (input) => expectCode(input, 'BLOCKED_HOST'));

  it.each([
    'http://0.0.0.0',
    'http://10.0.0.1',
    'http://100.64.0.1',
    'http://127.0.0.1',
    'http://127.1',
    'http://0177.0.0.1',
    'http://0x7f000001',
    'http://2130706433',
    'http://169.254.169.254/latest/meta-data',
    'http://172.16.0.1',
    'http://192.168.1.1',
    'http://192.0.2.1',
    'http://198.18.0.1',
    'http://198.51.100.1',
    'http://203.0.113.1',
    'http://224.0.0.1',
    'http://255.255.255.255',
  ])('rejects non-public IPv4 targets and alternate notations', (input) =>
    expectCode(input, 'BLOCKED_IP'),
  );

  it.each([
    'http://[::]',
    'http://[::1]',
    'http://[::ffff:127.0.0.1]',
    'http://[fc00::1]',
    'http://[fe80::1]',
    'http://[ff02::1]',
    'http://[2001:db8::1]',
    'http://[2002:7f00:1::]',
  ])('rejects non-public and transition IPv6 targets', (input) => expectCode(input, 'BLOCKED_IP'));
});
