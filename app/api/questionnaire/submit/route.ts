import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getAuthenticatedContext } from '@/app/lib/auth';
import { basicInfoSchema } from '@/app/lib/types';
import { buildAnalysisPrompt } from '@/app/lib/ai/build-analysis-prompt';

const questionnaireSubmitSchema = z.object({
  basicInfo: basicInfoSchema,
  answers: z.record(z.string(), z.string()).refine(
    (answers) => Object.keys(answers).length >= 10,
    { message: '必须回答所有 10 个问题' }
  ),
});

export async function POST(request: NextRequest) {
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

    const { supabase, user } = authContext;

    const body = await request.json();
    const validatedData = questionnaireSubmitSchema.parse(body);
    const { basicInfo, answers } = validatedData;

    const age = Number.parseInt(basicInfo.age, 10);
    const workYears = Number.parseInt(basicInfo.workYears, 10);

    if (Number.isNaN(age) || Number.isNaN(workYears)) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          message: '年龄和工龄必须是数字',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: basicInfo.name,
        gender: basicInfo.gender,
        age,
        job_type: basicInfo.jobType,
        work_years: workYears,
        mine_area: basicInfo.mineArea,
        updated_at: now,
      },
      {
        onConflict: 'id',
      }
    );

    if (profileError) {
      throw profileError;
    }

    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .insert({
        user_id: user.id,
        profile_id: user.id,
        status: 'submitted',
        basic_info: basicInfo,
        answers,
        updated_at: now,
      })
      .select('id')
      .single();

    if (questionnaireError || !questionnaire) {
      throw questionnaireError ?? new Error('问卷创建失败');
    }

    const prompt = buildAnalysisPrompt(basicInfo, answers);

    const { data: task, error: taskError } = await supabase
      .from('ai_analysis_tasks')
      .insert({
        questionnaire_id: questionnaire.id,
        provider: 'siliconflow',
        model: 'Qwen/Qwen2.5-14B-Instruct',
        prompt,
        status: 'pending',
        updated_at: now,
      })
      .select('id, status')
      .single();

    if (taskError || !task) {
      throw taskError ?? new Error('分析任务创建失败');
    }

    return NextResponse.json({
      success: true,
      message: '问卷提交成功，分析任务已创建',
      data: {
        questionnaireId: questionnaire.id,
        taskId: task.id,
        status: task.status,
        statusUrl: `/api/analysis/${task.id}`,
        reportUrl: `/api/reports/${questionnaire.id}`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          message: '请检查输入数据',
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : '问卷提交失败，请稍后重试';

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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}