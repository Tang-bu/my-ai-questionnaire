"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    rawRedirect === "/questionnaire"
      ? "/questionnaire/page/1"
      : rawRedirect || "/";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
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
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#fff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "30px", color: "#0f172a" }}>
          登录矿工安全评估平台
        </h1>
        <p style={{ color: "#64748b", marginTop: "12px", lineHeight: 1.7 }}>
          使用邮箱和密码登录
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "12px 14px",
              marginTop: "16px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "12px 14px",
              marginTop: "16px",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginTop: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              marginBottom: "8px",
            }}
          >
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="请输入邮箱"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              marginTop: "16px",
              marginBottom: "8px",
            }}
          >
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "18px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div style={{ marginTop: "24px", color: "#64748b", fontSize: "14px" }}>
          还没有账号？{" "}
          <Link href="/register" style={{ color: "#2563eb", fontWeight: 600 }}>
            去注册
          </Link>
        </div>

        <div style={{ marginTop: "16px" }}>
          <Link href="/" style={{ color: "#64748b", fontSize: "14px" }}>
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