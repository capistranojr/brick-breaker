// Game constants
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 2;
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 8;
const BALL_SPEED = 5;
const POWERUP_CHANCE = 0.2; // 20% chance for a powerup to spawn
const POWERUP_SPEED = 2;
const POWERUP_SIZE = 15;
const MAX_HIGH_SCORES = 5;
const LEVEL_TRANSITION_TIME = 2000; // 2 seconds

// Neon colors
const NEON_COLORS = [
    '#ff00ff', // pink
    '#00ffff', // cyan
    '#00ff00', // green
    '#ffff00', // yellow
    '#9900ff'  // purple
];

// Export constants for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BRICK_ROWS,
        BRICK_COLS,
        BRICK_HEIGHT,
        BRICK_GAP,
        PADDLE_HEIGHT,
        PADDLE_WIDTH,
        BALL_RADIUS,
        BALL_SPEED,
        POWERUP_CHANCE,
        POWERUP_SPEED,
        POWERUP_SIZE,
        MAX_HIGH_SCORES,
        LEVEL_TRANSITION_TIME,
        NEON_COLORS
    };
}
