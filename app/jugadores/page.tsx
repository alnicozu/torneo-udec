import { getPlayers } from '@/lib/data';
import PlayersTable from './PlayersTable';

export const metadata = { title: 'Jugadores · Torneo 5vs5 UdeC 2026' };

export default async function JugadoresPage() {
  const players = await getPlayers();
  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">{players.length} registrados</div>
        <h1 className="title">Jugadores</h1>
        <p className="subtitle">Todos los jugadores inscritos, con su rol, rango y equipo.</p>
      </div>
      <PlayersTable players={players} />
    </div>
  );
}
