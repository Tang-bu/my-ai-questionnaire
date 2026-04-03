import { v4 as uuidv4 } from 'uuid';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProviderInfo,
  AIModelInfo,
  AIProviderError,
  AIRateLimitError,
  AIQuotaExceededError,
  AIServiceUnavailableError,
  CostEstimation,
  ParseOptions,
} from '../types';

export abstract class AIProvider {
  abstract name: string;
  abstract displayName: string;

  // 必须实现的方法
  abstract analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
  abstract getAvailableModels(): string[];
  abstract getProviderInfo(): AIProviderInfo;

  // 可选实现的方法
  getModelInfo(model: string): AIModelInfo | null {
    return null;
  }

  getCostEstimation(request: AIAnalysisRequest): CostEstimation | null {
    return null;
  }

  // 标准错误处理
  protected handleError(error: any, request: AIAnalysisRequest): AIAnalysisResponse {
    const errorId = uuidv4();
    const errorResponse: AIAnalysisResponse = {
      id: errorId,
      rawResponse: '',
      structuredResult: {
        error: {
          id: errorId,
          message: error.message || 'Unknown error',
          type: error.name || 'UnknownError',
          provider: this.name,
          model: request.model,
          timestamp: new Date().toISOString(),
        },
      },
      provider: this.name,
      model: request.model,
      processingTime: 0,
    };

    // 根据错误类型添加更多信息
    if (error.response?.status === 429) {
      errorResponse.structuredResult.error.type = 'RateLimitError';
      errorResponse.structuredResult.error.retryAfter = error.response.headers?.['retry-after'];

      // 抛出特定错误供管理器处理
      throw new AIRateLimitError(
        this.name,
        request.model,
        error.response.headers?.['retry-after']
      );
    }

    if (error.response?.status === 402 || error.response?.status === 403) {
      errorResponse.structuredResult.error.type = 'QuotaExceededError';
      throw new AIQuotaExceededError(this.name, request.model);
    }

    if (error.response?.status >= 500) {
      errorResponse.structuredResult.error.type = 'ServiceUnavailableError';
      throw new AIServiceUnavailableError(this.name, request.model);
    }

    // 其他错误
    throw new AIProviderError(
      error.message || 'AI analysis failed',
      this.name,
      request.model,
      error
    );
  }

  // 解析结构化响应的默认实现
  protected parseStructuredResponse(
    rawResponse: string,
    options: ParseOptions = {}
  ): Record<string, any> {
    const { fallbackToRaw = true } = options;

    try {
      // 尝试解析为JSON
      if (rawResponse.trim().startsWith('{') || rawResponse.trim().startsWith('[')) {
        return JSON.parse(rawResponse);
      }

      // 尝试提取JSON部分
      const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       rawResponse.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }

      // 如果是纯文本，尝试结构化为简单格式
      const lines = rawResponse.split('\n').filter(line => line.trim());
      const sections: Record<string, any> = {};
      let currentSection = 'content';
      let sectionContent: string[] = [];

      for (const line of lines) {
        if (line.match(/^#{1,3}\s+.+/) || line.match(/^[A-Z][a-z]+:/)) {
          // 保存上一节
          if (sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n').trim();
          }

          // 新节
          currentSection = line.replace(/^#{1,3}\s+/, '').replace(/:$/, '').toLowerCase();
          sectionContent = [];
        } else {
          sectionContent.push(line);
        }
      }

      // 保存最后一节
      if (sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }

      if (Object.keys(sections).length > 0) {
        return sections;
      }

      // 如果所有解析都失败，返回原始文本
      if (fallbackToRaw) {
        return { raw: rawResponse };
      }

      throw new Error('无法解析AI响应');

    } catch (error) {
      if (fallbackToRaw) {
        return { raw: rawResponse, parseError: error.message };
      }
      throw error;
    }
  }

  // 估算token数的简单实现（可被子类覆盖）
  protected estimateTokens(text: string): number {
    // 简单估算：英文约4字符=1token，中文约1.3字符=1token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    // 粗略估算
    const tokens = Math.ceil(chineseChars / 1.3 + otherChars / 4);
    return tokens;
  }

  // 验证请求参数
  protected validateRequest(request: AIAnalysisRequest): void {
    if (!request.provider || !request.model || !request.prompt) {
      throw new Error('Missing required fields: provider, model, prompt');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.maxTokens !== undefined && request.maxTokens <= 0) {
      throw new Error('maxTokens must be positive');
    }

    if (request.topP !== undefined && (request.topP < 0 || request.topP > 1)) {
      throw new Error('topP must be between 0 and 1');
    }
  }

  // 准备最终响应
  protected createResponse(
    rawResponse: string,
    request: AIAnalysisRequest,
    processingTime: number,
    cost?: number,
    metadata?: Record<string, any>
  ): AIAnalysisResponse {
    const structuredResult = this.parseStructuredResponse(rawResponse);

    return {
      id: request.id || uuidv4(),
      rawResponse,
      structuredResult,
      provider: this.name,
      model: request.model,
      cost,
      processingTime,
      metadata,
    };
  }

  // 工具方法：等待重试
  protected async waitForRetry(delayMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  // 工具方法：重试逻辑
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // 如果是不可重试的错误，直接抛出
        if (
          error instanceof AIQuotaExceededError ||
          error.name === 'AIQuotaExceededError'
        ) {
          throw error;
        }

        // 如果是限流错误，等待指定时间
        if (error instanceof AIRateLimitError || error.retryAfter) {
          const retryAfter = error.retryAfter || 60; // 默认60秒
          await this.waitForRetry(retryAfter * 1000);
          continue;
        }

        // 如果是服务不可用，指数退避
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await this.waitForRetry(delay);
          continue;
        }
      }
    }

    throw lastError;
  }
}