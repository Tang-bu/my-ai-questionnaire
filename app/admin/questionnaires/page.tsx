"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type QuestionnaireRow = {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  basicInfo: {
    name: string;
    gender: string;
    age: string;
    jobType: string;
    workYears: string;
    mineArea: string;
  };
  latestTask: {
    id: string;
    status: string;
    updatedAt: string;
    errorMessage?: string | null;
  } | null;
  latestReport: {
    id: string;
    generatedAt: string;
    score?: number | null;
    safetyLevel?: string | null;
    awarenessType?: string | null;
  } | null;
};

export default function AdminQuestionnairesPage() {
  const [rows, setRows] = useState<QuestionnaireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/questionnaires", {
          cache: "no-store",
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "读取列表失败");
        }

        setRows(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取列表失败");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" ? true : row.status === statusFilter;

      const text = [
        row.id,
        row.basicInfo.name,
        row.basicInfo.mineArea,
        row.basicInfo.jobType,
        row.latestReport?.awarenessType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword = keyword.trim()
        ? text.includes(keyword.trim().toLowerCase())
        : true;

      return matchesStatus && matchesKeyword;
    });
  }, [rows, keyword, statusFilter]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              color: "#0f172a",
            }}
          >
            后台问卷管理
          </h1>
          <p
            style={{
              marginTop: 10,
              color: "#64748b",
              fontSize: 16,
            }}
          >
            查看所有提交问卷、分析状态与报告结果
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
              placeholder="搜索姓名、矿区、工种、类型、问卷ID"
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="all">全部状态</option>
              <option value="submitted">submitted</option>
              <option value="analyzing">analyzing</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
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
                共 {filteredRows.length} 条记录
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 1000,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <Th>姓名</Th>
                      <Th>矿区</Th>
                      <Th>工种</Th>
                      <Th>问卷状态</Th>
                      <Th>最新任务</Th>
                      <Th>评分</Th>
                      <Th>等级</Th>
                      <Th>类型</Th>
                      <Th>提交时间</Th>
                      <Th>操作</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <Td>{row.basicInfo.name || "-"}</Td>
                        <Td>{row.basicInfo.mineArea || "-"}</Td>
                        <Td>{row.basicInfo.jobType || "-"}</Td>
                        <Td>
                          <StatusBadge text={row.status} />
                        </Td>
                        <Td>
                          {row.latestTask ? (
                            <StatusBadge text={row.latestTask.status} />
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>{row.latestReport?.score ?? "-"}</Td>
                        <Td>{row.latestReport?.safetyLevel ?? "-"}</Td>
                        <Td>{row.latestReport?.awarenessType ?? "-"}</Td>
                        <Td>{formatDate(row.createdAt)}</Td>
                        <Td>
                          <Link
                            href={`/admin/questionnaires/${row.id}`}
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

function StatusBadge({ text }: { text: string }) {
  const background =
    text === "completed"
      ? "#dcfce7"
      : text === "failed"
      ? "#fee2e2"
      : text === "analyzing" || text === "processing"
      ? "#dbeafe"
      : "#fef3c7";

  const color =
    text === "completed"
      ? "#166534"
      : text === "failed"
      ? "#b91c1c"
      : text === "analyzing" || text === "processing"
      ? "#1d4ed8"
      : "#92400e";

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
      {text}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}