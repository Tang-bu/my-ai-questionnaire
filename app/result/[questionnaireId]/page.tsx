"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  params: Promise<{ questionnaireId: string }>;
};

type ReportData = {
  overallAssessment?: string;
  safetyLevel?: string;
  awarenessType?: string;
  score?: number | null;
  dimensions?: {
    safetyPriority?: number;
    complianceAwareness?: number;
    responsibilityAwareness?: number;
    luckPsychology?: number;
    conformityPsychology?: number;
    riskIdentification?: number;
    emergencyHandling?: number;
    interventionWillingness?: number;
    hazardReporting?: number;
  };
  strengths?: string[];
  blindSpots?: string[];
  keyRisks?: string[];
  recommendations?: string[];
  trainingNeeds?: string[];
  metadata?: {
    provider?: string;
    model?: string;
    processingTimeMs?: number;
  };
};

export default function ResultPage({ params }: Props) {
  const searchParams = useSearchParams();

  const [questionnaireId, setQuestionnaireId] = useState("");
  const [taskStatus, setTaskStatus] = useState<
    "idle" | "pending" | "processing" | "completed" | "failed"
  >("idle");
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  const taskId = useMemo(() => searchParams.get("taskId"), [searchParams]);

  useEffect(() => {
    let mounted = true;

    params.then((value) => {
      if (mounted) {
        setQuestionnaireId(value.questionnaireId);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!questionnaireId) return;

    let timer: NodeJS.Timeout | null = null;
    let stopped = false;

    async function fetchReportOnce() {
      const response = await fetch(`/api/reports/${questionnaireId}`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (response.ok && json?.success) {
        setReport(json.data.report);
        setTaskStatus("completed");
        setError("");
        return true;
      }

      return false;
    }

    async function startAndPoll() {
      setError("");

      if (taskId) {
        await fetch(`/api/analysis/run/${taskId}`, {
          method: "POST",
        }).catch(() => {
          // 启动任务失败时，后续轮询继续兜底
        });
      }

      const hasReport = await fetchReportOnce();
      if (hasReport || stopped) return;

      if (!taskId) {
        setError("缺少 taskId，无法轮询分析状态");
        setTaskStatus("failed");
        return;
      }

      timer = setInterval(async () => {
        if (stopped) return;

        const statusResponse = await fetch(`/api/analysis/${taskId}`, {
          cache: "no-store",
        });
        const statusJson = await statusResponse.json();

        if (!statusResponse.ok || !statusJson?.success) {
          setTaskStatus("failed");
          setError(statusJson?.message || "任务状态查询失败");
          if (timer) clearInterval(timer);
          return;
        }

        const status = statusJson.data.taskStatus as
          | "pending"
          | "processing"
          | "completed"
          | "failed";

        setTaskStatus(status);

        if (status === "completed") {
          const ok = await fetchReportOnce();
          if (ok && timer) clearInterval(timer);
        }

        if (status === "failed") {
          setError(statusJson.data.errorMessage || "分析任务失败");
          if (timer) clearInterval(timer);
        }
      }, 2000);
    }

    startAndPoll();

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, [questionnaireId, taskId]);

  const levelColor =
    report?.safetyLevel === "高"
      ? "#16a34a"
      : report?.safetyLevel === "中"
      ? "#d97706"
      : "#dc2626";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 16px 48px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: "28px 28px 24px",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            AI 安全意识评估结果
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.2,
              fontWeight: 800,
            }}
          >
            问卷分析结果
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "rgba(255,255,255,0.86)",
              fontSize: 16,
              lineHeight: 1.8,
              wordBreak: "break-all",
            }}
          >
            问卷 ID：{questionnaireId || "加载中..."}
          </p>
        </header>

        {!report && (
          <section
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 24 }}>分析状态</h2>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background:
                  taskStatus === "processing"
                    ? "#eff6ff"
                    : taskStatus === "pending"
                    ? "#fefce8"
                    : taskStatus === "failed"
                    ? "#fef2f2"
                    : "#f8fafc",
                color:
                  taskStatus === "processing"
                    ? "#1d4ed8"
                    : taskStatus === "pending"
                    ? "#a16207"
                    : taskStatus === "failed"
                    ? "#b91c1c"
                    : "#475569",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    taskStatus === "processing"
                      ? "#2563eb"
                      : taskStatus === "pending"
                      ? "#eab308"
                      : taskStatus === "failed"
                      ? "#ef4444"
                      : "#94a3b8",
                }}
              />
              当前状态：{taskStatus}
            </div>

            {taskStatus === "pending" && (
              <p style={{ marginTop: 18, color: "#64748b" }}>
                分析任务已创建，正在等待执行。
              </p>
            )}

            {taskStatus === "processing" && (
              <p style={{ marginTop: 18, color: "#64748b" }}>
                AI 正在分析问卷内容，请稍候。
              </p>
            )}

            {error && (
              <p style={{ marginTop: 18, color: "#b91c1c" }}>{error}</p>
            )}
          </section>
        )}

        {report && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <MetricCard
                title="综合评分"
                value={String(report.score ?? "-")}
                subText="个人安全意识综合评分"
                accent="#2563eb"
              />
              <MetricCard
                title="安全意识等级"
                value={report.safetyLevel ?? "-"}
                subText="按评分规则自动判定"
                accent={levelColor}
              />
              <MetricCard
                title="安全意识类型"
                value={report.awarenessType ?? "-"}
                subText="按心理特征与行为模式判定"
                accent="#7c3aed"
              />
            </section>

            <section
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 24 }}>总体评估</h2>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  结构化结论
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#334155",
                  fontSize: 16,
                  lineHeight: 1.9,
                }}
              >
                {report.overallAssessment ?? "暂无"}
              </p>
            </section>

            {report.dimensions && (
              <section
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ marginTop: 0, fontSize: 24 }}>维度评分</h2>
                <p
                  style={{
                    marginTop: 0,
                    color: "#64748b",
                    marginBottom: 20,
                  }}
                >
                  采用 0-10 分维度评分后，经后端统一规则换算为总分与类型结果。
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 14,
                  }}
                >
                  <DimensionBar
                    label="安全优先意识"
                    value={report.dimensions.safetyPriority}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="规范遵循意识"
                    value={report.dimensions.complianceAwareness}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="责任担当意识"
                    value={report.dimensions.responsibilityAwareness}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="侥幸心理"
                    value={report.dimensions.luckPsychology}
                    isRisk
                  />
                  <DimensionBar
                    label="从众心理"
                    value={report.dimensions.conformityPsychology}
                    isRisk
                  />
                  <DimensionBar
                    label="风险识别能力"
                    value={report.dimensions.riskIdentification}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="应急处置能力"
                    value={report.dimensions.emergencyHandling}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="违规干预意愿"
                    value={report.dimensions.interventionWillingness}
                    isRisk={false}
                  />
                  <DimensionBar
                    label="隐患上报意识"
                    value={report.dimensions.hazardReporting}
                    isRisk={false}
                  />
                </div>
              </section>
            )}

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <InfoCard
                title="主要优势表现"
                accent="#16a34a"
                items={report.strengths}
                emptyText="暂无优势表现数据"
              />
              <InfoCard
                title="关键安全盲区"
                accent="#d97706"
                items={report.blindSpots}
                emptyText="暂无安全盲区数据"
              />
              <InfoCard
                title="关键安全盲区与风险点"
                accent="#dc2626"
                items={report.keyRisks}
                emptyText="暂无关键风险数据"
              />
              <InfoCard
                title="针对性改进建议"
                accent="#2563eb"
                items={report.recommendations}
                emptyText="暂无改进建议"
              />
            </section>

            <section
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                marginBottom: 24,
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: 24 }}>培训需求</h2>
              <TagList items={report.trainingNeeds} emptyText="暂无培训需求" />
            </section>

            <section
              style={{
                background: "#0f172a",
                color: "#fff",
                borderRadius: 20,
                padding: 20,
                boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>
                模型与执行信息
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                <div>
                  <strong>模型：</strong>
                  {report.metadata?.model ?? "-"}
                </div>
                <div>
                  <strong>耗时：</strong>
                  {report.metadata?.processingTimeMs ?? "-"} ms
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subText,
  accent,
}: {
  title: string;
  value: string;
  subText: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 5,
          background: accent,
        }}
      />
      <div
        style={{
          color: "#64748b",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 10,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "#94a3b8",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {subText}
      </div>
    </div>
  );
}

