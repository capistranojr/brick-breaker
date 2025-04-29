// Import constants if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    var {
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
    } = require('./game-constants');
    
    // Mock global variables for testing
    global.balls = [];
    global.bricks = [];
    global.paddle = { width: PADDLE_WIDTH };
    global.lives = 3;
    global.score = 0;
    global.highScores = [];
    global.powerups = [];
    global.audioManager = { play: () => {} };
}

// Create a new ball
function createBall(x, y) {
    const newBall = {
        x: x || (typeof canvas !== 'undefined' ? canvas.width / 2 : 400),
        y: y || (typeof canvas !== 'undefined' ? canvas.height - 50 : 550),
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: -BALL_SPEED,
        radius: BALL_RADIUS,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        trail: []
    };
    
    balls.push(newBall);
    return newBall;
}

// Reset all balls
function resetBalls() {
    balls = [];
    createBall();
}

// Create brick layout
function createBricks() {
    bricks = [];
    const brickWidth = (typeof canvas !== 'undefined' ? 
        (canvas.width - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS : 
        50);

    // Different patterns based on level
    let pattern;
    switch ((typeof currentLevel !== 'undefined' ? currentLevel : 1) % 3) {
        case 1: // Standard pattern
            pattern = standardPattern;
            break;
        case 2: // Checkerboard pattern
            pattern = checkerboardPattern;
            break;
        case 0: // Pyramid pattern
            pattern = pyramidPattern;
            break;
    }
    
    pattern(brickWidth);
    
    // Play level start sound
    if (typeof currentLevel !== 'undefined' && currentLevel > 1 && typeof audioManager !== 'undefined') {
        audioManager.play('levelComplete');
    }
}

// Standard brick pattern
function standardPattern(brickWidth) {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
            bricks.push({
                x: BRICK_GAP + col * (brickWidth + BRICK_GAP),
                y: BRICK_GAP + row * (BRICK_HEIGHT + BRICK_GAP) + 40,
                width: brickWidth,
                height: BRICK_HEIGHT,
                color: NEON_COLORS[colorIndex],
                health: row < 2 ? 2 : 1, // Top two rows have 2 health
                broken: false
            });
        }
    }
}

// Checkerboard brick pattern
function checkerboardPattern(brickWidth) {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            // Skip every other brick in a checkerboard pattern
            if ((row + col) % 2 === 0) {
                const colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
                bricks.push({
                    x: BRICK_GAP + col * (brickWidth + BRICK_GAP),
                    y: BRICK_GAP + row * (BRICK_HEIGHT + BRICK_GAP) + 40,
                    width: brickWidth,
                    height: BRICK_HEIGHT,
                    color: NEON_COLORS[colorIndex],
                    health: 2, // All bricks have 2 health in this pattern
                    broken: false
                });
            }
        }
    }
}

// Pyramid brick pattern
function pyramidPattern(brickWidth) {
    for (let row = 0; row < BRICK_ROWS; row++) {
        // Calculate how many bricks to skip on each side for this row
        const skipCount = Math.floor((BRICK_ROWS - row - 1) / 2);
        
        for (let col = 0; col < BRICK_COLS; col++) {
            // Skip bricks at the edges to create a pyramid shape
            if (col >= skipCount && col < BRICK_COLS - skipCount) {
                const colorIndex = Math.floor(Math.random() * NEON_COLORS.length);
                bricks.push({
                    x: BRICK_GAP + col * (brickWidth + BRICK_GAP),
                    y: BRICK_GAP + row * (BRICK_HEIGHT + BRICK_GAP) + 40,
                    width: brickWidth,
                    height: BRICK_HEIGHT,
                    color: NEON_COLORS[colorIndex],
                    health: BRICK_ROWS - row, // Health increases toward the top
                    broken: false
                });
            }
        }
    }
}

// Check collision between ball and brick
function checkCollision(ball, brick) {
    return (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height &&
        !brick.broken
    );
}

// Apply powerup effect
function applyPowerup(type) {
    // Play powerup sound
    if (typeof audioManager !== 'undefined') {
        audioManager.play('powerupCollect');
    }
    
    switch (type) {
        case 'extraLife':
            lives++;
            if (typeof updateLives === 'function') {
                updateLives();
            }
            break;
        case 'expandPaddle':
            paddle.width = Math.min(paddle.width * 1.5, typeof canvas !== 'undefined' ? canvas.width / 2 : 400);
            setTimeout(() => {
                paddle.width = PADDLE_WIDTH;
            }, 10000);
            break;
        case 'multiball':
            // Implement multiball - add two more balls
            if (balls.length > 0) {
                const mainBall = balls[0];
                
                // Create two new balls at slightly different angles
                createBall(mainBall.x, mainBall.y);
                createBall(mainBall.x, mainBall.y);
                
                // Adjust angles to spread them out
                balls[balls.length - 2].dx = BALL_SPEED * Math.cos(Math.PI / 4);
                balls[balls.length - 2].dy = -BALL_SPEED * Math.sin(Math.PI / 4);
                
                balls[balls.length - 1].dx = BALL_SPEED * Math.cos(3 * Math.PI / 4);
                balls[balls.length - 1].dy = -BALL_SPEED * Math.sin(3 * Math.PI / 4);
                
                // Play multiball sound
                if (typeof audioManager !== 'undefined') {
                    audioManager.play('multiball');
                }
            }
            break;
        case 'slowBall':
            // Slow down all balls
            for (let i = 0; i < balls.length; i++) {
                balls[i].dx = balls[i].dx * 0.5;
                balls[i].dy = balls[i].dy * 0.5;
            }
            
            setTimeout(() => {
                for (let i = 0; i < balls.length; i++) {
                    balls[i].dx = balls[i].dx * 2;
                    balls[i].dy = balls[i].dy * 2;
                }
            }, 8000);
            break;
    }
    
    // Create particles for powerup effect
    if (typeof createParticles === 'function') {
        createParticles(paddle.x + paddle.width / 2, paddle.y, 30, '#ffffff');
    }
}

// High score functions
function loadHighScores() {
    if (typeof localStorage !== 'undefined') {
        const savedScores = localStorage.getItem('neonBreakerHighScores');
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        } else {
            highScores = [];
        }
    }
}

function saveHighScore(newScore) {
    // Add new score
    highScores.push({ score: newScore, date: new Date().toLocaleDateString() });
    
    // Sort high scores (highest first)
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 5 scores
    if (highScores.length > MAX_HIGH_SCORES) {
        highScores = highScores.slice(0, MAX_HIGH_SCORES);
    }
    
    // Save to local storage
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('neonBreakerHighScores', JSON.stringify(highScores));
    }
}

function resetHighScores() {
    // Clear high scores
    highScores = [];
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('neonBreakerHighScores');
    }
    
    // Show confirmation
    if (typeof document !== 'undefined') {
        const confirmationDiv = document.createElement('div');
        confirmationDiv.className = 'score-reset-confirmation';
        confirmationDiv.textContent = 'High scores reset!';
        document.querySelector('.game-container').appendChild(confirmationDiv);
        
        // Play sound effect
        if (typeof audioManager !== 'undefined') {
            audioManager.play('powerupCollect');
        }
        
        // Remove confirmation after delay
        setTimeout(() => {
            confirmationDiv.style.opacity = '0';
            setTimeout(() => {
                confirmationDiv.remove();
            }, 500);
        }, 2000);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
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
    };
}
