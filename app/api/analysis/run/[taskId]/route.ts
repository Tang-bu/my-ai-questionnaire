import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedContext } from "@/app/lib/auth";
import { analyzeWithSiliconFlow } from "@/app/lib/ai/siliconflow";
import { buildNormalizedResult } from "@/app/lib/ai/score-analysis";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  let taskId = "";
  let questionnaireId = "";
  let supabaseRef: Awaited<
    ReturnType<typeof getAuthenticatedContext>
  > extends infer T
    ? T extends { supabase: infer S }
      ? S
      : null
    : null = null;

  try {
    const authContext = await getAuthenticatedContext();

    if (!authContext) {
      return NextResponse.json(
        {
          success: false,
          error: "未授权访问",
          message: "请先登录",
        },
        { status: 401 }
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
        {
          success: false,
          error: "任务不存在",
          message: "未找到分析任务",
        },
        { status: 404 }
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
        {
          success: false,
          error: "问卷不存在",
          message: "未找到对应问卷",
        },
        { status: 404 }
      );
    }

    if (role !== "admin" && questionnaire.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权执行",
          message: "你无权执行该分析任务",
        },
        { status: 403 }
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
        {
          success: false,
          error: "任务进行中",
          message: "该任务正在执行，请稍后刷新",
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const { error: markTaskProcessingError } = await supabase
      .from("ai_analysis_tasks")
      .update({
        status: "processing",
        error_message: null,
        updated_at: now,
      })
      .eq("id", taskId);

    if (markTaskProcessingError) {
      throw markTaskProcessingError;
    }

    const { error: markQuestionnaireAnalyzingError } = await supabase
      .from("questionnaires")
      .update({
        status: "analyzing",
        updated_at: now,
      })
      .eq("id", questionnaireId);

    if (markQuestionnaireAnalyzingError) {
      throw markQuestionnaireAnalyzingError;
    }

    const analysis = await analyzeWithSiliconFlow(task.prompt);
    const structured = analysis.structuredResult as Record<string, any>;

    const { dimensions, normalized } = buildNormalizedResult(
      structured.dimensions ?? {}
    );

    const reportData = {
      overallAssessment:
        structured.overallAssessment ??
        `该受访者当前表现为${normalized.awarenessType}，安全意识等级为${normalized.safetyLevel}，综合得分为${normalized.score}分。建议结合薄弱维度持续开展针对性训练与反馈。`,
      safetyLevel: normalized.safetyLevel,
      awarenessType: normalized.awarenessType,
      score: normalized.score,
      dimensions,
      strengths:
        structured.strengths?.length > 0
          ? structured.strengths
          : buildStrengthsFallback(dimensions),
      blindSpots:
        structured.blindSpots?.length > 0
          ? structured.blindSpots
          : buildBlindSpotsFallback(dimensions),
      keyRisks:
        structured.keyRisks?.length > 0
          ? structured.keyRisks
          : buildKeyRisksFallback(dimensions),
      recommendations:
        structured.recommendations?.length > 0
          ? structured.recommendations
          : buildRecommendationsFallback(dimensions, normalized.awarenessType),
      trainingNeeds: structured.trainingNeeds ?? [],
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
        structured_result: {
          ...structured,
          normalized,
          dimensions,
        },
        processing_time_ms: analysis.processingTimeMs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (updateTaskError) {
      throw updateTaskError;
    }

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

    if (updateQuestionnaireError) {
      throw updateQuestionnaireError;
    }

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
          error_message:
            error instanceof Error ? error.message : "分析执行失败",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (questionnaireId) {
        await supabaseRef
          .from("questionnaires")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", questionnaireId);
      }
    }

    const message = error instanceof Error ? error.message : "分析执行失败";

    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        message,
      },
      { status: 500 }
    );
  }
}

