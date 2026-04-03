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

export default function AdminQuestionnairesPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(defaultQuestions);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("adminQuestions");
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adminQuestions", JSON.stringify(questions));
  }, [questions]);

  const handleChange = (
    id: number,
    field: "title" | "guide",
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleResetQuestions = () => {
    setQuestions(defaultQuestions);
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
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h1 style={{ marginTop: 0, color: "#111827" }}>问卷管理</h1>
          <p style={{ color: "#6b7280", lineHeight: "1.9", marginBottom: 0 }}>
            这里用于维护问卷题目和提示语。当前修改会自动保存在浏览器本地。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {questions.map((question) => (
            <div
              key={question.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
              }}
            >
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
                题目 {question.id}
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    题目标题
                  </label>
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) =>
                      handleChange(question.id, "title", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    提示语
                  </label>
                  <textarea
                    value={question.guide}
                    onChange={(e) =>
                      handleChange(question.id, "guide", e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "90px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      lineHeight: "1.8",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleResetQuestions}
            style={{
              backgroundColor: "#e5e7eb",
              color: "#111827",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            恢复默认题目
          </button>

          <Link href="/admin">
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
              返回后台首页
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}