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
    title: "你是街上巡逻的片儿警。对讲机里说，附近主干道边上有栋旧楼的墙皮正往下掉，已经砸到车了，楼下人来人往很危险。别的支援还要15分钟才到，你是第一个到现场的。这15分钟里，你会怎么办？",
    guide: "请考虑公共安全、临时警戒措施、人员疏散以及与上级的沟通协调。",
  },
  {
    id: 4,
    title: "你是镇上网吧的店长。你发现32号机没人，屏幕上露着银行密码。你刚要处理，却看见旁边33号机的人，正偷偷拿手机拍32号的屏幕。你会怎么办？",
    guide: "请考虑客户隐私保护、安全管理、现场处理方式以及可能的违法犯罪行为。",
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