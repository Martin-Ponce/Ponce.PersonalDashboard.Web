/** Reads a JWT's claims. Doesn't check the signature, the API does that. */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}
