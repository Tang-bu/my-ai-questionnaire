"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReportRow = {
  id: string;
  questionnaireId: string;
  aiAnalysisId: string;
  reportFormat: string;
  generatedAt: string;
  questionnaireStatus?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  basicInfo: {
    name: string;
    gender: string;
    age: string;
    jobType: string;
    workYears: string;
    mineArea: string;
  };
  score?: number | null;
  safetyLevel?: string | null;
  awarenessType?: string | null;
};

export default function AdminReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/reports", {
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
          throw new Error(json.message || "读取报告列表失败");
        }

        setRows(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取报告列表失败");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesLevel =
        levelFilter === "all" ? true : row.safetyLevel === levelFilter;

      const searchText = [
        row.id,
        row.questionnaireId,
        row.basicInfo.name,
        row.basicInfo.mineArea,
        row.basicInfo.jobType,
        row.awarenessType,
        row.safetyLevel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = keyword.trim()
        ? searchText.includes(keyword.trim().toLowerCase())
        : true;

      return matchesLevel && matchesKeyword;
    });
  }, [rows, keyword, levelFilter]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              color: "#0f172a",
            }}
          >
            后台报告管理
          </h1>
          <p
            style={{
              marginTop: 10,
              color: "#64748b",
              fontSize: 16,
            }}
          >
            查看所有已生成报告、评分结果与类型判定
          </p>
        </header>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 12,
            }}
          >
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索姓名、矿区、工种、等级、类型、报告ID"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 14,
                boxSizing: "border-box",
                background: "#fff",
              }}
            >
              <option value="all">全部等级</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          }}
        >
          {loading && <p style={{ margin: 0 }}>加载中...</p>}
          {error && <p style={{ margin: 0, color: "#dc2626" }}>{error}</p>}

          {!loading && !error && (
            <>
              <div
                style={{
                  marginBottom: 14,
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                共 {filteredRows.length} 份报告
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 1050,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <Th>姓名</Th>
                      <Th>矿区</Th>
                      <Th>工种</Th>
                      <Th>综合评分</Th>
                      <Th>等级</Th>
                      <Th>类型</Th>
                      <Th>问卷状态</Th>
                      <Th>生成时间</Th>
                      <Th>操作</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <Td>{row.basicInfo.name || "-"}</Td>
                        <Td>{row.basicInfo.mineArea || "-"}</Td>
                        <Td>{row.basicInfo.jobType || "-"}</Td>
                        <Td>{row.score ?? "-"}</Td>
                        <Td>
                          {row.safetyLevel ? (
                            <LevelBadge level={row.safetyLevel} />
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>{row.awarenessType ?? "-"}</Td>
                        <Td>{row.questionnaireStatus ?? "-"}</Td>
                        <Td>{formatDate(row.generatedAt)}</Td>
                        <Td>
                          <Link
                            href={`/admin/reports/${row.id}`}
                            style={{
                              color: "#2563eb",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            查看详情
                          </Link>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 14px",
        borderBottom: "1px solid #e5e7eb",
        color: "#475569",
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "14px",
        borderBottom: "1px solid #f1f5f9",
        color: "#0f172a",
        fontSize: 14,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function LevelBadge({ level }: { level: string }) {
  const background =
    level === "高" ? "#dcfce7" : level === "中" ? "#fef3c7" : "#fee2e2";

  const color =
    level === "高" ? "#166534" : level === "中" ? "#92400e" : "#b91c1c";

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "6px 10px",
        borderRadius: 999,
        background,
        color,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {level}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}