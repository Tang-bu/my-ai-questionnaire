// AI相关类型定义

export interface AIAnalysisRequest {
  id?: string;
  questionnaireId: string;
  provider: string;        // 'openai', 'deepseek', 'qwen', 'kimi', 'glm'
  model: string;           // 'gpt-4o', 'deepseek-chat', 'qwen-max', etc.
  prompt: string;
  temperature?: number;    // 0.0 - 2.0
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIAnalysisResponse {
  id: string;
  rawResponse: string;
  structuredResult: Record<string, any>;
  provider: string;
  model: string;
  cost?: number;
  processingTime: number; // 毫秒
  metadata?: Record<string, any>;
}

export interface AIProviderInfo {
  name: string;
  displayName: string;
  description?: string;
  models: string[];
  defaultModel: string;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsMaxTokens: boolean;
  costEstimation?: {
    perInputToken?: number;   // 每输入token成本
    perOutputToken?: number;  // 每输出token成本
    perRequest?: number;      // 每请求成本
  };
}

export interface AIModelInfo {
  name: string;
  displayName: string;
  description?: string;
  contextWindow: number;    // 上下文窗口大小（token数）
  maxOutputTokens?: number; // 最大输出token数
  trainingCutoff?: string;  // 训练数据截止日期
  capabilities?: string[];  // 支持的功能
}

export interface AIUsageStatistics {
  provider: string;
  model: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  totalTokens: {
    input: number;
    output: number;
  };
  averageProcessingTime: number;
  lastUsedAt?: Date;
}

export interface AIAnalysisConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

export interface AIAnalysisResult {
  safetyLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskAreas: string[];
  summary: string;
  details?: Record<string, any>;
}

// 错误类型
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public model: string,
    public cause?: any
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIRateLimitError extends AIProviderError {
  constructor(provider: string, model: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}/${model}`, provider, model);
    this.name = 'AIRateLimitError';
    this.retryAfter = retryAfter;
  }

  retryAfter?: number;
}

export class AIQuotaExceededError extends AIProviderError {
  constructor(provider: string, model: string) {
    super(`Quota exceeded for ${provider}/${model}`, provider, model);
    this.name = 'AIQuotaExceededError';
  }
}

export class AIServiceUnavailableError extends AIProviderError {
  constructor(provider: string, model: string) {
    super(`Service unavailable for ${provider}/${model}`, provider, model);
    this.name = 'AIServiceUnavailableError';
  }
}

// 成本估算工具
export interface CostEstimation {
  provider: string;
  model: string;
  estimatedCost: number;
  currency: string;
  inputTokens: number;
  outputTokens?: number;
  details?: {
    inputCost: number;
    outputCost?: number;
    requestCost?: number;
  };
}

// 解析AI响应为结构化结果的选项
export interface ParseOptions {
  schema?: Record<string, any>;  // JSON Schema
  expectedFormat?: 'json' | 'text' | 'markdown';
  fallbackToRaw?: boolean;       // 解析失败时是否返回原始响应
}

// 支持的AI提供商枚举
export enum AIProvider {
  SILICONFLOW = 'siliconflow', // 硅基流动 (您的首选)
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
  QWEN = 'qwen',
  MOCK = 'mock',              // 模拟提供商
}

// 常用模型枚举
export enum AIModel {
  // OpenAI
  GPT4_O = 'gpt-4o',
  GPT4_TURBO = 'gpt-4-turbo',
  GPT4 = 'gpt-4',
  GPT3_5_TURBO = 'gpt-3.5-turbo',

  // DeepSeek
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_CODER = 'deepseek-coder',

  // 通义千问
  QWEN_MAX = 'qwen-max',
  QWEN_PLUS = 'qwen-plus',
  QWEN_TURBO = 'qwen-turbo',

  // Kimi
  KIMI_LATEST = 'kimi-latest',

  // 智谱GLM
  GLM_4 = 'glm-4',
  GLM_3_TURBO = 'glm-3-turbo',
}