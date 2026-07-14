export type UrlValidationCode = 'credentials' | 'invalid' | 'protocol' | 'required';

export function validateWorkspaceUrl(value: string): {
  code?: UrlValidationCode;
  normalizedUrl?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { code: 'required' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { code: 'invalid' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { code: 'protocol' };
  }
  if (url.username || url.password) {
    return { code: 'credentials' };
  }

  return { normalizedUrl: url.toString() };
}
