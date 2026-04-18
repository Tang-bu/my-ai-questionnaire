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
    id: 5,
    title: "你是工地的带班工头。拆大吊车时，你发现规定用的那根粗钢索已经磨损快断了。现场监工催你：'明天就要完工了，必须今天搞定！用几根细的捆起来先用！' 你知道这是违规的。你会怎么办？",
    guide: "请考虑施工安全、职业责任、与上级的沟通以及违规操作的风险。",
  },
  {
    id: 6,
    title: "你是在20层高楼外面干活的工人。你发现自己唯一的安全带挂钩有裂纹。离下班还有2小时，但天气预报说3小时后有雷暴，活儿今天必须干完。你发现同事的挂钩也差不多，但他不管，只想赶快弄完。库房也没有备用的了。你会怎么办？",
    guide: "请考虑高空作业安全、个人防护、天气因素以及与同事的协调。",
  },
];

export default function QuestionnairePage3() {
  const [answers, setAnswers] = useState({
    question5: "",
    question6: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("questionnairePage3");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      const allQuestions: QuestionItem[] = JSON.parse(savedQuestions);
      const pageQuestions = allQuestions.filter(
        (item) => item.id === 5 || item.id === 6
      );
      if (pageQuestions.length === 2) {
        setQuestions(pageQuestions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionnairePage3", JSON.stringify(answers));
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
            问卷进度：第 3 / 5 页
          </div>
          <h1 style={{ margin: 0, color: "#111827" }}>安全意识问卷 · 第 3 页</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.8", marginTop: "10px" }}>
            本页包含 2 道题目。当前题目内容会优先读取后台问卷管理中的设置。
          </p>
        </div>

        <div style={{ width: "100%", height: "10px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden", marginBottom: "30px" }}>
          <div style={{ width: "60%", height: "100%", backgroundColor: "#2563eb" }} />
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "22px", backgroundColor: "#fcfdff" }}>
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>题目 5</div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>{questions[0]?.title || "题目 5"}</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>{questions[0]?.guide || "暂无提示语"}</p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question5}
              onChange={(e) => handleChange("question5", e.target.value)}
              style={{ width: "100%", minHeight: "140px", padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "15px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "22px", backgroundColor: "#fcfdff" }}>
            <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: 700, marginBottom: "10px" }}>题目 6</div>
            <h3 style={{ marginTop: 0, color: "#111827" }}>{questions[1]?.title || "题目 6"}</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.8", marginBottom: "16px" }}>{questions[1]?.guide || "暂无提示语"}</p>
            <textarea
              placeholder="请输入你的回答..."
              value={answers.question6}
              onChange={(e) => handleChange("question6", e.target.value)}
              style={{ width: "100%", minHeight: "140px", padding: "14px", borderRadius: "12px", border: "1px solid #d1d5db", fontSize: "15px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0, color: "#111827", fontSize: "16px" }}>当前作答预览</h3>
          <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
            第 5 题：{answers.question5 || "未填写"}
            <br />
            第 6 题：{answers.question6 || "未填写"}
          </p>
        </div>

        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/page/2">
            <button style={{ backgroundColor: "#e5e7eb", color: "#111827", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              上一步
            </button>
          </Link>

          <Link href="/questionnaire/page/4">
            <button style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer" }}>
              下一步
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}