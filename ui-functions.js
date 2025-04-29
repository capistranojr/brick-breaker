// Import functions if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    var { loadHighScores, saveHighScore, resetGame } = require('./game-functions');
    
    // Mock global variables for testing
    global.score = 0;
    global.lives = 3;
    global.currentLevel = 1;
    global.gameStarted = false;
    global.gameOver = false;
    global.highScores = [];
    global.scoreElement = { textContent: '0' };
    global.livesElement = { textContent: '3' };
    global.finalScoreElement = { textContent: '0' };
    global.levelIndicator = { textContent: 'LEVEL 1', style: { opacity: '0' } };
    global.gameMenu = { style: { display: 'flex' } };
    global.gameOverScreen = { style: { display: 'none' } };
    global.highScoresScreen = { style: { display: 'none' } };
    global.highScoresList = { innerHTML: '' };
    global.showingLevelIndicator = false;
    global.audioManager = { play: () => {} };
    global.createParticles = () => {};
    global.gameLoop = () => {};
    global.animationId = 0;
    global.cancelAnimationFrame = () => {};
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Update lives display
function updateLives() {
    livesElement.textContent = lives;
}

// Update level indicator
function updateLevelIndicator() {
    levelIndicator.textContent = `LEVEL ${currentLevel}`;
}

// Show high scores
function showHighScores() {
    // Populate high scores list
    highScoresList.innerHTML = '';
    
    if (highScores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No high scores yet!';
        highScoresList.appendChild(li);
    } else {
        for (let i = 0; i < highScores.length; i++) {
            const li = document.createElement('li');
            const scoreSpan = document.createElement('span');
            const dateSpan = document.createElement('span');
            
            scoreSpan.textContent = highScores[i].score;
            dateSpan.textContent = highScores[i].date;
            
            li.appendChild(scoreSpan);
            li.appendChild(dateSpan);
            highScoresList.appendChild(li);
        }
    }
    
    // Show high scores screen
    highScoresScreen.style.display = 'flex';
}

// Close high scores
function closeHighScores() {
    highScoresScreen.style.display = 'none';
}

// Quit game
function quitGame() {
    // Return to main menu
    gameOverScreen.style.display = 'none';
    gameMenu.style.display = 'flex';
    
    // Reset game state
    gameOver = false;
    gameStarted = false;
    resetGame();
    
    // Cancel any animations
    cancelAnimationFrame(animationId);
}

// Start game
function startGame() {
    gameMenu.style.display = 'none';
    gameStarted = true;
    gameLoop();
}

// Restart game
function restartGame() {
    gameOverScreen.style.display = 'none';
    gameOver = false;
    resetGame();
    gameStarted = true;
    gameLoop();
}

// Show level transition
function showLevelTransition() {
    showingLevelIndicator = true;
    levelIndicator.textContent = `LEVEL ${currentLevel}`;
    levelIndicator.style.opacity = '1';
    
    // Play level complete sound
    audioManager.play('levelComplete');
    
    // Create celebration particles
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * (typeof canvas !== 'undefined' ? canvas.width : 800);
        const y = Math.random() * (typeof canvas !== 'undefined' ? canvas.height : 600);
        const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        createParticles(x, y, 3, color);
    }
    
    // Hide level indicator and create new level after delay
    setTimeout(() => {
        levelIndicator.style.opacity = '0';
        createBricks();
        resetBalls();
        showingLevelIndicator = false;
    }, LEVEL_TRANSITION_TIME);
}

// End game
function endGame() {
    gameOver = true;
    gameStarted = false;
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'flex';
    cancelAnimationFrame(animationId);
    
    // Play game over sound
    audioManager.play('gameOver');
    
    // Check if score is a high score
    if (highScores.length < MAX_HIGH_SCORES || score > highScores[highScores.length - 1].score) {
        saveHighScore(score);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateScore,
        updateLives,
        updateLevelIndicator,
        showHighScores,
        closeHighScores,
        quitGame,
        startGame,
        restartGame,
        showLevelTransition,
        endGame
    };
}
