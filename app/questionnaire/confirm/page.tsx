"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_QUESTIONS } from "@/app/lib/questions";

type QuestionItem = {
  id: number;
  title: string;
  guide: string;
};

type BasicInfo = {
  name: string;
  gender: string;
  age: string;
  jobType: string;
  workYears: string;
  mineArea: string;
};

const emptyBasicInfo: BasicInfo = {
  name: "",
  gender: "",
  age: "",
  jobType: "",
  workYears: "",
  mineArea: "",
};

export default function ConfirmPage() {
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasicInfo);
  const questions: QuestionItem[] = DEFAULT_QUESTIONS;
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const savedBasicInfo = localStorage.getItem("basicInfo");
    const savedAllAnswers = localStorage.getItem("questionnaireAllAnswers");

    if (savedBasicInfo) {
      setBasicInfo(JSON.parse(savedBasicInfo));
    }

    if (savedAllAnswers) {
      setAllAnswers(JSON.parse(savedAllAnswers));
    }
  }, []);

  const answers = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) {
      result[i.toString()] = allAnswers[`question${i}`] || "";
    }
    return result;
  }, [allAnswers]);

  const answerMap = useMemo<Record<number, string>>(() => {
    const result: Record<number, string> = {};
    for (let i = 1; i <= 10; i++) {
      result[i] = allAnswers[`question${i}`] || "";
    }
    return result;
  }, [allAnswers]);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basicInfo,
          answers,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "问卷提交失败");
      }

      const { questionnaireId, taskId } = json.data;
      router.push(
        `/questionnaire/waiting?questionnaireId=${questionnaireId}&taskId=${taskId}`
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 24 }}>
          <p style={eyebrowStyle}>最后一步</p>
          <h1 style={titleStyle}>提交确认</h1>
          <p style={descriptionStyle}>
            请在提交前确认以下内容是否完整。当前页面会显示本次填写的基本信息、10道题目和对应答案。
          </p>
        </div>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>一、基本信息</h2>
          <div style={infoGridStyle}>
            <InfoItem label="姓名" value={basicInfo.name} />
            <InfoItem label="性别" value={basicInfo.gender} />
            <InfoItem label="年龄" value={basicInfo.age} />
            <InfoItem label="工种" value={basicInfo.jobType} />
            <InfoItem label="工龄" value={basicInfo.workYears} />
            <InfoItem label="所属矿区/单位" value={basicInfo.mineArea} />
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>二、问卷答案汇总</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {questions.map((question) => (
              <div key={question.id} style={answerCardStyle}>
                <div style={questionNumberStyle}>题目 {question.id}</div>
                <div style={questionTitleStyle}>{question.title}</div>
                <div style={answerTextStyle}>
                  {answerMap[question.id]?.trim() || "未填写"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={noticeStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 10, color: "#166534" }}>
            提交前提醒
          </h3>
          <ul style={noticeListStyle}>
            <li>请确认基本信息无误</li>
            <li>请确认10道题目的作答内容已经填写完整</li>
            <li>点击提交后将创建分析任务，并跳转到等待页面查看进度</li>
          </ul>
        </section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/questionnaire/guided">
            <button style={secondaryButtonStyle}>返回修改</button>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              ...primaryButtonStyle,
              backgroundColor: isSubmitting ? "#86efac" : "#16a34a",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "提交中..." : "确认提交"}
          </button>
        </div>

        {submitError && (
          <p style={{ color: "#dc2626", marginTop: 12 }}>{submitError}</p>
        )}
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoItemStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value || "未填写"}</div>
    </div>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  padding: "32px 16px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: 16,
  padding: 28,
  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#16a34a",
  fontWeight: 700,
  fontSize: 14,
};

const titleStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 8,
  fontSize: 28,
  color: "#0f172a",
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.7,
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 20,
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 20,
  color: "#0f172a",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const infoItemStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  backgroundColor: "#fafafa",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  marginBottom: 6,
};

const infoValueStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#111827",
  fontWeight: 600,
};

const answerCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  backgroundColor: "#fcfcfd",
};

const questionNumberStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#16a34a",
  marginBottom: 8,
};

const questionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 10,
  lineHeight: 1.6,
};

const answerTextStyle: React.CSSProperties = {
  color: "#374151",
  lineHeight: 1.8,
  whiteSpace: "pre-wrap",
};

const noticeStyle: React.CSSProperties = {
  border: "1px solid #dcfce7",
  backgroundColor: "#f0fdf4",
  borderRadius: 14,
  padding: "18px 20px",
  marginBottom: 24,
};

const noticeListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  color: "#166534",
  lineHeight: 1.8,
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 10,
  padding: "12px 22px",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 22px",
  fontWeight: 700,
};
