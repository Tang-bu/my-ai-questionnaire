export type AnalysisDimensions = {
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

export type NormalizedAnalysisResult = {
  score: number;
  safetyLevel: "高" | "中" | "低";
  awarenessType:
    | "卓越安全意识型"
    | "基础主动安全意识型"
    | "从众跟随安全意识型"
    | "侥幸妥协安全意识型";
};

function clamp(value: number, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function clamp100(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeDimensions(
  raw: Partial<AnalysisDimensions>
): AnalysisDimensions {
  return {
    safetyPriority: clamp(Number(raw.safetyPriority ?? 0)),
    complianceAwareness: clamp(Number(raw.complianceAwareness ?? 0)),
    responsibilityAwareness: clamp(Number(raw.responsibilityAwareness ?? 0)),
    luckPsychology: clamp(Number(raw.luckPsychology ?? 0)),
    conformityPsychology: clamp(Number(raw.conformityPsychology ?? 0)),
    riskIdentification: clamp(Number(raw.riskIdentification ?? 0)),
    emergencyHandling: clamp(Number(raw.emergencyHandling ?? 0)),
    interventionWillingness: clamp(Number(raw.interventionWillingness ?? 0)),
    hazardReporting: clamp(Number(raw.hazardReporting ?? 0)),
  };
}

export function calculateScore(dimensions: AnalysisDimensions): number {
  const positivePsychology =
    ((dimensions.safetyPriority +
      dimensions.complianceAwareness +
      dimensions.responsibilityAwareness) /
      30) *
    35;

  const behaviorAbility =
    ((dimensions.riskIdentification +
      dimensions.emergencyHandling +
      dimensions.interventionWillingness +
      dimensions.hazardReporting) /
      40) *
    45;

  const negativePenalty =
    ((dimensions.luckPsychology + dimensions.conformityPsychology) / 20) * 20;

  return clamp100(positivePsychology + behaviorAbility - negativePenalty);
}

export function calculateSafetyLevel(score: number): "高" | "中" | "低" {
  if (score >= 80) return "高";
  if (score >= 60) return "中";
  return "低";
}

export function calculateAwarenessType(
  dimensions: AnalysisDimensions,
  score: number
): NormalizedAnalysisResult["awarenessType"] {
  if (dimensions.luckPsychology >= 8) {
    return "侥幸妥协安全意识型";
  }

  if (dimensions.conformityPsychology >= 8) {
    return "从众跟随安全意识型";
  }

  if (
    score >= 80 &&
    dimensions.luckPsychology <= 2 &&
    dimensions.conformityPsychology <= 2
  ) {
    return "卓越安全意识型";
  }

  return "基础主动安全意识型";
}

export function buildNormalizedResult(
  raw: Partial<AnalysisDimensions>
): {
  dimensions: AnalysisDimensions;
  normalized: NormalizedAnalysisResult;
} {
  const dimensions = normalizeDimensions(raw);
  const score = calculateScore(dimensions);
  const safetyLevel = calculateSafetyLevel(score);
  const awarenessType = calculateAwarenessType(dimensions, score);

  return {
    dimensions,
    normalized: {
      score,
      safetyLevel,
      awarenessType,
    },
  };
}