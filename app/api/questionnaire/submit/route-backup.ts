import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { basicInfoSchema, questionnaireAnswerSchema } from '@/app/lib/types';
import { z } from 'zod';

// 问卷提交验证schema
const questionnaireSubmitSchema = z.object({
  basicInfo: basicInfoSchema,
  answers: z.record(z.string(), z.string()).refine(
    (answers) => Object.keys(answers).length >= 10,
    { message: '必须回答所有10个问题' }
  ),
});

export async function POST(request: NextRequest) {
  try {
    // 验证用户认证
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问', message: '请先登录' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validatedData = questionnaireSubmitSchema.parse(body);
    const { basicInfo, answers } = validatedData;

    // 检查用户是否已有profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    let profileId;

    if (existingProfile) {
      // 更新现有profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: basicInfo.name,
          gender: basicInfo.gender,
          age: parseInt(basicInfo.age, 10),
          job_type: basicInfo.jobType,
          work_years: parseInt(basicInfo.workYears, 10),
          mine_area: basicInfo.mineArea,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;
      profileId = session.user.id;
    } else {
      // 创建新profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          full_name: basicInfo.name,
          gender: basicInfo.gender,
          age: parseInt(basicInfo.age, 10),
          job_type: basicInfo.jobType,
          work_years: parseInt(basicInfo.workYears, 10),
          mine_area: basicInfo.mineArea,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError) throw createError;
      profileId = newProfile.id;
    }

    // 创建问卷提交记录
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .insert({
        user_id: session.user.id,
        profile_id: profileId,
        status: 'submitted',
        basic_info: basicInfo,
        answers,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (questionnaireError) throw questionnaireError;

    // 清理localStorage数据（如果前端使用）
    // 这个由前端处理，这里只是API

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        questionnaireId: questionnaire.id,
        message: '问卷提交成功',
        timestamp: new Date().toISOString(),
      },
      message: '问卷提交成功，系统将进行AI分析',
    });

  } catch (error: any) {
    console.error('问卷提交错误:', error);

    // 处理验证错误
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          details: errorMessages,
          message: '请检查输入数据',
        },
        { status: 400 }
      );
    }

    // 处理数据库错误
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: '重复提交',
          message: '您已经提交过问卷，请勿重复提交',
        },
        { status: 409 }
      );
    }

    // 处理其他错误
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        message: '问卷提交失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}