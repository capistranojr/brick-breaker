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

// Game variables
let canvas, ctx;
let balls = []; // Array of balls for multiball
let paddle;
let bricks = [];
let powerups = [];
let particles = [];
let score = 0;
let lives = 3;
let gameStarted = false;
let gameOver = false;
let animationId;
let currentLevel = 1;
let highScores = [];
let showingLevelIndicator = false;

// DOM elements
const gameMenu = document.getElementById('gameMenu');
const gameOverScreen = document.getElementById('gameOver');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('finalScore');
const highScoresScreen = document.getElementById('highScores');
const highScoresList = document.getElementById('highScoresList');
const highScoresButton = document.getElementById('highScoresButton');
const highScoresButtonEnd = document.getElementById('highScoresButtonEnd');
const closeHighScoresButton = document.getElementById('closeHighScores');
const levelIndicator = document.getElementById('levelIndicator');
const resetScoresButton = document.getElementById('resetScoresButton');
const quitButton = document.getElementById('quitButton');

// Event listeners
window.addEventListener('load', init);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
highScoresButton.addEventListener('click', showHighScores);
highScoresButtonEnd.addEventListener('click', showHighScores);
closeHighScoresButton.addEventListener('click', closeHighScores);
resetScoresButton.addEventListener('click', resetHighScores);
quitButton.addEventListener('click', quitGame);

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Load high scores from local storage
    loadHighScores();

    // Initialize game objects
    resetGame();

    // Add mouse/touch event listeners
    canvas.addEventListener('mousemove', movePaddle);
    canvas.addEventListener('touchmove', movePaddleTouch);

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Reset game state
function resetGame() {
    // Clear balls array and create initial ball
    balls = [];
    createBall();

    // Create paddle
    paddle = {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: canvas.height - 30,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: NEON_COLORS[1],
        dx: 0
    };

    // Create bricks
    createBricks();

    // Reset game variables
    powerups = [];
    particles = [];
    score = 0;
    updateScore();
    lives = 3;
    updateLives();
    currentLevel = 1;
    updateLevelIndicator();
}

// Create a new ball
function createBall(x, y) {
    const newBall = {
        x: x || canvas.width / 2,
        y: y || canvas.height - 50,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: -BALL_SPEED,
        radius: BALL_RADIUS,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        trail: []
    };

    balls.push(newBall);
    return newBall;
}

// Create brick layout
function createBricks() {
    bricks = [];
    const brickWidth = (canvas.width - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;

    // Different patterns based on level
    let pattern;
    switch (currentLevel % 3) {
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
    if (currentLevel > 1) {
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

// Start the game
function startGame() {
    gameMenu.style.display = 'none';
    gameStarted = true;
    gameLoop();
}

// Restart the game
function restartGame() {
    gameOverScreen.style.display = 'none';
    gameOver = false;
    resetGame();
    gameStarted = true;
    gameLoop();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw game objects
    updateBalls();
    updatePaddle();
    updatePowerups();
    updateParticles();

    drawBalls();
    drawPaddle();
    drawBricks();
    drawPowerups();
    drawParticles();

    // Check for level completion
    if (bricks.length === 0 && !showingLevelIndicator) {
        // Level completed
        currentLevel++;
        updateLevelIndicator();
        showLevelTransition();
    }

    // Continue animation if game is active
    if (gameStarted && !gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
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
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
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

// Update all balls
function updateBalls() {
    // If no balls left, lose a life
    if (balls.length === 0) {
        lives--;
        updateLives();

        if (lives <= 0) {
            endGame();
        } else {
            resetBalls();
            audioManager.play('gameOver');
        }
        return;
    }

    // Update each ball
    for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];

        // Add position to trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 5) {
            ball.trail.shift();
        }

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx = -ball.dx;
            createParticles(ball.x, ball.y, 10, ball.color);
            audioManager.play('wallHit');
        }

        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
            createParticles(ball.x, ball.y, 10, ball.color);
            audioManager.play('wallHit');
        }

        // Bottom wall collision (remove ball)
        if (ball.y + ball.radius > canvas.height) {
            // Remove this ball
            balls.splice(j, 1);
            j--;
            continue;
        }

        // Paddle collision
        if (ball.y + ball.radius > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width &&
            ball.y < paddle.y + paddle.height) {

            // Calculate bounce angle based on where ball hit the paddle
            const hitPosition = (ball.x - paddle.x) / paddle.width;
            const angle = hitPosition * Math.PI - Math.PI / 2;

            ball.dx = BALL_SPEED * Math.cos(angle);
            ball.dy = -BALL_SPEED * Math.abs(Math.sin(angle));

            createParticles(ball.x, ball.y, 5, paddle.color);
            audioManager.play('paddleHit');
        }

        // Brick collision
        let brickHit = false;
        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            if (brick.broken) continue;

            if (ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height) {

                // Determine collision direction
                const hitLeft = ball.x < brick.x;
                const hitRight = ball.x > brick.x + brick.width;
                const hitTop = ball.y < brick.y;
                const hitBottom = ball.y > brick.y + brick.height;

                if ((hitLeft || hitRight) && !(hitTop || hitBottom)) {
                    ball.dx = -ball.dx;
                } else {
                    ball.dy = -ball.dy;
                }

                // Reduce brick health
                brick.health--;

                if (brick.health <= 0) {
                    brick.broken = true;
                    score += 10;
                    updateScore();

                    // Create particles
                    createParticles(ball.x, ball.y, 20, brick.color);

                    // Play brick break sound
                    audioManager.play('brickBreak');

                    // Chance to spawn powerup
                    if (Math.random() < POWERUP_CHANCE) {
                        spawnPowerup(brick.x + brick.width / 2, brick.y + brick.height / 2);
                    }

                    // Remove brick
                    bricks.splice(i, 1);
                    i--;
                } else {
                    // Play brick hit sound
                    audioManager.play('brickHit');
                }

                brickHit = true;
                break;
            }
        }
    }
}

