import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/app/lib/auth";
import { analyzeWithSiliconFlow } from "@/app/lib/ai/siliconflow";
import { buildNormalizedResult } from "@/app/lib/ai/score-analysis";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

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

function hasItems<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function buildStrengthsFallback(dimensions: Dimensions): InsightItem[] {
  const result: InsightItem[] = [];

  if ((dimensions.safetyPriority ?? 0) >= 7) {
    result.push({
      title: "安全底线较稳",
      summary: "作业决策时通常会先考虑安全条件，不容易把进度直接压过安全要求。",
      scenario: "常见于班前布置、临时加任务、步骤取舍等情境。",
      impact: "能减少为赶进度而简化流程的冲动，保持基本操作边界。",
    });
  }

  if ((dimensions.complianceAwareness ?? 0) >= 7) {
    result.push({
      title: "规范执行倾向较强",
      summary: "对流程和规程保持较高接受度，不容易随意改动作法。",
      scenario: "常体现在标准作业、交接班确认、作业票执行中。",
      impact: "有利于降低经验替代标准带来的偏差。",
    });
  }

  if ((dimensions.interventionWillingness ?? 0) >= 7) {
    result.push({
      title: "具备现场纠偏意愿",
      summary: "看到不规范行为时不完全回避，具备提醒或干预的主动性。",
      scenario: "常见于同伴冒险操作、步骤缺失、默认违规等情境。",
      impact: "能够把问题拦在扩大之前，减少风险被默许。",
    });
  }

  if ((dimensions.hazardReporting ?? 0) >= 7) {
    result.push({
      title: "隐患反馈意识较好",
      summary: "发现异常后更可能反馈而不是沉默，具备主动上报和纠偏习惯。",
      scenario: "常见于设备异常、环境变化、流程漏洞或重复性小问题出现时。",
      impact: "有助于把未遂问题提前暴露，避免小偏差累积。",
    });
  }

  if (result.length === 0) {
    result.push({
      title: "基础安全意识已具备",
      summary: "当前已经形成基本的安全判断框架，但稳定性和深度仍需继续验证。",
      scenario: "在常规作业场景下通常能维持基本合规。",
      impact: "说明存在进一步塑造成稳定安全行为的基础。",
    });
  }

  return result.slice(0, 3);
}

function buildBlindSpotsFallback(dimensions: Dimensions): InsightItem[] {
  const result: InsightItem[] = [];

  if ((dimensions.conformityPsychology ?? 0) >= 5) {
    result.push({
      title: "群体压力下易松动",
      summary: "当现场主流做法与标准不一致时，独立判断可能被周围人带偏。",
      scenario: "常见于赶进度、老员工带头简化流程、班组默认违规等场景。",
      impact: "容易把一次妥协演变成习惯性偏差，削弱安全底线。",
    });
  }

  if ((dimensions.luckPsychology ?? 0) >= 5) {
    result.push({
      title: "对未出事场景易放松",
      summary: "长期没出问题的环境容易让警惕性下降，把侥幸当成经验。",
      scenario: "多见于重复任务、低概率风险和熟悉工序中。",
      impact: "会弱化对异常信号的敏感度，增加对非标准操作的容忍。",
    });
  }

  if ((dimensions.riskIdentification ?? 0) <= 6) {
    result.push({
      title: "隐性风险识别偏慢",
      summary: "对复杂、间接或变化中的风险不够敏感，容易等问题变明显才反应。",
      scenario: "常见于交叉作业、条件变化、临时调整和异常征兆初现时。",
      impact: "会压缩处置时间，导致纠偏动作偏慢。",
    });
  }

  if (result.length === 0) {
    result.push({
      title: "稳定性仍需观察",
      summary: "当前没有特别尖锐的单一盲区，但不同情境下的表现一致性仍需追踪。",
      scenario: "重点关注高压、临时变化和多人协同时的决策动作。",
      impact: "避免把一次较好作答直接等同于长期稳定行为。",
    });
  }

  return result.slice(0, 2);
}

