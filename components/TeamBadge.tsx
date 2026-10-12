import { teamLogoUrl } from '@/lib/data';

/** Muestra el logo del equipo si tiene, o su tag en un recuadro de color. */
export default function TeamBadge({ team, size = '' }: { team: { id: number; tag: string; has_logo?: boolean; logo_v?: number }; size?: '' | 'xl' }) {
  if (team.has_logo) return <img className={`team-logo ${size}`} src={teamLogoUrl(team)} alt={team.tag} />;
  return <div className={`team-badge ${size}`}>{team.tag}</div>;
}
