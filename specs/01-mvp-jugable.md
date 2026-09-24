# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Borrador
> **Depende de:** —
> **Fecha:** 2026-09-24
> **Objetivo:** Construir un MVP jugable de Arkanoid en el navegador, con una pala controlada por teclado, una bola con física de rebote, un único nivel de bloques por colores, sistema de vidas y puntuación, y pantallas de victoria/derrota reiniciables.

## Scope

**Dentro:**

- `index.html` como punto de entrada, con un `<canvas>` de 800x600 px.
- `js/game.js` con el game loop, el estado del juego y toda la física (un solo archivo, sin módulos separados).
- Pala controlada con teclado (flechas izquierda/derecha o A/D).
- Bola que parte pegada a la pala y se lanza con una tecla (espacio o flecha arriba).
- Física de colisión de la bola contra paredes, pala y bloques (rebote por reflexión de ángulo).
- Un único nivel con layout fijo: filas de bloques, una fila por color, usando los 7 colores de `SPRITES.blocks` (`gray`, `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`).
- Al romper un bloque: desaparece inmediatamente, sin animación de explosión y sin sonido.
- Sistema de vidas: 3 vidas. Perder la bola (cae por debajo de la pala) resta una vida y la bola vuelve a la posición de lanzamiento pegada a la pala.
- Sistema de puntuación: cada bloque roto suma una cantidad fija de puntos, visible en un HUD.
- HUD visible con vidas restantes y puntuación actual.
- Condición de victoria: romper todos los bloques del nivel único → pantalla de victoria.
- Condición de derrota: perder las 3 vidas → pantalla de Game Over.
- Pantallas de victoria/derrota muestran un mensaje y la instrucción de pulsar una tecla (Enter) para reiniciar la partida completa desde cero (vidas, score y bloques reseteados).
- Uso de `assets/spritesheet.js` (`loadSpritesheet`, `drawSprite`) para dibujar pala, bola y bloques con los sprites existentes.

**Fuera de alcance (para futuros specs):**

- Sonido (`ball-bounce.mp3`, `break-sound.mp3`) — el MVP es completamente silencioso.
- Animaciones de explosión (`EXPLOSION_FRAMES`) al romper bloques.
- Múltiples niveles o progresión.
- Power-ups.
- Persistencia de puntuación (high scores, localStorage).
- Soporte de mouse o táctil.
- Pausa del juego.
- Responsive / canvas de tamaño variable.

## Data model

```js
// Estado del juego, en memoria (sin persistencia)
const state = {
  status: "ready", // "ready" | "playing" | "won" | "lost"
  score: 0,
  lives: 3,
  paddle: { x: 350, y: 560, w: 100, h: 20 },
  ball: {
    x: 400, y: 540, radius: 8,
    dx: 0, dy: 0, // velocidad en px/frame; 0,0 mientras está pegada a la pala
    attached: true, // true = sigue a la pala, aún no lanzada
  },
  blocks: [
    // { x, y, w, h, color, alive }
  ],
};
```

Convenciones:

- Origen de coordenadas: esquina superior izquierda del canvas (0,0).
- Velocidades en píxeles por frame.
- `blocks` se genera al iniciar/reiniciar la partida: 7 filas (una por color), con columnas fijas que llenan el ancho del canvas con márgenes.
- Puntos por bloque: valor fijo igual para todos los colores (ej. 10 pts), definido como constante `POINTS_PER_BLOCK`.

## Implementation plan

