"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

type DetailData = {
  questionnaire: any;
  tasks: any[];
  reports: any[];
  latestTask: any | null;
  latestReport: any | null;
};

export default function AdminQuestionnaireDetailPage({ params }: Props) {
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

        const response = await fetch(`/api/admin/questionnaires/${id}`, {
          cache: "no-store",
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "读取详情失败");
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取详情失败");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

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
            href="/admin/questionnaires"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← 返回问卷列表
          </Link>
        </div>

        {loading && <p>加载中...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {!loading && !error && data && (
          <>
            <section style={sectionStyle}>
              <h1 style={h1Style}>问卷详情</h1>
              <p style={subStyle}>问卷 ID：{data.questionnaire.id}</p>
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>基本信息</h2>
              <InfoGrid
                data={[
                  ["姓名", data.questionnaire.basic_info?.name],
                  ["性别", data.questionnaire.basic_info?.gender],
                  ["年龄", data.questionnaire.basic_info?.age],
                  ["工种", data.questionnaire.basic_info?.jobType],
                  ["工龄", data.questionnaire.basic_info?.workYears],
                  ["矿区", data.questionnaire.basic_info?.mineArea],
                  ["问卷状态", data.questionnaire.status],
                  ["提交时间", formatDate(data.questionnaire.created_at)],
                ]}
              />
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
              <h2 style={h2Style}>分析任务</h2>
              {data.latestTask ? (
                <InfoGrid
                  data={[
                    ["任务 ID", data.latestTask.id],
                    ["任务状态", data.latestTask.status],
                    ["最近更新时间", formatDate(data.latestTask.updated_at)],
                    ["错误信息", data.latestTask.error_message || "-"],
                  ]}
                />
              ) : (
                <p>暂无分析任务</p>
              )}
            </section>

            <section style={sectionStyle}>
              <h2 style={h2Style}>分析报告</h2>
              {data.latestReport ? (
                <>
                  <InfoGrid
                    data={[
                      ["报告 ID", data.latestReport.id],
                      ["生成时间", formatDate(data.latestReport.generated_at)],
                      ["综合评分", data.latestReport.report_data?.score],
                      ["安全等级", data.latestReport.report_data?.safetyLevel],
                      ["安全类型", data.latestReport.report_data?.awarenessType],
                    ]}
                  />

                  <DetailBlock
                    title="总体评估"
                    content={data.latestReport.report_data?.overallAssessment}
                  />

                  <ListBlock
                    title="主要优势表现"
                    items={data.latestReport.report_data?.strengths}
                  />
                  <ListBlock
                    title="关键安全盲区"
                    items={data.latestReport.report_data?.blindSpots}
                  />
                  <ListBlock
                    title="关键安全盲区与风险点"
                    items={data.latestReport.report_data?.keyRisks}
                  />
                  <ListBlock
                    title="针对性改进建议"
                    items={data.latestReport.report_data?.recommendations}
                  />
                  <ListBlock
                    title="培训需求"
                    items={data.latestReport.report_data?.trainingNeeds}
                  />
                </>
              ) : (
                <p>暂无报告</p>
              )}
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

function DetailBlock({
  title,
  content,
}: {
  title: string;
  content?: string;
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
          color: "#0f172a",
          lineHeight: 1.9,
        }}
      >
        {content || "-"}
      </div>
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