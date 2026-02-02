export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    // atob / decode may fail in non-browser environments
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const json = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }
}

export function msUntilExpiry(token: string | null | undefined): number | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  const expMs = payload.exp * 1000;
  return expMs - Date.now();
}
