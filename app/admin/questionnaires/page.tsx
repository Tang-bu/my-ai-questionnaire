"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

export default function AdminQuestionnairesPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadQuestionsFromAPI = async () => {
    try {
      setLoading(true);
      setSaveError(null);
      setSaveMessage(null);

      const response = await fetch("/api/questions", {
        cache: "no-store",
      });
      const data = await response.json();

      if (
        response.ok &&
        data?.success &&
        Array.isArray(data?.data?.allQuestions) &&
        data.data.allQuestions.length > 0
      ) {
        const apiQuestions: QuestionItem[] = data.data.allQuestions.map(
          (q: any, index: number) => ({
            id: Number(q.order ?? index + 1),
            title: String(q.question_text ?? q.title ?? ""),
            guide: String(q.guide_text ?? q.guide ?? ""),
          })
        );

        apiQuestions.sort((a, b) => a.id - b.id);

        setQuestions(apiQuestions);
        localStorage.setItem("adminQuestions", JSON.stringify(apiQuestions));
        return;
      }

      const cached = localStorage.getItem("adminQuestions");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
          setSaveError("服务器题库读取失败，当前显示的是浏览器缓存数据。");
          return;
        }
      }

      setQuestions([]);
      setSaveError("未从服务器读取到题目，也没有可用的本地缓存。");
    } catch (error) {
      console.error("从API加载题目失败:", error);

      const cached = localStorage.getItem("adminQuestions");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setQuestions(parsed);
            setSaveError("服务器连接失败，当前显示的是浏览器缓存数据。");
            return;
          }
        } catch (parseError) {
          console.error("解析本地缓存失败:", parseError);
        }
      }

      setQuestions([]);
      setSaveError("题目加载失败，请检查接口或数据库配置。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionsFromAPI();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem("adminQuestions", JSON.stringify(questions));
    }
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

  const handleClearLocalData = async () => {
    const confirmed = confirm(
      "确定要清除浏览器缓存题目吗？清除后将重新从服务器加载。"
    );
    if (!confirmed) return;

    localStorage.removeItem("adminQuestions");
    await loadQuestionsFromAPI();
  };

  const saveQuestionsToAPI = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || "保存失败");
      }

      localStorage.setItem("adminQuestions", JSON.stringify(questions));
      setSaveMessage(
        `题目保存成功，已更新 ${data?.data?.totalSuccessful ?? questions.length} 个题目。`
      );

      await loadQuestionsFromAPI();
    } catch (error: any) {
      console.error("保存题目到API失败:", error);
      setSaveError(error?.message || "保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };

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
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "32px",
            color: "#0f172a",
          }}
        >
          问卷管理
        </h1>

        <p
          style={{
            color: "#475569",
            lineHeight: 1.8,
            marginBottom: "24px",
          }}
        >
          这里用于维护问卷题目和提示语。当前页面以服务器题库为准，浏览器本地缓存只作为故障兜底，不再作为主数据源。
        </p>

        {loading ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            正在加载题目...
          </div>
        ) : questions.length === 0 ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
            }}
          >
            当前没有可编辑题目。请先检查 `/api/questions` 是否能正常返回题目数据。
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {questions.map((question) => (
              <div
                key={question.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                  backgroundColor: "#fcfcfd",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#2563eb",
                    marginBottom: "12px",
                  }}
                >
                  题目 {question.id}
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    题目标题
                  </label>
                  <textarea
                    value={question.title}
                    onChange={(e) =>
                      handleChange(question.id, "title", e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "90px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "15px",
                      lineHeight: 1.7,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#334155",
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
                      lineHeight: 1.8,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {saveMessage && (
          <div
            style={{
              backgroundColor: "#d1fae5",
              color: "#065f46",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #a7f3d0",
              marginTop: "18px",
            }}
          >
            ✅ {saveMessage}
          </div>
        )}

        {saveError && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #fecaca",
              marginTop: "18px",
            }}
          >
            ❌ {saveError}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <button
            onClick={saveQuestionsToAPI}
            disabled={saving || loading || questions.length === 0}
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {saving ? "保存中..." : "✅ 保存到后端"}
          </button>

          <button
            onClick={loadQuestionsFromAPI}
            disabled={loading}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "加载中..." : "重新加载"}
          </button>

          <button
            onClick={handleClearLocalData}
            style={{
              backgroundColor: "#fca5a5",
              color: "#7f1d1d",
              border: "none",
              borderRadius: "10px",
              padding: "12px 22px",
              cursor: "pointer",
            }}
          >
            清除本地缓存
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