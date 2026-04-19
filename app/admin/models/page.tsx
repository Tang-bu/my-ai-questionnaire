"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const runtimeConfig = {
  provider: "SiliconFlow",
  modelName: "Qwen/Qwen2.5-14B-Instruct",
  temperature: "0.2",
  maxTokens: "2500",
  responseFormat: "JSON Object",
  status: "当前生产链路使用",
};

const defaultDraftConfig = {
  provider: "SiliconFlow",
  modelName: "Qwen/Qwen2.5-14B-Instruct",
  temperature: "0.2",
  maxTokens: "2500",
  responseFormat: "JSON Object",
};

export default function AdminModelsPage() {
  const [draftConfig, setDraftConfig] = useState(defaultDraftConfig);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("adminModelConfigPreview");
    if (saved) {
      try {
        setDraftConfig(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function handleChange(field: string, value: string) {
    setDraftConfig((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    localStorage.setItem("adminModelConfigPreview", JSON.stringify(draftConfig));
    setSaveMessage("配置已保存");
    setTimeout(() => setSaveMessage(""), 2000);
  }

  function handleReset() {
    setDraftConfig(defaultDraftConfig);
    localStorage.setItem(
      "adminModelConfigPreview",
      JSON.stringify(defaultDraftConfig)
    );
    setSaveMessage("已恢复默认配置");
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            模型管理
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
            查看当前分析链路使用的模型配置，并维护管理端配置草案。
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <ConfigCard
            title="当前生产链路配置"
            tag="已启用"
            tagColor="#16a34a"
            items={[
              ["模型服务商", runtimeConfig.provider],
              ["模型名称", runtimeConfig.modelName],
              ["Temperature", runtimeConfig.temperature],
              ["Max Tokens", runtimeConfig.maxTokens],
              ["响应格式", runtimeConfig.responseFormat],
              ["状态", runtimeConfig.status],
            ]}
          />

          <ConfigCard
            title="配置说明"
            tag="配置"
            tagColor="#2563eb"
            items={[
              ["运行模式", "固定生产配置"],
              ["配置策略", "先验证后切换"],
              ["稳定性要求", "评分规则优先保持一致"],
              ["管理方式", "配置集中维护"],
            ]}
          />
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
              fontSize: "clamp(24px, 6vw, 26px)",
            }}
          >
            配置草案维护
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: 15 }}>
            可在此维护管理端配置草案，用于预览与整理。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
              marginTop: 16,
            }}
          >
            <FormField label="模型服务商">
              <input
                value={draftConfig.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
                style={inputStyle}
              />
            </FormField>

            <FormField label="模型名称">
              <input
                value={draftConfig.modelName}
                onChange={(e) => handleChange("modelName", e.target.value)}
                style={inputStyle}
              />
            </FormField>

            <FormField label="Temperature">
              <input
                value={draftConfig.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                style={inputStyle}
              />
            </FormField>

            <FormField label="Max Tokens">
              <input
                value={draftConfig.maxTokens}
                onChange={(e) => handleChange("maxTokens", e.target.value)}
                style={inputStyle}
              />
            </FormField>

            <FormField label="响应格式">
              <input
                value={draftConfig.responseFormat}
                onChange={(e) => handleChange("responseFormat", e.target.value)}
                style={inputStyle}
              />
            </FormField>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <button onClick={handleSave} style={primaryButtonStyle}>
              保存配置
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

function ConfigCard({
  title,
  tag,
  tagColor,
  items,
}: {
  title: string;
  tag: string;
  tagColor: string;
  items: [string, string][];
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: "6px 10px",
          borderRadius: 999,
          background: `${tagColor}18`,
          color: tagColor,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {tag}
      </div>

      <h2
        style={{
          marginTop: 0,
          fontSize: "clamp(22px, 5vw, 24px)",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map(([label, value]) => (
          <div
            key={label}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 14,
              background: "#fafafa",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div
              style={{
                color: "#0f172a",
                fontWeight: 700,
                lineHeight: 1.6,
                wordBreak: "break-word",
                fontSize: 15,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "#334155",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box" as const,
  background: "#fff",
};

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