function buildKeyRisksFallback(dimensions: Dimensions): RiskItem[] {
  const result: RiskItem[] = [];

  if ((dimensions.luckPsychology ?? 0) >= 5) {
    result.push({
      title: "低概率风险被低估",
      trigger: "重复作业、长期未出事故或自认为熟练时更容易出现。",
      consequence: "容易把一次侥幸通过误当成可复制经验，给后续违章留下空间。",
      severity: "中",
    });
  }

  if ((dimensions.conformityPsychology ?? 0) >= 5) {
    result.push({
      title: "群体默认会拉低标准",
      trigger: "班组图省事、赶任务或由资深人员带头简化步骤时。",
      consequence: "可能错过最佳纠偏时机，让违规操作在现场被正常化。",
      severity: "中",
    });
  }

  if ((dimensions.emergencyHandling ?? 0) <= 6) {
    result.push({
      title: "异常情况下动作不完整",
      trigger: "突发变化、信息不全或压力增大时更容易出现。",
      consequence: "第一反应失序时，容易放大现场混乱并提高误操作风险。",
      severity: "高",
    });
  }

  if (result.length === 0) {
    result.push({
      title: "复杂情境下仍要防守松动",
      trigger: "高压、多人协同、临时变更和时间紧迫时都要重点留意。",
      consequence: "一旦边界感下降，基础意识也可能在现场被稀释。",
      severity: "中",
    });
  }

  return result.slice(0, 3);
}

function buildRecommendationsFallback(dimensions: Dimensions, awarenessType: string): RecommendationItem[] {
  const result: RecommendationItem[] = [];

  if ((dimensions.conformityPsychology ?? 0) >= 5) {
    result.push({
      title: "固定现场表态动作",
      action: "提前准备并反复使用标准表态句，发现流程被简化时立即提醒、复核并必要时叫停。",
      timing: "班前会、交接班和现场出现群体性简化操作时。",
      target: "把是否干预从临场犹豫变成固定动作链。",
      priority: "高",
    });
  }

  if ((dimensions.luckPsychology ?? 0) >= 5) {
    result.push({
      title: "复盘未遂而非只复盘事故",
      action: "每周至少梳理一次差点出事但没出事的小偏差，拆清楚当时为什么会放松。",
      timing: "班后复盘、周例会或阶段总结时。",
      target: "压住侥幸心理回潮，让风险判断不只靠结果倒推。",
      priority: "高",
    });
  }

  if ((dimensions.riskIdentification ?? 0) <= 6) {
    result.push({
      title: "把隐患识别拆成检查清单",
      action: "围绕本岗位高频任务整理风险检查点，作业前逐项确认，不靠临场感觉判断。",
      timing: "准备开工、任务变更和现场条件变化时。",
      target: "让风险识别从凭经验转为可重复核对。",
      priority: "高",
    });
  }

  if ((dimensions.emergencyHandling ?? 0) <= 6) {
    result.push({
      title: "固化异常处置顺序",
      action: "把停—看—报—控写成固定步骤，在演练和实际异常中统一执行。",
      timing: "出现设备异常、环境扰动或非预期变化时。",
      target: "降低突发情况下动作混乱和遗漏。",
      priority: "高",
    });
  }

  if (result.length === 0) {
    result.push({
      title: "持续做情境化校准",
      action: `围绕当前${awarenessType}表现，定期用真实案例复盘自己的判断是否还能守住标准。`,
      timing: "每周复盘或每次典型作业结束后。",
      target: "把较好的意识表现稳定成长期可重复行为。",
      priority: "中",
    });
  }

  return result.slice(0, 3);
}

function buildTrainingNeedsFallback(dimensions: Dimensions): TrainingNeedItem[] {
  const result: TrainingNeedItem[] = [];

  if ((dimensions.conformityPsychology ?? 0) >= 5) {
    result.push({
      topic: "抗压决策与反从众训练",
      reason: "当前在群体压力和资历压力面前仍存在判断松动风险。",
      method: "用多人协同、赶工、老员工带偏等情境做角色演练和即时纠偏训练。",
      goal: "训练后能在不利氛围下仍主动说出并执行标准动作。",
    });
  }

  if ((dimensions.riskIdentification ?? 0) <= 6 || (dimensions.luckPsychology ?? 0) >= 5) {
    result.push({
      topic: "隐患识别与未遂复盘训练",
      reason: "当前对低概率风险和隐性风险的敏感度还不够稳定。",
      method: "用岗位案例、未遂事件复盘和风险清单比对相结合的方式强化。",
      goal: "训练后能更早识别偏差，不再等问题明显才反应。",
    });
  }

  if (result.length === 0) {
    result.push({
      topic: "情景化巩固训练",
      reason: "当前需要把已有优势稳定下来，避免只在问卷里表现好。",
      method: "用真实岗位案例、小组复盘和短演练循环巩固已有能力。",
      goal: "训练后在真实现场也能持续保持同样标准。",
    });
  }

  return result.slice(0, 2);
}

