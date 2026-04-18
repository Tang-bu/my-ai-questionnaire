const DEFAULT_MODEL = "Qwen/Qwen2.5-14B-Instruct";
const SILICONFLOW_URL = "https://api.siliconflow.cn/v1/chat/completions";

export type SiliconFlowAnalysisResult = {
  model: string;
  rawText: string;
  structuredResult: Record<string, unknown>;
  processingTimeMs: number;
};

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function normalizeNumber(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return n;
}

function normalizeStructuredResult(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      dimensions: {
        safetyPriority: 0,
        complianceAwareness: 0,
        responsibilityAwareness: 0,
        luckPsychology: 0,
        conformityPsychology: 0,
        riskIdentification: 0,
        emergencyHandling: 0,
        interventionWillingness: 0,
        hazardReporting: 0,
      },
      overallAssessment: String(value ?? ""),
      strengths: [],
      weaknesses: [],
      recommendations: [],
      keyRisks: [],
      trainingNeeds: [],
    };
  }

  const obj = value as Record<string, unknown>;
  const rawDimensions =
    obj.dimensions && typeof obj.dimensions === "object"
      ? (obj.dimensions as Record<string, unknown>)
      : {};

  return {
    dimensions: {
      safetyPriority: normalizeNumber(rawDimensions.safetyPriority),
      complianceAwareness: normalizeNumber(rawDimensions.complianceAwareness),
      responsibilityAwareness: normalizeNumber(
        rawDimensions.responsibilityAwareness
      ),
      luckPsychology: normalizeNumber(rawDimensions.luckPsychology),
      conformityPsychology: normalizeNumber(rawDimensions.conformityPsychology),
      riskIdentification: normalizeNumber(rawDimensions.riskIdentification),
      emergencyHandling: normalizeNumber(rawDimensions.emergencyHandling),
      interventionWillingness: normalizeNumber(
        rawDimensions.interventionWillingness
      ),
      hazardReporting: normalizeNumber(rawDimensions.hazardReporting),
    },
    overallAssessment: String(obj.overallAssessment ?? ""),
    strengths: normalizeArray(obj.strengths),
    weaknesses: normalizeArray(obj.weaknesses),
    recommendations: normalizeArray(obj.recommendations),
    keyRisks: normalizeArray(obj.keyRisks),
    trainingNeeds: normalizeArray(obj.trainingNeeds),
  };
}

export async function analyzeWithSiliconFlow(
  prompt: string
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
            "你是矿工安全意识评估专家。请只返回 JSON 对象，不要输出 markdown，不要输出额外解释。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  const processingTimeMs = Date.now() - startedAt;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SiliconFlow 请求失败 (${response.status}): ${errorText.slice(0, 500)}`
    );
  }

  const json = await response.json();
  const rawText = json?.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {
      dimensions: {
        safetyPriority: 0,
        complianceAwareness: 0,
        responsibilityAwareness: 0,
        luckPsychology: 0,
        conformityPsychology: 0,
        riskIdentification: 0,
        emergencyHandling: 0,
        interventionWillingness: 0,
        hazardReporting: 0,
      },
      overallAssessment: rawText,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      keyRisks: [],
      trainingNeeds: [],
    };
  }

  return {
    model: json?.model ?? DEFAULT_MODEL,
    rawText,
    structuredResult: normalizeStructuredResult(parsed),
    processingTimeMs,
  };
}