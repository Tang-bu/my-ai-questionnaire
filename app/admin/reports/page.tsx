"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const defaultTemplate = `标准报告结构：
1. 基本信息
2. 综合评估结论
3. 安全意识等级
4. 主要表现
5. 问题分析
6. 改进建议

字段说明：
- 基本信息：姓名、工种、工龄、所属矿区/单位
- 综合评估结论：对整体安全意识水平进行概括
- 安全意识等级：按 A/B/C/D/E 等级输出
- 主要表现：提炼用户的积极表现或已有基础
- 问题分析：识别薄弱点和潜在风险
- 改进建议：给出后续优化建议

输出要求：
- 结构统一
- 表述规范
- 字段完整
- 便于展示与导出`;

export default function AdminReportsPage() {
  const [reportTemplate, setReportTemplate] = useState(defaultTemplate);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedTemplate = localStorage.getItem("adminReportTemplate");
    if (savedTemplate) {
      setReportTemplate(savedTemplate);
    }
  }, []);

  const handleSaveTemplate = () => {
    localStorage.setItem("adminReportTemplate", reportTemplate);
    setSaveMessage("模板已保存");
    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  const handleResetTemplate = () => {
    setReportTemplate(defaultTemplate);
    setSaveMessage("已恢复默认模板，记得点击保存");
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
          <h1 style={{ marginTop: 0, color: "#111827" }}>报告管理</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            这里用于管理标准报告模板结构。修改后请手动点击“保存模板”。
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
            模板编辑区
          </h2>
          <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
            你可以在这里定义标准报告结构、字段和输出要求。
          </p>

          <textarea
            value={reportTemplate}
            onChange={(e) => setReportTemplate(e.target.value)}
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

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleSaveTemplate}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              保存模板
            </button>

            <button
              onClick={handleResetTemplate}
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

            {saveMessage && (
              <span style={{ color: "#16a34a", fontSize: "14px" }}>
                {saveMessage}
              </span>
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

          <Link href="/admin/questionnaires">
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
              去问卷管理页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}