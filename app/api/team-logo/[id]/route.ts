import { q } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return new Response('No encontrado', { status: 404 });
  const [row] = await q('select logo from teams where id=$1', [id]);
  const m = typeof row?.logo === 'string' ? row.logo.match(/^data:(image\/(?:webp|png|jpeg));base64,(.+)$/) : null;
  if (!m) return new Response('No encontrado', { status: 404 });
  return new Response(Buffer.from(m[2], 'base64'), {
    headers: { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
