import { createClient } from '@/app/lib/supabase/server';

export type AuthenticatedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: {
    id: string;
    email?: string;
  };
  role: 'admin' | 'user';
};

export async function getAuthenticatedContext(): Promise<AuthenticatedContext | null> {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  return {
    supabase,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    role: profile?.role === 'admin' ? 'admin' : 'user',
  };
}