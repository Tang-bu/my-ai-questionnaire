"use client";

import { useState } from 'react';

export default function TestSimpleAIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSimpleAI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 构建一个简单的测试提示词
      const testPrompt = `矿工姓名：张三
工种：采煤工
工龄：8年

问卷回答：
1. 我理解安全规范很重要，每天检查装备
2. 发现隐患会立即报告
3. 注意交接班时的松懈
4. 按应急预案处理突发事件
5. 参加安全培训学习
6. 提醒同事注意安全
7. 责任心强，遵守规程
8. 注意设备状态
9. 安全第一原则
10. 建议加强实操演练

请分析这名矿工的安全意识水平。`;

      const response = await fetch('/api/ai/simple-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testPrompt,
          model: 'Qwen/Qwen2.5-14B-Instruct'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API错误: ${response.status}`);
      }

      setResult(data);
      console.log('测试成功:', data);

    } catch (error: any) {
      console.error('测试失败:', error);
      setError(error.message || '未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#111827', marginBottom: '24px' }}>极简AI分析测试</h1>

        <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '32px' }}>
          这个测试页面只调用最简单的AI分析端点，避免复杂的依赖。
        </p>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
        }}>
          <button
            onClick={testSimpleAI}
            disabled={isLoading}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {isLoading ? 'AI分析中... (请等待30-60秒)' : '测试极简AI分析'}
          </button>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h3 style={{ color: '#dc2626', marginTop: 0 }}>❌ 测试失败</h3>
              <pre style={{ color: '#7f1d1d', margin: 0, whiteSpace: 'pre-wrap' }}>
                {error}
              </pre>
            </div>
          )}

          {result && (
            <div>
              <h3 style={{ color: '#065f46', marginTop: 0, marginBottom: '16px' }}>
                ✅ 测试成功
              </h3>

              {result.success ? (
                <div>
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>模型:</strong> {result.data?.model}
                    </p>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>用时:</strong> {result.data?.processingTime}ms
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Token使用:</strong> 输入 {result.data?.usage?.prompt_tokens}, 输出 {result.data?.usage?.completion_tokens}
                    </p>
                  </div>

                  {result.data?.result && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <h4 style={{ color: '#374151', marginTop: 0 }}>AI分析结果</h4>
                      <pre style={{
                        fontSize: '14px',
                        overflow: 'auto',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {JSON.stringify(result.data.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#dc2626' }}>❌ 结果表示失败: {result.error}</p>
              )}
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb',
        }}>
          <h3 style={{ color: '#111827', marginTop: 0 }}>说明</h3>
          <ul style={{ color: '#6b7280', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
            <li><strong>极简设计</strong>：这个端点只包含最基本的功能，避免复杂依赖</li>
            <li><strong>直接调用</strong>：直接调用硅基流动API，不经过复杂的中间层</li>
            <li><strong>快速测试</strong>：验证AI分析功能是否能正常工作</li>
            <li><strong>安全</strong>：即使失败也不会影响主应用</li>
          </ul>
        </div>
      </div>
    </div>
  );
}