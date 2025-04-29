# Neon Brick Breaker

A modern take on the classic brick breaker game with neon visuals, cool animations, and exciting power-ups.

![Neon Brick Breaker Game](screenshot.png)

## Features

- **Neon Visual Style**: Vibrant colors with glowing effects
- **Multiple Levels**: Progress through different brick patterns with increasing difficulty
- **Power-ups System**: Collect various power-ups to enhance gameplay:
  - Extra Life: Adds an additional life
  - Expand Paddle: Temporarily increases paddle size
  - Multiball: Adds two additional balls
  - Slow Ball: Temporarily slows down ball movement
- **High Score System**: Stores the top 5 scores in browser local storage
- **Sound Effects**: Dynamic audio feedback for game actions
- **Responsive Design**: Adapts to different screen sizes

## How to Play

1. Use your mouse or touch to move the paddle left and right
2. Break all the bricks to advance to the next level
3. Collect falling power-ups for special abilities
4. Try to achieve a high score
5. You lose a life when all balls fall below the paddle
6. Game ends when you run out of lives

## Controls

- **Mouse Movement**: Move the paddle
- **Touch**: Slide to move the paddle (mobile devices)
- **Sound Button**: Toggle sound on/off

## Game Screens

- **Home Screen**: Start a new game or reset high scores
- **Game Screen**: Main gameplay area with score and lives display
- **Game Over Screen**: Shows final score with options to play again, view high scores, or quit

## Running the Game

1. Clone this repository or download the files
2. Open the project folder
3. Start a local server:
   ```
   powershell -ExecutionPolicy Bypass -File serve.ps1
   ```
4. Open your browser and navigate to `http://localhost:8000`

Alternatively, you can use any web server of your choice to serve the files.

## Testing

This project includes unit tests using Jest. To run the tests:

1. Install dependencies:
   ```
   npm install
   ```

2. Run tests:
   ```
   npm test
   ```

3. Run tests in watch mode (for development):
   ```
   npm run test:watch
   ```

The test suite covers:
- Game mechanics (ball movement, collision detection, brick patterns)
- UI components (score display, level transitions, game state management)
- Audio manager (sound playback, mute functionality)
- High score system (saving and loading scores)

## Technologies Used

- HTML5 Canvas for rendering
- CSS3 for styling and animations
- JavaScript for game logic
- Web Audio API for sound effects
- Local Storage API for saving high scores
- Jest for unit testing

## Future Enhancements

- Additional power-ups
- More level designs
- Background music
- Mobile-optimized controls
- Online leaderboard

## Credits

Created by [Your Name]

## License

This project is licensed under the MIT License - see the LICENSE file for details.
