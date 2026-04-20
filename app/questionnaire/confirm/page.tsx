"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

type BasicInfo = {
  name: string;
  gender: string;
  age: string;
  jobType: string;
  workYears: string;
  mineArea: string;
};

type Page1Answers = {
  question1: string;
  question2: string;
};

type Page2Answers = {
  question3: string;
  question4: string;
};

type Page3Answers = {
  question5: string;
  question6: string;
};

type Page4Answers = {
  question7: string;
  question8: string;
};

type Page5Answers = {
  question9: string;
  question10: string;
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
  {
    id: 5,
    title: "你平时是否会主动学习或关注安全生产相关知识？",
    guide: "可以结合培训、班前会、日常交流或自我学习情况来描述。",
  },
  {
    id: 6,
    title: "当同事存在不安全操作时，你通常会怎样处理？",
    guide: "可以从提醒、上报、协助纠正或其他做法来描述。",
  },
  {
    id: 7,
    title: "你认为安全意识强的员工通常具备哪些特点？",
    guide: "可以从行为习惯、责任心、规范执行等方面进行回答。",
  },
  {
    id: 8,
    title: "你所在的工作环境中，哪些因素最容易影响安全操作执行？",
    guide: "可以从人员、设备、制度、环境或管理等角度描述。",
  },
  {
    id: 9,
    title: "你认为自己在安全意识方面最需要提升的地方是什么？",
    guide: "可以结合认知、习惯、执行力或应急处理能力来回答。",
  },
  {
    id: 10,
    title: "如果系统根据你的答卷给出改进建议，你最希望它提供哪方面帮助？",
    guide: "例如培训建议、风险提醒、行为改进建议、个性化学习方向等。",
  },
];

export default function ConfirmPage() {
  const router = useRouter();

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });

  const [page1, setPage1] = useState<Page1Answers>({
    question1: "",
    question2: "",
  });

  const [page2, setPage2] = useState<Page2Answers>({
    question3: "",
    question4: "",
  });

  const [page3, setPage3] = useState<Page3Answers>({
    question5: "",
    question6: "",
  });

  const [page4, setPage4] = useState<Page4Answers>({
    question7: "",
    question8: "",
  });

  const [page5, setPage5] = useState<Page5Answers>({
    question9: "",
    question10: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedAllAnswers = localStorage.getItem("questionnaireAllAnswers");
    const savedQuestions = localStorage.getItem("adminQuestions");

    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
    if (savedAllAnswers) setAllAnswers(JSON.parse(savedAllAnswers));
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
  }, []);

  const answers = useMemo<Record<string, string>>(
    () => {
      const result: Record<string, string> = {};
      for (let i = 1; i <= 10; i++) {
        result[i.toString()] = allAnswers[`question${i}`] || "";
      }
      return result;
    },
    [allAnswers]
  );

  const answerMap = useMemo<Record<number, string>>(
    () => {
      const result: Record<number, string> = {};
      for (let i = 1; i <= 10; i++) {
        result[i] = allAnswers[`question${i}`] || "";
      }
      return result;
    },
    [allAnswers]
  );

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basicInfo,
          answers,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "问卷提交失败");
      }

      const { questionnaireId, taskId } = json.data;

      router.push(`/questionnaire/waiting?questionnaireId=${questionnaireId}&taskId=${taskId}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "提交失败，请稍后重试"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: 0,
              color: "#16a34a",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            最后一步
          </p>
          <h1
            style={{
              marginTop: "8px",
              marginBottom: "8px",
              fontSize: "28px",
              color: "#0f172a",
            }}
          >
            提交确认
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              lineHeight: 1.7,
            }}
          >
            请在提交前确认以下内容是否完整。当前页面展示的是本地保存的填写数据汇总，并会优先显示后台设置的题目标题。
          </p>
        </div>

        <section
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "20px",
              color: "#0f172a",
            }}
          >
            一、基本信息
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <InfoItem label="姓名" value={basicInfo.name} />
            <InfoItem label="性别" value={basicInfo.gender} />
            <InfoItem label="年龄" value={basicInfo.age} />
            <InfoItem label="工种" value={basicInfo.jobType} />
            <InfoItem label="工龄" value={basicInfo.workYears} />
            <InfoItem label="所属矿区/单位" value={basicInfo.mineArea} />
          </div>
        </section>

        <section
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "20px",
              color: "#0f172a",
            }}
          >
            二、问卷答案汇总
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            {questions.map((question) => (
              <div
                key={question.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  backgroundColor: "#fcfcfd",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#16a34a",
                    marginBottom: "8px",
                  }}
                >
                  题目 {question.id}
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "10px",
                    lineHeight: 1.6,
                  }}
                >
                  {question.title}
                </div>

                <div
                  style={{
                    color: "#374151",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {answerMap[question.id]?.trim() || "未填写"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            border: "1px solid #dcfce7",
            backgroundColor: "#f0fdf4",
            borderRadius: "14px",
            padding: "18px 20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: "#166534",
            }}
          >
            提交前提醒
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#166534",
              lineHeight: 1.8,
            }}
          >
            <li>请确认基本信息无误</li>
            <li>请确认问卷作答内容已经填写完整</li>
            <li>点击提交后将创建分析任务，并跳转到结果页查看进度</li>
          </ul>
        </section>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/guided">
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
              返回修改
            </button>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#86efac" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {isSubmitting ? "提交中..." : "确认提交"}
          </button>
        </div>

        {submitError && (
          <p style={{ color: "#dc2626", marginTop: "12px" }}>{submitError}</p>
        )}
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "14px",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          color: "#111827",
          fontWeight: 600,
        }}
      >
        {value || "未填写"}
      </div>
    </div>
  );
}