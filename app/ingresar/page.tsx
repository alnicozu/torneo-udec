import { redirect } from 'next/navigation';
import { discordEnabled, getCurrentUser } from '@/lib/auth';
import { DemoSignIn, SignInButton } from '@/components/AuthButtons';

export default async function IngresarPage({ searchParams }: { searchParams: { error?: string } }) {
  if (await getCurrentUser()) redirect('/cuenta');
  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-head" style={{ textAlign: 'center' }}>
        <div className="eyebrow">Inscripciones</div>
        <h1 className="title">Entrar</h1>
        {searchParams.error && (
          <div className="alert err" style={{ textAlign: 'left', marginTop: 24 }}>
            {searchParams.error === 'OAuthCallback'
              ? 'Discord rechazó el inicio de sesión. Revisa que DISCORD_CLIENT_ID y DISCORD_CLIENT_SECRET en Vercel sean los de tu app de Discord (sin espacios) y vuelve a desplegar.'
              : `No se pudo iniciar sesión (${searchParams.error}). Intenta de nuevo.`}
          </div>
        )}
        {discordEnabled ? (
          <>
            <p className="subtitle" style={{ margin: '12px auto 28px' }}>Usamos tu cuenta de Discord para identificarte. Solo pedimos tu nombre y avatar.</p>
            <SignInButton demo={false} lg />
          </>
        ) : (
          <>
            <p className="subtitle" style={{ margin: '12px auto 28px' }}>
              Discord aún no está configurado, así que puedes probar la página como jugador o como administrador.
            </p>
            <DemoSignIn />
          </>
        )}
      </div>
    </div>
  );
}
