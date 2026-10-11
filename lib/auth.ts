import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import { setSetting, upsertUser } from './data';

export const discordEnabled = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);

const admins = (process.env.ADMIN_DISCORD_IDS ?? '')
  .split(',')
  .map((s) => s.trim().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

export function isAdminId(id?: string | null) {
  if (!id) return false;
  if (!discordEnabled && id === 'demo-admin') return true;
  return admins.includes(id);
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NEXTAUTH_DEBUG === '1',
  logger: {
    error: (code, meta: any) => {
      const err = meta?.error ?? meta;
      const detail = [code, err?.name, err?.message, err?.error, err?.error_description, err?.cause?.message]
        .filter(Boolean).join(' | ').slice(0, 500);
      console.error('[next-auth]', detail);
      // Guarda el último error (sin datos sensibles) para mostrarlo en /ingresar.
      // Una cookie antigua (de antes de cambiar NEXTAUTH_SECRET) no es el error que buscamos.
      if (code !== 'JWT_SESSION_ERROR') {
        const g = globalThis as any;
        g.__authPending = g.__authPending || [];
        g.__authPending.push(setSetting('last_auth_error', `${new Date().toISOString()} ${detail}`).catch(() => {}));
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? (discordEnabled ? undefined : 'modo-demo-sin-secreto'),
  session: { strategy: 'jwt' },
  pages: { signIn: '/ingresar' },
  providers: discordEnabled
    ? [
        DiscordProvider({
          clientId: process.env.DISCORD_CLIENT_ID as string,
          clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
          authorization: { params: { scope: 'identify' } },
        }),
      ]
    : [
        // Solo en modo demo (sin Discord configurado): entrar como jugador o admin de prueba.
        CredentialsProvider({
          id: 'demo',
          name: 'Demo',
          credentials: { who: { label: 'who', type: 'text' } },
          async authorize(c) {
            return c?.who === 'admin'
              ? { id: 'demo-admin', name: 'Admin Demo' }
              : { id: 'demo-player', name: 'Jugador Demo' };
          },
        }),
      ],
  callbacks: {
    async signIn({ user, profile }) {
      const p = profile as any;
      const name = p?.global_name || p?.username || user.name || 'Jugador';
      try {
        await upsertUser(String(user.id), name, user.image ?? null);
      } catch (e) {
        console.error('[auth] No se pudo guardar el usuario', e);
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      if (user) token.sub = String(user.id);
      const p = profile as any;
      if (p) token.name = p.global_name || p.username || token.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).isAdmin = isAdminId(token.sub);
      }
      return session;
    },
  },
};

export type SessionUser = { id: string; name: string; image?: string | null; isAdmin: boolean };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const s = await getServerSession(authOptions);
  return (s?.user as SessionUser) ?? null;
}
