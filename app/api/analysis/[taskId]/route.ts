import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedContext } from '@/app/lib/auth';

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
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

    const { taskId } = await context.params;
    const { supabase, user, role } = authContext;

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

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .select('id, user_id, status')
      .eq('id', task.questionnaire_id)
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
          error: '无权访问',
          message: '你无权查看该任务',
        },
        { status: 403 }
      );
    }

    const { data: report } = await supabase
      .from('reports')
      .select('id, generated_at')
      .eq('questionnaire_id', questionnaire.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        questionnaireId: questionnaire.id,
        taskStatus: task.status,
        questionnaireStatus: questionnaire.status,
        processingTimeMs: task.processing_time_ms,
        errorMessage: task.error_message,
        reportId: report?.id ?? null,
        hasReport: Boolean(report),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '查询任务状态失败';

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