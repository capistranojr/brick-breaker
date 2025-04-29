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
const mockAudioPlay = jest.fn();

// Use jest.mock with a factory function to avoid JSDOM issues
jest.mock('../audio-manager', () => {
  return {
    play: mockAudioPlay,
    toggleMute: jest.fn(),
    setVolume: jest.fn(),
    audioManager: { play: mockAudioPlay }
  };
});

// Save original global variables if they exist
const originalGlobals = {
  createParticles: global.createParticles,
  audioManager: global.audioManager,
  updateLives: global.updateLives,
  currentLevel: global.currentLevel,
  canvas: global.canvas
};

// Mock global variables and functions
global.createParticles = jest.fn();
global.audioManager = { play: mockAudioPlay };
global.updateLives = jest.fn();
global.currentLevel = 1;
global.canvas = { width: 800, height: 600 };

// Restore original globals after all tests
afterAll(() => {
  // Restore only the globals that existed before
  Object.entries(originalGlobals).forEach(([key, value]) => {
    if (value !== undefined) {
      global[key] = value;
    }
  });
});

// Save original localStorage if it exists
const originalLocalStorage = global.localStorage;

// Create a localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Use Object.defineProperty to avoid conflicts with JSDOM
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Restore original localStorage after all tests
afterAll(() => {
  if (originalLocalStorage) {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  }
});

// Save original document methods
const originalDocument = global.document;

// Create a safe document mock that won't interfere with JSDOM
const documentMock = {
  createElement: jest.fn().mockReturnValue({
    style: { opacity: '1' },
    remove: jest.fn(),
    className: '',
    textContent: ''
  }),
  querySelector: jest.fn().mockReturnValue({
    appendChild: jest.fn()
  })
};

// Restore original document after all tests
afterAll(() => {
  if (originalDocument) {
    global.document = originalDocument;
  }
});

// Use the mock for tests
global.document = documentMock;

