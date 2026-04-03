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
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    gender: "",
    age: "",
    jobType: "",
    workYears: "",
    mineArea: "",
  });

  const [page1, setPage1] = useState({
    question1: "",
    question2: "",
  });

  const [page2, setPage2] = useState({
    question3: "",
    question4: "",
  });

  const [page3, setPage3] = useState({
    question5: "",
    question6: "",
  });

  const [page4, setPage4] = useState({
    question7: "",
    question8: "",
  });

  const [page5, setPage5] = useState({
    question9: "",
    question10: "",
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");
    const savedQuestions = localStorage.getItem("adminQuestions");

    if (savedBasicInfo) setBasicInfo(JSON.parse(savedBasicInfo));
    if (savedPage1) setPage1(JSON.parse(savedPage1));
    if (savedPage2) setPage2(JSON.parse(savedPage2));
    if (savedPage3) setPage3(JSON.parse(savedPage3));
    if (savedPage4) setPage4(JSON.parse(savedPage4));
    if (savedPage5) setPage5(JSON.parse(savedPage5));
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
  }, []);

  const answerMap: Record<number, string> = {
    1: page1.question1,
    2: page1.question2,
    3: page2.question3,
    4: page2.question4,
    5: page3.question5,
    6: page3.question6,
    7: page4.question7,
    8: page4.question8,
    9: page5.question9,
    10: page5.question10,
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
            padding: "36px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            最后一步
          </div>

          <h1 style={{ marginTop: 0, color: "#111827" }}>提交确认</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            请在提交前确认以下内容是否完整。当前页面展示的是本地保存的填写数据汇总，并会优先显示后台设置的题目标题。
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#111827" }}>一、基本信息</h2>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            姓名：{basicInfo.name || "未填写"}
            <br />
            性别：{basicInfo.gender || "未填写"}
            <br />
            年龄：{basicInfo.age || "未填写"}
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
          }}
        >
          <h2 style={{ marginTop: 0, color: "#111827" }}>二、问卷答案汇总</h2>

          <div style={{ display: "grid", gap: "18px" }}>
            {questions.map((question) => (
              <div
                key={question.id}
                style={{
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#2563eb",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  题目 {question.id}
                </div>

                <div
                  style={{
                    color: "#111827",
                    fontWeight: 700,
                    lineHeight: "1.8",
                    marginBottom: "8px",
                  }}
                >
                  {question.title}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    lineHeight: "1.8",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {answerMap[question.id]?.trim() || "未填写"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#111827" }}>提交前提醒</h3>
          <ul style={{ color: "#6b7280", lineHeight: "1.9", paddingLeft: "20px", marginBottom: 0 }}>
            <li>请确认基本信息无误</li>
            <li>请确认问卷作答内容已经填写完整</li>
            <li>当前点击提交后将进入AI分析结果页（可能需要30-60秒分析时间）</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/page/5">
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
              返回上一页
            </button>
          </Link>

          <Link href="/result/real">
            <button
              style={{
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              确认提交
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}