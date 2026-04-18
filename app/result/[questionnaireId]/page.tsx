'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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
  weaknesses?: string[];
  recommendations?: string[];
  keyRisks?: string[];
  trainingNeeds?: string[];
  metadata?: {
    provider?: string;
    model?: string;
    processingTimeMs?: number;
  };
};

export default function ResultPage({ params }: Props) {
  const searchParams = useSearchParams();

  const [questionnaireId, setQuestionnaireId] = useState('');
  const [taskStatus, setTaskStatus] = useState<
    'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  const taskId = useMemo(() => searchParams.get('taskId'), [searchParams]);

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
        cache: 'no-store',
      });

      const json = await response.json();

      if (response.ok && json?.success) {
        setReport(json.data.report);
        setTaskStatus('completed');
        setError('');
        return true;
      }

      return false;
    }

    async function startAndPoll() {
      setError('');

      if (taskId) {
        await fetch(`/api/analysis/run/${taskId}`, {
          method: 'POST',
        }).catch(() => {
          // 忽略启动接口瞬时失败，后面轮询会继续判断
        });
      }

      const hasReport = await fetchReportOnce();
      if (hasReport || stopped) return;

      if (!taskId) {
        setError('缺少 taskId，无法轮询分析状态');
        setTaskStatus('failed');
        return;
      }

      timer = setInterval(async () => {
        if (stopped) return;

        const statusResponse = await fetch(`/api/analysis/${taskId}`, {
          cache: 'no-store',
        });
        const statusJson = await statusResponse.json();

        if (!statusResponse.ok || !statusJson?.success) {
          setTaskStatus('failed');
          setError(statusJson?.message || '任务状态查询失败');
          if (timer) clearInterval(timer);
          return;
        }

        const status = statusJson.data.taskStatus as
          | 'pending'
          | 'processing'
          | 'completed'
          | 'failed';

        setTaskStatus(status);

        if (status === 'completed') {
          const ok = await fetchReportOnce();
          if (ok && timer) clearInterval(timer);
        }

        if (status === 'failed') {
          setError(statusJson.data.errorMessage || '分析任务失败');
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

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>问卷分析结果</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        问卷 ID：{questionnaireId || '加载中...'}
      </p>

      {!report && (
        <section
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>分析状态</h2>
          <p>当前状态：{taskStatus}</p>
          {taskStatus === 'pending' && <p>任务已创建，等待执行。</p>}
          {taskStatus === 'processing' && <p>AI 正在分析，请稍候。</p>}
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        </section>
      )}

      {report && (
  <section
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 20,
    }}
  >
    <h2 style={{ marginTop: 0 }}>分析结论</h2>

    <p>
      <strong>安全意识等级：</strong>
      {report.safetyLevel ?? "未评定"}
    </p>

    <p>
      <strong>评分：</strong>
      {report.score ?? "暂无"}
    </p>

    <p>
      <strong>安全意识类型：</strong>
      {report.awarenessType ?? "未判定"}
    </p>

    <p>
      <strong>总体评估：</strong>
      {report.overallAssessment ?? "暂无"}
    </p>

    {report.dimensions && (
      <div style={{ marginTop: 24 }}>
        <h3>维度评分</h3>
        <ul style={{ lineHeight: 1.9, paddingLeft: 20 }}>
          <li>安全优先意识：{report.dimensions.safetyPriority ?? "-"}</li>
          <li>规范遵循意识：{report.dimensions.complianceAwareness ?? "-"}</li>
          <li>责任担当意识：{report.dimensions.responsibilityAwareness ?? "-"}</li>
          <li>侥幸心理：{report.dimensions.luckPsychology ?? "-"}</li>
          <li>从众心理：{report.dimensions.conformityPsychology ?? "-"}</li>
          <li>风险识别能力：{report.dimensions.riskIdentification ?? "-"}</li>
          <li>应急处置能力：{report.dimensions.emergencyHandling ?? "-"}</li>
          <li>违规干预意愿：{report.dimensions.interventionWillingness ?? "-"}</li>
          <li>隐患上报意识：{report.dimensions.hazardReporting ?? "-"}</li>
        </ul>
      </div>
    )}

    <RenderList title="优势" items={report.strengths} />
    <RenderList title="不足" items={report.weaknesses} />
    <RenderList title="建议" items={report.recommendations} />
    <RenderList title="关键风险" items={report.keyRisks} />
    <RenderList title="培训需求" items={report.trainingNeeds} />

    <div style={{ marginTop: 24, color: "#666", fontSize: 14 }}>
      <p>模型：{report.metadata?.model ?? "-"}</p>
      <p>耗时：{report.metadata?.processingTimeMs ?? "-"} ms</p>
    </div>
  </section>
)}
    </main>
  );
}

function RenderList({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}