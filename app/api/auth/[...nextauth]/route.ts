import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';

const nextAuth = NextAuth(authOptions);

async function handler(req: NextRequest, ctx: any) {
  // Discord ahora agrega el parámetro "iss" al volver del login, y la librería
  // de NextAuth v4 lo rechaza ("issuer must be configured on the issuer").
  // Lo quitamos antes de procesar la respuesta de Discord.
  if (req.nextUrl.searchParams.has('iss')) {
    const url = new URL(req.nextUrl);
    url.searchParams.delete('iss');
    req = new NextRequest(url, req);
  }
  const res = await nextAuth(req, ctx);
  // Espera a que se guarde el detalle de cualquier error antes de responder.
  const g = globalThis as any;
  const pending: Promise<unknown>[] = g.__authPending || [];
  g.__authPending = [];
  await Promise.allSettled(pending);
  return res;
}

export { handler as GET, handler as POST };
