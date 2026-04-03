# Supabase 后端配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com) 并注册账户
2. 创建一个新组织（Organization）
3. 在组织中创建新项目：
   - **项目名称**: `ai-questionnaire-platform`
   - **数据库密码**: 设置一个安全的密码
   - **区域**: 选择离您最近的区域（如 `Southeast Asia (Singapore)`）
   - **定价计划**: 选择 **Free Plan**（免费层）

4. 等待项目初始化（约1-2分钟）

## 2. 获取项目配置信息

项目创建后，在 Dashboard 中获取以下信息：

1. **Project URL**: `https://xxxxx.supabase.co`
2. **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

将这些信息更新到 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. 设置数据库表结构

在 Supabase Dashboard 中，打开 **SQL Editor**，然后执行以下 SQL 语句：

### 核心表创建
```sql
-- 1. 扩展用户信息表（profiles）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  gender TEXT,
  age INTEGER,
  job_type TEXT,
  work_years INTEGER,
  mine_area TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 问卷题目模板表
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  guide_text TEXT,
  version INTEGER DEFAULT 1,
  category TEXT DEFAULT 'general',
  "order" INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 问卷提交表
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'analyzing', 'completed', 'failed')),
  basic_info JSONB,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI分析任务表
CREATE TABLE ai_analysis_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  raw_response TEXT,
  structured_result JSONB,
  error_message TEXT,
  cost NUMERIC(10, 6),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 报告表
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  ai_analysis_id UUID REFERENCES ai_analysis_tasks(id) ON DELETE SET NULL,
  report_data JSONB NOT NULL,
  report_format TEXT DEFAULT 'json' CHECK (report_format IN ('json', 'html', 'pdf')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 管理员配置表（可选）
```sql
-- AI提供商配置表
CREATE TABLE ai_provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  base_url TEXT,
  available_models JSONB DEFAULT '[]',
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  rate_limit INTEGER DEFAULT 60,
  cost_per_token NUMERIC(10, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt模板表
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 初始数据插入
```sql
-- 插入默认问卷题目（10题）
INSERT INTO question_templates (question_text, guide_text, "order") VALUES
  ('请描述你在日常工作中对安全规范的理解。', '可以从操作流程、风险防范意识、个人习惯等方面进行描述。', 1),
  ('当你发现施工环境存在隐患时，通常会怎么做？', '可以结合你平时的处理方式进行回答，例如上报、规避、提醒同事等。', 2),
  ('你认为在矿工作业中，最容易被忽视的安全风险是什么？', '可以结合你的岗位、经验或观察到的情况进行说明。', 3),
  ('遇到突发情况时，你通常会优先考虑哪些处理步骤？', '可以从个人反应、团队协作、上报流程等角度描述。', 4),
  ('你平时是否会主动学习或关注安全生产相关知识？', '可以结合培训、班前会、日常交流或自我学习情况来描述。', 5),
  ('当同事存在不安全操作时，你通常会怎样处理？', '可以从提醒、上报、协助纠正或其他做法来描述。', 6),
  ('你认为安全意识强的员工通常具备哪些特点？', '可以从行为习惯、责任心、规范执行等方面进行回答。', 7),
  ('你所在的工作环境中，哪些因素最容易影响安全操作执行？', '可以考虑设备、环境、管理、个人状态等因素。', 8),
  ('在日常工作中，你是如何平衡工作效率与安全要求的？', '可以结合具体场景和做法进行说明。', 9),
  ('对于提升你个人或团队的安全意识，你有什么建议或想法？', '可以根据实际情况提出具体可行的建议。', 10);
```

### 行级安全策略（RLS）
```sql
-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "用户可以查看自己的资料" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以查看自己的问卷" ON questionnaires
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的问卷" ON questionnaires
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以访问所有数据
CREATE POLICY "管理员可以访问所有资料" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 4. 配置认证设置

在 Supabase Dashboard 中，配置 **Authentication**：

1. **Email Auth**: 启用
   - 确认邮件模板可以自定义
   - 禁用 "Secure email change"

2. **OAuth Providers** (可选):
   - Google: 需要配置 OAuth 2.0 客户端
   - GitHub: 需要配置 OAuth App

3. **URL Configuration**:
   - Site URL: `http://localhost:3000` (开发环境)
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 5. 设置环境变量

创建 `.env.local` 文件并配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers (可选)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=...
QWEN_API_KEY=...
KIMI_API_KEY=...
GLM_API_KEY=...

# App
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## 6. 安装和运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 访问应用
# 前端: http://localhost:3000
# API 健康检查: http://localhost:3000/api/health
```

## 7. 测试步骤

1. **数据库连接测试**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **用户认证测试**:
   - 访问 `http://localhost:3000/register` 注册账号
   - 访问 `http://localhost:3000/login` 登录

3. **问卷API测试**:
   ```bash
   # 需要先获取认证token
   curl -X POST http://localhost:3000/api/questionnaire/submit \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "basicInfo": {
         "name": "张三",
         "gender": "男",
         "age": "35",
         "jobType": "采煤工",
         "workYears": "10",
         "mineArea": "山西煤矿"
       },
       "answers": {
         "1": "我理解安全规范包括...",
         "2": "发现隐患我会立即上报...",
         "3": "最容易被忽视的是...",
         "4": "首先确保自身安全...",
         "5": "经常参加安全培训...",
         "6": "会善意提醒同事...",
         "7": "责任心强，遵守规程...",
         "8": "设备老化和疲劳作业...",
         "9": "安全永远是第一位...",
         "10": "建议增加实操培训..."
       }
     }'
   ```

## 8. 故障排除

### 常见问题

1. **数据库连接失败**:
   - 检查 `.env.local` 中的 Supabase URL 和 Key
   - 确保 Supabase 项目正常运行

2. **认证失败**:
   - 检查 Supabase 认证设置
   - 确认 Redirect URL 配置正确

3. **RLS 权限问题**:
   - 确保正确设置了行级安全策略
   - 检查用户角色是否正确

4. **CORS 问题**:
   - Supabase 默认已配置 CORS
   - 如果需要自定义，在 Supabase Dashboard 的 Settings → API 中配置

### 日志查看

1. **Supabase 日志**:
   - Dashboard → Logs → PostgreSQL Logs
   - Dashboard → Logs → Auth Logs

2. **应用日志**:
   - 检查控制台输出
   - 查看浏览器开发者工具

## 9. 下一步开发

完成 Supabase 配置后，可以继续开发：

1. **完善前端界面**:
   - 用户仪表盘
   - 问卷历史查看
   - 报告展示

2. **AI 集成**:
   - 配置 AI 提供商 API 密钥
   - 测试 AI 分析功能
   - 实现报告生成

3. **管理员后台**:
   - 用户管理
   - 问卷题目管理
   - AI 配置管理

4. **部署**:
   - 部署到 Vercel
   - 配置生产环境变量
   - 设置自定义域名

## 10. 资源链接

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [项目 GitHub 仓库](https://github.com/your-username/my-ai-questionnaire)