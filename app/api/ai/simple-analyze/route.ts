import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== 极简AI分析端点被调用 ===');

  try {
    // 1. 获取请求数据
    const body = await request.json();
    const { prompt, model = 'Qwen/Qwen2.5-14B-Instruct' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '缺少提示词(prompt)' },
        { status: 400 }
      );
    }

    console.log('收到分析请求，模型:', model);
    console.log('提示词长度:', prompt.length);

    // 2. 直接调用硅基流动API（最简单的方式）
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('硅基流动API密钥未配置');
    }

    const requestBody = {
      model,
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
  "recommendations": ["建议1", "建议2"]
}

请确保分析专业、客观、有针对性。`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    };

    console.log('调用硅基流动API...');

    const startTime = Date.now();
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('硅基流动API错误:', response.status, errorText);
      throw new Error(`AI API错误: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI分析成功，用时:', processingTime, 'ms');

    // 3. 解析和返回结果
    const aiResponse = result.choices[0]?.message?.content;
    let parsedResult;

    try {
      parsedResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.warn('AI返回的不是有效JSON，使用原始内容');
      parsedResult = { rawResponse: aiResponse };
    }

    return NextResponse.json({
      success: true,
      data: {
        model: result.model,
        processingTime,
        usage: result.usage,
        result: parsedResult
      },
      message: 'AI分析完成'
    });

  } catch (error: any) {
    console.error('极简AI分析错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'AI分析失败',
        message: error.message || '未知错误',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}