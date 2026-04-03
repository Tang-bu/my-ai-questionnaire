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
    id: 1,
    title: "请描述你在日常工作中对安全规范的理解。",
    guide: "可以从操作流程、风险防范意识、个人习惯等方面进行描述。",
  },
  {
    id: 2,
    title: "当你发现施工环境存在隐患时，通常会怎么做？",
    guide: "可以结合你平时的处理方式进行回答，例如上报、规避、提醒同事等。",
  },
];

export default function QuestionnairePage1() {
  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("questionnairePage1");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      const allQuestions: QuestionItem[] = JSON.parse(savedQuestions);
      const pageQuestions = allQuestions.filter(
        (item) => item.id === 1 || item.id === 2
      );
      if (pageQuestions.length === 2) {
        setQuestions(pageQuestions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionnairePage1", JSON.stringify(answers));
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
            问卷进度：第 1 / 5 页
          </div>

          <h1 style={{ margin: 0, color: "#111827" }}>安全意识问卷 · 第 1 页</h1>
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
              width: "20%",
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
            <div
              style={{
                fontSize: "14px",
                color: "#2563eb",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              题目 1
            </div>

            <h3 style={{ marginTop: 0, color: "#111827" }}>
              {questions[0]?.title || "题目 1"}
            </h3>

            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>
              {questions[0]?.guide || "暂无提示语"}
            </p>

            <textarea
              placeholder="请输入你的回答..."
              value={answers.question1}
              onChange={(e) => handleChange("question1", e.target.value)}
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

            <div style={{ marginTop: "12px" }}>
              <button
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                语音输入（后续接入）
              </button>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              backgroundColor: "#fcfdff",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#2563eb",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              题目 2
            </div>

            <h3 style={{ marginTop: 0, color: "#111827" }}>
              {questions[1]?.title || "题目 2"}
            </h3>

            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>
              {questions[1]?.guide || "暂无提示语"}
            </p>

            <textarea
              placeholder="请输入你的回答..."
              value={answers.question2}
              onChange={(e) => handleChange("question2", e.target.value)}
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

            <div style={{ marginTop: "12px" }}>
              <button
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  cursor: "pointer",
                }}
              >
                语音输入（后续接入）
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#111827", fontSize: "16px" }}>当前作答预览</h3>
          <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
            第 1 题：{answers.question1 || "未填写"}
            <br />
            第 2 题：{answers.question2 || "未填写"}
          </p>
        </div>

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/questionnaire/basic-info">
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
              上一步
            </button>
          </Link>

          <Link href="/questionnaire/page/2">
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
              下一步
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}