function buildStrengthsFallback(dimensions: Record<string, number>) {
  const result: string[] = [];

  if ((dimensions.safetyPriority ?? 0) >= 7) {
    result.push("安全优先意识较强，能够把安全放在作业决策前列");
  }

  if ((dimensions.complianceAwareness ?? 0) >= 7) {
    result.push("规范遵循意识较好，具备较强的制度执行倾向");
  }

  if ((dimensions.emergencyHandling ?? 0) >= 7) {
    result.push("应急处置能力较强，面对突发情况具备较清晰的处置思路");
  }

  if ((dimensions.interventionWillingness ?? 0) >= 7) {
    result.push("违规干预意愿较强，愿意主动制止不安全行为");
  }

  if ((dimensions.hazardReporting ?? 0) >= 7) {
    result.push("隐患上报意识较强，具备主动反馈与纠偏意识");
  }

  if (result.length === 0) {
    result.push("具备一定基础安全意识，能够在部分场景中保持基本安全判断");
  }

  return result.slice(0, 4);
}

function buildBlindSpotsFallback(dimensions: Record<string, number>) {
  const result: string[] = [];

  if ((dimensions.riskIdentification ?? 0) <= 6) {
    result.push("对隐性风险和复杂风险的识别敏感度仍有不足");
  }

  if ((dimensions.hazardReporting ?? 0) <= 6) {
    result.push("隐患上报意识还不够稳定，主动反馈风险的习惯需要加强");
  }

  if ((dimensions.complianceAwareness ?? 0) <= 6) {
    result.push("在规范执行细节上仍存在松动空间");
  }

  if ((dimensions.responsibilityAwareness ?? 0) <= 6) {
    result.push("对自身及他人安全责任的持续担当意识仍需强化");
  }

  if ((dimensions.emergencyHandling ?? 0) <= 6) {
    result.push("复杂突发情境下的应急处置完整性还有提升空间");
  }

  return result.slice(0, 4);
}

function buildKeyRisksFallback(dimensions: Record<string, number>) {
  const result: string[] = [];

  if ((dimensions.luckPsychology ?? 0) >= 5) {
    result.push("存在一定侥幸心理，可能在低概率风险面前放松警惕");
  }

  if ((dimensions.conformityPsychology ?? 0) >= 5) {
    result.push("存在一定从众倾向，群体违规情境下可能降低自主判断");
  }

  if ((dimensions.riskIdentification ?? 0) <= 6) {
    result.push("对潜在风险的提前识别能力不足，可能导致处置滞后");
  }

  if ((dimensions.emergencyHandling ?? 0) <= 6) {
    result.push("复杂突发情境下的处置完整性不足，存在扩大风险的可能");
  }

  if ((dimensions.interventionWillingness ?? 0) <= 6) {
    result.push("对他人违规行为的主动干预不足，可能放大现场安全隐患");
  }

  return result.slice(0, 4);
}

function buildRecommendationsFallback(
  dimensions: Record<string, number>,
  awarenessType: string
) {
  const result: string[] = [];

  if (awarenessType === "基础主动安全意识型") {
    result.push("加强复杂情境模拟训练，提升复杂风险条件下的独立判断能力");
  }

  if (awarenessType === "从众跟随安全意识型") {
    result.push("强化个体安全责任教育，减少对群体行为的依赖");
  }

  if (awarenessType === "侥幸妥协安全意识型") {
    result.push("通过事故案例复盘和风险警示教育，降低侥幸心理影响");
  }

  if ((dimensions.riskIdentification ?? 0) <= 6) {
    result.push("增加隐患识别专项训练，提升对隐性风险和新风险的敏感度");
  }

  if ((dimensions.hazardReporting ?? 0) <= 6) {
    result.push("建立作业后风险复盘和隐患上报机制，强化主动反馈习惯");
  }

  if ((dimensions.emergencyHandling ?? 0) <= 6) {
    result.push("通过应急预案演练提升突发情境下的处置完整度和响应速度");
  }

  if (result.length === 0) {
    result.push("持续保持现有安全行为习惯，并通过定期训练巩固风险识别与应急处置能力");
  }

  return result.slice(0, 4);
}