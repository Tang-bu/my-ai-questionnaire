// 共享类型定义

// 用户相关
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  gender: string;
  age: number;
  jobType: string;
  workYears: number;
  mineArea: string;
  createdAt: Date;
  updatedAt: Date;
}

// 问卷相关
export interface QuestionTemplate {
  id: string;
  questionText: string;
  guideText?: string;
  version: number;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Questionnaire {
  id: string;
  userId: string;
  profileId: string;
  status: 'draft' | 'submitted' | 'analyzing' | 'completed' | 'failed';
  basicInfo: Record<string, any>; // 存储用户基本信息
  answers: Record<string, string>; // 存储所有答案，键为questionId
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionItem {
  id: number;        // 保持与现有前端的兼容性
  title: string;     // 题目内容
  guide?: string;    // 提示语
}

// AI分析相关
export interface AIAnalysisTask {
  id: string;
  questionnaireId: string;
  provider: string;  // 'openai', 'deepseek', 'qwen', 'kimi', 'glm'
  model: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rawResponse?: string;
  structuredResult?: Record<string, any>;
  errorMessage?: string;
  cost?: number;
  processingTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisRequest {
  questionnaireId: string;
  provider: string;
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIAnalysisResponse {
  id: string;
  rawResponse: string;
  structuredResult: Record<string, any>;
  provider: string;
  model: string;
  cost?: number;
  processingTime: number;
}

// 报告相关
export interface Report {
  id: string;
  questionnaireId: string;
  aiAnalysisId?: string;
  reportData: Record<string, any>;
  reportFormat: 'json' | 'html' | 'pdf';
  generatedAt: Date;
  createdAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 管理员配置
export interface AIProviderConfig {
  id: string;
  providerName: string;  // 'openai', 'deepseek', 'qwen', 'kimi', 'glm'
  apiKey?: string;       // 加密存储
  baseUrl?: string;
  availableModels: string[];
  isEnabled: boolean;
  priority: number;      // 优先级，越低越优先
  rateLimit?: number;    // 每分钟请求限制
  costPerToken?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  version: number;
  variables: string[];   // 模板变量定义
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  template: string;      // JSON结构模板
  version: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 表单数据类型（与现有前端兼容）
export interface BasicInfoFormData {
  name: string;
  gender: string;
  age: string;
  jobType: string;
  workYears: string;
  mineArea: string;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 验证模式（使用Zod）
import { z } from 'zod';

export const basicInfoSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  gender: z.string().min(1, '性别不能为空'),
  age: z.string().min(1, '年龄不能为空'),
  jobType: z.string().min(1, '工种不能为空'),
  workYears: z.string().min(1, '工龄不能为空'),
  mineArea: z.string().min(1, '所属矿区/单位不能为空'),
});

export const questionnaireAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string().min(1, '答案不能为空'),
});

export type BasicInfoFormDataZod = z.infer<typeof basicInfoSchema>;
export type QuestionnaireAnswerZod = z.infer<typeof questionnaireAnswerSchema>;