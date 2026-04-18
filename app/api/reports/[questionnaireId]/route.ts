import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedContext } from '@/app/lib/auth';

type RouteContext = {
  params: Promise<{ questionnaireId: string }>;
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

    const { questionnaireId } = await context.params;
    const { supabase, user, role } = authContext;

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .select('id, user_id, status, completed_at, created_at')
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
          error: '无权访问',
          message: '你无权查看该报告',
        },
        { status: 403 }
      );
    }

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('questionnaire_id', questionnaireId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportError) {
      throw reportError;
    }

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: '报告未生成',
          message: '报告尚未生成，请稍后重试',
          data: {
            questionnaireId,
            questionnaireStatus: questionnaire.status,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        questionnaireId,
        questionnaireStatus: questionnaire.status,
        completedAt: questionnaire.completed_at,
        report: report.report_data,
        reportId: report.id,
        reportFormat: report.report_format,
        generatedAt: report.generated_at,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '读取报告失败';

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