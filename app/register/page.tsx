"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const validateForm = (): string | null => {
    if (!email || !email.includes('@')) {
      return '请输入有效的邮箱地址';
    }

    if (password.length < 6) {
      return '密码长度至少6位';
    }

    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }

    if (!fullName.trim()) {
      return '请输入您的姓名';
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // 注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // 邮箱确认（可选）
          // emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        // 处理特定错误
        if (authError.message.includes('already registered')) {
          setError('该邮箱已注册，请直接登录');
        } else if (authError.message.includes('password')) {
          setError('密码不符合要求');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        setMessage('注册成功！正在跳转到登录页面...');

        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // 需要邮箱确认的情况
        setMessage('注册成功！请查收您的邮箱确认邮件。');
      }
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || `使用${provider}注册失败`);
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
              注册新账号
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              创建您的矿工安全评估平台账号
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

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                姓名
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="请输入您的姓名"
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

            <div style={{ marginBottom: '20px' }}>
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
                placeholder="至少6位字符"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                密码长度至少6位
              </p>
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
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="再次输入密码"
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
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ color: '#6b7280' }}>或</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialRegister('google')}
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
              onClick={() => handleSocialRegister('github')}
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
              已有账号？{' '}
              <Link
                href="/login"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                立即登录
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
            lineHeight: '1.6',
          }}
        >
          <p>© 2024 矿工安全意识评估平台</p>
          <p style={{ margin: 0 }}>
            注册即表示同意我们的{' '}
            <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>
              服务条款
            </Link>{' '}
            和{' '}
            <Link href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}