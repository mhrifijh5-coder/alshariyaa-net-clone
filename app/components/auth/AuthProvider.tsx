"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe, sessionError } = useAuthStore();
  useEffect(() => {
    void fetchMe();

    // Only retry on network recovery, NOT on every tab focus.
    // window.focus fires constantly (mobile resume, tab switch, etc.)
    // and each fire triggers /api/auth/me → Vercel Fluid CPU + CDN request.
    const retry = () => {
      void fetchMe(true);
    };

    // Retry every 30s ONLY when there is an active session error
    const timer = setInterval(() => {
      if (useAuthStore.getState().sessionError) retry();
    }, 30000);

    window.addEventListener("online", retry);
    // Removed: window.addEventListener("focus", retry)
    // Reason: causes /api/auth/me on every tab switch — major CDN request driver

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", retry);
    };
  }, [fetchMe]);

  return <>
    {sessionError && <div role="status" dir="rtl" className="bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
      {sessionError} <button className="mr-2 underline" onClick={() => void fetchMe(true)}>تحديث الجلسة</button>
    </div>}
    {children}
  </>;
}
