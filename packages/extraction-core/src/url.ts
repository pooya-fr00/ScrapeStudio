const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function resolveHttpUrl(rawValue: string | null | undefined, baseUrl: URL): URL | null {
  const value = rawValue?.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, baseUrl);
    if (!HTTP_PROTOCOLS.has(url.protocol) || url.username || url.password) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function resolveReferenceUrl(rawValue: string | null | undefined, baseUrl: URL): URL | null {
  const value = rawValue?.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, baseUrl);
    if (url.username || url.password) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
