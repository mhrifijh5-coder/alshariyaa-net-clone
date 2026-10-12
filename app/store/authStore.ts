import { create } from "zustand";

export interface AuthUser {
  id?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  sessionError: string;
  loggingOut: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  fetchMe: (force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const CACHE_KEY = "auth_user_cache";
let revision = 0;
let checking = false;
let pendingCheck = false;

function readCache(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); }
  catch { return null; }
}
function writeCache(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* Storage can be unavailable in private browsing. */ }
}
function clearDrafts() {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("auth_")) sessionStorage.removeItem(key);
    }
  } catch { /* optional cache */ }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, loading: true, initialized: false, sessionError: "", loggingOut: false,
  setUser: (user) => {
    revision++;
    writeCache(user);
    set({ user, loading: false, initialized: true, sessionError: "" });
  },
  setLoading: (loading) => set({ loading }),
  fetchMe: async (force = false) => {
    if (get().loggingOut || (get().initialized && !force)) return;
    if (checking) { pendingCheck ||= force; return; }
    checking = true;
    const requestRevision = revision;
    const cached = get().user ?? readCache();
    if (!get().initialized) set({ user: cached, loading: true });
    try {
      // Consult the server session
      const res = await fetch("/api/auth/me", { cache: "no-store", signal: AbortSignal.timeout(7000) });
      if (!res.ok) throw new Error("session unavailable");
      const data = await res.json();
      if (typeof data.authenticated !== "boolean") throw new Error("invalid session response");
      if (requestRevision !== revision) return;
      const user = data.authenticated && data.user ? (data.user as AuthUser) : null;
      writeCache(user);
      set({ user, loading: false, initialized: true, sessionError: "" });
    } catch {
      if (requestRevision !== revision) return;
      // Do not resurrect stale cache if user was logged out
      const fallbackUser = get().user;
      set({ user: fallbackUser, loading: false, initialized: true, sessionError: fallbackUser ? "تعذر التحقق من اتصال حسابك. سنعيد المحاولة تلقائيًا." : "" });
    } finally {
      checking = false;
      if (pendingCheck) { pendingCheck = false; void get().fetchMe(true); }
    }
  },
  logout: async () => {
    if (get().loggingOut) return;
    revision++; // Invalidate any session response started before logout
    set({ loggingOut: true });
    // Reset local state immediately so user sees logged-out UI instantaneously
    writeCache(null);
    clearDrafts();
    set({ user: null, initialized: true, loading: false, sessionError: "" });
    try {
      await fetch("/api/auth/logout", { method: "POST", signal: AbortSignal.timeout(4000) }).catch(() => {});
    } finally {
      set({ loggingOut: false });
    }
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== CACHE_KEY && event.key !== null) return;
    revision++;
    if (!event.newValue) {
      // Sync locally; never issue another logout request from a second tab.
      clearDrafts();
      useAuthStore.setState({ user: null, initialized: true, loading: false, sessionError: "" });
    } else {
      void useAuthStore.getState().fetchMe(true);
    }
  });
}