export async function POST(_request: NextRequest, context: RouteContext) {
  let taskId = "";
  let questionnaireId = "";
  let supabaseRef: Awaited<ReturnType<typeof getAuthenticatedContext>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : null
    : null = null;

  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "未授权访问", message: "请先登录" },
        { status: 401 },
      );
    }

    const { taskId: routeTaskId } = await context.params;
    taskId = routeTaskId;

    const { supabase, user, role } = authContext;
    supabaseRef = supabase;

    const { data: task, error: taskError } = await supabase
      .from("ai_analysis_tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: "任务不存在", message: "未找到分析任务" },
        { status: 404 },
      );
    }

    questionnaireId = task.questionnaire_id;

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from("questionnaires")
      .select("id, user_id, status")
      .eq("id", questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        { success: false, error: "问卷不存在", message: "未找到对应问卷" },
        { status: 404 },
      );
    }

    if (role !== "admin" && questionnaire.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "无权执行", message: "你无权执行该分析任务" },
        { status: 403 },
      );
    }

    if (task.status === "completed") {
      const { data: existingReport } = await supabase
        .from("reports")
        .select("id")
        .eq("questionnaire_id", questionnaireId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        message: "分析已完成，无需重复执行",
        data: {
          taskId,
          questionnaireId,
          status: "completed",
          reportId: existingReport?.id ?? null,
        },
      });
    }

    if (task.status === "processing") {
      return NextResponse.json(
        { success: false, error: "任务进行中", message: "该任务正在执行，请稍后刷新" },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const { error: markTaskProcessingError } = await supabase
      .from("ai_analysis_tasks")
      .update({ status: "processing", error_message: null, updated_at: now })
      .eq("id", taskId);

    if (markTaskProcessingError) throw markTaskProcessingError;

    const { error: markQuestionnaireAnalyzingError } = await supabase
      .from("questionnaires")
      .update({ status: "analyzing", updated_at: now })
      .eq("id", questionnaireId);

    if (markQuestionnaireAnalyzingError) throw markQuestionnaireAnalyzingError;

    const analysis = await analyzeWithSiliconFlow(task.prompt);
    const structured = analysis.structuredResult;
    const { dimensions, normalized } = buildNormalizedResult(structured.dimensions ?? {});

    const reportData = {
      overallAssessment:
        structured.overallAssessment ||
        `该受访者当前表现为${normalized.awarenessType}，安全意识等级为${normalized.safetyLevel}，综合得分为${normalized.score}分。需重点关注高风险情境下的稳定性与执行动作。`,
      safetyLevel: normalized.safetyLevel,
      awarenessType: normalized.awarenessType,
      score: normalized.score,
      dimensions,
      strengths: hasItems(structured.strengths)
        ? structured.strengths
        : buildStrengthsFallback(dimensions),
      blindSpots: hasItems(structured.blindSpots)
        ? structured.blindSpots
        : buildBlindSpotsFallback(dimensions),
      keyRisks: hasItems(structured.keyRisks)
        ? structured.keyRisks
        : buildKeyRisksFallback(dimensions),
      recommendations: hasItems(structured.recommendations)
        ? structured.recommendations
        : buildRecommendationsFallback(dimensions, normalized.awarenessType),
      trainingNeeds: hasItems(structured.trainingNeeds)
        ? structured.trainingNeeds
        : buildTrainingNeedsFallback(dimensions),
      metadata: {
        provider: "siliconflow",
        model: analysis.model,
        processingTimeMs: analysis.processingTimeMs,
      },
    };

    const { error: updateTaskError } = await supabase
      .from("ai_analysis_tasks")
      .update({
        status: "completed",
        raw_response: analysis.rawText,
        structured_result: { ...structured, normalized, dimensions },
        processing_time_ms: analysis.processingTimeMs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (updateTaskError) throw updateTaskError;

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        questionnaire_id: questionnaireId,
        ai_analysis_id: taskId,
        report_data: reportData,
        report_format: "json",
      })
      .select("id")
      .single();

    if (reportError || !report) {
      throw reportError ?? new Error("报告写入失败");
    }

    const { error: updateQuestionnaireError } = await supabase
      .from("questionnaires")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", questionnaireId);

    if (updateQuestionnaireError) throw updateQuestionnaireError;

    return NextResponse.json({
      success: true,
      message: "分析完成，报告已生成",
      data: {
        taskId,
        questionnaireId,
        reportId: report.id,
        status: "completed",
        score: normalized.score,
        safetyLevel: normalized.safetyLevel,
        awarenessType: normalized.awarenessType,
      },
    });
  } catch (error) {
    if (supabaseRef && taskId) {
      await supabaseRef
        .from("ai_analysis_tasks")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "分析执行失败",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (questionnaireId) {
        await supabaseRef
          .from("questionnaires")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", questionnaireId);
      }
    }

    const message = error instanceof Error ? error.message : "分析执行失败";
    return NextResponse.json(
      { success: false, error: "服务器内部错误", message },
      { status: 500 },
    );
  }
}
