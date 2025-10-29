// src/lib/use-session.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { AppUser } from "@/types/user";

type UseSessionResult = {
  user: AppUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const j = await res.json();
      setUser(j.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { user, loading, refresh: load };
}