1. Crear `index.html` con el `<canvas id="gameCanvas" width="800" height="600">`, carga de `assets/spritesheet.js` y `js/game.js`. Verificación manual: la página carga sin errores en consola y muestra un canvas vacío.
2. Crear `js/game.js` con el estado inicial (`state`), llamar a `loadSpritesheet` y dibujar la pala y la bola estáticas en pantalla al terminar de cargar. Verificación: se ven la pala y la bola en sus posiciones iniciales.
3. Implementar el game loop con `requestAnimationFrame` y el movimiento de la pala con teclado (flechas/A-D), acotado a los límites del canvas. Verificación: la pala se mueve al presionar teclas y no sale del canvas.
4. Implementar el lanzamiento de la bola (tecla espacio/flecha arriba) y su movimiento libre con rebote contra las paredes izquierda, derecha y superior. Verificación: la bola se lanza y rebota en los bordes sin escapar del canvas.
5. Implementar la colisión bola-pala (rebote con ángulo según punto de impacto) y la pérdida de vida cuando la bola cae por debajo de la pala, reseteando la bola a `attached: true`. Verificación: la bola rebota en la pala; al no interceptarla, se resta una vida y la bola vuelve a pegarse a la pala.
6. Generar el layout fijo de bloques (7 filas por color) y dibujarlos con `drawSprite`. Verificación: se ven los 7 colores de bloques ordenados en filas.
7. Implementar colisión bola-bloque: al impactar, el bloque se marca `alive: false`, desaparece, rebota la bola y suma `POINTS_PER_BLOCK` al score. Verificación: al golpear un bloque, desaparece y el score aumenta.
8. Implementar el HUD (vidas y score) dibujado sobre el canvas. Verificación: el HUD se actualiza en tiempo real al perder vidas o sumar puntos.
9. Implementar las condiciones de fin de partida: victoria (todos los bloques `alive: false`) y derrota (`lives === 0`), mostrando la pantalla correspondiente y deteniendo el loop de física. Verificación: romper todos los bloques muestra victoria; perder las 3 vidas muestra Game Over.
10. Implementar el reinicio con tecla Enter desde las pantallas de victoria/derrota, reseteando `state` por completo (score, vidas, bloques, posición de bola/pala). Verificación: tras Game Over o victoria, pulsar Enter reinicia la partida desde cero y es jugable de nuevo.

## Acceptance criteria

- [ ] La página carga `index.html` sin errores en consola.
- [ ] La pala se mueve con las flechas izquierda/derecha (o A/D) sin salir del canvas.
- [ ] La bola parte pegada a la pala y se lanza al pulsar espacio o flecha arriba.
- [ ] La bola rebota correctamente contra paredes, pala y bloques.
- [ ] Al golpear un bloque, este desaparece inmediatamente (sin animación ni sonido) y el score aumenta en `POINTS_PER_BLOCK`.
- [ ] Perder la bola (que caiga por debajo de la pala) resta exactamente 1 vida y la bola vuelve a pegarse a la pala.
- [ ] El HUD muestra vidas y score actualizados en todo momento.
- [ ] Perder las 3 vidas muestra la pantalla de Game Over y detiene el juego.
- [ ] Romper los 21 bloques (7 filas) del nivel muestra la pantalla de victoria y detiene el juego.
- [ ] Desde Game Over o victoria, pulsar Enter reinicia la partida completa (score, vidas, bloques) y vuelve a ser jugable.
- [ ] Pala, bola y bloques se dibujan usando los sprites de `assets/spritesheet.js` (no rectángulos de relleno).

## Decisiones

- **Sí:** un único archivo `js/game.js` sin módulos separados. Es un MVP pequeño y evita complejidad de imports/exports para este alcance.
- **No:** ES modules por archivo (paddle.js, ball.js, etc.). Sobre-ingeniería para el tamaño actual del MVP.
- **Sí:** sin sonido en el MVP, a pesar de que `ball-bounce.mp3` y `break-sound.mp3` ya existen como assets. Decisión explícita del usuario para mantener el alcance mínimo; se puede añadir en un spec futuro.
- **No:** usar `EXPLOSION_FRAMES` al romper bloques. Mismo motivo: mantener el MVP mínimo; el bloque simplemente desaparece.
- **Sí:** layout de bloques fijo (filas por color), no aleatorio. Es predecible, fácil de testear visualmente y suficiente para un MVP de un solo nivel.
- **Sí:** canvas fijo de 800x600, sin responsive. Simplifica cálculos de colisión y layout.
- **Sí:** reinicio manual con tecla Enter desde las pantallas de fin de partida, en vez de requerir recargar la página. Mejor UX sin mucho esfuerzo adicional.
- **No:** persistencia de score (localStorage/high scores). Fuera de alcance del MVP, candidato a spec futuro.

## What is **not** in this spec

- Sonido de rebote y de rotura de bloques.
- Animaciones de explosión al romper bloques.
- Múltiples niveles o progresión de dificultad.
- Power-ups.
- Persistencia de puntuación entre sesiones.
- Soporte de mouse/táctil.
- Pausa del juego.
- Diseño responsive.

Cada uno de estos, si se implementa, irá en su propio spec.
