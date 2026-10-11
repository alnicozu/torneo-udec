'use client';
import { signIn, signOut } from 'next-auth/react';

export function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.2a18 18 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.8 19.8 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L18 21a19.7 19.7 0 0 0 6-3c.5-5.1-.8-9.6-3.7-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}

export function SignInButton({ demo, label = 'Entrar con Discord', lg }: { demo: boolean; label?: string; lg?: boolean }) {
  if (demo) {
    return (
      <a className={`btn btn-discord ${lg ? 'lg' : ''}`} href="/ingresar">
        <DiscordIcon /> <span className="long">{label}</span>
      </a>
    );
  }
  return (
    <button className={`btn btn-discord ${lg ? 'lg' : ''}`} onClick={() => signIn('discord', { callbackUrl: '/cuenta' })}>
      <DiscordIcon /> <span className="long">{label}</span>
    </button>
  );
}

export function DemoSignIn() {
  return (
    <div className="form-actions" style={{ justifyContent: 'center' }}>
      <button className="btn lg" onClick={() => signIn('demo', { who: 'player', callbackUrl: '/cuenta' })}>Entrar como jugador</button>
      <button className="btn ghost lg" onClick={() => signIn('demo', { who: 'admin', callbackUrl: '/admin' })}>Entrar como admin</button>
    </div>
  );
}

export function SignOutButton() {
  return <button onClick={() => signOut({ callbackUrl: '/' })}>Cerrar sesión</button>;
}
