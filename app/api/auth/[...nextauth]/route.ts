import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const nextAuth = NextAuth(authOptions);

// Espera a que se guarde el detalle de cualquier error antes de responder.
async function handler(req: Request, ctx: any) {
  const res = await nextAuth(req, ctx);
  const g = globalThis as any;
  const pending: Promise<unknown>[] = g.__authPending || [];
  g.__authPending = [];
  await Promise.allSettled(pending);
  return res;
}

export { handler as GET, handler as POST };
