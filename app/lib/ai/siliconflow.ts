const DEFAULT_MODEL =
  process.env.SILICONFLOW_MODEL?.trim() || "deepseek-ai/DeepSeek-V3";

const SILICONFLOW_URL = "https://api.siliconflow.cn/v1/chat/completions";

type DimensionScores = {
  safetyPriority: number;
  complianceAwareness: number;
  responsibilityAwareness: number;
  luckPsychology: number;
  conformityPsychology: number;
  riskIdentification: number;
  emergencyHandling: number;
  interventionWillingness: number;
  hazardReporting: number;
};

type InsightItem = {
  title: string;
  summary: string;
  scenario: string;
  impact: string;
};

type RiskItem = {
  title: string;
  trigger: string;
  consequence: string;
  severity: "高" | "中" | "低";
};

type RecommendationItem = {
  title: string;
  action: string;
  timing: string;
  target: string;
  priority: "高" | "中" | "低";
};

type TrainingNeedItem = {
  topic: string;
  reason: string;
  method: string;
  goal: string;
};

export type StructuredAnalysisResult = {
  dimensions: DimensionScores;
  overallAssessment: string;
  strengths: InsightItem[];
  blindSpots: InsightItem[];
  keyRisks: RiskItem[];
  recommendations: RecommendationItem[];
  trainingNeeds: TrainingNeedItem[];
};

export type SiliconFlowAnalysisResult = {
  model: string;
  rawText: string;
  structuredResult: StructuredAnalysisResult;
  processingTimeMs: number;
};

type UnknownRecord = Record<string, unknown>;

const EMPTY_DIMENSIONS: DimensionScores = {
  safetyPriority: 0,
  complianceAwareness: 0,
  responsibilityAwareness: 0,
  luckPsychology: 0,
  conformityPsychology: 0,
  riskIdentification: 0,
  emergencyHandling: 0,
  interventionWillingness: 0,
  hazardReporting: 0,
};

function normalizeNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(10, parsed));
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function pickLevel(value: unknown, fallback: "高" | "中" | "低" = "中") {
  return value === "高" || value === "中" || value === "低" ? value : fallback;
}

function normalizeDimensions(value: unknown): DimensionScores {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_DIMENSIONS };
  }

  const obj = value as UnknownRecord;

  return {
    safetyPriority: normalizeNumber(obj.safetyPriority),
    complianceAwareness: normalizeNumber(obj.complianceAwareness),
    responsibilityAwareness: normalizeNumber(obj.responsibilityAwareness),
    luckPsychology: normalizeNumber(obj.luckPsychology),
    conformityPsychology: normalizeNumber(obj.conformityPsychology),
    riskIdentification: normalizeNumber(obj.riskIdentification),
    emergencyHandling: normalizeNumber(obj.emergencyHandling),
    interventionWillingness: normalizeNumber(obj.interventionWillingness),
    hazardReporting: normalizeNumber(obj.hazardReporting),
  };
}

function normalizeInsightArray(value: unknown): InsightItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;

        return {
          title: text.length > 18 ? text.slice(0, 18) : text,
          summary: text,
          scenario: "建议结合班前会、交接班、作业执行等现场情境进一步确认具体表现。",
          impact: "该结论来自旧格式兼容转换，建议重新生成报告以获得更完整分析。",
        } satisfies InsightItem;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const obj = item as UnknownRecord;
      const title = normalizeText(obj.title);
      const summary = normalizeText(obj.summary);
      const scenario = normalizeText(obj.scenario);
      const impact = normalizeText(obj.impact);

      if (!title && !summary && !scenario && !impact) {
        return null;
      }

      return {
        title: title || summary || "未命名结论",
        summary: summary || scenario || impact || "暂无补充说明",
        scenario: scenario || "建议结合具体作业场景进一步核实。",
        impact: impact || "该项结论需要结合现场行为继续验证。",
      } satisfies InsightItem;
    })
    .filter((item): item is InsightItem => Boolean(item));
}

function normalizeRiskArray(value: unknown): RiskItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;

        return {
          title: text.length > 18 ? text.slice(0, 18) : text,
          trigger: text,
          consequence: "该结论来自旧格式兼容转换，建议重新生成报告以获取完整风险链条。",
          severity: "中",
        } satisfies RiskItem;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const obj = item as UnknownRecord;
      const title = normalizeText(obj.title);
      const trigger = normalizeText(obj.trigger);
      const consequence = normalizeText(obj.consequence);
      const severity = pickLevel(obj.severity, "中");

      if (!title && !trigger && !consequence) {
        return null;
      }

      return {
        title: title || trigger || "未命名风险",
        trigger: trigger || "触发条件未明确，建议结合现场任务压力和作业流程补充判断。",
        consequence: consequence || "后果未明确，建议结合岗位风险重新评估。",
        severity,
      } satisfies RiskItem;
    })
    .filter((item): item is RiskItem => Boolean(item));
}

