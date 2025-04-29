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

This project includes unit tests using Jest. To run the tests, you'll need to have Node.js installed.

### Installing Node.js

1. Download Node.js from the official website: https://nodejs.org/
2. Run the installer and follow the installation wizard
3. Make sure to check the option to "Automatically install the necessary tools"
4. After installation, open a new command prompt or PowerShell window
5. Verify the installation by running:
   ```
   node --version
   npm --version
   ```

### Running Tests

Once Node.js is installed:

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

4. View test coverage:
   ```
   npm test -- --coverage
   ```

### Test Coverage

The test suite covers:
- Game mechanics (ball movement, collision detection, brick patterns)
- UI components (score display, level transitions, game state management)
- Audio manager (sound playback, mute functionality)
- High score system (saving and loading scores)

### Troubleshooting Tests

If you encounter errors when running tests:

1. Make sure Node.js is properly installed
2. Try deleting the `node_modules` folder and running `npm install` again
3. Check for any syntax errors in the test files
4. Ensure all dependencies are correctly installed

#### Common Test Issues and Solutions

- **TypeError: X is not a function**: This usually means a function is not properly mocked or imported. Make sure to mock all external functions and import them correctly in your tests. Always check if a function exists before calling it with `if (typeof myFunction === 'function')`.

- **Missing DOM methods**: When testing code that interacts with the DOM, create detailed mocks for DOM elements and their methods (like `appendChild`). Use try/catch blocks to handle potential DOM errors gracefully.

- **Mock function not being called**: Make sure to clear mock history before each test with `jest.clearAllMocks()` in a `beforeEach` hook. Use separate mock function variables and assign them to global variables in your tests.

- **Proper mocking order**: Define your mock functions before importing the modules that use them. This ensures the mocks are in place when the code is loaded.

- **Testing asynchronous code**: When testing code with setTimeout, don't execute the callback immediately. Instead, capture the callback and execute it manually after checking the initial state. This allows you to verify both the initial state and the final state.

#### Common Test Issues

- **ReferenceError: X is not defined**: This usually means a constant or variable is missing in the test environment. Make sure all required variables are properly imported or defined in the test file.

- **Expected function to have been called**: If you're testing functions that use timers (setTimeout, setInterval), you may need to mock these functions to properly test the callbacks. See the tests for examples of how to handle this.

- **Nested timeouts**: When testing code with nested setTimeout calls, you need to capture and execute callbacks in the correct order. The resetHighScores test demonstrates how to handle this pattern.

- **TypeError: Cannot read property of undefined**: Check that all objects and their properties are properly initialized in your test setup.

- **Type mismatches in expectations**: When testing DOM updates, remember that numeric values are often converted to strings. Use `String(value)` in your expectations to match the actual behavior. Also, ensure your implementation explicitly converts values to strings with `String()`.

- **Missing mock functions**: When testing code that depends on imported functions, use `jest.mock()` to mock those dependencies. Create separate mock function variables to have better control over them in your tests.

- **Mock function access**: When using Jest's mock functions, make sure to use the mock function variables directly in your expectations, not the global variables that might be overridden.

- **Testing browser APIs**: When testing code that uses browser APIs like Audio or Web Audio API, create comprehensive mocks that simulate the behavior of these APIs. Use spies to verify that error handlers and callbacks are called correctly. Avoid using the actual DOM event system in tests to prevent JSDOM errors.

- **Testing error handling**: Use spies on console methods (like `console.warn` or `console.error`) to verify that error handling code works correctly. Remember to restore these spies after each test.

- **Testing edge cases**: Test what happens when dependencies are missing or undefined. Use techniques like `delete global.someVariable` to simulate missing dependencies, then restore them after the test.

- **Testing all branches**: Make sure to test all branches in conditional statements. For example, if a function behaves differently based on a level number, test all possible levels.

- **Testing localStorage**: Mock the localStorage API to test functions that read from or write to localStorage. This allows you to verify that the correct data is being stored and retrieved.

- **JSDOM compatibility**: When testing code that interacts with the DOM, be careful with event handling. Use proper cleanup in `afterEach` and `afterAll` hooks to restore original objects and methods. Avoid direct manipulation of JSDOM internals.

- **Jest timer mocking**: Use Jest's built-in timer mocking (`jest.useFakeTimers()`, `jest.runAllTimers()`, `jest.advanceTimersByTime()`) instead of manually mocking `setTimeout`. This is more reliable and avoids conflicts with JSDOM.

- **Explicit mock clearing**: Always explicitly clear mocks with `mockFunction.mockClear()` in `beforeEach` hooks, especially when the same mock is used across multiple tests. Don't rely solely on `jest.clearAllMocks()` as it might not clear all mocks in complex test environments.

- **Ensure proper mock setup**: Reassign mocks to global variables in each test or beforeEach hook to ensure they're properly set up. For example, `global.audioManager = { play: mockAudioPlay }` ensures the mock is correctly connected to the global object.

- **Reset mocks between assertions**: When a test contains multiple assertions that verify the same mock was called with different arguments, explicitly clear the mock between assertions with `mockFunction.mockClear()`. This prevents previous calls from affecting later assertions.

- **Spy on the correct object instance**: When using Jest spies, make sure to spy on the same object instance that will be used in the test. For example, if you create a new instance of a class in your test, spy on methods of that specific instance, not on methods of a different instance.

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
