// Import UI functions for testing
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
      global.highScoresList = { innerHTML: '' };
      global.highScoresScreen = { style: { display: 'none' } };
      
      // Execute
      showHighScores();
      
      // Verify
      expect(highScoresScreen.style.display).toBe('flex');
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
      global.resetGame = jest.fn();
      global.gameStarted = false;
      global.gameLoop = jest.fn();
      
      // Execute
      restartGame();
      
      // Verify
      expect(gameOverScreen.style.display).toBe('none');
      expect(gameOver).toBe(false);
      expect(resetGame).toHaveBeenCalled();
      expect(gameStarted).toBe(true);
      expect(gameLoop).toHaveBeenCalled();
    });
    
    test('quitGame should return to main menu', () => {
      // Setup
      global.gameOverScreen = { style: { display: 'flex' } };
      global.gameMenu = { style: { display: 'none' } };
      global.gameOver = true;
      global.gameStarted = true;
      global.resetGame = jest.fn();
      global.cancelAnimationFrame = jest.fn();
      
      // Execute
      quitGame();
      
      // Verify
      expect(gameOverScreen.style.display).toBe('none');
      expect(gameMenu.style.display).toBe('flex');
      expect(gameOver).toBe(false);
      expect(gameStarted).toBe(false);
      expect(resetGame).toHaveBeenCalled();
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
      global.saveHighScore = jest.fn();
      
      // Execute
      endGame();
      
      // Verify
      expect(gameOver).toBe(true);
      expect(gameStarted).toBe(false);
      expect(finalScoreElement.textContent).toBe('250');
      expect(gameOverScreen.style.display).toBe('flex');
      expect(cancelAnimationFrame).toHaveBeenCalled();
      expect(audioManager.play).toHaveBeenCalledWith('gameOver');
      expect(saveHighScore).toHaveBeenCalledWith(250);
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
      jest.useFakeTimers();
      
      // Execute
      showLevelTransition();
      
      // Verify
      expect(showingLevelIndicator).toBe(true);
      expect(levelIndicator.textContent).toBe('LEVEL 2');
      expect(levelIndicator.style.opacity).toBe('1');
      expect(audioManager.play).toHaveBeenCalledWith('levelComplete');
      
      // Fast-forward time
      jest.advanceTimersByTime(2000);
      
      // Verify level transition completes
      expect(levelIndicator.style.opacity).toBe('0');
      
      jest.useRealTimers();
    });
  });
});
