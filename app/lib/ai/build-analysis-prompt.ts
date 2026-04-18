type BasicInfo = {
  name: string;
  gender: string;
  age: string;
  jobType: string;
  workYears: string;
  mineArea: string;
};

export function buildAnalysisPrompt(
  basicInfo: BasicInfo,
  answers: Record<string, string>
): string {
  const sortedAnswers = Object.entries(answers).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return `请分析以下矿工安全意识问卷。

## 评分依据
请围绕以下维度评分，每个维度范围为 0-10 分：
1. safetyPriority：安全优先意识
2. complianceAwareness：规范遵循意识
3. responsibilityAwareness：责任担当意识
4. luckPsychology：侥幸心理（分越高表示风险越大）
5. conformityPsychology：从众心理（分越高表示风险越大）
6. riskIdentification：风险识别能力
7. emergencyHandling：应急处置能力
8. interventionWillingness：违规干预意愿
9. hazardReporting：隐患上报/主动纠偏意识

## 矿工基本信息
- 姓名: ${basicInfo.name || "未提供"}
- 性别: ${basicInfo.gender || "未提供"}
- 年龄: ${basicInfo.age || "未提供"} 岁
- 工种: ${basicInfo.jobType || "未提供"}
- 工龄: ${basicInfo.workYears || "未提供"} 年
- 所属矿区: ${basicInfo.mineArea || "未提供"}

## 问卷回答
${sortedAnswers
  .map(([questionId, answer]) => `问题 ${questionId}: ${answer}`)
  .join("\n")}

## 输出要求
只返回 JSON 对象，不要输出 markdown，不要输出解释。

JSON 字段必须包含：
{
  "dimensions": {
    "safetyPriority": 0,
    "complianceAwareness": 0,
    "responsibilityAwareness": 0,
    "luckPsychology": 0,
    "conformityPsychology": 0,
    "riskIdentification": 0,
    "emergencyHandling": 0,
    "interventionWillingness": 0,
    "hazardReporting": 0
  },
  "overallAssessment": "对该受访者安全意识的总体判断",
  "strengths": ["主要优势1", "主要优势2", "主要优势3"],
  "blindSpots": ["关键盲区1", "关键盲区2"],
  "keyRisks": ["关键风险点1", "关键风险点2"],
  "recommendations": ["针对性建议1", "针对性建议2", "针对性建议3"],
  "trainingNeeds": ["培训需求1", "培训需求2"]
}

要求：
1. strengths 必须突出个人优势表现
2. blindSpots 必须体现安全意识盲区
3. keyRisks 必须体现潜在风险点
4. recommendations 必须具体、可执行
5. 所有数组字段尽量控制在 2-4 条`;
}