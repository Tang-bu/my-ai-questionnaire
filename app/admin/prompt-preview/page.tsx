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

const runtimeModelConfig = {
  provider: "SiliconFlow",
  modelName: "Qwen/Qwen2.5-14B-Instruct",
  temperature: "0.2",
  maxTokens: "2500",
  responseFormat: "JSON Object",
};

const runtimePromptStructure = `请围绕以下 9 个维度评分，每个维度范围为 0-10 分：
1. safetyPriority：安全优先意识
2. complianceAwareness：规范遵循意识
3. responsibilityAwareness：责任担当意识
4. luckPsychology：侥幸心理（分越高表示风险越大）
5. conformityPsychology：从众心理（分越高表示风险越大）
6. riskIdentification：风险识别能力
7. emergencyHandling：应急处置能力
8. interventionWillingness：违规干预意愿
9. hazardReporting：隐患上报/主动纠偏意识

要求模型只返回 JSON，并包含：
- dimensions
- overallAssessment
- strengths
- blindSpots
- keyRisks
- recommendations
- trainingNeeds`;

export default function PromptPreviewPage() {
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });
  const [questions, setQuestions] = useState(defaultQuestions);
  const [template, setTemplate] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedQuestions = localStorage.getItem("adminQuestions");
    const savedPrompt = localStorage.getItem("adminPromptTemplatePreview");
    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");

    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedPrompt) setTemplate(savedPrompt);

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

    const modelText = `模型服务商：${runtimeModelConfig.provider}
模型名称：${runtimeModelConfig.modelName}
Temperature：${runtimeModelConfig.temperature}
Max Tokens：${runtimeModelConfig.maxTokens}
响应格式：${runtimeModelConfig.responseFormat}`;

    return `==============================
一、当前生产分析 Prompt 结构
==============================
${runtimePromptStructure}

==============================
二、当前问卷对象基本信息
==============================
${basicInfoText}

==============================
三、当前问卷题目与回答
==============================
${questionAnswerText}

==============================
四、当前生产模型配置
==============================
${modelText}

==============================
五、模板内容
==============================
${template || "暂无模板内容"}`;
  }, [basicInfo, questions, answers, template]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/admin"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← 返回后台首页
          </Link>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            marginBottom: 20,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32, color: "#0f172a" }}>
            输入拼装预览
          </h1>
          <p
            style={{
              marginTop: 12,
              color: "#64748b",
              lineHeight: 1.8,
              maxWidth: 900,
            }}
          >
            查看系统发送给 AI 的完整输入结构，包括角色设定、评分维度、用户信息、问卷内容与输出要求。
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <InfoCard
            title="当前生产模型"
            value={runtimeModelConfig.modelName}
            subText={runtimeModelConfig.provider}
          />
          <InfoCard
            title="响应格式"
            value={runtimeModelConfig.responseFormat}
            subText="用于结构化评分输出"
          />
          <InfoCard
            title="评分维度数"
            value="9"
            subText="心理 + 行为能力维度"
          />
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 24 }}>输入内容预览</h2>
          <p
            style={{
              color: "#64748b",
              lineHeight: 1.8,
            }}
          >
            以下展示当前配置下的输入拼装结果。
          </p>

          <div
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              borderRadius: 16,
              padding: 18,
              fontSize: 14,
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
              marginTop: 16,
              overflowX: "auto",
            }}
          >
            {mergedPrompt}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 18,
              flexWrap: "wrap",
            }}
          >
            <Link href="/admin/prompts">
              <button style={secondaryButtonStyle}>返回 Prompt 管理</button>
            </Link>
            <Link href="/admin/models">
              <button style={darkButtonStyle}>查看模型配置</button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
  subText,
}: {
  title: string;
  value: string;
  subText: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 8,
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 13 }}>{subText}</div>
    </div>
  );
}

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const darkButtonStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};