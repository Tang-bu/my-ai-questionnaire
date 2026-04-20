import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  questionnaireId: z.string().optional(),
  currentQuestion: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatSchema.parse(body);
    const { messages, currentQuestion } = validatedData;

    const siliconflowApiKey = process.env.SILICONFLOW_API_KEY;
    
    if (!siliconflowApiKey) {
      return NextResponse.json({
        success: false,
        error: 'AI服务未配置',
        message: '请联系管理员配置AI服务',
      }, { status: 500 });
    }

    const systemPrompt = `你是「安全意识评估AI助理」，专门帮助用户更好地完成安全意识问卷。

你的职责：
1. 识别重复性回答并进行简单提醒
2. 识别过于简单的回答并进行简单引导
3. 保持友好、专业的语气，不要过于生硬
4. 不改变答题者原本的回答角度和思路
5. 允许错误答案存在，只提供建议性引导
6. 重点关注答题的完整性和思考深度，而不是答案的正确性

当前问卷共10个安全场景问题，每个问题都是情境题。用户正在回答第${currentQuestion || 1}题。

回答要求：
- 当发现回答过于简单时，仅进行简短提醒，鼓励用户提供更详细的思考
- 当发现回答重复时，温和提醒用户避免重复内容
- 不评判答案的对错，只关注回答的完整性
- 保持中立，不偏向任何特定的安全立场
- 用简洁明了的语言进行引导，避免冗长的解释
`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6)
    ];

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${siliconflowApiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-14B-Instruct',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SiliconFlow API error:', response.status, errorData);
      return NextResponse.json({
        success: false,
        error: 'AI服务调用失败',
        message: 'AI助理暂时无法回复，请稍后再试',
      }, { status: response.status });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回复，请稍后再试。';

    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        usage: data.usage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '数据格式错误',
        message: error.issues.map((issue: any) => issue.message).join(', '),
      }, { status: 400 });
    }

    console.error('AI chat error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器错误',
      message: error instanceof Error ? error.message : 'AI助理暂时无法回复',
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