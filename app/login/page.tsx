"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  if (value === "/questionnaire") {
    return "/questionnaire/basic-info";
  }

  return value;
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("登录成功，正在跳转...");
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>登录</h1>
        <p style={descStyle}>登录后可进入管理员后台或开始答题。</p>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={successStyle}>{message}</div>}

        <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
          <label style={labelStyle}>邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="请输入邮箱"
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 16 }}>密码</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="请输入密码"
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={submitStyle(loading)}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div style={footerStyle}>
          还没有账号？{" "}
          <Link href="/register" style={linkStyle}>
            去注册
          </Link>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link href="/" style={{ color: "#64748b", fontSize: 14 }}>
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const panelStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 460,
  background: "#fff",
  borderRadius: 16,
  padding: 32,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  color: "#0f172a",
};

const descStyle: React.CSSProperties = {
  color: "#64748b",
  marginTop: 12,
  lineHeight: 1.7,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 15,
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: 10,
  padding: "12px 14px",
  marginTop: 16,
};

const successStyle: React.CSSProperties = {
  background: "#f0fdf4",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: 10,
  padding: "12px 14px",
  marginTop: 16,
};

function submitStyle(loading: boolean): React.CSSProperties {
  return {
    width: "100%",
    marginTop: 18,
    backgroundColor: loading ? "#93c5fd" : "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontWeight: 800,
    cursor: loading ? "not-allowed" : "pointer",
  };
}

const footerStyle: React.CSSProperties = {
  marginTop: 24,
  color: "#64748b",
  fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  fontWeight: 700,
};
