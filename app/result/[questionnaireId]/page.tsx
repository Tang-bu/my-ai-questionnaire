"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = { params: Promise<{ questionnaireId: string }> };

type Dimensions = {
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

type InsightItem = { title?: string; summary?: string; scenario?: string; impact?: string };
type RiskItem = { title?: string; trigger?: string; consequence?: string; severity?: "高" | "中" | "低" };
type RecommendationItem = { title?: string; action?: string; timing?: string; target?: string; priority?: "高" | "中" | "低" };
type TrainingNeedItem = { topic?: string; reason?: string; method?: string; goal?: string };

type ReportData = {
  overallAssessment?: string;
  safetyLevel?: string;
  awarenessType?: string;
  score?: number | null;
  dimensions?: Dimensions;
  strengths?: Array<string | InsightItem>;
  blindSpots?: Array<string | InsightItem>;
  keyRisks?: Array<string | RiskItem>;
  recommendations?: Array<string | RecommendationItem>;
  trainingNeeds?: Array<string | TrainingNeedItem>;
  metadata?: { provider?: string; model?: string; processingTimeMs?: number };
};

type NormalizedInsightItem = { title: string; summary: string; scenario: string; impact: string };
type NormalizedRiskItem = { title: string; trigger: string; consequence: string; severity: "高" | "中" | "低" };
type NormalizedRecommendationItem = { title: string; action: string; timing: string; target: string; priority: "高" | "中" | "低" };
type NormalizedTrainingNeedItem = { topic: string; reason: string; method: string; goal: string };

const colors = {
  bg: "#f3f6fb",
  card: "#ffffff",
  border: "#d7e1f0",
  text: "#0f172a",
  muted: "#475569",
  shadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

function asText(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function normalizeInsights(items?: Array<string | InsightItem>): NormalizedInsightItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;
        return {
          title: `结论 ${index + 1}`,
          summary: text,
          scenario: "建议结合班前会、交接班、作业执行等现场情境进一步确认具体表现。",
          impact: "该条来自旧格式报告，建议重新生成以获得更完整分析。",
        } satisfies NormalizedInsightItem;
      }
      if (!item || typeof item !== "object") return null;
      return {
        title: asText(item.title, `结论 ${index + 1}`),
        summary: asText(item.summary, "暂无说明"),
        scenario: asText(item.scenario, "建议结合具体现场场景继续核实该结论。"),
        impact: asText(item.impact, "该结论需要在实际行为中进一步验证。"),
      } satisfies NormalizedInsightItem;
    })
    .filter((item): item is NormalizedInsightItem => Boolean(item));
}

function normalizeRisks(items?: Array<string | RiskItem>): NormalizedRiskItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;
        return {
          title: `风险 ${index + 1}`,
          trigger: text,
          consequence: "该条来自旧格式报告，建议重新生成以获得完整风险链条。",
          severity: "中",
        } satisfies NormalizedRiskItem;
      }
      if (!item || typeof item !== "object") return null;
      const severity =
        item.severity === "高" || item.severity === "中" || item.severity === "低"
          ? item.severity
          : "中";
      return {
        title: asText(item.title, `风险 ${index + 1}`),
        trigger: asText(item.trigger, "触发条件未明确。"),
        consequence: asText(item.consequence, "可能后果未明确。"),
        severity,
      } satisfies NormalizedRiskItem;
    })
    .filter((item): item is NormalizedRiskItem => Boolean(item));
}

function normalizeRecommendations(
  items?: Array<string | RecommendationItem>,
): NormalizedRecommendationItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;
        return {
          title: `建议 ${index + 1}`,
          action: text,
          timing: "建议在相关问题第一次暴露时立即执行。",
          target: "形成可重复的稳定动作。",
          priority: "中",
        } satisfies NormalizedRecommendationItem;
      }
      if (!item || typeof item !== "object") return null;
      const priority =
        item.priority === "高" || item.priority === "中" || item.priority === "低"
          ? item.priority
          : "中";
      return {
        title: asText(item.title, `建议 ${index + 1}`),
        action: asText(item.action, "具体动作未明确。"),
        timing: asText(item.timing, "建议在相关风险场景出现时执行。"),
        target: asText(item.target, "形成可观察的行为变化。"),
        priority,
      } satisfies NormalizedRecommendationItem;
    })
    .filter((item): item is NormalizedRecommendationItem => Boolean(item));
}

