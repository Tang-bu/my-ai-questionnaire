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

export class SiliconFlowProvider extends AIProvider {
  name = 'siliconflow';
  displayName = '硅基流动 (SiliconFlow)';

  private client: OpenAI;

  constructor() {
    super();
    const apiKey = process.env.SILICONFLOW_API_KEY;

    if (!apiKey) {
      throw new Error('SILICONFLOW_API_KEY is not configured');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.siliconflow.cn/v1', // 硅基流动API地址
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
            content: this.getSystemPrompt(),
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

      // 硅基流动成本计算
      const cost = this.calculateCost(completion.usage);

      return this.createResponse(
        rawResponse,
        request,
        processingTime,
        cost,
        {
          usage: completion.usage,
          finishReason: completion.choices[0]?.finish_reason,
          provider: 'siliconflow',
        }
      );
    } catch (error: any) {
      return this.handleError(error, request);
    }
  }

  private getSystemPrompt(): string {
    return `你是一名专业的矿工安全意识评估分析助手，具有丰富的矿业安全知识和经验。

你的任务是：
1. 分析矿工填写的安全意识问卷
2. 评估其安全意识水平
3. 识别潜在的安全风险
4. 提供具体的改进建议

请按照以下格式返回结构化的JSON分析结果：
{
  "overallAssessment": "总体评估结论",
  "safetyLevel": "安全意识等级（高/中/低）",
  "score": 数值评分（0-100）,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "keyRisks": ["风险1", "风险2"],
  "recommendations": ["建议1", "建议2"],
  "trainingNeeds": ["培训需求1", "培训需求2"],
  "urgentActions": ["紧急措施1", "紧急措施2"]
}

请确保分析专业、客观、有针对性，对矿工的安全提升有实际帮助。`;
  }

  getAvailableModels(): string[] {
    return [
      'Qwen/Qwen2.5-72B-Instruct',      // 通义千问2.5-72B
      'Qwen/Qwen2.5-32B-Instruct',      // 通义千问2.5-32B
      'Qwen/Qwen2.5-14B-Instruct',      // 通义千问2.5-14B
      'Qwen/Qwen2.5-7B-Instruct',       // 通义千问2.5-7B
      'deepseek-ai/DeepSeek-V2.5',      // DeepSeek V2.5
      'deepseek-ai/DeepSeek-V2',        // DeepSeek V2
      'deepseek-ai/DeepSeek-Coder-V2',  // DeepSeek Coder V2
      'stepfun/Llama-3.3-70B-Instruct', // Llama 3.3 70B
      'stepfun/Llama-3.1-8B-Instruct',  // Llama 3.1 8B
      'mistralai/Mistral-7B-Instruct',  // Mistral 7B
      'siliconflow/yi-large',          // Yi Large (零一万物)
      'siliconflow/yi-medium',         // Yi Medium
      'siliconflow/bilingual-moe-4x7b', // 双语MoE 4x7B
    ];
  }

  getProviderInfo(): AIProviderInfo {
    return {
      name: this.name,
      displayName: '硅基流动 (SiliconFlow)',
      description: '领先的国产AI模型服务平台，聚合了国内外优质大模型，提供稳定高效的API服务',
      models: this.getAvailableModels(),
      defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
      supportsTemperature: true,
      supportsTopP: true,
      supportsMaxTokens: true,
      costEstimation: {
        perInputToken: 0.0000005,   // 约 ¥0.0005/千token输入
        perOutputToken: 0.000001,   // 约 ¥0.001/千token输出
      },
    };
  }

