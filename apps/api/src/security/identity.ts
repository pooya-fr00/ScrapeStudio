import { AppError } from '../errors.js';

const ANONYMOUS_CLIENT_ID = 'anonymous-client';
const CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createAnonymousIdentityHash(
  request: Request,
  salt: string | undefined,
): Promise<string> {
  if (!salt || salt.length < 16) {
    throw new AppError('SERVICE_LIMIT_REACHED', 503);
  }

  const edgeIp = request.headers.get('CF-Connecting-IP')?.trim() || 'unknown-edge-ip';
  const suppliedClientId = request.headers.get('X-ScrapeStudio-Client')?.trim();
  const clientId =
    suppliedClientId && CLIENT_ID_PATTERN.test(suppliedClientId)
      ? suppliedClientId
      : ANONYMOUS_CLIENT_ID;
  const data = new TextEncoder().encode(`${salt}\u0000${edgeIp}\u0000${clientId}`);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return hex(digest);
}
