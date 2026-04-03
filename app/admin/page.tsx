import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px 16px",
        fontFamily: "Arial, sans-serif",
        // 响应式内边距
        '@media (min-width: 640px)': {
          padding: "32px 20px",
        },
        '@media (min-width: 1024px)': {
          padding: "40px 20px",
        },
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "16px",
          // 响应式间距
          '@media (min-width: 640px)': {
            gap: "20px",
          },
        }}
      >
        <div
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            // 响应式内边距
            '@media (min-width: 640px)': {
              borderRadius: "24px",
              padding: "32px",
            },
            '@media (min-width: 1024px)': {
              padding: "36px",
            },
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.12)",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "12px",
              // 响应式字体
              '@media (min-width: 640px)': {
                fontSize: "13px",
                marginBottom: "14px",
              },
            }}
          >
            管理员后台
          </div>

          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
              fontSize: "24px",
              lineHeight: "1.3",
              // 响应式字体
              '@media (min-width: 640px)': {
                fontSize: "28px",
                marginBottom: "12px",
              },
              '@media (min-width: 1024px)': {
                fontSize: "32px",
              },
            }}
          >
            后台管理总览
          </h1>
          <p
            style={{
              color: "#d1d5db",
              lineHeight: "1.6",
              marginBottom: 0,
              fontSize: "14px",
              // 响应式字体
              '@media (min-width: 640px)': {
                lineHeight: "1.9",
                fontSize: "15px",
              },
            }}
          >
            这里用于管理问卷内容、提示词模板、模型配置和标准报告输出规则。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr", // 手机单列
            gap: "16px",
            // 响应式网格
            '@media (min-width: 640px)': {
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            },
            '@media (min-width: 768px)': {
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            },
          }}
        >
          <Link href="/admin/questionnaires" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                // 响应式内边距
                '@media (min-width: 640px)': {
                  borderRadius: "18px",
                  padding: "24px",
                },
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#111827",
                  fontSize: "18px",
                  marginBottom: "8px",
                  // 响应式字体
                  '@media (min-width: 640px)': {
                    fontSize: "20px",
                    marginBottom: "10px",
                  },
                }}
              >
                问卷管理
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  lineHeight: "1.6",
                  marginBottom: 0,
                  fontSize: "14px",
                  // 响应式字体
                  '@media (min-width: 640px)': {
                    lineHeight: "1.8",
                    fontSize: "16px",
                  },
                }}
              >
                维护题目、结构和问卷内容。
              </p>
            </div>
          </Link>

          <Link href="/admin/prompts" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                // 响应式内边距
                '@media (min-width: 640px)': {
                  borderRadius: "18px",
                  padding: "24px",
                },
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#111827",
                  fontSize: "18px",
                  marginBottom: "8px",
                  // 响应式字体
                  '@media (min-width: 640px)': {
                    fontSize: "20px",
                    marginBottom: "10px",
                  },
                }}
              >
                Prompt 管理
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  lineHeight: "1.6",
                  marginBottom: 0,
                  fontSize: "14px",
                  // 响应式字体
                  '@media (min-width: 640px)': {
                    lineHeight: "1.8",
                    fontSize: "16px",
                  },
                }}
              >
                管理提示词模板和输出要求。
              </p>
            </div>
          </Link>

          <Link href="/admin/models" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#111827" }}>模型管理</h3>
              <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: 0 }}>
                配置模型类型、参数与切换逻辑。
              </p>
            </div>
          </Link>

          <Link href="/admin/reports" style={{ textDecoration: "none" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#111827" }}>报告管理</h3>
              <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: 0 }}>
                管理报告模板、字段和格式化规则。
              </p>
            </div>
          </Link>
          <Link href="/admin/prompt-preview" style={{ textDecoration: "none" }}>
  <div
    style={{
      backgroundColor: "#ffffff",
      borderRadius: "18px",
      padding: "24px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
    }}
  >
    <h3 style={{ marginTop: 0, color: "#111827" }}>Prompt 拼装预览</h3>
    <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: 0 }}>
      查看系统准备发送给 AI 的完整输入内容。
    </p>
  </div>
</Link>
        </div>

        <div>
          <Link href="/">
            <button
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              返回首页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}