  getModelInfo(model: string): AIModelInfo | null {
    const modelInfo: Record<string, AIModelInfo> = {
      'Qwen/Qwen2.5-72B-Instruct': {
        name: 'Qwen/Qwen2.5-72B-Instruct',
        displayName: '通义千问 2.5 72B',
        description: '阿里云通义千问2.5版本72B参数模型，擅长中文理解和复杂推理',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'complex-reasoning', 'chinese-optimized'],
      },
      'Qwen/Qwen2.5-32B-Instruct': {
        name: 'Qwen/Qwen2.5-32B-Instruct',
        displayName: '通义千问 2.5 32B',
        description: '阿里云通义千问2.5版本32B参数模型，平衡性能与成本',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'general-purpose', 'chinese-optimized'],
      },
      'Qwen/Qwen2.5-14B-Instruct': {
        name: 'Qwen/Qwen2.5-14B-Instruct',
        displayName: '通义千问 2.5 14B',
        description: '阿里云通义千问2.5版本14B参数模型，速度快，成本低',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'fast-inference', 'chinese-optimized'],
      },
      'deepseek-ai/DeepSeek-V2.5': {
        name: 'deepseek-ai/DeepSeek-V2.5',
        displayName: 'DeepSeek V2.5',
        description: '深度求索最新V2.5模型，性能强劲，支持128K长上下文',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-10',
        capabilities: ['json-mode', 'long-context', 'mathematics'],
      },
      'deepseek-ai/DeepSeek-V2': {
        name: 'deepseek-ai/DeepSeek-V2',
        displayName: 'DeepSeek V2',
        description: '深度求索V2模型，高性价比选择',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-07',
        capabilities: ['json-mode', 'long-context', 'cost-effective'],
      },
      'stepfun/Llama-3.3-70B-Instruct': {
        name: 'stepfun/Llama-3.3-70B-Instruct',
        displayName: 'Llama 3.3 70B',
        description: 'Meta最新Llama 3.3 70B模型，英文能力出色',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-03',
        capabilities: ['json-mode', 'english-optimized', 'coding'],
      },
      'siliconflow/yi-large': {
        name: 'siliconflow/yi-large',
        displayName: 'Yi Large',
        description: '零一万物大模型，中英文能力均衡',
        contextWindow: 16384,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-06',
        capabilities: ['json-mode', 'bilingual', 'general-purpose'],
      },
      'siliconflow/bilingual-moe-4x7b': {
        name: 'siliconflow/bilingual-moe-4x7b',
        displayName: '双语MoE 4x7B',
        description: '混合专家模型，高效的多语言处理能力',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        trainingCutoff: '2024-08',
        capabilities: ['json-mode', 'moe-architecture', 'multilingual'],
      },
    };

    return modelInfo[model] || null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    const inputTokens = this.estimateTokens(request.prompt);
    const outputTokens = request.maxTokens || 2000;

    // 硅基流动模型定价（估算，需参考官方文档）
    const pricing: Record<string, { input: number; output: number }> = {
      'Qwen/Qwen2.5-72B-Instruct': { input: 0.001, output: 0.002 },
      'Qwen/Qwen2.5-32B-Instruct': { input: 0.0005, output: 0.001 },
      'Qwen/Qwen2.5-14B-Instruct': { input: 0.0002, output: 0.0004 },
      'deepseek-ai/DeepSeek-V2.5': { input: 0.0008, output: 0.0016 },
      'deepseek-ai/DeepSeek-V2': { input: 0.0004, output: 0.0008 },
      'stepfun/Llama-3.3-70B-Instruct': { input: 0.0012, output: 0.0024 },
      'siliconflow/yi-large': { input: 0.0006, output: 0.0012 },
      'siliconflow/bilingual-moe-4x7b': { input: 0.0003, output: 0.0006 },
    };

    let modelPricing = pricing[request.model];
    if (!modelPricing) {
      // 默认定价 - 修复：使用let声明，避免重新赋值给const
      modelPricing = { input: 0.0005, output: 0.001 };
    }

    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
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

    // 硅基流动定价（估算）
    const inputRate = 0.0000005;  // ¥0.0005 每千token输入
    const outputRate = 0.000001;  // ¥0.001 每千token输出

    const cost = prompt_tokens * inputRate + completion_tokens * outputRate;
    return parseFloat(cost.toFixed(8));
  }

  protected validateRequest(request: AIAnalysisRequest): void {
    super.validateRequest(request);

    const availableModels = this.getAvailableModels();
    if (!availableModels.includes(request.model)) {
      console.warn(`Model ${request.model} may not be available for SiliconFlow, attempting anyway`);
      // 硅基流动支持更多模型，不强制验证
    }

    // 硅基流动通常支持更大的输出
    if (request.maxTokens && request.maxTokens > 8192) {
      console.warn(`SiliconFlow models may have limitations with max_tokens > 8192`);
    }
  }

  // 硅基流动特定的错误处理
  protected handleError(error: any, request: AIAnalysisRequest): AIAnalysisResponse {
    // 硅基流动常见的错误处理
    if (error.response?.status === 401) {
      error.message = '硅基流动API密钥无效或已过期';
    } else if (error.response?.status === 402) {
      error.message = '硅基流动账户余额不足';
    } else if (error.response?.status === 404) {
      error.message = '请求的模型不存在或不可用';
    }

    return super.handleError(error, request);
  }

  // 获取可用模型的实时信息（如果需要）
  async getRealTimeModelList(): Promise<string[]> {
    try {
      // 这里可以调用硅基流动的模型列表API获取最新信息
      // 暂时返回静态列表
      return this.getAvailableModels();
    } catch (error) {
      console.warn('Failed to fetch real-time model list from SiliconFlow:', error);
      return this.getAvailableModels();
    }
  }

  // 检查模型是否可用
  async checkModelAvailability(model: string): Promise<boolean> {
    try {
      const models = await this.getRealTimeModelList();
      return models.includes(model);
    } catch (error) {
      console.warn(`Failed to check availability for model ${model}:`, error);
      return true; // 假设可用
    }
  }
}