function normalizeRecommendationArray(value: unknown): RecommendationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;

        return {
          title: text.length > 18 ? text.slice(0, 18) : text,
          action: text,
          timing: "在相关风险场景出现时立即执行。",
          target: "形成可重复执行的稳定动作。",
          priority: "中",
        } satisfies RecommendationItem;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const obj = item as UnknownRecord;
      const title = normalizeText(obj.title);
      const action = normalizeText(obj.action);
      const timing = normalizeText(obj.timing);
      const target = normalizeText(obj.target);
      const priority = pickLevel(obj.priority, "中");

      if (!title && !action && !timing && !target) {
        return null;
      }

      return {
        title: title || action || "未命名建议",
        action: action || "建议补充更明确的执行动作。",
        timing: timing || "在相关问题首次暴露时执行。",
        target: target || "形成可以被观察和复核的行为变化。",
        priority,
      } satisfies RecommendationItem;
    })
    .filter((item): item is RecommendationItem => Boolean(item));
}

function normalizeTrainingNeedArray(value: unknown): TrainingNeedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;

        return {
          topic: text,
          reason: "该结论来自旧格式兼容转换，缺少原因说明。",
          method: "建议采用情景演练、案例复盘和班组讨论结合的方式推进。",
          goal: "训练后能在类似场景中做出更符合标准的动作。",
        } satisfies TrainingNeedItem;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const obj = item as UnknownRecord;
      const topic = normalizeText(obj.topic);
      const reason = normalizeText(obj.reason);
      const method = normalizeText(obj.method);
      const goal = normalizeText(obj.goal);

      if (!topic && !reason && !method && !goal) {
        return null;
      }

      return {
        topic: topic || "未命名培训主题",
        reason: reason || "当前短板与岗位要求之间仍有差距。",
        method: method || "建议结合真实案例和情景训练开展。",
        goal: goal || "训练后形成稳定、可观察的改进行为。",
      } satisfies TrainingNeedItem;
    })
    .filter((item): item is TrainingNeedItem => Boolean(item));
}

function normalizeStructuredResult(value: unknown): StructuredAnalysisResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      dimensions: { ...EMPTY_DIMENSIONS },
      overallAssessment: "",
      strengths: [],
      blindSpots: [],
      keyRisks: [],
      recommendations: [],
      trainingNeeds: [],
    };
  }

  const obj = value as UnknownRecord;

  return {
    dimensions: normalizeDimensions(obj.dimensions),
    overallAssessment: normalizeText(obj.overallAssessment),
    strengths: normalizeInsightArray(obj.strengths),
    blindSpots: normalizeInsightArray(obj.blindSpots),
    keyRisks: normalizeRiskArray(obj.keyRisks),
    recommendations: normalizeRecommendationArray(obj.recommendations),
    trainingNeeds: normalizeTrainingNeedArray(obj.trainingNeeds),
  };
}

export async function analyzeWithSiliconFlow(
  prompt: string,
): Promise<SiliconFlowAnalysisResult> {
  if (!process.env.SILICONFLOW_API_KEY) {
    throw new Error("缺少 SILICONFLOW_API_KEY");
  }

  const startedAt = Date.now();
  const response = await fetch(SILICONFLOW_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是矿工安全意识评估专家。输出必须是严格合法的 JSON 对象，不要输出 markdown，不要输出代码块，不要输出额外解释。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2600,
      response_format: { type: "json_object" },
    }),
  });

  const processingTimeMs = Date.now() - startedAt;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SiliconFlow 请求失败 (${response.status}): ${errorText.slice(0, 500)}`,
    );
  }

  const json = await response.json();
  const rawText = json?.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {
      dimensions: { ...EMPTY_DIMENSIONS },
      overallAssessment: rawText,
      strengths: [],
      blindSpots: [],
      keyRisks: [],
      recommendations: [],
      trainingNeeds: [],
    } satisfies StructuredAnalysisResult;
  }

  return {
    model: json?.model ?? DEFAULT_MODEL,
    rawText,
    structuredResult: normalizeStructuredResult(parsed),
    processingTimeMs,
  };
}
