const POINTS_PER_BLOCK = 10;

const state = {
  status: "ready", // "ready" | "playing" | "won" | "lost"
  score: 0,
  lives: 3,
  paddle: { x: 350, y: 560, w: 100, h: 20 },
  ball: {
    x: 400, y: 540, radius: 8,
    dx: 0, dy: 0,
    attached: true,
  },
  blocks: [
    // { x, y, w, h, color, alive }
  ],
};

const canvas = document.getElementById( 'gameCanvas' );
const ctx = canvas.getContext( '2d' );

const BLOCK_COLORS = [ 'gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ];
const BLOCK_COLS = 3;
const BLOCK_MARGIN_X = 20;
const BLOCK_GAP = 8;
const BLOCK_TOP = 50;
const BLOCK_H = 20;
const BLOCK_ROW_GAP = 8;
const BLOCK_W = ( canvas.width - BLOCK_MARGIN_X * 2 - BLOCK_GAP * ( BLOCK_COLS - 1 ) ) / BLOCK_COLS;

function createBlocks() {
  const blocks = [];
  BLOCK_COLORS.forEach( ( color, row ) => {
    for ( let col = 0; col < BLOCK_COLS; col++ ) {
      blocks.push( {
        x: BLOCK_MARGIN_X + col * ( BLOCK_W + BLOCK_GAP ),
        y: BLOCK_TOP + row * ( BLOCK_H + BLOCK_ROW_GAP ),
        w: BLOCK_W,
        h: BLOCK_H,
        color,
        alive: true,
      } );
    }
  } );
  return blocks;
}

state.blocks = createBlocks();

const PADDLE_SPEED = 8;
const keys = {};

const BALL_SPEED = 5;

window.addEventListener( 'keydown', ( e ) => {
  keys[ e.key ] = true;
  if ( ( e.key === ' ' || e.key === 'ArrowUp' ) && state.ball.attached ) {
    state.ball.attached = false;
    state.ball.dx = BALL_SPEED;
    state.ball.dy = -BALL_SPEED;
  }
} );
window.addEventListener( 'keyup', ( e ) => { keys[ e.key ] = false; } );

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'Enter' && ( state.status === 'won' || state.status === 'lost' ) ) {
    resetGame();
    requestAnimationFrame( loop );
  }
} );

function resetGame() {
  state.status = 'ready';
  state.score = 0;
  state.lives = 3;
  state.paddle.x = 350;
  state.paddle.y = 560;
  state.ball.attached = true;
  state.ball.dx = 0;
  state.ball.dy = 0;
  state.blocks = createBlocks();
}

function updatePaddle() {
  if ( keys[ 'ArrowLeft' ] || keys[ 'a' ] || keys[ 'A' ] ) {
    state.paddle.x -= PADDLE_SPEED;
  }
  if ( keys[ 'ArrowRight' ] || keys[ 'd' ] || keys[ 'D' ] ) {
    state.paddle.x += PADDLE_SPEED;
  }
  state.paddle.x = Math.max( 0, Math.min( canvas.width - state.paddle.w, state.paddle.x ) );
}

function updateBall() {
  if ( state.ball.attached ) {
    state.ball.x = state.paddle.x + state.paddle.w / 2;
    state.ball.y = state.paddle.y - state.ball.radius;
    return;
  }

  state.ball.x += state.ball.dx;
  state.ball.y += state.ball.dy;

  if ( state.ball.x - state.ball.radius < 0 ) {
    state.ball.x = state.ball.radius;
    state.ball.dx *= -1;
  } else if ( state.ball.x + state.ball.radius > canvas.width ) {
    state.ball.x = canvas.width - state.ball.radius;
    state.ball.dx *= -1;
  }

  if ( state.ball.y - state.ball.radius < 0 ) {
    state.ball.y = state.ball.radius;
    state.ball.dy *= -1;
  }

  if (
    state.ball.dy > 0 &&
    state.ball.y + state.ball.radius >= state.paddle.y &&
    state.ball.y + state.ball.radius <= state.paddle.y + state.paddle.h &&
    state.ball.x >= state.paddle.x &&
    state.ball.x <= state.paddle.x + state.paddle.w
  ) {
    const hitPos = ( state.ball.x - state.paddle.x ) / state.paddle.w; // 0..1
    const angle = ( hitPos - 0.5 ) * Math.PI * 0.8; // -0.4π..0.4π from vertical
    const speed = Math.hypot( state.ball.dx, state.ball.dy );
    state.ball.dx = speed * Math.sin( angle );
    state.ball.dy = -speed * Math.cos( angle );
    state.ball.y = state.paddle.y - state.ball.radius;
  }

  if ( state.ball.y - state.ball.radius > canvas.height ) {
    state.lives -= 1;
    state.ball.attached = true;
    state.ball.dx = 0;
    state.ball.dy = 0;
    return;
  }

  for ( const block of state.blocks ) {
    if ( !block.alive ) continue;
    const closestX = Math.max( block.x, Math.min( state.ball.x, block.x + block.w ) );
    const closestY = Math.max( block.y, Math.min( state.ball.y, block.y + block.h ) );
    const dx = state.ball.x - closestX;
    const dy = state.ball.y - closestY;
    if ( dx * dx + dy * dy <= state.ball.radius * state.ball.radius ) {
      block.alive = false;
      state.score += POINTS_PER_BLOCK;
      if ( Math.abs( dx ) > Math.abs( dy ) ) {
        state.ball.dx *= -1;
      } else {
        state.ball.dy *= -1;
      }
      break;
    }
  }
}

function checkEndConditions() {
  if ( state.lives <= 0 ) {
    state.status = 'lost';
  } else if ( state.blocks.every( ( block ) => !block.alive ) ) {
    state.status = 'won';
  }
}

function draw() {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h );
  drawSprite( ctx, 'ball', state.ball.x - state.ball.radius, state.ball.y - state.ball.radius, state.ball.radius * 2, state.ball.radius * 2 );
  state.blocks.forEach( ( block ) => {
    if ( block.alive ) {
      drawSprite( ctx, 'block_' + block.color, block.x, block.y, block.w, block.h );
    }
  } );
  drawHud();
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText( 'Score: ' + state.score, 10, 10 );
  ctx.fillText( 'Lives: ' + state.lives, canvas.width - 100, 10 );
}

function drawEndScreen( message ) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect( 0, 0, canvas.width, canvas.height );
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = '48px sans-serif';
  ctx.fillText( message, canvas.width / 2, canvas.height / 2 - 20 );
  ctx.font = '20px sans-serif';
  ctx.fillText( 'Pulsa Enter para reiniciar', canvas.width / 2, canvas.height / 2 + 30 );
  ctx.textAlign = 'left';
}

function loop() {
  if ( state.status === 'won' || state.status === 'lost' ) {
    draw();
    drawEndScreen( state.status === 'won' ? '¡Victoria!' : 'Game Over' );
    return;
  }

  updatePaddle();
  updateBall();
  checkEndConditions();
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( loop );
