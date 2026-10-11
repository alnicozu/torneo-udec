'use client';
import { useEffect, useState } from 'react';

export default function TwitchEmbed({ channel }: { channel: string }) {
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => setHost(window.location.hostname), []);
  const ch = encodeURIComponent(channel.replace(/^https?:\/\/(www\.)?twitch\.tv\//, '').replace(/\/.*$/, ''));
  return (
    <div className="live-wrap">
      <div>
        <div className="embed">
          {host && <iframe src={`https://player.twitch.tv/?channel=${ch}&parent=${host}`} allowFullScreen title="Transmisión" />}
        </div>
        <a className="btn ghost" style={{ marginTop: 12 }} href={`https://twitch.tv/${ch}`} target="_blank" rel="noreferrer">Abrir en Twitch</a>
      </div>
      <div className="chat">
        {host && <iframe src={`https://www.twitch.tv/embed/${ch}/chat?parent=${host}&darkpopout`} title="Chat" />}
      </div>
    </div>
  );
}
