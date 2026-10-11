import { redirect } from 'next/navigation';
import { discordEnabled, getCurrentUser } from '@/lib/auth';
import { DemoSignIn, SignInButton } from '@/components/AuthButtons';

export default async function IngresarPage() {
  if (await getCurrentUser()) redirect('/cuenta');
  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-head" style={{ textAlign: 'center' }}>
        <div className="eyebrow">Inscripciones</div>
        <h1 className="title">Entrar</h1>
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
