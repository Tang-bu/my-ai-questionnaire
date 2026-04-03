# 硅基流动 (SiliconFlow) 配置指南

## 简介
硅基流动是一个优秀的国产AI模型服务平台，聚合了国内外优质大模型。您已经拥有硅基流动的API密钥，这是最佳的选择。

## 优势
1. **国内访问快**: 无需科学上网
2. **模型丰富**: 提供通义千问、DeepSeek、Llama、Yi等多种模型
3. **成本合理**: 相比OpenAI有明显成本优势
4. **稳定性好**: 国内服务，网络延迟低

## 配置步骤

### 1. 获取API密钥
如果您还没有硅基流动API密钥：
1. 访问 [硅基流动官网](https://www.siliconflow.cn/)
2. 注册账号并登录
3. 在控制台获取API密钥

### 2. 配置环境变量
在 `.env.local` 文件中添加：
```env
SILICONFLOW_API_KEY=您的API密钥
```

### 3. 模型选择建议
根据您的需求选择合适的模型：

#### 推荐配置（平衡性能与成本）
```typescript
// 主用模型
const primaryModel = 'Qwen/Qwen2.5-14B-Instruct';
// 备用模型
const fallbackModel = 'deepseek-ai/DeepSeek-V2';
```

#### 各模型特点
| 模型 | 特点 | 适合场景 | 预估成本/千token |
|------|------|----------|----------------|
| **Qwen/Qwen2.5-72B-Instruct** | 能力强，推理优秀 | 复杂分析，重要报告 | ¥0.001输入, ¥0.002输出 |
| **Qwen/Qwen2.5-14B-Instruct** | 性价比高，速度快 | 日常问卷分析 | ¥0.0002输入, ¥0.0004输出 |
| **deepseek-ai/DeepSeek-V2** | 长上下文，数学好 | 技术性分析 | ¥0.0004输入, ¥0.0008输出 |
| **stepfun/Llama-3.3-70B-Instruct** | 英文优秀，代码强 | 国际化需求 | ¥0.0012输入, ¥0.0024输出 |

### 4. 测试连接
运行测试脚本验证连接：
```bash
# 进入项目目录
cd my-ai-questionnaire

# 安装依赖
npm install

# 运行测试
npm run test:ai
```

如果没有测试脚本，可以运行：
```bash
node -e "
  require('dotenv').config({path: '.env.local'});
  const { AIManager } = require('./app/lib/ai/ai-manager');
  const manager = new AIManager();
  
  console.log('可用AI提供商:');
  manager.getAvailableProviders().forEach(p => {
    console.log(\`- \${p.displayName}: \${p.models.length}个模型\`);
  });
  
  console.log('\\n默认提供商:', manager.getRecommendedProvider());
"
```

## API使用示例

### 基本分析调用
```typescript
import { getAIManager } from '@/app/lib/ai/example';

async function analyzeQuestionnaire() {
  const manager = getAIManager();
  
  const result = await manager.analyze({
    questionnaireId: 'test-123',
    provider: 'siliconflow',
    model: 'Qwen/Qwen2.5-14B-Instruct',
    prompt: '分析矿工安全意识...',
    temperature: 0.7,
    maxTokens: 1500,
  });
  
  console.log('分析结果:', result.structuredResult);
}
```

### 自动选择最优模型
```typescript
import { analyzeMinerQuestionnaire } from '@/app/lib/ai/example';

const basicInfo = {
  name: '张三',
  gender: '男',
  age: '35',
  jobType: '采煤工',
  workYears: '10',
  mineArea: '山西煤矿',
};

const answers = {
  '1': '安全规范包括戴安全帽、检查设备...',
  '2': '发现隐患立即上报班组长...',
  // ... 更多答案
};

// 自动使用硅基流动分析
const analysis = await analyzeMinerQuestionnaire(basicInfo, answers, {
  model: 'Qwen/Qwen2.5-14B-Instruct', // 可选，默认会自动选择
});
```

## 成本控制

### 1. 成本估算
```typescript
import { compareCosts } from '@/app/lib/ai/example';

// 比较不同模型的成本
const prompt = '分析矿工安全意识...';
const costComparison = await compareCosts(prompt);

// 输出：按成本从低到高排序的模型列表
```

### 2. 使用统计监控
```typescript
const manager = getAIManager();
const stats = manager.getUsageStatistics();

console.log('硅基流动使用情况:');
const siliconflowStats = stats.find(s => s.provider === 'siliconflow');
if (siliconflowStats) {
  console.log('总请求:', siliconflowStats.totalRequests);
  console.log('成功率:', siliconflowStats.successfulRequests / siliconflowStats.totalRequests);
  console.log('总成本:', siliconflowStats.totalCost, '元');
}
```

## 故障排除

### 常见问题

#### 1. API密钥无效
**症状**: 401错误
**解决方案**:
- 检查API密钥是否正确
- 确认账户余额充足
- 在硅基流动控制台重新生成密钥

#### 2. 模型不可用
**症状**: 404错误
**解决方案**:
- 检查模型名称是否正确
- 查看硅基流动文档确认模型可用性
- 切换到备用模型

#### 3. 响应时间慢
**解决方案**:
- 切换到较小模型（如14B替代72B）
- 减少max_tokens参数
- 检查网络连接

### 错误处理示例
```typescript
try {
  const result = await manager.analyze(request);
} catch (error: any) {
  if (error.name === 'AIRateLimitError') {
    console.log('请求频率限制，请稍后重试');
    // 自动等待后重试
    await new Promise(resolve => setTimeout(resolve, 5000));
    return await manager.analyze(request);
  }
  
  if (error.name === 'AIQuotaExceededError') {
    console.log('账户配额不足，请充值');
    // 自动切换到备用提供商
    request.provider = 'openai'; // 或 'mock' 用于开发
    return await manager.analyze(request);
  }
  
  throw error; // 其他错误向上抛出
}
```

## 最佳实践

### 1. 生产环境配置
```typescript
// 生产环境使用更稳定的模型
const PRODUCTION_MODEL = 'Qwen/Qwen2.5-14B-Instruct';

// 开发环境使用更小更快的模型
const DEVELOPMENT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

// 根据环境选择模型
const model = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_MODEL 
  : DEVELOPMENT_MODEL;
```

### 2. 性能优化
- **缓存常用结果**: 对相似问卷结果进行缓存
- **批量处理**: 多个问卷一起分析时使用批量API
- **异步处理**: 长时间分析使用异步任务队列

### 3. 质量保证
```typescript
// 添加质量检查
function validateAnalysisResult(result: any): boolean {
  return result && 
         result.safetyLevel && 
         result.score !== undefined &&
         Array.isArray(result.recommendations);
}

// 使用验证
const analysis = await analyzeMinerQuestionnaire(basicInfo, answers);
if (!validateAnalysisResult(analysis.result)) {
  console.warn('分析结果格式异常，尝试重新分析...');
  // 重试或记录异常
}
```

## 监控和维护

### 1. 健康检查
定期检查硅基流动服务状态：
```bash
curl -X POST https://api.siliconflow.cn/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "ping"}],
    "max_tokens": 5
  }'
```

### 2. 成本监控
建议设置月度成本预算，并在硅基流动控制台设置警报。

### 3. 模型更新
定期查看硅基流动的新模型，测试性能提升：
```typescript
// 每月测试新模型
async function testNewModels() {
  const newModels = [
    'new-model-1',
    'new-model-2',
  ];
  
  for (const model of newModels) {
    const benchmark = await benchmarkModel(model);
    if (benchmark.costPerAccuracy < currentBest) {
      console.log(`发现更好模型: ${model}`);
      // 更新默认模型配置
    }
  }
}
```

## 资源链接
- [硅基流动官方文档](https://docs.siliconflow.cn/)
- [API参考文档](https://docs.siliconflow.cn/api-reference/)
- [模型列表](https://www.siliconflow.cn/models)
- [控制台](https://www.siliconflow.cn/console)
- [技术支持](https://www.siliconflow.cn/support)

## 紧急联系
如遇紧急问题：
1. 查看硅基流动状态页面
2. 联系技术支持邮箱：support@siliconflow.cn
3. 备用方案：切换到其他AI提供商（如DeepSeek）

---

通过以上配置，您的矿工安全评估平台将充分利用硅基流动的优势，提供稳定、高效、成本合理的AI分析服务。