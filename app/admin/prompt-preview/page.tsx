"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

const defaultQuestions: QuestionItem[] = [
  { id: 1, title: "请描述你在日常工作中对安全规范的理解。", guide: "" },
  { id: 2, title: "当你发现施工环境存在隐患时，通常会怎么做？", guide: "" },
  { id: 3, title: "你认为在矿工作业中，最容易被忽视的安全风险是什么？", guide: "" },
  { id: 4, title: "遇到突发情况时，你通常会优先考虑哪些处理步骤？", guide: "" },
  { id: 5, title: "你平时是否会主动学习或关注安全生产相关知识？", guide: "" },
  { id: 6, title: "当同事存在不安全操作时，你通常会怎样处理？", guide: "" },
  { id: 7, title: "你认为安全意识强的员工通常具备哪些特点？", guide: "" },
  { id: 8, title: "你所在的工作环境中，哪些因素最容易影响安全操作执行？", guide: "" },
  { id: 9, title: "你认为自己在安全意识方面最需要提升的地方是什么？", guide: "" },
  { id: 10, title: "如果系统根据你的答卷给出改进建议，你最希望它提供哪方面帮助？", guide: "" },
];

export default function PromptPreviewPage() {
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  const [promptTemplate, setPromptTemplate] = useState("");
  const [reportTemplate, setReportTemplate] = useState("");
  const [modelConfig, setModelConfig] = useState({
    provider: "",
    modelName: "",
    temperature: "",
    maxTokens: "",
  });

  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedQuestions = localStorage.getItem("adminQuestions");
    const savedPrompt = localStorage.getItem("adminPromptTemplate");
    const savedReport = localStorage.getItem("adminReportTemplate");
    const savedModel = localStorage.getItem("adminModelConfig");

    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");

    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedPrompt) setPromptTemplate(savedPrompt);
    if (savedReport) setReportTemplate(savedReport);
    if (savedModel) setModelConfig(JSON.parse(savedModel));

    const page1 = savedPage1 ? JSON.parse(savedPage1) : {};
    const page2 = savedPage2 ? JSON.parse(savedPage2) : {};
    const page3 = savedPage3 ? JSON.parse(savedPage3) : {};
    const page4 = savedPage4 ? JSON.parse(savedPage4) : {};
    const page5 = savedPage5 ? JSON.parse(savedPage5) : {};

    setAnswers({
      1: page1.question1 || "",
      2: page1.question2 || "",
      3: page2.question3 || "",
      4: page2.question4 || "",
      5: page3.question5 || "",
      6: page3.question6 || "",
      7: page4.question7 || "",
      8: page4.question8 || "",
      9: page5.question9 || "",
      10: page5.question10 || "",
    });
  }, []);

  const mergedPrompt = useMemo(() => {
    const basicInfoText = `姓名：${basicInfo.name || "未填写"}
性别：${basicInfo.gender || "未填写"}
年龄：${basicInfo.age || "未填写"}
工种：${basicInfo.jobType || "未填写"}
工龄：${basicInfo.workYears || "未填写"}
所属矿区/单位：${basicInfo.mineArea || "未填写"}`;

    const questionAnswerText = questions
      .map((q) => {
        const answer = answers[q.id] || "未填写";
        return `【题目${q.id}】
题目：${q.title}
回答：${answer}`;
      })
      .join("\n\n");

    const modelText = `模型提供商：${modelConfig.provider || "未设置"}
模型名称：${modelConfig.modelName || "未设置"}
Temperature：${modelConfig.temperature || "未设置"}
Max Tokens：${modelConfig.maxTokens || "未设置"}`;

    return `==============================
一、系统角色与分析设定（Prompt 模板）
==============================
${promptTemplate || "暂无 Prompt 模板内容"}

==============================
二、用户基本信息
==============================
${basicInfoText}

==============================
三、问卷题目与用户答案
==============================
${questionAnswerText}

==============================
四、模型配置
==============================
${modelText}

==============================
五、报告输出模板要求
==============================
${reportTemplate || "暂无报告模板内容"}
`;
  }, [basicInfo, questions, answers, promptTemplate, modelConfig, reportTemplate]);

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
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            borderRadius: "24px",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(255,255,255,0.12)",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            Prompt 拼装预览
          </div>

          <h1 style={{ marginTop: 0, marginBottom: "12px" }}>最终发送给 AI 的内容预览</h1>
          <p style={{ color: "#d1d5db", lineHeight: "1.9", marginBottom: 0 }}>
            当前页面会自动读取后台模板、模型配置、用户基本信息和问卷答案，并拼装成一份完整输入文本。
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#111827" }}>拼装结果</h2>
          <p style={{ color: "#6b7280", lineHeight: "1.8" }}>
            后续真正接 AI 时，可以直接把这里的内容作为请求体中的核心文本输入。
          </p>

          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "18px",
              whiteSpace: "pre-wrap",
              color: "#374151",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            {mergedPrompt}
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

          <Link href="/admin/prompts">
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
              返回 Prompt 管理页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}