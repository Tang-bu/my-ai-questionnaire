import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabase = await createClient();

  try {
    // 使用code交换session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('认证回调错误:', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }

    // 重定向到目标页面
    return NextResponse.redirect(new URL(redirectTo, request.url));

  } catch (error: any) {
    console.error('认证回调异常:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'unknown_error')}`, request.url));
  }
}