"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "idle" | "pending" | "processing" | "completed" | "failed";

function WaitingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("pending");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("正在提交问卷...");

  const taskId = searchParams.get("taskId");
  const questionnaireId = searchParams.get("questionnaireId");

  useEffect(() => {
    if (!taskId || !questionnaireId) {
      setStatus("failed");
      setMessage("缺少必要的参数，请返回重新提交");
      return;
    }

    let pollCount = 0;
    const maxPolls = 60;

    const startAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/run/${taskId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const json = await response.json();
        console.log("Analysis start response:", json);
      } catch (error) {
        console.error("Start analysis error:", error);
      }
    };

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/${taskId}`, {
          cache: "no-store",
        });
        const json = await response.json();

        if (!response.ok || !json?.success) {
          setStatus("failed");
          setMessage(json?.message || "查询状态失败");
          return;
        }

        const taskStatus = json.data.taskStatus as Status;

        if (taskStatus === "completed") {
          setStatus("completed");
          setMessage("分析完成！正在跳转到结果页面...");
          setProgress(100);
          setTimeout(() => {
            router.push(`/result/${questionnaireId}?taskId=${taskId}`);
          }, 1500);
          return;
        }

        if (taskStatus === "failed") {
          setStatus("failed");
          setMessage(json.data.errorMessage || "分析任务失败");
          return;
        }

        pollCount++;
        const newProgress = Math.min(95, Math.round((pollCount / maxPolls) * 100));
        setProgress(newProgress);

        if (pollCount >= maxPolls) {
          setStatus("failed");
          setMessage("分析超时，请稍后刷新页面重试");
          return;
        }

        setTimeout(pollStatus, 2000);
      } catch (error) {
        console.error("Poll error:", error);
        pollCount++;
        if (pollCount >= maxPolls) {
          setStatus("failed");
          setMessage("网络错误，请检查网络连接后刷新重试");
        } else {
          setTimeout(pollStatus, 3000);
        }
      }
    };

    setTimeout(() => {
      setMessage("问卷已提交，正在启动AI分析...");
      startAnalysis();
      setTimeout(pollStatus, 1000);
    }, 1500);

  }, [taskId, questionnaireId, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 16px 48px rgba(15, 23, 42, 0.1)",
          textAlign: "center",
        }}
      >
        {status === "failed" ? (
          <>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: "24px", color: "#111827" }}>
              提交失败
            </h1>
            <p style={{ margin: "0 0 24px", color: "#6b7280", lineHeight: "1.6" }}>
              {message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => router.push("/questionnaire/guided")}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                重新填写
              </button>
              <button
                onClick={() => router.push("/")}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                返回首页
              </button>
            </div>
          </>
        ) : status === "completed" ? (
          <>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: "24px", color: "#111827" }}>
              分析完成！
            </h1>
            <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
              {message}
            </p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "32px", position: "relative" }}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 3.39} 339`}
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#2563eb",
                }}
              >
                {progress}%
              </div>
            </div>

            <h1 style={{ margin: "0 0 12px", fontSize: "24px", color: "#111827" }}>
              AI 正在分析中
            </h1>
            <p style={{ margin: "0 0 8px", color: "#6b7280", lineHeight: "1.6" }}>
              {message}
            </p>
            <p style={{ margin: "0 0 24px", color: "#9ca3af", fontSize: "14px" }}>
              预计需要 1-3 分钟，请勿关闭页面
            </p>

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "left",
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                分析流程：
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#6b7280", lineHeight: "1.8" }}>
                <li>答卷预处理与校验</li>
                <li>AI 深度语义分析</li>
                <li>安全意识维度评估</li>
                <li>报告生成与整合</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <WaitingPageContent />
    </Suspense>
  );
}