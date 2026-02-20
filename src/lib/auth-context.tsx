"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string;
};

type AuthContextValue = {
  data: { session: { user: SessionUser } } | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  data: null,
  status: "loading",
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AuthContextValue["data"]>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (json.user) {
        setData({
          session: {
            user: {
              id: json.user.id,
              email: json.user.email,
              name: json.user.name,
              image: json.user.image,
              role: json.user.role,
            },
          },
        });
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch {
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        fetchUser();
      }
    });

    const onAuthChange = () => fetchUser();
    if (typeof window !== "undefined") {
      window.addEventListener("auth-change", onAuthChange);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-change", onAuthChange);
      }
    };
  }, [supabase.auth, fetchUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setData(null);
    setStatus("unauthenticated");
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ data, status, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Drop-in replacement for useSession from next-auth/react */
export function useSession() {
  const ctx = useContext(AuthContext);
  return {
    data: ctx.data,
    status: ctx.status,
    signOut: ctx.signOut,
  };
}
