import { middleware as supabaseMiddleware } from "./app/lib/supabase/middleware";
import { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return supabaseMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
