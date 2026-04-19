"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const runtimePromptSummary = `当前生产分析链路采用固定已验证 Prompt，核心结构如下：

1. 明确矿工安全意识评估角色
2. 基于 9 个维度进行 0-10 分评分：
   - 安全优先意识
   - 规范遵循意识
   - 责任担当意识
   - 侥幸心理
   - 从众心理
   - 风险识别能力
   - 应急处置能力
   - 违规干预意愿
   - 隐患上报意识
3. 要求模型返回结构化 JSON
4. 最终总分、等级、类型由后端统一规则计算`;

const defaultTemplate = `角色设定：
你是一名矿工安全意识评估分析助手。

分析目标：
请根据用户基本信息与问卷作答，从安全优先意识、规范遵循意识、责任担当意识、侥幸心理、从众心理、风险识别能力、应急处置能力、违规干预意愿、隐患上报意识等维度进行分析，并输出结构化 JSON。

输出要求：
1. 返回维度评分（0-10）
2. 返回总体评估
3. 返回主要优势表现
4. 返回关键安全盲区
5. 返回关键安全盲区与风险点
6. 返回针对性改进建议
7. 返回培训需求`;

export default function AdminPromptsPage() {
  const [template, setTemplate] = useState(defaultTemplate);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("adminPromptTemplatePreview");
    if (saved) setTemplate(saved);
  }, []);

  function handleSave() {
    localStorage.setItem("adminPromptTemplatePreview", template);
    setSaveMessage("模板已保存");
    setTimeout(() => setSaveMessage(""), 2000);
  }

  function handleReset() {
    setTemplate(defaultTemplate);
    localStorage.setItem("adminPromptTemplatePreview", defaultTemplate);
    setSaveMessage("已恢复默认模板");
    setTimeout(() => setSaveMessage(""), 2000);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "20px 14px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/admin"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            ← 返回后台首页
          </Link>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            marginBottom: 18,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 8vw, 34px)",
              color: "#0f172a",
            }}
          >
            Prompt 管理
          </h1>
          <p
            style={{
              marginTop: 10,
              color: "#64748b",
              lineHeight: 1.8,
              fontSize: "clamp(14px, 3.8vw, 16px)",
              maxWidth: 900,
            }}
          >
            统一维护分析提示词模板、评分维度说明与输出结构要求。
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <section
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "clamp(22px, 5vw, 24px)",
              }}
            >
              当前生产 Prompt 说明
            </h2>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                color: "#334155",
                lineHeight: 1.9,
                whiteSpace: "pre-wrap",
                fontSize: 15,
              }}
            >
              {runtimePromptSummary}
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "clamp(22px, 5vw, 24px)",
              }}
            >
              配置原则
            </h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                color: "#334155",
                lineHeight: 1.9,
                fontSize: 15,
              }}
            >
              <li>统一评分维度定义。</li>
              <li>统一结构化 JSON 输出要求。</li>
              <li>总分、等级、类型由后端规则统一计算。</li>
              <li>配置修改需验证后纳入生产链路。</li>
            </ul>
          </section>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "clamp(24px, 6vw, 26px)",
            }}
          >
            模板内容维护
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: 15 }}>
            可在此查看和维护模板内容，用于配置管理与预览。
          </p>

          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            style={{
              width: "100%",
              minHeight: 320,
              padding: 16,
              borderRadius: 14,
              border: "1px solid #d1d5db",
              fontSize: 15,
              lineHeight: 1.8,
              resize: "vertical",
              boxSizing: "border-box",
              marginTop: 12,
            }}
          />

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button onClick={handleSave} style={primaryButtonStyle}>
              保存模板
            </button>
            <button onClick={handleReset} style={secondaryButtonStyle}>
              恢复默认
            </button>

            <Link href="/admin/prompt-preview">
              <button style={darkButtonStyle}>查看输入预览</button>
            </Link>
          </div>

          {saveMessage && (
            <p style={{ marginTop: 14, color: "#16a34a", fontWeight: 600 }}>
              {saveMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

const primaryButtonStyle = {
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  backgroundColor: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const darkButtonStyle = {
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};