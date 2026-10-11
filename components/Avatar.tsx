export default function Avatar({ src, name, size = '' }: { src?: string | null; name: string; size?: '' | 'md' | 'lg' }) {
  if (src) return <img className={`avatar ${size}`} src={src} alt="" />;
  return <span className={`avatar ${size}`}>{(name || '?').slice(0, 2)}</span>;
}