// Import game functions for testing
const {
  createBall,
  createBricks,
  standardPattern,
  checkerboardPattern,
  pyramidPattern,
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
    beforeEach(() => {
      // Reset mocks and global variables before each test
      jest.clearAllMocks();
      mockAudioPlay.mockClear(); // Explicitly clear the audio mock
      global.bricks = [];

      // Ensure audioManager is properly set up for each test
      global.audioManager = { play: mockAudioPlay };
    });

    test('createBricks should select the correct pattern based on level', () => {
      // Test level 1 (standard pattern)
      mockAudioPlay.mockClear();
      global.currentLevel = 1;
      createBricks();
      expect(bricks.length).toBe(BRICK_ROWS * BRICK_COLS);
      expect(mockAudioPlay).not.toHaveBeenCalled();

      // Test level 2 (checkerboard pattern)
      mockAudioPlay.mockClear();
      global.bricks = [];
      global.currentLevel = 2;
      createBricks();
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(mockAudioPlay).toHaveBeenCalledWith('levelComplete');

      // Test level 3 (pyramid pattern)
      mockAudioPlay.mockClear();
      global.bricks = [];
      global.currentLevel = 3;
      createBricks();
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(mockAudioPlay).toHaveBeenCalledWith('levelComplete');
    });

    test('createBricks should handle undefined canvas', () => {
      // Save original canvas
      const originalCanvas = global.canvas;

      // Remove canvas
      delete global.canvas;

      // Execute with undefined canvas
      createBricks();

      // Verify bricks were still created
      expect(bricks.length).toBeGreaterThan(0);

      // Restore canvas
      global.canvas = originalCanvas;
    });

    test('createBricks should handle undefined currentLevel', () => {
      // Save original currentLevel
      const originalLevel = global.currentLevel;

      // Remove currentLevel
      delete global.currentLevel;

      // Execute with undefined currentLevel
      createBricks();

      // Verify bricks were still created using default pattern
      expect(bricks.length).toBe(BRICK_ROWS * BRICK_COLS);

      // Restore currentLevel
      global.currentLevel = originalLevel;
    });

    test('standardPattern should create the correct number of bricks', () => {
      // Execute
      standardPattern(50); // 50px brick width

      // Verify
      expect(bricks.length).toBe(BRICK_ROWS * BRICK_COLS);

      // Check brick properties
      const brick = bricks[0];
      expect(brick).toHaveProperty('x');
      expect(brick).toHaveProperty('y');
      expect(brick).toHaveProperty('width', 50);
      expect(brick).toHaveProperty('height', BRICK_HEIGHT);
      expect(brick).toHaveProperty('color');
      expect(brick).toHaveProperty('health');
      expect(brick).toHaveProperty('broken', false);
    });

    test('checkerboardPattern should create a checkerboard pattern', () => {
      // Execute
      checkerboardPattern(50);

      // Verify - checkerboard has roughly half the bricks
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(bricks.length).toBeGreaterThan(0);

      // Check brick properties
      const brick = bricks[0];
      expect(brick).toHaveProperty('health', 2); // All bricks have 2 health in checkerboard
    });

    test('pyramidPattern should create a pyramid pattern', () => {
      // Execute
      pyramidPattern(50);

      // Verify - pyramid has fewer bricks than standard
      expect(bricks.length).toBeLessThan(BRICK_ROWS * BRICK_COLS);
      expect(bricks.length).toBeGreaterThan(0);

      // Check brick properties - health increases toward the top
      const topRowBrick = bricks.find(b => b.y === BRICK_GAP + 0 * (BRICK_HEIGHT + BRICK_GAP) + 40);
      const bottomRowBrick = bricks.find(b => b.y === BRICK_GAP + (BRICK_ROWS - 1) * (BRICK_HEIGHT + BRICK_GAP) + 40);

      if (topRowBrick && bottomRowBrick) {
        expect(topRowBrick.health).toBeGreaterThan(bottomRowBrick.health);
      }
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
    beforeEach(() => {
      // Reset mocks and global variables before each test
      jest.clearAllMocks();
      mockAudioPlay.mockClear(); // Explicitly clear the audio mock
      global.lives = 2;
      global.updateLives = jest.fn();
      global.paddle = { width: PADDLE_WIDTH };
      global.createParticles = jest.fn();

      // Ensure audioManager is properly set up for each test
      global.audioManager = { play: mockAudioPlay };
    });

    test('applyPowerup should play sound effect', () => {
      // Execute
      applyPowerup('extraLife');

      // Verify
      expect(mockAudioPlay).toHaveBeenCalledWith('powerupCollect');
    });

    test('applyPowerup should handle extraLife correctly', () => {
      // Execute
      applyPowerup('extraLife');

      // Verify
      expect(lives).toBe(3);
      expect(updateLives).toHaveBeenCalled();
    });

    test('applyPowerup should handle expandPaddle correctly', () => {
      // Setup
      const originalWidth = PADDLE_WIDTH;

      // Use jest.useFakeTimers() instead of manually mocking setTimeout
      jest.useFakeTimers();

      // Execute
      applyPowerup('expandPaddle');

      // Verify paddle expands
      expect(paddle.width).toBeGreaterThan(originalWidth);

      // Fast-forward time to trigger the timeout
      jest.runAllTimers();

      // Verify paddle returns to normal
      expect(paddle.width).toBe(originalWidth);

      // Restore real timers
      jest.useRealTimers();
    });

    test('applyPowerup should handle multiball correctly', () => {
      // Setup
      global.balls = [{
        x: 100,
        y: 100,
        dx: BALL_SPEED,
        dy: -BALL_SPEED
      }];

      // Reset the mock before the test
      mockAudioPlay.mockClear();

      // Ensure audioManager is properly set up
      global.audioManager = { play: mockAudioPlay };

      // Execute
      applyPowerup('multiball');

      // Verify - should add 2 more balls
      expect(balls.length).toBe(3);

      // Verify the new balls have different angles
      expect(balls[1].dx).not.toBe(balls[0].dx);
      expect(balls[2].dx).not.toBe(balls[0].dx);
      expect(balls[1].dx).not.toBe(balls[2].dx);

      // Verify multiball sound is played
      expect(mockAudioPlay).toHaveBeenCalledWith('multiball');
    });

    test('applyPowerup should handle slowBall correctly', () => {
      // Setup
      global.balls = [
        { dx: BALL_SPEED, dy: -BALL_SPEED },
        { dx: -BALL_SPEED, dy: -BALL_SPEED }
      ];

      // Use jest.useFakeTimers() instead of manually mocking setTimeout
      jest.useFakeTimers();

      // Execute
      applyPowerup('slowBall');

      // Verify balls slow down
      expect(balls[0].dx).toBe(BALL_SPEED * 0.5);
      expect(balls[0].dy).toBe(-BALL_SPEED * 0.5);
      expect(balls[1].dx).toBe(-BALL_SPEED * 0.5);
      expect(balls[1].dy).toBe(-BALL_SPEED * 0.5);

      // Fast-forward time to trigger the timeout
      jest.runAllTimers();

      // Verify balls return to normal speed
      expect(balls[0].dx).toBe(BALL_SPEED);
      expect(balls[0].dy).toBe(-BALL_SPEED);
      expect(balls[1].dx).toBe(-BALL_SPEED);
      expect(balls[1].dy).toBe(-BALL_SPEED);

      // Restore real timers
      jest.useRealTimers();
    });

    test('applyPowerup should create particles', () => {
      // Setup
      global.paddle = { x: 100, width: PADDLE_WIDTH, y: 500 };

      // Execute
      applyPowerup('extraLife');

      // Verify particles are created
      expect(createParticles).toHaveBeenCalledWith(
        paddle.x + paddle.width / 2,
        paddle.y,
        30,
        '#ffffff'
      );
    });

    test('applyPowerup should handle missing audioManager', () => {
      // Save original audioManager
      const originalAudioManager = global.audioManager;

      // Remove audioManager
      delete global.audioManager;

      // Execute - should not throw error
      applyPowerup('extraLife');

      // Verify lives still increased
      expect(lives).toBe(3);

      // Restore audioManager
      global.audioManager = originalAudioManager;
    });

    test('applyPowerup should handle missing createParticles', () => {
      // Save original createParticles
      const originalCreateParticles = global.createParticles;

      // Remove createParticles
      delete global.createParticles;

      // Execute - should not throw error
      applyPowerup('extraLife');

      // Verify lives still increased
      expect(lives).toBe(3);

      // Restore createParticles
      global.createParticles = originalCreateParticles;
    });
  });

  // High scores
  describe('High Scores', () => {
    beforeEach(() => {
      // Reset mocks and global variables before each test
      jest.clearAllMocks();
      mockAudioPlay.mockClear(); // Explicitly clear the audio mock
      global.highScores = [];
      localStorageMock.clear();

      // Ensure audioManager is properly set up for each test
      global.audioManager = { play: mockAudioPlay };
    });

    test('loadHighScores should load scores from localStorage', () => {
      // Setup
      const mockScores = [
        { score: 100, date: '1/1/2023' },
        { score: 200, date: '1/2/2023' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockScores));

      // Execute
      loadHighScores();

      // Verify
      expect(highScores).toEqual(mockScores);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('neonBreakerHighScores');
    });

    test('loadHighScores should initialize empty array when no scores exist', () => {
      // Setup
      localStorageMock.getItem.mockReturnValue(null);

      // Execute
      loadHighScores();

      // Verify
      expect(highScores).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('neonBreakerHighScores');
    });

    test('loadHighScores should handle missing localStorage', () => {
      // Save original localStorage
      const originalLocalStorage = global.localStorage;

      // Remove localStorage
      delete global.localStorage;

      // Execute - should not throw error
      loadHighScores();

      // Verify highScores remains unchanged
      expect(highScores).toEqual([]);

      // Restore localStorage
      global.localStorage = originalLocalStorage;
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
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'neonBreakerHighScores',
        JSON.stringify(highScores)
      );
    });

    test('saveHighScore should limit to MAX_HIGH_SCORES', () => {
      // Setup
      global.highScores = [];

      // Add more scores than the maximum
      for (let i = 0; i < MAX_HIGH_SCORES + 2; i++) {
        saveHighScore(i * 100);
      }

      // Verify
      expect(highScores.length).toBe(MAX_HIGH_SCORES);

      // Verify the highest scores are kept
      expect(highScores[0].score).toBe((MAX_HIGH_SCORES + 1) * 100);
    });

    test('saveHighScore should handle missing localStorage', () => {
      // Save original localStorage
      const originalLocalStorage = global.localStorage;

      // Remove localStorage
      delete global.localStorage;

      // Execute - should not throw error
      saveHighScore(500);

      // Verify score was still added to highScores
      expect(highScores.length).toBe(1);
      expect(highScores[0].score).toBe(500);

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    test('resetHighScores should clear high scores', () => {
      // Setup
      global.highScores = [{ score: 100, date: '1/1/2023' }];
      const mockConfirmationDiv = {
        style: { opacity: '1' },
        remove: jest.fn(),
        className: '',
        textContent: ''
      };
      document.querySelector.mockReturnValue({
        appendChild: jest.fn()
      });
      document.createElement.mockReturnValue(mockConfirmationDiv);

      // Reset the mock before the test
      mockAudioPlay.mockClear();

      // Use Jest's fake timers
      jest.useFakeTimers();

      // Execute
      resetHighScores();

      // Verify high scores are cleared
      expect(highScores).toEqual([]);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('neonBreakerHighScores');

      // Verify confirmation div was created
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockConfirmationDiv.className).toBe('score-reset-confirmation');
      expect(mockConfirmationDiv.textContent).toBe('High scores reset!');

      // Verify sound effect was played
      expect(mockAudioPlay).toHaveBeenCalledWith('powerupCollect');

      // Advance timers to trigger the first timeout (opacity change)
      jest.advanceTimersByTime(2000); // Use 2000ms as specified in the code

      // Now the opacity should be changed
      expect(mockConfirmationDiv.style.opacity).toBe('0');

      // Advance timers to trigger the second timeout (element removal)
      jest.advanceTimersByTime(500); // Use 500ms as specified in the code

      // Verify the element was removed
      expect(mockConfirmationDiv.remove).toHaveBeenCalled();

      // Restore real timers
      jest.useRealTimers();
    });

    test('resetHighScores should handle missing document', () => {
      // Save current document mock
      const currentDocument = global.document;

      // Replace document with undefined
      global.document = undefined;

      // Execute - should not throw error
      resetHighScores();

      // Verify high scores are still cleared
      expect(highScores).toEqual([]);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('neonBreakerHighScores');

      // Restore document mock
      global.document = currentDocument;
    });

    test('resetHighScores should handle missing audioManager', () => {
      // Save original audioManager
      const originalAudioManager = global.audioManager;

      // Remove audioManager
      delete global.audioManager;

      // Execute - should not throw error
      resetHighScores();

      // Verify high scores are still cleared
      expect(highScores).toEqual([]);

      // Restore audioManager
      global.audioManager = originalAudioManager;
    });
  });
});
