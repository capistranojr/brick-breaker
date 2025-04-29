// Mock the game-functions module first
const mockResetGame = jest.fn();
const mockSaveHighScore = jest.fn();
const mockCreateBricks = jest.fn();
const mockResetBalls = jest.fn();

jest.mock('../game-functions', () => ({
  resetGame: mockResetGame,
  saveHighScore: mockSaveHighScore,
  createBricks: mockCreateBricks,
  resetBalls: mockResetBalls,
  loadHighScores: jest.fn()
}));

// Now import UI functions
const {
  updateScore,
  updateLives,
  updateLevelIndicator,
  showHighScores,
  closeHighScores,
  quitGame,
  endGame,
  startGame,
  restartGame,
  showLevelTransition
} = require('../ui-functions');

describe('UI Components', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up global mocks for DOM elements
    global.document = {
      createElement: jest.fn().mockImplementation((tag) => {
        if (tag === 'li') {
          return {
            textContent: '',
            appendChild: jest.fn()
          };
        }
        if (tag === 'span') {
          return { textContent: '' };
        }
        return {};
      })
    };

    // Reset global variables for each test
    global.highScoresList = {
      innerHTML: '',
      appendChild: jest.fn()
    };
  });

  // Score and lives display
  describe('Game Status Display', () => {
    test('updateScore should update score element', () => {
      // Setup
      global.score = 150;
      global.scoreElement = { textContent: '0' };

      // Execute
      updateScore();

      // Verify
      expect(scoreElement.textContent).toBe('150');
    });

    test('updateLives should update lives element', () => {
      // Setup
      global.lives = 2;
      global.livesElement = { textContent: '3' };

      // Execute
      updateLives();

      // Verify
      expect(livesElement.textContent).toBe('2');
    });

    test('updateLevelIndicator should update level indicator', () => {
      // Setup
      global.currentLevel = 3;
      global.levelIndicator = { textContent: 'LEVEL 1' };

      // Execute
      updateLevelIndicator();

      // Verify
      expect(levelIndicator.textContent).toBe('LEVEL 3');
    });
  });

  // High scores screen
  describe('High Scores Screen', () => {
    test('showHighScores should display high scores screen', () => {
      // Setup
      global.highScores = [
        { score: 300, date: '1/1/2023' },
        { score: 200, date: '1/2/2023' }
      ];

      // Mock DOM elements and methods
      const mockLi = { appendChild: jest.fn() };
      const mockSpan = {};

      document.createElement = jest.fn().mockImplementation((tag) => {
        if (tag === 'li') return mockLi;
        if (tag === 'span') return mockSpan;
        return {};
      });

      global.highScoresList = {
        innerHTML: '',
        appendChild: jest.fn()
      };
      global.highScoresScreen = { style: { display: 'none' } };

      // Execute
      showHighScores();

      // Verify
      expect(highScoresScreen.style.display).toBe('flex');
      expect(highScoresList.appendChild).toHaveBeenCalled();
    });

    test('closeHighScores should hide high scores screen', () => {
      // Setup
      global.highScoresScreen = { style: { display: 'flex' } };

      // Execute
      closeHighScores();

      // Verify
      expect(highScoresScreen.style.display).toBe('none');
    });
  });

  // Game state transitions
  describe('Game State Transitions', () => {
    test('startGame should initialize game correctly', () => {
      // Setup
      global.gameMenu = { style: { display: 'flex' } };
      global.gameStarted = false;
      global.gameLoop = jest.fn();

      // Execute
      startGame();

      // Verify
      expect(gameMenu.style.display).toBe('none');
      expect(gameStarted).toBe(true);
      expect(gameLoop).toHaveBeenCalled();
    });

    test('restartGame should reset game state', () => {
      // Setup
      global.gameOverScreen = { style: { display: 'flex' } };
      global.gameOver = true;
      global.gameStarted = false;
      global.gameLoop = jest.fn();
      global.resetGame = mockResetGame; // Use our mock function

      // Execute
      restartGame();

      // Verify
      expect(gameOverScreen.style.display).toBe('none');
      expect(gameOver).toBe(false);
      expect(mockResetGame).toHaveBeenCalled();
      expect(gameStarted).toBe(true);
      expect(gameLoop).toHaveBeenCalled();
    });

    test('quitGame should return to main menu', () => {
      // Setup
      global.gameOverScreen = { style: { display: 'flex' } };
      global.gameMenu = { style: { display: 'none' } };
      global.gameOver = true;
      global.gameStarted = true;
      global.cancelAnimationFrame = jest.fn();
      global.resetGame = mockResetGame; // Use our mock function

      // Execute
      quitGame();

      // Verify
      expect(gameOverScreen.style.display).toBe('none');
      expect(gameMenu.style.display).toBe('flex');
      expect(gameOver).toBe(false);
      expect(gameStarted).toBe(false);
      expect(mockResetGame).toHaveBeenCalled();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    test('endGame should show game over screen', () => {
      // Setup
      global.gameOver = false;
      global.gameStarted = true;
      global.score = 250;
      global.finalScoreElement = { textContent: '0' };
      global.gameOverScreen = { style: { display: 'none' } };
      global.cancelAnimationFrame = jest.fn();
      global.audioManager = { play: jest.fn() };
      global.highScores = [];
      global.MAX_HIGH_SCORES = 5;
      global.saveHighScore = mockSaveHighScore; // Use our mock function

      // Execute
      endGame();

      // Verify
      expect(gameOver).toBe(true);
      expect(gameStarted).toBe(false);
      expect(finalScoreElement.textContent).toBe('250');
      expect(gameOverScreen.style.display).toBe('flex');
      expect(cancelAnimationFrame).toHaveBeenCalled();
      expect(audioManager.play).toHaveBeenCalledWith('gameOver');
      expect(mockSaveHighScore).toHaveBeenCalledWith(250);
    });

    test('showLevelTransition should show level indicator', () => {
      // Setup
      global.showingLevelIndicator = false;
      global.levelIndicator = {
        textContent: 'LEVEL 1',
        style: { opacity: '0' }
      };
      global.currentLevel = 2;
      global.audioManager = { play: jest.fn() };
      global.createParticles = jest.fn();
      global.createBricks = mockCreateBricks; // Use our mock function
      global.resetBalls = mockResetBalls; // Use our mock function

      // Mock setTimeout to execute the callback after we check the initial state
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn((callback) => {
        // Don't execute the callback immediately
        // We'll call it manually after checking the initial state
        return 123; // Return a timeout ID
      });

      // Execute
      showLevelTransition();

      // Verify
      expect(showingLevelIndicator).toBe(true);
      expect(levelIndicator.textContent).toBe('LEVEL 2');
      expect(levelIndicator.style.opacity).toBe('1');
      expect(audioManager.play).toHaveBeenCalledWith('levelComplete');

      // Now manually call the setTimeout callback to simulate the transition completing
      const timeoutCallback = global.setTimeout.mock.calls[0][0];
      timeoutCallback();

      // Verify level transition completes
      expect(levelIndicator.style.opacity).toBe('0');
      expect(mockCreateBricks).toHaveBeenCalled();
      expect(mockResetBalls).toHaveBeenCalled();
      expect(showingLevelIndicator).toBe(false);

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });
});
