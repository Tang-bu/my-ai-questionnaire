"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPromptsPage() {
  const [promptTemplate, setPromptTemplate] = useState(`角色设定：
你是一名矿工安全意识评估分析助手。

行业背景：
本项目面向矿工行业安全意识检测场景，围绕用户问卷作答内容展开分析。

分析目标：
请结合用户基本信息、问卷答案与安全意识评估要求，生成结构化分析结论。

输出要求：
请输出标准化结果，包括：
1. 综合评估结论
2. 安全意识等级
3. 主要表现
4. 问题分析
5. 改进建议`);

  // 新增：控制预览显示的状态
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const savedPrompt = localStorage.getItem("adminPromptTemplate");
    if (savedPrompt) {
      setPromptTemplate(savedPrompt);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adminPromptTemplate", promptTemplate);
  }, [promptTemplate]);

  const handleResetPrompt = () => {
    const defaultPrompt = `角色设定：
你是一名矿工安全意识评估分析助手。

行业背景：
本项目面向矿工行业安全意识检测场景，围绕用户问卷作答内容展开分析。

分析目标：
请结合用户基本信息、问卷答案与安全意识评估要求，生成结构化分析结论。

输出要求：
请输出标准化结果，包括：
1. 综合评估结论
2. 安全意识等级
3. 主要表现
4. 问题分析
5. 改进建议`;
    setPromptTemplate(defaultPrompt);
  };

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
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#111827" }}>Prompt 管理</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            这里用于管理提示词模板。当前为前端演示版，内容会自动保存在浏览器本地。
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column", // 手机：垂直布局
            gap: "16px",
            // 响应式布局：手机垂直，桌面左右
            '@media (min-width: 1024px)': {
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: "20px",
            },
          }}
        >
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
              模板编辑区
            </h2>
            <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
              你可以在这里修改提示词内容，系统会自动保存。
            </p>

            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              style={{
                width: "100%",
                minHeight: "420px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                lineHeight: "1.8",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleResetPrompt}
                style={{
                  backgroundColor: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  cursor: "pointer",
                }}
              >
                恢复默认模板
              </button>

              {/* 手机端预览键 */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  // 桌面端隐藏，手机端显示
                  display: "block",
                  '@media (min-width: 1024px)': {
                    display: "none",
                  },
                }}
              >
                {showPreview ? "隐藏预览" : "显示预览"}
              </button>
            </div>
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
              当前模板预览
            </h2>
            <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
              后续这里可以继续接“问卷答案拼接预览”和“最终发送给 AI 的完整 Prompt 预览”。
            </p>

            <div
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                color: "#374151",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                minHeight: "420px",
              }}
            >
              {promptTemplate || "当前没有模板内容"}
            </div>
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

          <Link href="/admin/models">
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
              去模型管理页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}