export type SessionUser = {
  id: number;
  username: string;
};

const SESSION_KEY = 'tubi26.user';

export function getSessionUser(): SessionUser | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<SessionUser>;
    if (!Number.isInteger(parsed.id) || typeof parsed.username !== 'string') return null;
    return { id: parsed.id as number, username: parsed.username };
  } catch {
    return null;
  }
}

export function getUserId(): number | null {
  return getSessionUser()?.id ?? null;
}

export function setSessionUser(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
