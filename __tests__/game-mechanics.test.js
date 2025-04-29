// Import game constants for testing
const {
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
} = require('../game-constants');

// Mock the audio manager
jest.mock('../audio-manager', () => ({
  play: jest.fn(),
  toggleMute: jest.fn(),
  setVolume: jest.fn()
}));

// Import game functions for testing
const {
  createBall,
  createBricks,
  standardPattern,
  checkerboardPattern,
  pyramidPattern,
  updateBalls,
  resetBalls,
  checkCollision,
  applyPowerup,
  loadHighScores,
  saveHighScore,
  resetHighScores
} = require('../game-functions');

describe('Game Mechanics', () => {
  // Ball creation and movement
  describe('Ball Mechanics', () => {
    test('createBall should return a ball object with correct properties', () => {
      const ball = createBall(400, 300);
      
      expect(ball).toHaveProperty('x', 400);
      expect(ball).toHaveProperty('y', 300);
      expect(ball).toHaveProperty('dx');
      expect(ball).toHaveProperty('dy');
      expect(ball).toHaveProperty('radius', BALL_RADIUS);
      expect(ball).toHaveProperty('color');
      expect(ball).toHaveProperty('trail');
      expect(Array.isArray(ball.trail)).toBe(true);
    });
    
    test('resetBalls should clear balls array and create a new ball', () => {
      // Setup
      global.balls = [{}, {}, {}]; // Mock multiple balls
      
      // Execute
      resetBalls();
      
      // Verify
      expect(balls.length).toBe(1);
    });
  });
  
  // Brick patterns
  describe('Brick Patterns', () => {
    test('standardPattern should create the correct number of bricks', () => {
      // Setup
      global.bricks = [];
      
      // Execute
      standardPattern(50); // 50px brick width
      
      // Verify
      expect(bricks.length).toBe(BRICK_ROWS * BRICK_COLS);
    });
    
    test('checkerboardPattern should create a checkerboard pattern', () => {
      // Setup
      global.bricks = [];
      
      // Execute
      checkerboardPattern(50);
      
      // Verify - checkerboard has roughly half the bricks
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(bricks.length).toBeGreaterThan(0);
    });
    
    test('pyramidPattern should create a pyramid pattern', () => {
      // Setup
      global.bricks = [];
      
      // Execute
      pyramidPattern(50);
      
      // Verify - pyramid has fewer bricks than standard
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(bricks.length).toBeGreaterThan(0);
    });
  });
  
  // Collision detection
  describe('Collision Detection', () => {
    test('checkCollision should detect collision between ball and brick', () => {
      // Setup
      const ball = {
        x: 100,
        y: 100,
        radius: BALL_RADIUS
      };
      
      const brick = {
        x: 95,
        y: 95,
        width: 50,
        height: BRICK_HEIGHT,
        broken: false
      };
      
      // Execute & Verify
      expect(checkCollision(ball, brick)).toBe(true);
    });
    
    test('checkCollision should return false when no collision', () => {
      // Setup
      const ball = {
        x: 100,
        y: 100,
        radius: BALL_RADIUS
      };
      
      const brick = {
        x: 200,
        y: 200,
        width: 50,
        height: BRICK_HEIGHT,
        broken: false
      };
      
      // Execute & Verify
      expect(checkCollision(ball, brick)).toBe(false);
    });
  });
  
  // Powerups
  describe('Powerups', () => {
    test('applyPowerup should handle extraLife correctly', () => {
      // Setup
      global.lives = 2;
      global.updateLives = jest.fn();
      
      // Execute
      applyPowerup('extraLife');
      
      // Verify
      expect(lives).toBe(3);
      expect(updateLives).toHaveBeenCalled();
    });
    
    test('applyPowerup should handle expandPaddle correctly', () => {
      // Setup
      global.paddle = { width: PADDLE_WIDTH };
      jest.useFakeTimers();
      
      // Execute
      applyPowerup('expandPaddle');
      
      // Verify
      expect(paddle.width).toBeGreaterThan(PADDLE_WIDTH);
      
      // Fast-forward time
      jest.advanceTimersByTime(10000);
      
      // Verify paddle returns to normal
      expect(paddle.width).toBe(PADDLE_WIDTH);
      
      jest.useRealTimers();
    });
    
    test('applyPowerup should handle multiball correctly', () => {
      // Setup
      global.balls = [{ x: 100, y: 100 }];
      
      // Execute
      applyPowerup('multiball');
      
      // Verify - should add 2 more balls
      expect(balls.length).toBe(3);
    });
  });
  
  // High scores
  describe('High Scores', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });
    
    test('loadHighScores should load scores from localStorage', () => {
      // Setup
      const mockScores = [
        { score: 100, date: '1/1/2023' },
        { score: 200, date: '1/2/2023' }
      ];
      localStorage.setItem('neonBreakerHighScores', JSON.stringify(mockScores));
      
      // Execute
      loadHighScores();
      
      // Verify
      expect(highScores).toEqual(mockScores);
    });
    
    test('saveHighScore should add and sort high scores', () => {
      // Setup
      global.highScores = [
        { score: 300, date: '1/1/2023' },
        { score: 100, date: '1/2/2023' }
      ];
      
      // Execute
      saveHighScore(200);
      
      // Verify - scores should be sorted highest first
      expect(highScores[0].score).toBe(300);
      expect(highScores[1].score).toBe(200);
      expect(highScores[2].score).toBe(100);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
    
    test('saveHighScore should limit to MAX_HIGH_SCORES', () => {
      // Setup
      global.highScores = [];
      for (let i = 0; i < MAX_HIGH_SCORES + 2; i++) {
        saveHighScore(i * 100);
      }
      
      // Verify
      expect(highScores.length).toBe(MAX_HIGH_SCORES);
    });
    
    test('resetHighScores should clear high scores', () => {
      // Setup
      global.highScores = [{ score: 100, date: '1/1/2023' }];
      document.querySelector = jest.fn().mockReturnValue({
        appendChild: jest.fn()
      });
      
      // Execute
      resetHighScores();
      
      // Verify
      expect(highScores).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('neonBreakerHighScores');
    });
  });
});
