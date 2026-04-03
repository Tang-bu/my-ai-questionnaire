"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setMessage('登录成功！正在跳转...');

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || `使用${provider}登录失败`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ marginTop: 0, marginBottom: '8px', color: '#111827' }}>
              登录矿工安全评估平台
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              请输入您的账号信息
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #fca5a5',
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                backgroundColor: '#d1fae5',
                color: '#059669',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid #6ee7b7',
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="请输入邮箱"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: '#6b7280' }}>或</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('google')}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Google</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('github')}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>GitHub</span>
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>
              还没有账号？{' '}
              <Link
                href="/register"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                立即注册
              </Link>
            </p>

            <Link
              href="/"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              ← 返回首页
            </Link>
          </div>
        </div>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
          }}
        >
          <p>© 2024 矿工安全意识评估平台. 保护矿工安全，我们在行动。</p>
        </div>
      </div>
    </main>
  );
}