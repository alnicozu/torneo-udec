'use client';
import { useRef, useState } from 'react';

/** Elige una imagen, la achica a 256x256 en el navegador y la envía al servidor. */
export default function LogoUploader({ action }: { action: (fd: FormData) => void }) {
  const [data, setData] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErr('El archivo tiene que ser una imagen.');
    if (f.size > 10 * 1024 * 1024) return setErr('La imagen pesa demasiado (máximo 10 MB).');
    const img = new Image();
    img.onload = () => {
      const S = 256;
      const c = document.createElement('canvas');
      c.width = S; c.height = S;
      const ctx = c.getContext('2d')!;
      const r = Math.min(S / img.width, S / img.height);
      const w = img.width * r, h = img.height * r;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      let out = c.toDataURL('image/webp', 0.85);
      if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/png');
      setData(out);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => setErr('No se pudo leer la imagen.');
    img.src = URL.createObjectURL(f);
  }

  return (
    <form action={action} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <input type="hidden" name="logo" value={data} />
      {data && <img src={data} alt="Vista previa" className="team-logo" />}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFile} style={{ display: 'none' }} />
      <button type="button" className="btn ghost sm" onClick={() => fileRef.current?.click()}>
        {data ? 'Elegir otra imagen' : 'Elegir imagen'}
      </button>
      {data && <button className="btn sm">Guardar logo</button>}
      {err && <span className="small" style={{ color: '#ff8f99' }}>{err}</span>}
    </form>
  );
}
