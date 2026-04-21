type BasicInfo = {
  name: string;
  gender: string;
  age: string;
  jobType: string;
  workYears: string;
  mineArea: string;
};

type AnswersRecord = Record<string, string | number | boolean | null | undefined>;

export function buildAnalysisPrompt(
  basicInfo: BasicInfo,
  answers: AnswersRecord,
): string {
  const sortedAnswers = Object.entries(answers).sort(
    ([a], [b]) => Number(a) - Number(b),
  );

  return `你是矿工安全意识评估专家，需要根据问卷回答输出一份“判断明确、贴近现场、没有空话”的分析结果。

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
${sortedAnswers.map(([questionId, answer]) => `问题 ${questionId}: ${answer ?? "未作答"}`).join("\n")}

## 你的分析原则
1. 不要写口号，不要写正确但没用的废话。
2. 结论必须和分数及回答倾向对应，不能泛泛而谈。
3. 语言要像一名懂现场的安全管理者在写评估意见，不要像宣传材料。
4. 重点写“在哪些场景下会表现出来”“会带来什么后果”“下一步该怎么改”。
5. strengths 是已经形成的能力，不是优点堆砌。
6. blindSpots 要指出什么时候容易失守。
7. keyRisks 要写清楚触发条件和可能后果。
8. recommendations 必须写成可以执行的动作，禁止只写“加强、提高、重视、关注”。
9. trainingNeeds 要说明为什么训、怎么训、训完看什么变化。
10. 每条内容务必简洁，summary/action/reason/goal 控制在 18-60 字，不要注水。

## 输出要求
只返回 JSON 对象，不要输出 markdown，不要输出解释。
JSON 字段必须严格包含以下结构：
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
  "overallAssessment": "80-140字，总结此人的安全意识水平、主要稳定能力、最关键短板以及最优先改进方向",
  "strengths": [
    {
      "title": "标题，8-18字",
      "summary": "这项能力已经形成到什么程度",
      "scenario": "通常会出现在哪类现场场景",
      "impact": "这项能力能减少什么问题或带来什么价值"
    }
  ],
  "blindSpots": [
    {
      "title": "标题，8-18字",
      "summary": "核心盲区是什么",
      "scenario": "在哪些情境下最容易暴露",
      "impact": "一旦失守，通常会带来什么问题"
    }
  ],
  "keyRisks": [
    {
      "title": "标题，8-18字",
      "trigger": "风险一般在什么触发条件下出现",
      "consequence": "可能导致什么后果",
      "severity": "高或中或低"
    }
  ],
  "recommendations": [
    {
      "title": "标题，8-18字",
      "action": "必须执行的具体动作",
      "timing": "建议在什么时机执行",
      "target": "做到什么算有效",
      "priority": "高或中或低"
    }
  ],
  "trainingNeeds": [
    {
      "topic": "培训主题，6-18字",
      "reason": "为什么当前需要训",
      "method": "建议怎么训",
      "goal": "训完要看到什么变化"
    }
  ]
}

## 数量要求
- strengths：2-3 条
- blindSpots：1-2 条
- keyRisks：1-3 条
- recommendations：2-3 条
- trainingNeeds：1-2 条

## 额外要求
- 如果某个维度分高，不要机械吹捧，要说明它在现场的实际意义。
- 如果侥幸心理或从众心理偏高，必须在 blindSpots 或 keyRisks 中明确指出。
- 如果风险识别、应急处置、违规干预、隐患上报偏弱，recommendations 和 trainingNeeds 必须直接对应这些短板。
- 不要输出空数组，实在信息不足也要给出基于回答倾向的谨慎判断。`;
}
