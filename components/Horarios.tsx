import { HORARIOS_PAISES } from '@/lib/evento';

/** Tabla compacta con el horario del torneo en cada país. */
export default function Horarios({ title = 'Horario por país · domingo 22 de noviembre' }: { title?: string }) {
  return (
    <div className="horarios">
      <div className="horarios-t">🕓 {title}</div>
      <div className="horarios-g">
        {HORARIOS_PAISES.map((h) => (
          <div key={h.paises} className="horarios-r">
            <span className="hp">{h.paises}</span>
            <span className="hh">{h.horario}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
