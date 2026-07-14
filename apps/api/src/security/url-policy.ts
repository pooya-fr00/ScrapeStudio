import ipaddr from 'ipaddr.js';

import { AppError } from '../errors.js';

const BLOCKED_HOSTNAMES = new Set([
  'instance-data',
  'metadata',
  'metadata.azure.internal',
  'metadata.google.internal',
]);

const BLOCKED_HOST_SUFFIXES = [
  '.home',
  '.internal',
  '.invalid',
  '.lan',
  '.local',
  '.localhost',
  '.onion',
  '.test',
] as const;

export interface ValidatedUrl {
  hostname: string;
  url: URL;
}

function normalizedHostname(url: URL): string {
  const hostname = url.hostname.toLowerCase().replace(/\.+$/, '');

  if (!hostname) {
    throw new AppError('INVALID_URL', 400);
  }

  if (hostname !== url.hostname) {
    url.hostname = hostname;
  }

  return hostname;
}

function addressLiteral(hostname: string): string {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.slice(1, -1);
  }

  return hostname;
}

function validateIpAddress(hostname: string): boolean {
  const literal = addressLiteral(hostname);

  if (!ipaddr.isValid(literal)) {
    return false;
  }

  const address = ipaddr.parse(literal);

  if (address instanceof ipaddr.IPv6 && address.isIPv4MappedAddress()) {
    if (address.toIPv4Address().range() !== 'unicast') {
      throw new AppError('BLOCKED_IP', 400);
    }

    return true;
  }

  if (address.range() !== 'unicast') {
    throw new AppError('BLOCKED_IP', 400);
  }

  return true;
}

export function validatePublicUrl(input: string | URL): ValidatedUrl {
  let url: URL;

  try {
    url = new URL(input);
  } catch (cause) {
    throw new AppError('INVALID_URL', 400, { cause });
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new AppError('UNSUPPORTED_PROTOCOL', 400);
  }

  if (url.username || url.password) {
    throw new AppError('INVALID_URL', 400);
  }

  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new AppError('BLOCKED_PORT', 400);
  }

  const hostname = normalizedHostname(url);

  if (validateIpAddress(hostname)) {
    return { hostname: addressLiteral(hostname), url };
  }

  if (
    hostname === 'localhost' ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
    !hostname.includes('.')
  ) {
    throw new AppError('BLOCKED_HOST', 400);
  }

  return { hostname, url };
}
