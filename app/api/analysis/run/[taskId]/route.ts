import { NextRequest, NextResponse } from 'next/server';
import { buildNormalizedResult } from "@/app/lib/ai/score-analysis";
import { getAuthenticatedContext } from '@/app/lib/auth';
import { analyzeWithSiliconFlow } from '@/app/lib/ai/siliconflow';

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  let taskId = '';
  let questionnaireId = '';
  let supabaseRef: Awaited<ReturnType<typeof import('@/app/lib/supabase/server').createClient>> | null = null;

  try {
    const authContext = await getAuthenticatedContext();

    if (!authContext) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问',
          message: '请先登录',
        },
        { status: 401 }
      );
    }

    const { taskId: routeTaskId } = await context.params;
    taskId = routeTaskId;

    const { supabase, user, role } = authContext;
    supabaseRef = supabase;

    const { data: task, error: taskError } = await supabase
      .from('ai_analysis_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        {
          success: false,
          error: '任务不存在',
          message: '未找到分析任务',
        },
        { status: 404 }
      );
    }

    questionnaireId = task.questionnaire_id;

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .select('id, user_id, status')
      .eq('id', questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        {
          success: false,
          error: '问卷不存在',
          message: '未找到对应问卷',
        },
        { status: 404 }
      );
    }

    if (role !== 'admin' && questionnaire.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: '无权执行',
          message: '你无权执行该分析任务',
        },
        { status: 403 }
      );
    }

    if (task.status === 'completed') {
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('questionnaire_id', questionnaireId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        message: '分析已完成，无需重复执行',
        data: {
          taskId,
          questionnaireId,
          status: 'completed',
          reportId: existingReport?.id ?? null,
        },
      });
    }

    if (task.status === 'processing') {
      return NextResponse.json(
        {
          success: false,
          error: '任务进行中',
          message: '该任务正在执行，请稍后刷新',
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    await supabase
      .from('ai_analysis_tasks')
      .update({
        status: 'processing',
        error_message: null,
        updated_at: now,
      })
      .eq('id', taskId);

    await supabase
      .from('questionnaires')
      .update({
        status: 'analyzing',
        updated_at: now,
      })
      .eq('id', questionnaireId);

    const analysis = await analyzeWithSiliconFlow(task.prompt);

    const structured = analysis.structuredResult as Record<string, any>;

const { dimensions, normalized } = buildNormalizedResult(
  structured.dimensions ?? {}
);

const reportData = {
  overallAssessment: structured.overallAssessment ?? "",
  safetyLevel: normalized.safetyLevel,
  awarenessType: normalized.awarenessType,
  score: normalized.score,
  dimensions,
  strengths: structured.strengths ?? [],
  weaknesses: structured.weaknesses ?? [],
  recommendations: structured.recommendations ?? [],
  keyRisks: structured.keyRisks ?? [],
  trainingNeeds: structured.trainingNeeds ?? [],
  metadata: {
    provider: "siliconflow",
    model: analysis.model,
    processingTimeMs: analysis.processingTimeMs,
  },
};

    const { error: updateTaskError } = await supabase
      .from('ai_analysis_tasks')
      .update({
        status: 'completed',
        raw_response: analysis.rawText,
        structured_result: analysis.structuredResult,
        processing_time_ms: analysis.processingTimeMs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateTaskError) {
      throw updateTaskError;
    }

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        questionnaire_id: questionnaireId,
        ai_analysis_id: taskId,
        report_data: reportData,
        report_format: 'json',
      })
      .select('id')
      .single();

    if (reportError || !report) {
      throw reportError ?? new Error('报告写入失败');
    }

    const { error: updateQuestionnaireError } = await supabase
      .from('questionnaires')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionnaireId);

    if (updateQuestionnaireError) {
      throw updateQuestionnaireError;
    }

    return NextResponse.json({
      success: true,
      message: '分析完成，报告已生成',
      data: {
        taskId,
        questionnaireId,
        reportId: report.id,
        status: 'completed',
      },
    });
  } catch (error) {
    if (supabaseRef && taskId) {
      await supabaseRef
        .from('ai_analysis_tasks')
        .update({
          status: 'failed',
          error_message:
            error instanceof Error ? error.message : '分析执行失败',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (questionnaireId) {
        await supabaseRef
          .from('questionnaires')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', questionnaireId);
      }
    }

    const message =
      error instanceof Error ? error.message : '分析执行失败';

    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        message,
      },
      { status: 500 }
    );
  }
}