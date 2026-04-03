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

export class DeepSeekProvider extends AIProvider {
  name = ProviderEnum.DEEPSEEK;
  displayName = 'DeepSeek';

  private client: OpenAI;

  constructor() {
    super();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
      // timeout: 30000,
      // maxRetries: 3,
    });
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    try {
      this.validateRequest(request);

      const completion = await this.client.chat.completions.create({
        model: request.model,
        messages: [
          {
            role: 'system',
            content: '你是一名矿工安全意识评估分析助手，需要对用户的问卷回答进行专业分析。请使用中文回答，并以JSON格式返回分析结果。',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        response_format: { type: 'json_object' },
      });

      const processingTime = Date.now() - startTime;
      const rawResponse = completion.choices[0]?.message?.content || '';

      // DeepSeek成本较低，模拟一个较低的成本
      const cost = this.calculateCost(completion.usage);

      return this.createResponse(
        rawResponse,
        request,
        processingTime,
        cost,
        {
          usage: completion.usage,
          finishReason: completion.choices[0]?.finish_reason,
        }
      );
    } catch (error: any) {
      return this.handleError(error, request);
    }
  }

  getAvailableModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder',
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: this.name,
      displayName: 'DeepSeek',
      description: '深度求索公司开发的AI模型，性价比高，支持128K长上下文',
      models: this.getAvailableModels(),
      defaultModel: 'deepseek-chat',
      supportsTemperature: true,
      supportsTopP: true,
      supportsMaxTokens: true,
      costEstimation: {
        perInputToken: 0.00000014,  // 每输入token ¥0.00000014
        perOutputToken: 0.00000028, // 每输出token ¥0.00000028
      },
    };
  }

  getModelInfo(model: string): AIModelInfo | null {
    const modelInfo: Record<string, AIModelInfo> = {
      'deepseek-chat': {
        name: 'deepseek-chat',
        displayName: 'DeepSeek Chat',
        description: 'DeepSeek通用对话模型，支持128K上下文',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'function-calling'],
      },
      'deepseek-coder': {
        name: 'deepseek-coder',
        displayName: 'DeepSeek Coder',
        description: 'DeepSeek代码生成模型，擅长编程任务',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'code-generation'],
      },
    };

    return modelInfo[model] || null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    const inputTokens = this.estimateTokens(request.prompt);
    const outputTokens = request.maxTokens || 2000;

    // DeepSeek定价（人民币/每千token）
    const pricing = {
      input: 0.00014,   // ¥0.00014 per 1K tokens input
      output: 0.00028,  // ¥0.00028 per 1K tokens output
    };

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const estimatedCost = inputCost + outputCost;

    return {
      provider: this.name,
      model: request.model,
      estimatedCost,
      currency: 'CNY',
      inputTokens,
      outputTokens,
      details: {
        inputCost,
        outputCost,
      },
    };
  }

  private calculateCost(usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }): number {
    if (!usage) return 0;

    const { prompt_tokens = 0, completion_tokens = 0 } = usage;

    // DeepSeek定价较低
    const inputRate = 0.00000014;  // ¥0.00000014 per input token
    const outputRate = 0.00000028; // ¥0.00000028 per output token

    const cost = prompt_tokens * inputRate + completion_tokens * outputRate;
    return parseFloat(cost.toFixed(8)); // 保留8位小数
  }

  protected validateRequest(request: AIAnalysisRequest): void {
    super.validateRequest(request);

    const availableModels = this.getAvailableModels();
    if (!availableModels.includes(request.model)) {
      throw new Error(`Model ${request.model} is not available for DeepSeek provider`);
    }

    // DeepSeek支持更大的输出token数
    if (request.maxTokens && request.maxTokens > 4096) {
      throw new Error('DeepSeek models have a maximum of 4096 output tokens');
    }
  }
}