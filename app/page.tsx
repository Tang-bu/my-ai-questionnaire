import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "16px 12px 28px",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "18px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
            padding: "10px 14px",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "clamp(13px, 3.5vw, 16px)",
          }}
        >
          矿工安全意识智能评估平台
        </div>

        <h1
          style={{
            marginTop: "20px",
            marginBottom: "14px",
            fontSize: "clamp(34px, 9vw, 72px)",
            lineHeight: 1.2,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
            wordBreak: "break-word",
          }}
        >
          面向矿工行业的
          <br />
          AI 安全意识检测与标准化报告生成系统
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 4vw, 22px)",
            lineHeight: 1.9,
            color: "#475569",
            maxWidth: "1040px",
            marginTop: 0,
            marginBottom: "22px",
          }}
        >
          本系统围绕矿工安全意识评估展开，通过问卷作答、AI 分析与标准化报告生成，
          为用户提供结构清晰、表达统一、便于反馈的评估结果。
        </p>

        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          <Link href="/login" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                padding: "16px 18px",
                fontSize: "clamp(17px, 4.4vw, 22px)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              用户登录
            </button>
          </Link>

          <Link href="/register" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#2f5be3",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                padding: "16px 18px",
                fontSize: "clamp(17px, 4.4vw, 22px)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              用户注册
            </button>
          </Link>

          <Link href="/questionnaire/page/1" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                padding: "16px 18px",
                fontSize: "clamp(17px, 4.4vw, 22px)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              开始填写问卷
            </button>
          </Link>

          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "100%",
                backgroundColor: "#020617",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                padding: "16px 18px",
                fontSize: "clamp(17px, 4.4vw, 22px)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              管理员入口
            </button>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "14px",
            marginTop: "24px",
          }}
        >
          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "18px",
              background: "#fff",
            }}
          >
            <h3
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                marginTop: 0,
                marginBottom: "10px",
                color: "#0f172a",
              }}
            >
              问卷采集
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "clamp(14px, 3.8vw, 17px)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              支持用户填写基本信息与安全意识相关问卷内容。
            </p>
          </section>

          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "18px",
              background: "#fff",
            }}
          >
            <h3
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                marginTop: 0,
                marginBottom: "10px",
                color: "#0f172a",
              }}
            >
              AI 分析
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "clamp(14px, 3.8vw, 17px)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              自动整合问卷内容并生成结构化分析结果。
            </p>
          </section>

          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "18px",
              background: "#fff",
            }}
          >
            <h3
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                marginTop: 0,
                marginBottom: "10px",
                color: "#0f172a",
              }}
            >
              标准报告
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "clamp(14px, 3.8vw, 17px)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              对 AI 输出进行统一结构化处理，形成标准化报告。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}