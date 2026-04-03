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

// 构建AI分析提示词
function buildAnalysisPrompt(basicInfo: any, answers: Record<string, string>): string {
  return `请分析以下矿工的安全意识问卷：

## 矿工基本信息
- 姓名: ${basicInfo.name || '未提供'}
- 性别: ${basicInfo.gender || '未提供'}
- 年龄: ${basicInfo.age || '未提供'}岁
- 工种: ${basicInfo.jobType || '未提供'}
- 工龄: ${basicInfo.workYears || '未提供'}年
- 所属矿区: ${basicInfo.mineArea || '未提供'}

## 问卷回答
${Object.entries(answers)
  .map(([questionId, answer]) => `问题 ${questionId}: ${answer}`)
  .join('\n')}

## 分析要求
请基于矿工的回答，专业、客观地评估其安全意识水平，返回JSON格式的分析结果：`;
}

// 调用极简AI分析端点
async function callAIAnalysis(prompt: string, questionnaireId: string) {
  try {
    console.log(`开始AI分析，问卷ID: ${questionnaireId}`);

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-14B-Instruct',
        messages: [
          {
            role: 'system',
            content: `你是矿工安全意识评估专家。请分析矿工的问卷回答，返回JSON格式的分析结果。

请按照以下格式返回：
{
  "overallAssessment": "总体评估",
  "safetyLevel": "安全意识等级（高/中/低）",
  "score": 0-100的评分,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "recommendations": ["建议1", "建议2"],
  "keyRisks": ["风险点1", "风险点2"],
  "trainingNeeds": ["培训需求1", "培训需求2"]
}

请确保分析专业、客观、有针对性，对矿工的安全提升有实际帮助。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;

    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponse);
    } catch (parseError) {
      parsedResult = { rawResponse: aiResponse };
    }

    return {
      success: true,
      data: {
        model: result.model,
        processingTime: result.usage?.total_tokens || 0,
        usage: result.usage,
        result: parsedResult,
        rawResponse: aiResponse,
      }
    };

  } catch (error: any) {
    console.error('AI分析调用失败:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== 增强版问卷提交API ===');

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

    console.log(`收到问卷提交: ${basicInfo.name}, 回答数: ${Object.keys(answers).length}`);

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

    console.log(`问卷保存成功，ID: ${questionnaire.id}`);

    // 第1步：构建AI分析提示词
    const aiPrompt = buildAnalysisPrompt(basicInfo, answers);
    console.log('AI提示词构建完成，长度:', aiPrompt.length);

    // 第2步：调用AI分析
    const aiAnalysisResult = await callAIAnalysis(aiPrompt, questionnaire.id);

    let aiAnalysisRecord = null;

    // 第3步：保存AI分析结果到数据库
    if (aiAnalysisResult.success) {
      console.log('AI分析成功，开始保存结果到数据库...');

      const { data: aiTask, error: aiTaskError } = await supabase
        .from('ai_analysis_tasks')
        .insert({
          questionnaire_id: questionnaire.id,
          provider: 'siliconflow',
          model: aiAnalysisResult.data?.model || 'Qwen/Qwen2.5-14B-Instruct',
          prompt: aiPrompt.substring(0, 5000), // 限制长度
          status: 'completed',
          raw_response: aiAnalysisResult.data?.rawResponse?.substring(0, 10000), // 限制长度
          structured_result: aiAnalysisResult.data?.result || null,
          cost: 0.001, // 估算成本
          processing_time_ms: 5000, // 估算时间
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (!aiTaskError) {
        aiAnalysisRecord = aiTask;
        console.log('AI分析结果保存成功，ID:', aiTask.id);

        // 更新问卷状态
        await supabase
          .from('questionnaires')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', questionnaire.id);
      } else {
        console.error('保存AI分析结果失败:', aiTaskError);
      }
    } else {
      console.warn('AI分析失败，但问卷提交成功:', aiAnalysisResult.error);

      // 即使AI分析失败，也记录一个失败的任务
      const { data: failedAiTask } = await supabase
        .from('ai_analysis_tasks')
        .insert({
          questionnaire_id: questionnaire.id,
          provider: 'siliconflow',
          model: 'Qwen/Qwen2.5-14B-Instruct',
          prompt: aiPrompt.substring(0, 5000),
          status: 'failed',
          error_message: aiAnalysisResult.error?.substring(0, 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      aiAnalysisRecord = failedAiTask;
    }

    // 第4步：准备响应数据
    const responseData: any = {
      success: true,
      data: {
        questionnaireId: questionnaire.id,
        message: '问卷提交成功',
        timestamp: new Date().toISOString(),
        hasAIAnalysis: aiAnalysisResult.success,
      }
    };

    // 如果有AI分析结果，包含在响应中
    if (aiAnalysisResult.success && aiAnalysisResult.data?.result) {
      responseData.aiAnalysis = {
        success: true,
        safetyLevel: aiAnalysisResult.data.result.safetyLevel,
        score: aiAnalysisResult.data.result.score,
        overallAssessment: aiAnalysisResult.data.result.overallAssessment,
        recommendations: aiAnalysisResult.data.result.recommendations,
        analysisId: aiAnalysisRecord?.id,
      };
      responseData.message = '问卷提交成功，AI分析已完成';
    } else if (aiAnalysisRecord) {
      responseData.aiAnalysis = {
        success: false,
        error: aiAnalysisResult.error || 'AI分析过程出现问题',
        analysisId: aiAnalysisRecord.id,
      };
      responseData.message = '问卷提交成功，但AI分析遇到问题';
    }

    console.log('返回响应数据');
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('增强版问卷提交错误:', error);

    // 处理验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
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