"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

type DetailData = {
  report: any;
  questionnaire: any;
  task: any | null;
};

export default function AdminReportDetailPage({ params }: Props) {
  const [id, setId] = useState("");
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    params.then((value) => {
      if (mounted) setId(value.id);
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/reports/${id}`, {
          cache: "no-store",
        });

        const text = await response.text();

        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(
            `接口没有返回 JSON。状态码: ${response.status}，返回内容前80字符: ${text.slice(0, 80)}`
          );
        }

        if (!response.ok || !json.success) {
          throw new Error(json.message || "读取报告详情失败");
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取报告详情失败");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  const reportData = data?.report?.report_data ?? {};
  const dimensions = reportData.dimensions ?? {};

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/admin/reports"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← 返回报告列表
          </Link>
        </div>

        {loading && <p>加载中...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {!loading && !error && data && (
          <>
            <section style={sectionStyle}>
              <h1 style={h1Style}>报告详情</h1>
              <p style={subStyle}>报告 ID：{data.report.id}</p>
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>报告摘要</h2>
              <InfoGrid
                data={[
                  ["综合评分", reportData.score],
                  ["安全意识等级", reportData.safetyLevel],
                  ["安全意识类型", reportData.awarenessType],
                  ["生成时间", formatDate(data.report.generated_at)],
                  ["问卷 ID", data.report.questionnaire_id],
                  ["分析任务 ID", data.report.ai_analysis_id],
                ]}
              />
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>受访者基本信息</h2>
              <InfoGrid
                data={[
                  ["姓名", data.questionnaire.basic_info?.name],
                  ["性别", data.questionnaire.basic_info?.gender],
                  ["年龄", data.questionnaire.basic_info?.age],
                  ["工种", data.questionnaire.basic_info?.jobType],
                  ["工龄", data.questionnaire.basic_info?.workYears],
                  ["矿区", data.questionnaire.basic_info?.mineArea],
                ]}
              />
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>总体评估</h2>
              <DetailBlock content={reportData.overallAssessment} />
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>维度评分</h2>
              <InfoGrid
                data={[
                  ["安全优先意识", dimensions.safetyPriority],
                  ["规范遵循意识", dimensions.complianceAwareness],
                  ["责任担当意识", dimensions.responsibilityAwareness],
                  ["侥幸心理", dimensions.luckPsychology],
                  ["从众心理", dimensions.conformityPsychology],
                  ["风险识别能力", dimensions.riskIdentification],
                  ["应急处置能力", dimensions.emergencyHandling],
                  ["违规干预意愿", dimensions.interventionWillingness],
                  ["隐患上报意识", dimensions.hazardReporting],
                ]}
              />
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>结构化分析内容</h2>
              <ListBlock title="主要优势表现" items={reportData.strengths} />
              <ListBlock title="关键安全盲区" items={reportData.blindSpots} />
              <ListBlock
                title="关键安全盲区与风险点"
                items={reportData.keyRisks}
              />
              <ListBlock
                title="针对性改进建议"
                items={reportData.recommendations}
              />
              <ListBlock title="培训需求" items={reportData.trainingNeeds} />
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>问卷答案</h2>
              <div style={{ display: "grid", gap: 12 }}>
                {Object.entries(data.questionnaire.answers ?? {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 14,
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          marginBottom: 6,
                        }}
                      >
                        题目 {key}
                      </div>
                      <div style={{ color: "#0f172a", lineHeight: 1.8 }}>
                        {String(value)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>执行信息</h2>
              <InfoGrid
                data={[
                  ["模型", reportData.metadata?.model],
                  ["耗时(ms)", reportData.metadata?.processingTimeMs],
                  ["任务状态", data.task?.status],
                  ["最近更新时间", formatDate(data.task?.updated_at)],
                  ["错误信息", data.task?.error_message || "-"],
                ]}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function InfoGrid({ data }: { data: [string, any][] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {data.map(([label, value]) => (
        <div
          key={label}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 14,
            background: "#fafafa",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              color: "#0f172a",
              fontWeight: 600,
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}
          >
            {value ?? "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailBlock({ content }: { content?: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "#fafafa",
        color: "#0f172a",
        lineHeight: 1.9,
      }}
    >
      {content || "-"}
    </div>
  );
}

function ListBlock({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h3>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 14,
          background: "#fafafa",
        }}
      >
        {!items || items.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>暂无数据</div>
        ) : (
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#0f172a",
              lineHeight: 1.9,
            }}
          >
            {items.map((item, index) => (
              <li key={`${title}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  color: "#0f172a",
};

const h2Style: React.CSSProperties = {
  marginTop: 0,
  fontSize: 22,
  color: "#0f172a",
};

const subStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#64748b",
  fontSize: 14,
  wordBreak: "break-all",
};