"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RealResultPage() {
  const [basicInfo, setBasicInfo] = useState<any>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 从localStorage加载数据
  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedPage1 = localStorage.getItem("questionnairePage1");
    const savedPage2 = localStorage.getItem("questionnairePage2");
    const savedPage3 = localStorage.getItem("questionnairePage3");
    const savedPage4 = localStorage.getItem("questionnairePage4");
    const savedPage5 = localStorage.getItem("questionnairePage5");

    if (savedBasicInfo) {
      setBasicInfo(JSON.parse(savedBasicInfo));
    }

    // 合并所有答案
    const page1 = savedPage1 ? JSON.parse(savedPage1) : {};
    const page2 = savedPage2 ? JSON.parse(savedPage2) : {};
    const page3 = savedPage3 ? JSON.parse(savedPage3) : {};
    const page4 = savedPage4 ? JSON.parse(savedPage4) : {};
    const page5 = savedPage5 ? JSON.parse(savedPage5) : {};

    const allAnswers: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) {
      const key = `question${i}`;
      if (i <= 2 && page1[key]) allAnswers[i.toString()] = page1[key];
      else if (i <= 4 && page2[key]) allAnswers[i.toString()] = page2[key];
      else if (i <= 6 && page3[key]) allAnswers[i.toString()] = page3[key];
      else if (i <= 8 && page4[key]) allAnswers[i.toString()] = page4[key];
      else if (i <= 10 && page5[key]) allAnswers[i.toString()] = page5[key];
    }

    setAnswers(allAnswers);

    // 检查是否有缓存的AI结果
    const cachedAiResult = localStorage.getItem("aiAnalysisResult");
    if (cachedAiResult) {
      setAiResult(JSON.parse(cachedAiResult));
      setIsLoading(false);
    } else {
      // 如果没有缓存，尝试获取
      fetchAiAnalysis();
    }
  }, []);

  // 获取AI分析
  const fetchAiAnalysis = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('开始获取AI分析...');

      const requestData = {
        basicInfo,
        answers
      };

      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API错误: ${response.status}`);
      }

      if (data.success && data.aiAnalysis) {
        // 保存AI结果到localStorage
        localStorage.setItem('aiAnalysisResult', JSON.stringify(data.aiAnalysis));
        setAiResult(data.aiAnalysis);
        console.log('AI分析结果已保存:', data.aiAnalysis);
      } else {
        throw new Error('API返回了失败状态');
      }

    } catch (error) {
      console.error('获取AI分析失败:', error);
      const errorMessage = error instanceof Error ? error.message : '获取AI分析失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // 手动重新获取AI分析
  const handleRetry = () => {
    localStorage.removeItem('aiAnalysisResult');
    setAiResult(null);
    setError(null);
    setIsLoading(true);
    fetchAiAnalysis();
  };

  // 获取完成率
  const getCompletionRate = () => {
    const answeredCount = Object.values(answers).filter(answer =>
      answer && answer.trim() !== ''
    ).length;
    return Math.round((answeredCount / 10) * 100);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
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
        {/* 标题栏 */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            真实AI分析报告
          </div>

          <h1 style={{ marginTop: 0, color: "#111827", marginBottom: "12px" }}>
            矿工安全意识评估报告
          </h1>
          <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
            本报告基于您填写的问卷，由AI模型分析生成，包含安全意识评估、优势不足分析、改进建议等内容。
          </p>
        </div>

        {/* 基本信息卡片 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
              基本信息
            </h3>
            <div style={{ color: "#6b7280", lineHeight: "1.8" }}>
              <p style={{ margin: "8px 0" }}>
                <strong>姓名：</strong>{basicInfo.name || "未填写"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>工种：</strong>{basicInfo.jobType || "未填写"}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>工龄：</strong>{basicInfo.workYears || "未填写"}年
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>所属矿区：</strong>{basicInfo.mineArea || "未填写"}
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
              完成情况
            </h3>
            <div style={{ color: "#6b7280", lineHeight: "1.8" }}>
              <p style={{ margin: "8px 0" }}>
                <strong>已回答题数：</strong>
                {Object.values(answers).filter(a => a && a.trim() !== '').length} / 10
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>完成率：</strong>{getCompletionRate()}%
              </p>
            </div>
            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  width: `${getCompletionRate()}%`,
                  height: "100%",
                  backgroundColor: "#2563eb",
                }}
              />
            </div>
          </div>
        </div>

        {/* AI分析结果区域 */}
        {isLoading ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "40px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: "18px", marginBottom: "16px" }}>
              ⏳ AI分析中，请稍候...
            </div>
            <p style={{ color: "#9ca3af", lineHeight: "1.6" }}>
              正在调用AI模型分析您的问卷回答，这可能需要30-60秒。
              <br />
              请耐心等待，不要关闭页面。
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #fecaca",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#dc2626", marginBottom: "16px" }}>
              ❌ AI分析失败
            </h3>
            <p style={{ color: "#7f1d1d", lineHeight: "1.6", marginBottom: "24px" }}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              重新尝试AI分析
            </button>
          </div>
        ) : aiResult ? (
          <>
            {/* 安全意识等级和评分 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "18px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                  安全意识等级
                </h3>
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: aiResult.safetyLevel === "高" ? "#d1fae5" :
                                   aiResult.safetyLevel === "中" ? "#fef3c7" : "#fee2e2",
                    color: aiResult.safetyLevel === "高" ? "#065f46" :
                          aiResult.safetyLevel === "中" ? "#92400e" : "#7f1d1d",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "20px",
                  }}
                >
                  {aiResult.safetyLevel || "未评估"}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "18px",
                  padding: "24px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                  综合评分
                </h3>
                <div
                  style={{
                    color: aiResult.score >= 80 ? "#065f46" :
                          aiResult.score >= 60 ? "#92400e" : "#dc2626",
                    fontSize: "48px",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {aiResult.score || "未评分"}
                  <span style={{ fontSize: "20px", color: "#6b7280" }}>/100</span>
                </div>
              </div>
            </div>

            {/* 总体评估 */}
            {aiResult.overallAssessment && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "28px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                  📋 总体评估
                </h3>
                <p style={{ color: "#6b7280", lineHeight: "1.8", margin: 0 }}>
                  {aiResult.overallAssessment}
                </p>
              </div>
            )}

            {/* 优势和不足 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {aiResult.strengths && aiResult.strengths.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                    ✅ 优势分析
                  </h3>
                  <ul style={{ color: "#6b7280", lineHeight: "1.7", margin: 0, paddingLeft: "20px" }}>
                    {aiResult.strengths.map((item: string, index: number) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.weaknesses && aiResult.weaknesses.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.5)",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                    ⚠️  需要注意
                  </h3>
                  <ul style={{ color: "#6b7280", lineHeight: "1.7", margin: 0, paddingLeft: "20px" }}>
                    {aiResult.weaknesses.map((item: string, index: number) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 改进建议 */}
            {aiResult.recommendations && aiResult.recommendations.length > 0 && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "28px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#111827", marginBottom: "16px" }}>
                  💡 改进建议
                </h3>
                <ul style={{ color: "#6b7280", lineHeight: "1.7", margin: 0, paddingLeft: "20px" }}>
                  {aiResult.recommendations.map((item: string, index: number) => (
                    <li key={index} style={{ marginBottom: "12px" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              backgroundColor: "#fef3c7",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #fbbf24",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#92400e", marginBottom: "16px" }}>
              ⚠️  未获取到AI分析结果
            </h3>
            <p style={{ color: "#92400e", lineHeight: "1.6", marginBottom: "24px" }}>
              未能获取到AI分析结果，请尝试重新提交问卷。
            </p>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              获取AI分析
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/questionnaire/basic-info">
            <button
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              重新填写问卷
            </button>
          </Link>

          <Link href="/">
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
              返回首页
            </button>
          </Link>

          <Link href="/result/demo">
            <button
              style={{
                backgroundColor: "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              查看演示结果
            </button>
          </Link>

          {aiResult && (
            <button
              onClick={() => {
                localStorage.removeItem('aiAnalysisResult');
                setAiResult(null);
                handleRetry();
              }}
              style={{
                backgroundColor: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              重新分析
            </button>
          )}
        </div>
      </div>
    </main>
  );
}