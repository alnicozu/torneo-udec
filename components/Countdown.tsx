'use client';
import { useEffect, useState } from 'react';

/** Cuenta regresiva hasta una fecha. Se oculta cuando ya pasó. */
export default function Countdown({ to }: { to: string }) {
  const end = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="countdown" aria-hidden style={{ visibility: 'hidden' }}><div><b>00</b><span>días</span></div></div>;
  const left = Math.max(0, end - now);
  if (left === 0) return <div className="countdown-done">Inscripciones cerradas</div>;
  const d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24, m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="countdown" role="timer">
      <div><b>{d}</b><span>{d === 1 ? 'día' : 'días'}</span></div>
      <div><b>{p(h)}</b><span>horas</span></div>
      <div><b>{p(m)}</b><span>min</span></div>
      <div><b>{p(s)}</b><span>seg</span></div>
    </div>
  );
}
