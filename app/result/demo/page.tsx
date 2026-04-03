"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ResultDemoPage() {
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });

  const [allAnswers, setAllAnswers] = useState<string[]>([]);

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");

    if (savedBasicInfo) {
      setBasicInfo(JSON.parse(savedBasicInfo));
    }

    const page1 = savedPage1 ? JSON.parse(savedPage1) : {};
    const page2 = savedPage2 ? JSON.parse(savedPage2) : {};
    const page3 = savedPage3 ? JSON.parse(savedPage3) : {};
    const page4 = savedPage4 ? JSON.parse(savedPage4) : {};
    const page5 = savedPage5 ? JSON.parse(savedPage5) : {};

    const mergedAnswers = [
      page1.question1 || "",
      page1.question2 || "",
      page2.question3 || "",
      page2.question4 || "",
      page3.question5 || "",
      page3.question6 || "",
      page4.question7 || "",
      page4.question8 || "",
      page5.question9 || "",
      page5.question10 || "",
    ];

    setAllAnswers(mergedAnswers);
  }, []);

  const filledCount = useMemo(() => {
    return allAnswers.filter((item) => item.trim() !== "").length;
  }, [allAnswers]);

  const completionRate = useMemo(() => {
    return Math.round((filledCount / 10) * 100);
  }, [filledCount]);

  const demoLevel = useMemo(() => {
    if (filledCount >= 9) return "A 级（演示）";
    if (filledCount >= 7) return "B 级（演示）";
    if (filledCount >= 5) return "C 级（演示）";
    if (filledCount >= 3) return "D 级（演示）";
    return "E 级（演示）";
  }, [filledCount]);

  const demoConclusion = useMemo(() => {
    if (filledCount >= 9) {
      return "从当前填写情况看，用户作答较完整，能够较充分地反映安全意识相关想法，具备较好的评估基础。";
    }
    if (filledCount >= 7) {
      return "从当前填写情况看，用户已提供较多有效信息，能够支撑形成初步安全意识评估结论。";
    }
    if (filledCount >= 5) {
      return "从当前填写情况看，用户已完成部分核心作答，但仍建议补充更多内容，以提高评估完整性。";
    }
    if (filledCount >= 3) {
      return "当前作答内容较少，系统可以生成基础结果，但建议补充更多信息以提升分析质量。";
    }
    return "当前有效作答较少，结果仅能作为演示预览，建议继续补充问卷内容。";
  }, [filledCount]);

  const handleResetAll = () => {
  localStorage.removeItem("basicInfo");
  localStorage.removeItem("questionnairePage1");
  localStorage.removeItem("questionnairePage2");
  localStorage.removeItem("questionnairePage3");
  localStorage.removeItem("questionnairePage4");
  localStorage.removeItem("questionnairePage5");
  window.location.href = "/";
};
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            动态结果预览
          </div>

          <h1 style={{ marginTop: 0, color: "#111827" }}>标准化评估报告（演示版）</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            当前页面会自动读取前面填写的基本信息和问卷答案，展示一个动态结果预览。
            后续接入 AI 后，这里将替换为真实分析结果。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>基本信息摘要</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
              姓名：{basicInfo.name || "未填写"}
              <br />
              工种：{basicInfo.jobType || "未填写"}
              <br />
              工龄：{basicInfo.workYears || "未填写"}
              <br />
              所属矿区/单位：{basicInfo.mineArea || "未填写"}
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>完成情况</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: "10px" }}>
              已填写题数：{filledCount} / 10
              <br />
              完成率：{completionRate}%
            </p>

            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionRate}%`,
                  height: "100%",
                  backgroundColor: "#2563eb",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>意识等级</h3>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                padding: "10px 16px",
                borderRadius: "12px",
                fontWeight: 700,
                marginTop: "8px",
              }}
            >
              {demoLevel}
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
            <h3 style={{ marginTop: 0, color: "#111827" }}>综合评估结论</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: 0 }}>
              {demoConclusion}
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#111827" }}>结果页说明</h3>
          <ul style={{ color: "#6b7280", lineHeight: "1.9", paddingLeft: "20px", marginBottom: 0 }}>
            <li>当前等级和结论由前端演示逻辑生成，不是正式 AI 分析结果</li>
            <li>后续可将这里替换为模型返回的标准化 JSON 数据</li>
            <li>后续可继续补充主要表现、问题分析、改进建议等模块</li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <Link href="/questionnaire/basic-info">
    <button
      style={{
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "12px 22px",
        cursor: "pointer",
      }}
    >
      重新填写问卷
    </button>
  </Link>

  <Link href="/questionnaire/confirm">
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
      返回提交页
    </button>
  </Link>

  <Link href="/admin">
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
      查看后台
    </button>
  </Link>

  <button
    onClick={handleResetAll}
    style={{
      backgroundColor: "#dc2626",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 22px",
      cursor: "pointer",
    }}
  >
    清空全部数据
  </button>
</div>


      </div>
    </main>
  );
}