function normalizeTrainingNeeds(
  items?: Array<string | TrainingNeedItem>,
): NormalizedTrainingNeedItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;
        return {
          topic: text,
          reason: "原因说明缺失，建议重新生成结构化报告。",
          method: "建议采用案例复盘、情景演练和班组讨论结合方式。",
          goal: "训练后能在类似情境下做出更符合标准的动作。",
        } satisfies NormalizedTrainingNeedItem;
      }
      if (!item || typeof item !== "object") return null;
      return {
        topic: asText(item.topic, `培训主题 ${index + 1}`),
        reason: asText(item.reason, "暂无原因说明。"),
        method: asText(item.method, "暂无训练方式说明。"),
        goal: asText(item.goal, "暂无预期变化说明。"),
      } satisfies NormalizedTrainingNeedItem;
    })
    .filter((item): item is NormalizedTrainingNeedItem => Boolean(item));
}

function levelColor(level?: string) {
  if (level === "高") return "#16a34a";
  if (level === "中") return "#d97706";
  return "#dc2626";
}

function badgeColors(level: "高" | "中" | "低") {
  if (level === "高") return { bg: "#fee2e2", text: "#b91c1c" };
  if (level === "中") return { bg: "#fef3c7", text: "#b45309" };
  return { bg: "#dcfce7", text: "#15803d" };
}

