const STORAGE_KEY = "guest_session_id";
const PREFIX = "guest_";

export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || !id.startsWith(PREFIX)) {
      id = `${PREFIX}${crypto.randomUUID()}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `${PREFIX}${crypto.randomUUID()}`;
  }
}
