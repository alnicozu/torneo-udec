// Fechas del torneo. Cambia estos valores si se mueven las fechas.
export const CIERRE_INSCRIPCIONES = '2026-11-21T23:59:00-03:00'; // sábado 21 de noviembre, 23:59 (hora de Chile)
export const TEXTO_CIERRE = '¡Plazo extendido! Inscripciones hasta el sábado 21 de noviembre';
export const TEXTO_JUEGO = 'Se juega el domingo 22 de noviembre, de 16:00 a 22:00 (hora de Chile)';

// Horario del torneo en otros países que suelen jugar en el servidor de Santiago.
// En noviembre Chile está en UTC-3 (horario de verano).
export const HORARIOS_PAISES: { paises: string; horario: string }[] = [
  { paises: 'Chile · Argentina · Uruguay · Paraguay', horario: '16:00 – 22:00' },
  { paises: 'Bolivia', horario: '15:00 – 21:00' },
  { paises: 'Perú · Ecuador · Colombia', horario: '14:00 – 20:00' },
];
