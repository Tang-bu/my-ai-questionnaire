import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const analyzeSchema = z.object({
  questionId: z.number(),
  questionTitle: z.string(),
  questionGuide: z.string(),
  answer: z.string(),
  allAnswers: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = analyzeSchema.parse(body);
    const { questionId, questionTitle, questionGuide, answer, allAnswers } = validatedData;

    const siliconflowApiKey = process.env.SILICONFLOW_API_KEY;

    if (!siliconflowApiKey) {
      return NextResponse.json({
        success: false,
        error: 'AI服务未配置',
        message: '请在环境变量中配置 SILICONFLOW_API_KEY',
      }, { status: 500 });
    }

    const systemPrompt = `你是「安全意识问卷答案分析专家」，专门评估用户回答的质量。

你的职责：
1. 识别少于10字的过短答案
2. 识别无意义数字或乱码答案
3. 提供温和的改进建议（仅当答案确实需要改进时）

评估标准（极其宽松版）：
- 有效答案：字数≥10，不是无意义的数字或乱码
- 无效答案：字数<10，或无意义的数字/乱码

重要原则：
- 保持极其宽松的标准，几乎所有答案都应通过
- 不评判答案的对错
- 不评判答案的相关性
- 不评判答案的质量
- 不因为重复内容而判定答案无效
- 只有在答案确实需要改进时才提供建议
- 用温和、友好的语言进行引导

你的输出必须是严格的JSON格式，不要包含任何其他内容：
{
  "isValid": true/false,  // 答案是否有效（有效标准：字数≥10，不是无意义的数字/乱码）
  "issueType": "too_short" | "nonsense" | "good" | "empty",
  "shortMessage": "简短的问题提示（不超过20字）",
  "detailedMessage": "详细的改进建议（50字以内）",
  "suggestions": ["建议1", "建议2", "建议3"]  // 具体可操作的改进建议
}`;

    const userPrompt = `请分析以下安全意识问卷答案：

题目${questionId}：${questionTitle}
答题提示：${questionGuide}
用户回答：${answer || '（未填写）'}

请严格按照JSON格式输出评估结果，保持极其宽松的标准，只要字数≥10且不是无意义的数字/乱码，都视为有效答案。`;

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${siliconflowApiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-14B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SiliconFlow API error:', response.status, errorData);
      return NextResponse.json({
        success: false,
        error: 'AI服务调用失败',
        message: 'AI分析暂时无法进行，请稍后再试',
      }, { status: response.status });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '';

    let analysisResult;
    try {
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        success: true,
        data: {
          isValid: true,
          issueType: 'good',
          shortMessage: '答案已记录',
          detailedMessage: '系统暂时无法进行深度分析，请继续答题',
          suggestions: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '数据格式错误',
        message: error.issues.map((issue: any) => issue.message).join(', '),
      }, { status: 400 });
    }

    console.error('Answer analysis error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器错误',
      message: error instanceof Error ? error.message : 'AI分析暂时无法进行',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
