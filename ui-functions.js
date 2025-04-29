// Import constants and functions if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    var { NEON_COLORS, MAX_HIGH_SCORES, LEVEL_TRANSITION_TIME } = require('./game-constants');
    var { loadHighScores, saveHighScore, resetGame, createBricks, resetBalls } = require('./game-functions');

    // Make sure these functions are available in the global scope for testing
    global.resetGame = resetGame;
    global.saveHighScore = saveHighScore;
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
    global.NEON_COLORS = NEON_COLORS;
    global.MAX_HIGH_SCORES = MAX_HIGH_SCORES;
    global.LEVEL_TRANSITION_TIME = LEVEL_TRANSITION_TIME;
}

// Update score display
function updateScore() {
    scoreElement.textContent = String(score);
}

// Update lives display
function updateLives() {
    livesElement.textContent = String(lives);
}

// Update level indicator
function updateLevelIndicator() {
    levelIndicator.textContent = `LEVEL ${currentLevel}`;
}

// Show high scores
function showHighScores() {
    // Populate high scores list
    if (highScoresList && typeof highScoresList.innerHTML === 'string') {
        highScoresList.innerHTML = '';
    }

    // Check if we're in a browser environment with DOM
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
        if (highScores.length === 0) {
            try {
                const li = document.createElement('li');
                li.textContent = 'No high scores yet!';

                // Make sure appendChild exists before calling it
                if (highScoresList && typeof highScoresList.appendChild === 'function') {
                    highScoresList.appendChild(li);
                }
            } catch (e) {
                console.error('Error creating high score element:', e);
            }
        } else {
            for (let i = 0; i < highScores.length; i++) {
                try {
                    const li = document.createElement('li');
                    const scoreSpan = document.createElement('span');
                    const dateSpan = document.createElement('span');

                    scoreSpan.textContent = highScores[i].score;
                    dateSpan.textContent = highScores[i].date;

                    // Make sure appendChild exists before calling it
                    if (li && typeof li.appendChild === 'function') {
                        li.appendChild(scoreSpan);
                        li.appendChild(dateSpan);
                    }

                    if (highScoresList && typeof highScoresList.appendChild === 'function') {
                        highScoresList.appendChild(li);
                    }
                } catch (e) {
                    console.error('Error creating high score element:', e);
                }
            }
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

    // Call resetGame if it exists
    if (typeof resetGame === 'function') {
        resetGame();
    }

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

    // Call resetGame if it exists
    if (typeof resetGame === 'function') {
        resetGame();
    }

    gameStarted = true;
    gameLoop();
}

// Show level transition
function showLevelTransition() {
    // Always set the flag to true, regardless of whether it's defined
    showingLevelIndicator = true;

    levelIndicator.textContent = `LEVEL ${currentLevel}`;
    levelIndicator.style.opacity = '1'; // Ensure this is a string

    // Play level complete sound
    audioManager.play('levelComplete');

    // Create celebration particles
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * (typeof canvas !== 'undefined' ? canvas.width : 800);
        const y = Math.random() * (typeof canvas !== 'undefined' ? canvas.height : 600);

        // Use default colors if NEON_COLORS is not defined
        let color;
        if (typeof NEON_COLORS !== 'undefined' && Array.isArray(NEON_COLORS)) {
            color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        } else {
            // Default neon colors
            const defaultColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#9900ff'];
            color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
        }

        if (typeof createParticles === 'function') {
            createParticles(x, y, 3, color);
        }
    }

    // Hide level indicator and create new level after delay
    setTimeout(() => {
        levelIndicator.style.opacity = '0';
        if (typeof createBricks === 'function') createBricks();
        if (typeof resetBalls === 'function') resetBalls();

        // Always reset the flag, regardless of whether it's defined
        showingLevelIndicator = false;
    }, typeof LEVEL_TRANSITION_TIME !== 'undefined' ? LEVEL_TRANSITION_TIME : 2000);
}

// End game
function endGame() {
    gameOver = true;
    gameStarted = false;
    finalScoreElement.textContent = String(score);
    gameOverScreen.style.display = 'flex';
    cancelAnimationFrame(animationId);

    // Play game over sound
    audioManager.play('gameOver');

    // Check if score is a high score
    const maxScores = typeof MAX_HIGH_SCORES !== 'undefined' ? MAX_HIGH_SCORES : 5;
    if (highScores.length < maxScores || (highScores.length > 0 && score > highScores[highScores.length - 1].score)) {
        // Make sure saveHighScore is a function before calling it
        if (typeof saveHighScore === 'function') {
            saveHighScore(score);
        }
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