function DimensionBar({
  label,
  value,
  isRisk,
}: {
  label: string;
  value?: number;
  isRisk?: boolean;
}) {
  const safeValue = Math.max(0, Math.min(10, Number(value ?? 0)));
  const percent = `${safeValue * 10}%`;
  const barColor = isRisk ? "#ef4444" : "#2563eb";
  const trackColor = isRisk ? "#fee2e2" : "#dbeafe";

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "14px 16px",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 12,
        }}
      >
        <span
          style={{
            color: "#0f172a",
            fontWeight: 600,
            lineHeight: 1.6,
          }}
        >
          {label}
        </span>
        <span
          style={{
            minWidth: 34,
            textAlign: "right",
            color: isRisk ? "#b91c1c" : "#1d4ed8",
            fontWeight: 800,
          }}
        >
          {safeValue}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: 999,
          background: trackColor,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: percent,
            height: "100%",
            borderRadius: 999,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  accent,
  items,
  emptyText,
}: {
  title: string;
  accent: string;
  items?: string[];
  emptyText: string;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: accent,
            flexShrink: 0,
          }}
        />
        <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
      </div>

      {!items || items.length === 0 ? (
        <p style={{ margin: 0, color: "#94a3b8" }}>{emptyText}</p>
      ) : (
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#334155",
            lineHeight: 1.9,
          }}
        >
          {items.map((item, index) => (
            <li key={`${title}-${index}`} style={{ marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TagList({
  items,
  emptyText,
}: {
  items?: string[];
  emptyText: string;
}) {
  if (!items || items.length === 0) {
    return <p style={{ margin: 0, color: "#94a3b8" }}>{emptyText}</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}