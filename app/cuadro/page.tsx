import Bracket from '@/components/Bracket';
import { getMatches, getTeams } from '@/lib/data';

export const metadata = { title: 'Cuadro · Torneo 5vs5 UdeC 2026' };

export default async function CuadroPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Eliminación directa</div>
        <h1 className="title">Cuadro del torneo</h1>
        <p className="subtitle">Cada partido es al mejor de 1, excepto semifinales, final y 3er lugar, que se juegan al mejor de 3. Desliza hacia el lado para ver todas las rondas.</p>
      </div>
      {matches.length ? (
        <Bracket matches={matches} teams={teamMap} />
      ) : (
        <div className="empty">
          El cuadro se publicará cuando cierren las inscripciones.
          <br />
          Por ahora hay <b style={{ color: 'var(--text)' }}>{teams.length}</b> equipos inscritos.
        </div>
      )}
    </div>
  );
}
