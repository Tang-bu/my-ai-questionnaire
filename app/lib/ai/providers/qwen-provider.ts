import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { AIProvider } from './base-provider';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProviderInfo,
  AIModelInfo,
  CostEstimation,
  AIProvider as ProviderEnum,
} from '../types';

export class QwenProvider extends AIProvider {
  name = ProviderEnum.QWEN;
  displayName = '通义千问';
  private client: OpenAI | null = null;

  constructor() {
    super();
    const apiKey = process.env.QWEN_API_KEY;

    // 如果没有配置API密钥，client将为null，但依然允许创建实例
    if (!apiKey) {
      console.warn('QWEN_API_KEY is not configured, QwenProvider will not be operational');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        timeout: 30000,
      });
    } catch (error) {
      console.error('Failed to initialize QwenProvider client:', error);
      // 继续运行，但client为null
    }
  }

  getAvailableModels(): string[] {
    return ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b-instruct'];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: this.name,
      displayName: this.displayName,
      description: '阿里云通义千问大模型，支持多种尺寸模型选择',
      models: this.getAvailableModels(),
      defaultModel: 'qwen-turbo',
      supportsTemperature: true,
      supportsTopP: true,
      supportsMaxTokens: true,
      costEstimation: {
        perInputToken: 0.002,
        perOutputToken: 0.002,
      },
    };
  }

  getModelInfo(model: string): AIModelInfo | null {
    const modelInfo: Record<string, AIModelInfo> = {
      'qwen-max': {
        name: 'qwen-max',
        displayName: 'Qwen Max',
        contextWindow: 32000,
        maxOutputTokens: 32000,
        capabilities: ['json-mode', 'function-calling', 'streaming'],
      },
      'qwen-plus': {
        name: 'qwen-plus',
        displayName: 'Qwen Plus',
        contextWindow: 32000,
        maxOutputTokens: 32000,
        capabilities: ['json-mode', 'function-calling', 'streaming'],
      },
      'qwen-turbo': {
        name: 'qwen-turbo',
        displayName: 'Qwen Turbo',
        contextWindow: 32000,
        maxOutputTokens: 32000,
        capabilities: ['json-mode', 'function-calling', 'streaming'],
      },
      'qwen2.5-72b-instruct': {
        name: 'qwen2.5-72b-instruct',
        displayName: 'Qwen 2.5 72B',
        contextWindow: 32768,
        maxOutputTokens: 32768,
        capabilities: ['json-mode', 'function-calling', 'streaming'],
      },
    };

    return modelInfo[model] || null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    const model = request.model || 'qwen-turbo';

    // 不同模型的成本配置（元/千token）
    const costConfig: Record<string, { inputPer1K: number; outputPer1K: number }> = {
      'qwen-max': { inputPer1K: 0.020, outputPer1K: 0.080 },
      'qwen-plus': { inputPer1K: 0.008, outputPer1K: 0.008 },
      'qwen-turbo': { inputPer1K: 0.002, outputPer1K: 0.002 },
      'qwen2.5-72b-instruct': { inputPer1K: 0.004, outputPer1K: 0.004 },
    };

    const config = costConfig[model];
    if (!config) {
      return null;
    }

    const inputTokens = Math.ceil((request.prompt?.length || 0) / 4);
    const estimatedOutputTokens = Math.ceil((request.maxTokens || 1000) / 4);

    const inputCost = (inputTokens / 1000) * config.inputPer1K;
    const outputCost = (estimatedOutputTokens / 1000) * config.outputPer1K;
    const totalCost = inputCost + outputCost;

    return {
      provider: this.name,
      model,
      inputTokens,
      outputTokens: estimatedOutputTokens,
      estimatedCost: totalCost,
      currency: 'CNY',
      details: {
        inputCost,
        outputCost,
      },
    };
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 如果client未初始化，抛出错误
    if (!this.client) {
      throw new Error('QwenProvider is not properly configured. QWEN_API_KEY is missing.');
    }

    const model = request.model || 'qwen-turbo';
    const analysisId = uuidv4();

    try {
      const startTime = Date.now();

      const completion = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的矿工安全意识评估专家。请根据提供的问卷回答，进行专业、客观的分析。'
          },
          {
            role: 'user',
            content: request.prompt || ''
          }
        ],
        temperature: request.temperature || 0.2,
        max_tokens: request.maxTokens || 1500,
        top_p: request.topP || 0.9,
        frequency_penalty: request.frequencyPenalty || 0,
        presence_penalty: request.presencePenalty || 0,
        response_format: { type: 'json_object' },
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      const responseText = completion.choices[0]?.message?.content || '';

      // 解析JSON响应
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Qwen response as JSON:', parseError);
        // 尝试提取JSON部分
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            responseData = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            // 如果仍然失败，返回原始文本
            responseData = {
              summary: '无法解析AI返回的JSON，返回原始分析',
              rawResponse: responseText
            };
          }
        } else {
          responseData = {
            summary: 'AI返回了非JSON响应',
            rawResponse: responseText
          };
        }
      }

      // 计算成本
      const costConfig: Record<string, { inputPer1K: number; outputPer1K: number }> = {
        'qwen-max': { inputPer1K: 0.020, outputPer1K: 0.080 },
        'qwen-plus': { inputPer1K: 0.008, outputPer1K: 0.008 },
        'qwen-turbo': { inputPer1K: 0.002, outputPer1K: 0.002 },
        'qwen2.5-72b-instruct': { inputPer1K: 0.004, outputPer1K: 0.004 },
      };

      const config = costConfig[model] || costConfig['qwen-turbo'];
      const promptTokens = completion.usage?.prompt_tokens || 0;
      const completionTokens = completion.usage?.completion_tokens || 0;

      const inputCost = (promptTokens / 1000) * config.inputPer1K;
      const outputCost = (completionTokens / 1000) * config.outputPer1K;
      const totalCost = inputCost + outputCost;

      return {
        id: analysisId,
        provider: this.name,
        model: model,
        rawResponse: responseText,
        structuredResult: responseData,
        processingTime: latency,
        cost: totalCost,
        metadata: {
          promptTokens,
          completionTokens,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error: any) {
      console.error(`Qwen分析失败:`, error);

      // 处理各种错误类型
      if (error?.status === 429) {
        throw new Error(`Qwen速率限制: ${error.message || '请稍后重试'}`);
      } else if (error?.status === 401) {
        throw new Error(`Qwen认证失败: 请检查API密钥配置`);
      } else if (error?.status === 503) {
        throw new Error(`Qwen服务暂时不可用: ${error.message || '请稍后重试'}`);
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        throw new Error(`无法连接到Qwen服务: ${error.message || '请检查网络连接'}`);
      }

      throw new Error(`Qwen分析请求失败: ${error?.message || '未知错误'}`);
    }
  }
}