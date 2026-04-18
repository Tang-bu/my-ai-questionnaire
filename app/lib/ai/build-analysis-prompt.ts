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

  return `请分析以下矿工的安全意识问卷：

## 矿工基本信息
- 姓名: ${basicInfo.name || '未提供'}
- 性别: ${basicInfo.gender || '未提供'}
- 年龄: ${basicInfo.age || '未提供'} 岁
- 工种: ${basicInfo.jobType || '未提供'}
- 工龄: ${basicInfo.workYears || '未提供'} 年
- 所属矿区: ${basicInfo.mineArea || '未提供'}

## 问卷回答
${sortedAnswers
  .map(([questionId, answer]) => `问题 ${questionId}: ${answer}`)
  .join('\n')}

## 输出要求
请你以矿工安全意识评估专家身份，输出 JSON 格式结果，字段必须包含：
{
  "overallAssessment": "总体评估",
  "safetyLevel": "高/中/低",
  "score": 0-100,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "recommendations": ["建议1", "建议2"],
  "keyRisks": ["风险点1", "风险点2"],
  "trainingNeeds": ["培训需求1", "培训需求2"]
}

要求：
1. 结论专业、客观、可执行
2. 不要输出 markdown
3. 只返回 JSON 对象`;
}