export default function ResultPage({ params }: Props) {
  const searchParams = useSearchParams();
  const [questionnaireId, setQuestionnaireId] = useState("");
  const [taskStatus, setTaskStatus] = useState<"idle" | "pending" | "processing" | "completed" | "failed">("idle");
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const taskId = useMemo(() => searchParams.get("taskId"), [searchParams]);

  useEffect(() => {
    let mounted = true;
    params.then((value) => {
      if (mounted) setQuestionnaireId(value.questionnaireId);
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
      const response = await fetch(`/api/reports/${questionnaireId}`, { cache: "no-store" });
      const json = await response.json();
      if (response.ok && json?.success) {
        setReport(json.data.report as ReportData);
        setTaskStatus("completed");
        setError("");
        return true;
      }
      return false;
    }

    async function startAndPoll() {
      setError("");
      if (taskId) {
        await fetch(`/api/analysis/run/${taskId}`, { method: "POST" }).catch(() => {});
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
        const statusResponse = await fetch(`/api/analysis/${taskId}`, { cache: "no-store" });
        const statusJson = await statusResponse.json();

        if (!statusResponse.ok || !statusJson?.success) {
          setTaskStatus("failed");
          setError(statusJson?.message || "任务状态查询失败");
          if (timer) clearInterval(timer);
          return;
        }

        const status = statusJson.data.taskStatus as "pending" | "processing" | "completed" | "failed";
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

  const strengths = normalizeInsights(report?.strengths);
  const blindSpots = normalizeInsights(report?.blindSpots);
  const risks = normalizeRisks(report?.keyRisks);
  const recommendations = normalizeRecommendations(report?.recommendations);
  const trainingNeeds = normalizeTrainingNeeds(report?.trainingNeeds);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, padding: 16, color: colors.text }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Header questionnaireId={questionnaireId} />

        {!report && (
          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0 }}>分析状态</h2>
            <div style={{ color: colors.muted, marginBottom: 8 }}>当前状态：{taskStatus}</div>
            {taskStatus === "pending" && <div>分析任务已创建，正在等待执行。</div>}
            {taskStatus === "processing" && <div>AI 正在分析问卷内容，请稍候。</div>}
            {error && <div style={{ color: "#dc2626" }}>{error}</div>}
          </section>
        )}

        {report && (
          <>
            <div style={metricGridStyle}>
              <MetricCard title="综合评分" value={String(report.score ?? 0)} subText="个人安全意识综合评分" accent="#3b82f6" />
              <MetricCard title="安全意识等级" value={report.safetyLevel ?? "-"} subText="按评分规则自动判定" accent="#f59e0b" />
              <MetricCard title="安全意识类型" value={report.awarenessType ?? "-"} subText="结合维度表现与行为倾向判定" accent="#8b5cf6" />
            </div>

            <section style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <h2 style={{ margin: 0 }}>总体评估</h2>
                <span style={pillStyle("#dbeafe", "#1d4ed8")}>结构化结论</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.8 }}>{report.overallAssessment ?? "暂无"}</p>
            </section>

            {report.dimensions && (
              <section style={sectionStyle}>
                <h2 style={{ marginTop: 0 }}>维度评分</h2>
                <p style={descStyle}>蓝色维度越高越好，红色维度越高代表风险越大。</p>
                <div style={dimensionGridStyle}>
                  <DimensionBar label="安全优先意识" value={report.dimensions.safetyPriority} />
                  <DimensionBar label="规范遵循意识" value={report.dimensions.complianceAwareness} />
                  <DimensionBar label="责任担当意识" value={report.dimensions.responsibilityAwareness} />
                  <DimensionBar label="侥幸心理" value={report.dimensions.luckPsychology} isRisk />
                  <DimensionBar label="从众心理" value={report.dimensions.conformityPsychology} isRisk />
                  <DimensionBar label="风险识别能力" value={report.dimensions.riskIdentification} />
                  <DimensionBar label="应急处置能力" value={report.dimensions.emergencyHandling} />
                  <DimensionBar label="违规干预意愿" value={report.dimensions.interventionWillingness} />
                  <DimensionBar label="隐患上报意识" value={report.dimensions.hazardReporting} />
                </div>
              </section>
            )}

            <section style={sectionStyle}>
              <SectionTitle dotColor="#16a34a" title="主要优势表现" />
              <p style={descStyle}>这里写的是已经形成的能力，不是优点堆砌。</p>
              <div style={gridTwoStyle}>
                {strengths.length === 0 ? <EmptyCard text="暂无优势分析" /> : strengths.map((item, index) => <InsightCard key={`${item.title}-${index}`} item={item} tone="green" />)}
              </div>
            </section>

            <section style={sectionStyle}>
              <SectionTitle dotColor="#d97706" title="关键安全盲区" />
              <p style={descStyle}>重点看什么时候会失守，不是泛泛地说有问题。</p>
              <div style={gridTwoStyle}>
                {blindSpots.length === 0 ? <EmptyCard text="暂无盲区分析" /> : blindSpots.map((item, index) => <InsightCard key={`${item.title}-${index}`} item={item} tone="orange" />)}
              </div>
            </section>

            <section style={sectionStyle}>
              <SectionTitle dotColor="#dc2626" title="关键安全盲区与风险点" />
              <p style={descStyle}>每个风险都拆成触发条件和可能后果，方便判断优先盯哪里。</p>
              <div style={{ display: "grid", gap: 14 }}>
                {risks.length === 0 ? <EmptyCard text="暂无风险分析" /> : risks.map((item, index) => <RiskCard key={`${item.title}-${index}`} item={item} />)}
              </div>
            </section>

            <section style={sectionStyle}>
              <SectionTitle dotColor="#2563eb" title="针对性改进建议" />
              <p style={descStyle}>建议必须能执行，所以按动作、时机、目标和优先级展示。</p>
              <div style={gridTwoStyle}>
                {recommendations.length === 0 ? <EmptyCard text="暂无改进建议" /> : recommendations.map((item, index) => <RecommendationCard key={`${item.title}-${index}`} item={item} />)}
              </div>
            </section>

            <section style={sectionStyle}>
              <SectionTitle dotColor="#7c3aed" title="培训需求" />
              <p style={descStyle}>培训不是贴标签，而是明确为什么训、怎么训、训完要看到什么变化。</p>
              <div style={{ display: "grid", gap: 14 }}>
                {trainingNeeds.length === 0 ? <EmptyCard text="暂无培训建议" /> : trainingNeeds.map((item, index) => <TrainingNeedCard key={`${item.topic}-${index}`} item={item} />)}
              </div>
            </section>

            <section style={{ ...sectionStyle, background: "linear-gradient(180deg, #0b1736 0%, #0f1f4d 100%)", color: "#f8fafc" }}>
              <h3 style={{ marginTop: 0 }}>模型与执行信息</h3>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", fontSize: 15 }}>
                <div>模型： <strong>{report.metadata?.model ?? "-"}</strong></div>
                <div>耗时： <strong>{report.metadata?.processingTimeMs ?? "-"} ms</strong></div>
                <div>当前等级色： <strong style={{ color: levelColor(report.safetyLevel) }}>{report.safetyLevel ?? "-"}</strong></div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Header({ questionnaireId }: { questionnaireId: string }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #172554 0%, #1d4ed8 100%)", color: "#fff", borderRadius: 22, padding: 24, boxShadow: colors.shadow, marginBottom: 20 }}>
      <div style={pillStyle("rgba(255,255,255,0.14)", "#fff")}>AI 安全意识评估结果</div>
      <h1 style={{ margin: "18px 0 10px", fontSize: 38, lineHeight: 1.15 }}>问卷分析结果</h1>
      <div style={{ opacity: 0.9, fontSize: 14 }}>问卷 ID：{questionnaireId || "加载中..."}</div>
    </div>
  );
}

function MetricCard({ title, value, subText, accent }: { title: string; value: string; subText: string; accent: string }) {
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderTop: `4px solid ${accent}`, borderRadius: 20, padding: 18, boxShadow: colors.shadow }}>
      <div style={{ color: colors.muted, fontSize: 14, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{value}</div>
      <div style={{ color: colors.muted, fontSize: 13 }}>{subText}</div>
    </div>
  );
}

function DimensionBar({ label, value, isRisk }: { label: string; value?: number; isRisk?: boolean }) {
  const safeValue = Math.max(0, Math.min(10, Number(value ?? 0)));
  const percent = `${safeValue * 10}%`;
  const barColor = isRisk ? "#ef4444" : "#2563eb";
  const trackColor = isRisk ? "#fee2e2" : "#dbeafe";
  return (
    <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 18, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, fontWeight: 700 }}>
        <span>{label}</span>
        <span style={{ color: barColor }}>{safeValue}</span>
      </div>
      <div style={{ width: "100%", height: 10, borderRadius: 999, overflow: "hidden", background: trackColor }}>
        <div style={{ width: percent, height: "100%", background: barColor, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function SectionTitle({ dotColor, title }: { dotColor: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, background: dotColor, display: "inline-block" }} />
      <h2 style={{ margin: 0 }}>{title}</h2>
    </div>
  );
}

function InsightCard({ item, tone }: { item: NormalizedInsightItem; tone: "green" | "orange" }) {
  const palette = tone === "green"
    ? { border: "#bbf7d0", bg: "#f0fdf4", badge: "#22c55e" }
    : { border: "#fed7aa", bg: "#fff7ed", badge: "#f97316" };
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 18, padding: 16 }}>
      <div style={{ ...pillStyle("rgba(255,255,255,0.75)", palette.badge), marginBottom: 12 }}>{item.title}</div>
      <Field label="核心判断" value={item.summary} />
      <Field label="典型场景" value={item.scenario} />
      <Field label="实际意义" value={item.impact} />
    </div>
  );
}

