// Edita aquí el reglamento. Cada sección aparece en la página /reglamento.
export const REGLAMENTO: { id: string; title: string; items: string[] }[] = [
  {
    id: 'inscripcion',
    title: 'Inscripción',
    items: [
      'La inscripción es gratuita. Los cupos son limitados y se asignan por orden de inscripción.',
      'Las inscripciones están abiertas hasta el viernes 20 de noviembre a las 23:59. El torneo se juega el sábado 21 y el domingo 22 de noviembre.',
      'Cada jugador debe entrar a la página con su cuenta de Discord y completar su Riot ID.',
      'Los equipos son de 5 jugadores titulares y pueden tener hasta 2 suplentes (máximo 7).',
      'Al inscribirse, el capitán recibe un código de inscripción para crear el equipo en la página. Cada código sirve para un solo equipo.',
      'Una vez creado el equipo, el capitán comparte el código del equipo con sus compañeros para que se unan.',
      'Un jugador solo puede pertenecer a un equipo durante todo el torneo.',
    ],
  },
  {
    id: 'formato',
    title: 'Formato',
    items: [
      'Eliminación directa: el equipo que pierde queda fuera del torneo.',
      'Todas las rondas se juegan al mejor de 1 (BO1), excepto semifinales y final, que se juegan al mejor de 3 (BO3).',
      'Los perdedores de semifinales juegan un partido por el 3er lugar.',
      'Los cruces se sortean al momento de publicar el cuadro.',
    ],
  },
  {
    id: 'partidas',
    title: 'Partidas',
    items: [
      'Las partidas son personalizadas, 5vs5, con las reglas de competitivo (13 rondas para ganar, prórroga activada).',
      'La selección de mapas se hace por veto entre capitanes antes de cada partido.',
      'Los equipos deben estar conectados 15 minutos antes del horario publicado.',
      'Si un equipo no se presenta 15 minutos después del horario, pierde por W.O.',
      'Cada equipo puede pedir una pausa técnica de hasta 10 minutos por mapa.',
    ],
  },
  {
    id: 'resultados',
    title: 'Resultados',
    items: [
      'Al terminar, los capitanes envían una captura del marcador final a la organización por Discord.',
      'La organización actualiza el cuadro en la página. En caso de disputa, la decisión de la organización es final.',
    ],
  },
  {
    id: 'conducta',
    title: 'Conducta',
    items: [
      'Está prohibido el uso de hacks, scripts, smurfs o cuentas de terceros.',
      'No se toleran insultos, acoso ni discriminación hacia otros jugadores o la organización.',
      'Las faltas pueden sancionarse con pérdida de mapa, de partido o descalificación del equipo.',
    ],
  },
  {
    id: 'premios',
    title: 'Premios',
    items: [
      'Hay un único premio de $20.000 para el equipo campeón.',
      'El premio se entrega al capitán del equipo campeón una vez terminado el torneo.',
    ],
  },
];
