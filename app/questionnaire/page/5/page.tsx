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
    id: 9,
    title: "你是工厂里的车工。机器今天有点不对劲，马上要下班了，还差最后一个没做完。开始有严重异响，但还能用。要是停下来报修，至少要等一个钟头，下班就晚了，完工绩效也可能拿不到。你会怎么办？",
    guide: "请考虑设备安全、生产安全、个人绩效与安全责任的平衡。",
  },
  {
    id: 10,
    title: "你是小区的物业人员。巡逻时看见有个小孩正在爬高压电箱，旁边没大人。你赶紧过去把他抱了下来。这时，小孩的奶奶冲过来骂你：'孩子玩一下怎么了？吓到我孙子你赔得起吗！' 你会怎么办？",
    guide: "请考虑儿童安全、高压电危险、与家长的沟通以及物业人员的职责。",
  },
];

export default function QuestionnairePage5() {
  const [answers, setAnswers] = useState({
    question9: "",
    question10: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("questionnairePage5");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      const allQuestions: QuestionItem[] = JSON.parse(savedQuestions);
      const pageQuestions = allQuestions.filter(
        (item) => item.id === 9 || item.id === 10
      );
      if (pageQuestions.length === 2) {
        setQuestions(pageQuestions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionnairePage5", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (field: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", boxShadow: "0 12px 30px rgba(15,23,42,0.08)", border: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "inline-block", backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "6px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
            问卷进度：第 5 / 5 页
          </div>
          <h1 style={{ margin: 0, color: "#111827" }}>安全意识问卷 · 第 5 页</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.8", marginTop: "10px" }}>
            本页包含 2 道题目。当前题目内容会优先读取后台问卷管理中的设置。
          </p>
        </div>

        <div style={{ width: "100%", height: "10px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden", marginBottom: "30px" }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "#2563eb" }} />
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "22px", backgroundColor: "#fcfdff" }}>
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>题目 9</div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>{questions[0]?.title || "题目 9"}</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>{questions[0]?.guide || "暂无提示语"}</p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question9}
              onChange={(e) => handleChange("question9", e.target.value)}
              style={{ width: "100%", minHeight: "140px", padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "15px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "22px", backgroundColor: "#fcfdff" }}>
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>题目 10</div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>{questions[1]?.title || "题目 10"}</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>{questions[1]?.guide || "暂无提示语"}</p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question10}
              onChange={(e) => handleChange("question10", e.target.value)}
              style={{ width: "100%", minHeight: "140px", padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "15px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0, color: "#111827", fontSize: "16px" }}>当前作答预览</h3>
          <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
            第 9 题：{answers.question9 || "未填写"}
            <br />
            第 10 题：{answers.question10 || "未填写"}
          </p>
        </div>

        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/page/4">
            <button style={{ backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              上一步
            </button>
          </Link>

          <Link href="/questionnaire/confirm">
            <button style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              去提交确认页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}