function RiskCard({ item }: { item: NormalizedRiskItem }) {
  const colors = badgeColors(item.severity);
  return (
    <div style={{ background: "#fff7f7", border: "1px solid #fecaca", borderRadius: 18, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 18 }}>{item.title}</h4>
        <span style={pillStyle(colors.bg, colors.text)}>风险等级：{item.severity}</span>
      </div>
      <Field label="风险触发条件" value={item.trigger} />
      <Field label="可能后果" value={item.consequence} />
    </div>
  );
}

function RecommendationCard({ item }: { item: NormalizedRecommendationItem }) {
  const colors = badgeColors(item.priority);
  return (
    <div style={{ background: "#f8fbff", border: "1px solid #bfdbfe", borderRadius: 18, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 18 }}>{item.title}</h4>
        <span style={pillStyle(colors.bg, colors.text)}>优先级：{item.priority}</span>
      </div>
      <Field label="具体动作" value={item.action} />
      <Field label="建议时机" value={item.timing} />
      <Field label="完成标准" value={item.target} />
    </div>
  );
}

function TrainingNeedCard({ item }: { item: NormalizedTrainingNeedItem }) {
  return (
    <div style={{ background: "#faf7ff", border: "1px solid #d8b4fe", borderRadius: 18, padding: 16 }}>
      <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>{item.topic}</h4>
      <Field label="培训原因" value={item.reason} />
      <Field label="训练方式" value={item.method} />
      <Field label="预期变化" value={item.goal} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: colors.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ lineHeight: 1.8 }}>{value}</div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ background: "#fff", border: `1px dashed ${colors.border}`, borderRadius: 18, padding: 18, color: colors.muted }}>
      {text}
    </div>
  );
}

function pillStyle(bg: string, color: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: bg,
    color,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };
}

const sectionStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 22,
  padding: 20,
  boxShadow: colors.shadow,
  marginBottom: 20,
};

const descStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  color: colors.muted,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 20,
};

const dimensionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const gridTwoStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 14,
};
