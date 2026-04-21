"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

type UserState = {
  id: string;
  email?: string;
};

export default function AuthStatus() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user ? { id: user.id, email: user.email ?? undefined } : null);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user;
      setUser(nextUser ? { id: nextUser.id, email: nextUser.email ?? undefined } : null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (loading || !user) {
    return null;
  }

  return (
    <div style={wrapperStyle}>
      <div style={idStyle} title={user.email || user.id}>
        已登录：{user.id.slice(0, 8)}
      </div>
      <button type="button" onClick={handleLogout} style={buttonStyle}>
        退出登录
      </button>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  position: "fixed",
  top: 14,
  right: 14,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  border: "1px solid #dbe3ef",
  borderRadius: 10,
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
  maxWidth: "calc(100vw - 28px)",
};

const idStyle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#f8fafc",
  color: "#334155",
  padding: "6px 8px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};
