"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuestionItem = {
  id: number;
  order?: number;
  title: string;
  guide?: string;
};

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
  const [template, setTemplate] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedPrompt = localStorage.getItem("adminPromptTemplatePreview");
    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");

    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
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

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoadingQuestions(true);
        const response = await fetch("/api/questions", { cache: "no-store" });
        const json = await response.json();

        if (response.ok && json?.data?.allQuestions) {
          const normalized = (json.data.allQuestions as any[])
            .map((q) => ({
              id: Number(q.id ?? q.order),
              order: Number(q.order ?? q.id),
              title: String(q.title ?? q.question_text ?? ""),
              guide: String(q.guide ?? q.guide_text ?? ""),
            }))
            .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));

          setQuestions(normalized);
        } else {
          setQuestions([]);
        }
      } catch {
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, []);

  const mergedPrompt = useMemo(() => {
    const basicInfoText = `姓名：${basicInfo.name || "未填写"}
性别：${basicInfo.gender || "未填写"}
年龄：${basicInfo.age || "未填写"}
工种：${basicInfo.jobType || "未填写"}
工龄：${basicInfo.workYears || "未填写"}
所属矿区/单位：${basicInfo.mineArea || "未填写"}`;

    const questionAnswerText =
      questions.length > 0
        ? questions
            .map((q) => {
              const answer = answers[q.id] || "未填写";
              return `【题目${q.id}】
题目：${q.title}
回答：${answer}`;
            })
            .join("\n\n")
        : "题库加载中或暂无题目数据";

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
        padding: "20px 14px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/admin"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            ← 返回后台首页
          </Link>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            marginBottom: 18,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 8vw, 34px)",
              color: "#0f172a",
            }}
          >
            输入拼装预览
          </h1>
          <p
            style={{
              marginTop: 10,
              color: "#64748b",
              lineHeight: 1.8,
              fontSize: "clamp(14px, 3.8vw, 16px)",
              maxWidth: 900,
            }}
          >
            查看系统发送给 AI 的完整输入结构，包括角色设定、评分维度、用户信息、问卷内容与输出要求。
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 18,
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
          <InfoCard
            title="题库状态"
            value={loadingQuestions ? "加载中" : `${questions.length} 题`}
            subText="直接读取当前题库接口"
          />
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "clamp(24px, 6vw, 26px)",
            }}
          >
            输入内容预览
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.8, fontSize: 15 }}>
            以下展示当前配置下的输入拼装结果。
          </p>

          <div
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              borderRadius: 16,
              padding: 16,
              fontSize: 14,
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
              marginTop: 14,
              overflowX: "auto",
            }}
          >
            {mergedPrompt}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
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
        padding: 18,
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
          fontSize: "clamp(24px, 6vw, 22px)",
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

const secondaryButtonStyle = {
  backgroundColor: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};

const darkButtonStyle = {
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 700,
};