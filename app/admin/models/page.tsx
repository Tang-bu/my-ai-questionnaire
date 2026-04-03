"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const defaultConfig = {
  provider: "OpenAI",
  modelName: "gpt-4o-mini",
  temperature: "0.3",
  maxTokens: "2000",
};

export default function AdminModelsPage() {
  const [modelConfig, setModelConfig] = useState(defaultConfig);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedModelConfig = localStorage.getItem("adminModelConfig");
    if (savedModelConfig) {
      setModelConfig(JSON.parse(savedModelConfig));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setModelConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetConfig = () => {
    setModelConfig(defaultConfig);
    setSaveMessage("已恢复为默认配置，记得点击保存");
  };

  const handleSaveConfig = () => {
    localStorage.setItem("adminModelConfig", JSON.stringify(modelConfig));
    setSaveMessage("配置已保存");
    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#111827" }}>模型管理</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            这里用于配置 AI 模型提供商、模型名称和基础调用参数。修改后请手动点击“保存配置”。
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#111827", fontSize: "20px" }}>
            模型配置区
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
                模型提供商
              </label>
              <select
                value={modelConfig.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              >
                <option value="OpenAI">OpenAI</option>
                <option value="DeepSeek">DeepSeek</option>
                <option value="Kimi">Kimi</option>
                <option value="Qwen">Qwen</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
                模型名称
              </label>
              <input
                type="text"
                value={modelConfig.modelName}
                onChange={(e) => handleChange("modelName", e.target.value)}
                placeholder="请输入模型名称"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
                Temperature
              </label>
              <input
                type="text"
                value={modelConfig.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                placeholder="例如 0.3"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#374151" }}>
                Max Tokens
              </label>
              <input
                type="text"
                value={modelConfig.maxTokens}
                onChange={(e) => handleChange("maxTokens", e.target.value)}
                placeholder="例如 2000"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleSaveConfig}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              保存配置
            </button>

            <button
              onClick={handleResetConfig}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              恢复默认配置
            </button>

            {saveMessage && (
              <span style={{ color: "#16a34a", fontSize: "14px" }}>{saveMessage}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin">
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
              返回后台首页
            </button>
          </Link>

          <Link href="/admin/reports">
            <button
              style={{
                backgroundColor: "#111827",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              去报告管理页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}