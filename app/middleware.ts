import { middleware as supabaseMiddleware } from './lib/supabase/middleware';

export async function middleware(request: Request) {
  // 调用Supabase中间件
  return supabaseMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};