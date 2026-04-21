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

const PAGE_SIZE = 10;

export default function AdminQuestionnairesPage() {
  const [rows, setRows] = useState<QuestionnaireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <main style={mainStyle}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={h1Style}>后台问卷管理</h1>
          <p style={subStyle}>查看所有提交问卷、分析状态与报告结果</p>
        </header>

        <section style={panelStyle}>
          <div style={filterGridStyle}>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索姓名、矿区、工种、类型、问卷ID"
              style={controlStyle}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={controlStyle}
            >
              <option value="all">全部状态</option>
              <option value="submitted">submitted</option>
              <option value="analyzing">analyzing</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </div>
        </section>

        <section style={panelStyle}>
          {loading && <p style={{ margin: 0 }}>加载中...</p>}
          {error && <p style={{ margin: 0, color: "#dc2626" }}>{error}</p>}

          {!loading && !error && (
            <>
              <PaginationSummary
                total={filteredRows.length}
                page={safePage}
                totalPages={totalPages}
                label="条记录"
              />

              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
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
                    {pagedRows.map((row) => (
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
                          <Link href={`/admin/questionnaires/${row.id}`} style={linkStyle}>
                            查看详情
                          </Link>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function PaginationSummary({
  total,
  page,
  totalPages,
  label,
}: {
  total: number;
  page: number;
  totalPages: number;
  label: string;
}) {
  return (
    <div style={{ marginBottom: 14, color: "#64748b", fontSize: 14 }}>
      共 {total} {label}，第 {page} / {totalPages} 页
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div style={paginationStyle}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={pageButtonStyle(page <= 1)}
      >
        上一页
      </button>
      <span style={{ color: "#475569", fontSize: 14 }}>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={pageButtonStyle(page >= totalPages)}
      >
        下一页
      </button>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={thStyle}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={tdStyle}>{children}</td>;
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

  return <span style={{ ...badgeStyle, background, color }}>{text}</span>;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "32px 20px",
};

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  color: "#0f172a",
};

const subStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#64748b",
  fontSize: 16,
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};

const filterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(180px, 1fr)",
  gap: 12,
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
  background: "#fff",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1000,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #e5e7eb",
  color: "#475569",
  fontSize: 14,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid #f1f5f9",
  color: "#0f172a",
  fontSize: 14,
  verticalAlign: "top",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  fontWeight: 600,
  textDecoration: "none",
};

const paginationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
  marginTop: 18,
};

function pageButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    background: disabled ? "#f3f4f6" : "#fff",
    color: disabled ? "#9ca3af" : "#111827",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
