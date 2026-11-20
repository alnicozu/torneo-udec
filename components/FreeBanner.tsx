import Countdown from './Countdown';
import Horarios from './Horarios';
import { CIERRE_INSCRIPCIONES, TEXTO_CIERRE, TEXTO_JUEGO } from '@/lib/evento';

/** Recuadro destacado: inscripción gratis, cupos limitados, fechas y cuenta regresiva. */
export default function FreeBanner() {
  return (
    <div className="free-banner">
      <div className="free-top">
        <span className="free-word">Inscripción gratis</span>
        <span className="free-pill">⚠ Cupos limitados</span>
      </div>
      <div className="free-dates">
        <div><span className="ico">📝</span>{TEXTO_CIERRE}</div>
        <div><span className="ico">🎮</span>{TEXTO_JUEGO}</div>
        <div><span className="ico">🖥️</span>Servidor: Santiago</div>
      </div>
      <Horarios />
      <div className="free-cd-label">El cierre de inscripciones es en</div>
      <Countdown to={CIERRE_INSCRIPCIONES} />
    </div>
  );
}
