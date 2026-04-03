import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        padding: "20px 16px",
        fontFamily: "Arial, sans-serif",
        // 手机优化
        }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            padding: "32px 24px",
            boxShadow: "0 18px 50px rgba(37,99,235,0.10)",
            border: "1px solid #e5e7eb",
            // 手机优化
            }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            矿工安全意识智能评估平台
          </div>

          <h1
            style={{
              fontSize: "28px",
              lineHeight: "1.3",
              color: "#111827",
              margin: "0 0 16px 0",
              // 响应式字体
              }}
          >
            面向矿工行业的
            <br />
            AI 安全意识检测与标准化报告生成系统
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.8",
              maxWidth: "760px",
              marginBottom: "24px",
              // 响应式字体
              }}
          >
            本系统围绕矿工安全意识评估展开，通过问卷作答、提示词工程整合、
            AI 分析与标准化报告生成，为用户提供结构清晰、表述统一、便于反馈的评估结果。
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              // 响应式布局
              }}
          >
            <Link href="/questionnaire/basic-info" style={{ width: "100%" }}>
              <button
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  minHeight: "48px", // 触摸友好的高度
                  // 响应式按钮
                  }}
              >
                开始填写问卷
              </button>
            </Link>

            <Link href="/admin" style={{ width: "100%" }}>
              <button
                style={{
                  backgroundColor: "#111827",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  minHeight: "48px",
                  // 响应式按钮
                  }}
              >
                管理员入口
              </button>
            </Link>
          </div>

          <div
            style={{
              marginTop: "32px",
              display: "grid",
              gridTemplateColumns: "1fr", // 手机单列
              gap: "16px",
              // 响应式网格
              }}
          >
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#111827",
                  fontSize: "18px",
                  // 响应式字体
                  }}
              >
                问卷采集
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  // 响应式字体
                  }}
              >
                支持用户填写基本信息与安全意识相关问卷内容，后续可扩展语音输入。
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#111827",
                  fontSize: "18px",
                  // 响应式字体
                  }}
              >
                AI 分析
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  // 响应式字体
                  }}
              >
                自动整合设定、模型、答卷与输出要求，完成分类判断与初步结果生成。
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#111827",
                  fontSize: "18px",
                  // 响应式字体
                  }}
              >
                标准报告
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  // 响应式字体
                  }}
              >
                对 AI 原始结果统一字段、结构与表述，形成适合展示与管理的标准化报告。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}