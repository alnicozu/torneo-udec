import { getSettings } from '@/lib/data';
import TwitchEmbed from './TwitchEmbed';

export const metadata = { title: 'En vivo · Torneo 5vs5 UdeC 2026' };

export default async function EnVivoPage() {
  const { stream_channel } = await getSettings();
  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Transmisión</div>
        <h1 className="title">En vivo</h1>
        <p className="subtitle">Sigue los partidos del torneo en directo.</p>
      </div>
      {stream_channel ? (
        <TwitchEmbed channel={stream_channel} />
      ) : (
        <div className="empty">La transmisión aparecerá aquí cuando la organización configure el canal de Twitch.</div>
      )}
    </div>
  );
}
