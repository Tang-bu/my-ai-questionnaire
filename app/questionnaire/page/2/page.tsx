"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

const defaultQuestions: QuestionItem[] = [
  {
    id: 3,
    title: "你认为在矿工作业中，最容易被忽视的安全风险是什么？",
    guide: "可以结合你的岗位、经验或观察到的情况进行说明。",
  },
  {
    id: 4,
    title: "遇到突发情况时，你通常会优先考虑哪些处理步骤？",
    guide: "可以从个人反应、团队协作、上报流程等角度描述。",
  },
];

export default function QuestionnairePage2() {
  const [answers, setAnswers] = useState({
    question3: "",
    question4: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("questionnairePage2");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      const allQuestions: QuestionItem[] = JSON.parse(savedQuestions);
      const pageQuestions = allQuestions.filter(
        (item) => item.id === 3 || item.id === 4
      );
      if (pageQuestions.length === 2) {
        setQuestions(pageQuestions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionnairePage2", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (field: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
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
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "36px",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
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
            问卷进度：第 2 / 5 页
          </div>

          <h1 style={{ margin: 0, color: "#111827" }}>安全意识问卷 · 第 2 页</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.8", marginTop: "10px" }}>
            本页包含 2 道题目。当前题目内容会优先读取后台问卷管理中的设置。
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "40%",
              height: "100%",
              backgroundColor: "#2563eb",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              backgroundColor: "#fcfdff",
            }}
          >
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>
              题目 3
            </div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>
              {questions[0]?.title || "题目 3"}
            </h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>
              {questions[0]?.guide || "暂无提示语"}
            </p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question3}
              onChange={(e) => handleChange("question3", e.target.value)}
              style={{
                width: "100%",
                minHeight: "140px",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              backgroundColor: "#fcfdff",
            }}
          >
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>
              题目 4
            </div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>
              {questions[1]?.title || "题目 4"}
            </h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>
              {questions[1]?.guide || "暂无提示语"}
            </p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question4}
              onChange={(e) => handleChange("question4", e.target.value)}
              style={{
                width: "100%",
                minHeight: "140px",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0, color: "#111827", fontSize: "16px" }}>当前作答预览</h3>
          <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
            第 3 题：{answers.question3 || "未填写"}
            <br />
            第 4 题：{answers.question4 || "未填写"}
          </p>
        </div>

        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/page/1">
            <button style={{ backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              上一步
            </button>
          </Link>

          <Link href="/questionnaire/page/3">
            <button style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              下一步
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}