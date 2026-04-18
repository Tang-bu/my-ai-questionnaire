const DEFAULT_MODEL = 'Qwen/Qwen2.5-14B-Instruct';
const SILICONFLOW_URL = 'https://api.siliconflow.cn/v1/chat/completions';

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

function normalizeStructuredResult(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      overallAssessment: String(value ?? ''),
      safetyLevel: '未评定',
      score: null,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      keyRisks: [],
      trainingNeeds: [],
    };
  }

  const obj = value as Record<string, unknown>;

  return {
    overallAssessment: String(obj.overallAssessment ?? ''),
    safetyLevel: String(obj.safetyLevel ?? '未评定'),
    score:
      typeof obj.score === 'number'
        ? obj.score
        : obj.score
        ? Number(obj.score)
        : null,
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
    throw new Error('缺少 SILICONFLOW_API_KEY');
  }

  const startedAt = Date.now();

  const response = await fetch(SILICONFLOW_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            '你是矿工安全意识评估专家。请只返回 JSON 对象，不要输出 markdown，不要输出额外解释。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
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
  const rawText = json?.choices?.[0]?.message?.content ?? '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {
      overallAssessment: rawText,
      safetyLevel: '未评定',
      score: null,
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