import Link from "next/link";

const cards = [
  {
    title: "问卷管理",
    desc: "查看所有提交问卷、分析状态与原始作答内容。",
    href: "/admin/questionnaires",
    tag: "问卷",
    tagColor: "#16a34a",
  },
  {
    title: "报告管理",
    desc: "查看已生成的评估报告、评分结果与类型判定。",
    href: "/admin/reports",
    tag: "报告",
    tagColor: "#2563eb",
  },
  {
    title: "Prompt 管理",
    desc: "统一维护分析提示词模板、评分维度说明与输出结构要求。",
    href: "/admin/prompts",
    tag: "配置",
    tagColor: "#7c3aed",
  },
  {
    title: "模型管理",
    desc: "查看当前生产链路使用的模型配置，并维护配置草案。",
    href: "/admin/models",
    tag: "配置",
    tagColor: "#d97706",
  },
  {
    title: "输入拼装预览",
    desc: "查看系统发送给 AI 的完整输入结构与拼装结果。",
    href: "/admin/prompt-preview",
    tag: "预览",
    tagColor: "#0f766e",
  },
];

export default function AdminHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: "28px 28px 24px",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            管理员后台
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.2,
              fontWeight: 800,
            }}
          >
            后台管理中心
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "rgba(255,255,255,0.88)",
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 900,
            }}
          >
            统一管理问卷数据、分析报告、提示词模板与模型配置。当前系统采用固定生产配置运行，优先保证评分规则与分析链路稳定。
          </p>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            marginBottom: 20,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 24, color: "#0f172a" }}>
            系统概览
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#334155",
              lineHeight: 1.9,
            }}
          >
            <li>前台已支持问卷填写与分析结果查看。</li>
            <li>后台已支持问卷管理与报告管理。</li>
            <li>配置模块用于统一维护分析模板、模型参数与输入结构说明。</li>
            <li>当前版本采用固定生产配置运行，配置修改需验证后纳入生产链路。</li>
          </ul>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 20,
                  padding: 22,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: `${card.tagColor}18`,
                      color: card.tagColor,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    {card.tag}
                  </span>

                  <h3
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: 24,
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    style={{
                      marginTop: 12,
                      marginBottom: 0,
                      color: "#64748b",
                      lineHeight: 1.8,
                    }}
                  >
                    {card.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  进入模块 →
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}