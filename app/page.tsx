import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "28px",
          padding: "40px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
            padding: "12px 18px",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          矿工安全意识智能评估平台
        </div>

        <h1
          style={{
            marginTop: "28px",
            marginBottom: "16px",
            fontSize: "56px",
            lineHeight: 1.25,
            color: "#0f172a",
            maxWidth: "980px",
          }}
        >
          面向矿工行业的
          <br />
          AI 安全意识检测与标准化报告生成系统
        </h1>

        <p
          style={{
            fontSize: "20px",
            lineHeight: 1.9,
            color: "#475569",
            maxWidth: "1100px",
          }}
        >
          本系统围绕矿工安全意识评估展开，通过问卷作答、AI 分析与标准化报告生成，
          为用户提供结构清晰、表达统一、便于反馈的评估结果。
        </p>

        <div
          style={{
            display: "grid",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          <Link href="/login">
            <button
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "18px",
                padding: "22px",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              用户登录
            </button>
          </Link>

          <Link href="/register">
            <button
              style={{
                width: "100%",
                backgroundColor: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "18px",
                padding: "22px",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              用户注册
            </button>
          </Link>

          <Link href="/questionnaire">
            <button
              style={{
                width: "100%",
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "none",
                borderRadius: "18px",
                padding: "22px",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              开始填写问卷
            </button>
          </Link>

          <Link href="/admin">
            <button
              style={{
                width: "100%",
                backgroundColor: "#020617",
                color: "#fff",
                border: "none",
                borderRadius: "18px",
                padding: "22px",
                fontSize: "20px",
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
            gridTemplateColumns: "1fr",
            gap: "22px",
            marginTop: "42px",
          }}
        >
          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "22px",
              padding: "28px",
            }}
          >
            <h3 style={{ fontSize: "24px", marginTop: 0, color: "#0f172a" }}>
              问卷采集
            </h3>
            <p style={{ color: "#64748b", fontSize: "18px", lineHeight: 1.8 }}>
              支持用户填写基本信息与安全意识相关问卷内容。
            </p>
          </section>

          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "22px",
              padding: "28px",
            }}
          >
            <h3 style={{ fontSize: "24px", marginTop: 0, color: "#0f172a" }}>
              AI 分析
            </h3>
            <p style={{ color: "#64748b", fontSize: "18px", lineHeight: 1.8 }}>
              自动整合问卷内容并生成结构化分析结果。
            </p>
          </section>

          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "22px",
              padding: "28px",
            }}
          >
            <h3 style={{ fontSize: "24px", marginTop: 0, color: "#0f172a" }}>
              标准报告
            </h3>
            <p style={{ color: "#64748b", fontSize: "18px", lineHeight: 1.8 }}>
              对 AI 输出进行统一结构化处理，形成标准化报告。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}