// Reset all balls
function resetBalls() {
    balls = [];
    createBall();
}

// Update paddle position
function updatePaddle() {
    paddle.x += paddle.dx;

    // Keep paddle within canvas
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }

    // Apply friction to paddle movement
    paddle.dx *= 0.9;
}

// Move paddle with mouse
function movePaddle(e) {
    if (!gameStarted) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    paddle.x = mouseX - paddle.width / 2;
}

// Move paddle with touch
function movePaddleTouch(e) {
    if (!gameStarted) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    paddle.x = touchX - paddle.width / 2;
}

// Spawn a powerup
function spawnPowerup(x, y) {
    const types = ['extraLife', 'expandPaddle', 'multiball', 'slowBall'];
    const type = types[Math.floor(Math.random() * types.length)];

    let color;
    switch (type) {
        case 'extraLife': color = '#ff00ff'; break;
        case 'expandPaddle': color = '#00ffff'; break;
        case 'multiball': color = '#00ff00'; break;
        case 'slowBall': color = '#ffff00'; break;
    }

    powerups.push({
        x: x,
        y: y,
        size: POWERUP_SIZE,
        speed: POWERUP_SPEED,
        type: type,
        color: color,
        rotation: 0
    });
}

// Update powerups
function updatePowerups() {
    for (let i = 0; i < powerups.length; i++) {
        const powerup = powerups[i];

        // Move powerup down
        powerup.y += powerup.speed;
        powerup.rotation += 0.05;

        // Check for paddle collision
        if (powerup.y + powerup.size > paddle.y &&
            powerup.x > paddle.x &&
            powerup.x < paddle.x + paddle.width &&
            powerup.y < paddle.y + paddle.height) {

            // Apply powerup effect
            applyPowerup(powerup.type);

            // Remove powerup
            powerups.splice(i, 1);
            i--;
            continue;
        }

        // Remove if out of bounds
        if (powerup.y > canvas.height) {
            powerups.splice(i, 1);
            i--;
        }
    }
}

// Apply powerup effect
function applyPowerup(type) {
    // Play powerup sound
    audioManager.play('powerupCollect');

    switch (type) {
        case 'extraLife':
            lives++;
            updateLives();
            break;
        case 'expandPaddle':
            paddle.width = Math.min(paddle.width * 1.5, canvas.width / 2);
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
                audioManager.play('multiball');
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
    createParticles(paddle.x + paddle.width / 2, paddle.y, 30, '#ffffff');
}

// Create particles
function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;

        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            color: color,
            life: 30
        });
    }
}

// Update particles
function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Reduce life
        particle.life--;

        // Remove if dead
        if (particle.life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

// Draw all balls
function drawBalls() {
    for (let j = 0; j < balls.length; j++) {
        const ball = balls[j];

        // Draw trail
        for (let i = 0; i < ball.trail.length; i++) {
            const alpha = i / ball.trail.length;
            ctx.beginPath();
            ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.radius * alpha, 0, Math.PI * 2);
            ctx.fillStyle = ball.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fill();
            ctx.closePath();
        }

        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = ball.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.closePath();
    }
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = paddle.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (brick.broken) continue;

        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        ctx.fillStyle = brick.color;

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = brick.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw health indicator
        if (brick.health > 1) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.closePath();
    }
}

// Draw powerups
function drawPowerups() {
    for (let i = 0; i < powerups.length; i++) {
        const powerup = powerups[i];

        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.rotate(powerup.rotation);

        // Draw powerup
        ctx.beginPath();
        ctx.rect(-powerup.size / 2, -powerup.size / 2, powerup.size, powerup.size);
        ctx.fillStyle = powerup.color;

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = powerup.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.closePath();
        ctx.restore();
    }
}

// Draw particles
function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor((particle.life / 30) * 255).toString(16).padStart(2, '0');

        // Add glow effect
        ctx.shadowBlur = 5;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.closePath();
    }
}

// Handle window resize
function handleResize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Adjust paddle position
    paddle.y = canvas.height - 30;

    // Redraw everything
    if (!gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle();
        drawBricks();
    }
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

// High score functions
function loadHighScores() {
    const savedScores = localStorage.getItem('neonBreakerHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    } else {
        highScores = [];
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
    localStorage.setItem('neonBreakerHighScores', JSON.stringify(highScores));
}

function resetHighScores() {
    // Clear high scores
    highScores = [];
    localStorage.removeItem('neonBreakerHighScores');

    // Show confirmation
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'score-reset-confirmation';
    confirmationDiv.textContent = 'High scores reset!';
    document.querySelector('.game-container').appendChild(confirmationDiv);

    // Play sound effect
    audioManager.play('powerupCollect');

    // Remove confirmation after delay
    setTimeout(() => {
        confirmationDiv.style.opacity = '0';
        setTimeout(() => {
            confirmationDiv.remove();
        }, 500);
    }, 2000);
}

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

function closeHighScores() {
    highScoresScreen.style.display = 'none';
}

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
