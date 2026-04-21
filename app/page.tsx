"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

type SessionState = "loading" | "signed-in" | "signed-out";

export default function HomePage() {
  const supabase = createClient();
  const [sessionState, setSessionState] = useState<SessionState>("loading");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setSessionState(session ? "signed-in" : "signed-out");
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session ? "signed-in" : "signed-out");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const isSignedIn = sessionState === "signed-in";
  const adminHref = isSignedIn ? "/admin" : "/login?redirect=/admin";
  const questionnaireHref = isSignedIn
    ? "/questionnaire/basic-info"
    : "/login?redirect=/questionnaire/basic-info";

  return (
    <main style={mainStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>矿工安全意识智能评估平台</div>

        <h1 style={titleStyle}>AI 安全意识检测与标准化报告系统</h1>

        <p style={introStyle}>
          面向矿工安全意识评估，支持登录后答题、AI 分析、报告生成和后台统一管理。
        </p>

        <div style={primaryGridStyle}>
          <Link href={questionnaireHref} style={{ textDecoration: "none" }}>
            <button style={primaryButtonStyle}>
              开始答题
            </button>
          </Link>

          <Link href={adminHref} style={{ textDecoration: "none" }}>
            <button style={primaryButtonStyle}>
              管理员入口
            </button>
          </Link>
        </div>

        <div style={secondaryActionsStyle}>
          <Link href="/login?redirect=/admin" style={smallLinkStyle}>
            登录
          </Link>
          <Link href="/register" style={smallLinkStyle}>
            注册
          </Link>
        </div>
      </section>

      <section style={featureGridStyle}>
        <FeatureCard
          title="问卷采集"
          text="登录用户填写基本信息与10道安全场景题，提交后进入分析流程。"
        />
        <FeatureCard
          title="AI 分析"
          text="系统整合问卷答案，生成结构化安全意识分析结果。"
        />
        <FeatureCard
          title="后台管理"
          text="管理员查看问卷、报告、评分结果与执行状态。"
        />
      </section>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <article style={cardStyle}>
      <h2 style={cardTitleStyle}>{title}</h2>
      <p style={cardTextStyle}>{text}</p>
    </article>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  padding: "64px 14px 28px",
};

const heroStyle: React.CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: "clamp(22px, 5vw, 34px) clamp(16px, 4vw, 24px)",
  boxShadow: "0 12px 34px rgba(15, 23, 42, 0.08)",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-flex",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  padding: "8px 12px",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 14,
};

const titleStyle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
  fontSize: "clamp(28px, 8vw, 52px)",
  lineHeight: 1.18,
  color: "#0f172a",
  letterSpacing: 0,
  maxWidth: 880,
};

const introStyle: React.CSSProperties = {
  fontSize: "clamp(15px, 3.8vw, 20px)",
  lineHeight: 1.75,
  color: "#475569",
  maxWidth: 860,
  marginTop: 0,
  marginBottom: 20,
};

const primaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
  gap: 10,
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "clamp(13px, 3.6vw, 18px) 16px",
  fontSize: "clamp(17px, 4.6vw, 22px)",
  fontWeight: 900,
  cursor: "pointer",
  minHeight: 54,
};

const secondaryActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginTop: 14,
  flexWrap: "wrap",
};

const smallLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 82,
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  color: "#334155",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 800,
};

const featureGridStyle: React.CSSProperties = {
  maxWidth: 920,
  margin: "14px auto 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 10,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "14px 16px",
  background: "#fff",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "clamp(18px, 5vw, 22px)",
  marginTop: 0,
  marginBottom: 8,
  color: "#0f172a",
};

const cardTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.65,
  margin: 0,
};
