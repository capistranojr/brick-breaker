// Set up Jest environment
jest.mock('../audio-manager', () => {
  // Create a mock implementation of the Audio class before importing
  global.Audio = class {
    constructor() {
      this.src = '';
      this.volume = 0;
      this.error = null;
      this._eventListeners = {};
      this.addEventListener = jest.fn((event, callback) => {
        if (!this._eventListeners[event]) {
          this._eventListeners[event] = [];
        }
        this._eventListeners[event].push(callback);
      });
      this.cloneNode = jest.fn(() => {
        const clone = {
          src: this.src,
          volume: this.volume,
          play: jest.fn().mockResolvedValue()
        };
        return clone;
      });
      this.play = jest.fn().mockResolvedValue();
    }

    // Method to simulate an error without using DOM events
    simulateError() {
      this.error = new Error('Audio file not found');
      if (this._eventListeners && this._eventListeners.error) {
        this._eventListeners.error.forEach(callback => callback());
      }
    }
  };

  // Now require the real module
  const originalModule = jest.requireActual('../audio-manager');
  return originalModule;
});

// Import AudioManager for testing
const AudioManager = require('../audio-manager').AudioManager;

// Mock window.AudioContext
const mockCreateOscillator = jest.fn().mockReturnValue({
  connect: jest.fn(),
  frequency: {
    value: 0,
    linearRampToValueAtTime: jest.fn()
  },
  type: '',
  start: jest.fn(),
  stop: jest.fn()
});

const mockCreateGain = jest.fn().mockReturnValue({
  connect: jest.fn(),
  gain: { value: 0 }
});

// Save original window if it exists
const originalWindow = global.window;

// Create a mock window object that won't interfere with JSDOM
const mockWindow = {
  AudioContext: jest.fn().mockImplementation(() => ({
    createOscillator: mockCreateOscillator,
    createGain: mockCreateGain,
    currentTime: 0,
    destination: {}
  })),
  webkitAudioContext: jest.fn().mockImplementation(() => ({
    createOscillator: mockCreateOscillator,
    createGain: mockCreateGain,
    currentTime: 0,
    destination: {}
  }))
};

// Use Object.defineProperty to avoid conflicts with JSDOM
Object.defineProperty(global, 'window', {
  value: originalWindow ? { ...originalWindow, ...mockWindow } : mockWindow,
  writable: true
});

// Restore original window after all tests
afterAll(() => {
  if (originalWindow) {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    });
  }
});

describe('Audio Manager', () => {
  let audioManager;

  // Save original document methods at the suite level
  const originalGetElementById = document.getElementById;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock document methods safely
    document.getElementById = jest.fn().mockImplementation((id) => {
      // Return a mock element that won't cause JSDOM issues
      return {
        addEventListener: jest.fn(),
        textContent: '',
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      };
    });

    // Create a new AudioManager instance
    audioManager = new AudioManager();
  });

  // Restore original document methods after each test
  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  test('should initialize with default values', () => {
    expect(audioManager.sounds).toBeDefined();
    expect(audioManager.muted).toBe(false);
    expect(audioManager.volume).toBe(0.5);
  });

  test('loadSounds should create audio elements', () => {
    // Verify
    expect(Object.keys(audioManager.sounds).length).toBeGreaterThan(0);
  });

  test('play should play the requested sound', () => {
    // Setup
    const mockSound = {
      cloneNode: jest.fn().mockReturnValue({
        play: jest.fn().mockResolvedValue(),
        volume: 0
      }),
      error: null
    };
    audioManager.sounds.paddleHit = mockSound;

    // Execute
    audioManager.play('paddleHit');

    // Verify
    expect(mockSound.cloneNode).toHaveBeenCalled();
  });

  test('play should not play when muted', () => {
    // Setup
    audioManager.muted = true;
    const mockSound = {
      cloneNode: jest.fn().mockReturnValue({
        play: jest.fn().mockResolvedValue(),
        volume: 0
      }),
      error: null
    };
    audioManager.sounds.paddleHit = mockSound;

    // Execute
    audioManager.play('paddleHit');

    // Verify
    expect(mockSound.cloneNode).not.toHaveBeenCalled();
  });

  test('toggleMute should toggle mute state', () => {
    // Setup
    const muteButton = { textContent: '🔊', classList: { add: jest.fn(), remove: jest.fn() } };
    document.getElementById.mockReturnValue(muteButton);

    // Execute - mute
    audioManager.toggleMute();

    // Verify
    expect(audioManager.muted).toBe(true);
    expect(muteButton.textContent).toBe('🔇');
    expect(muteButton.classList.add).toHaveBeenCalledWith('muted');

    // Execute - unmute
    audioManager.toggleMute();

    // Verify
    expect(audioManager.muted).toBe(false);
    expect(muteButton.textContent).toBe('🔊');
    expect(muteButton.classList.remove).toHaveBeenCalledWith('muted');
  });

  test('setVolume should update volume for all sounds', () => {
    // Setup
    audioManager.sounds = {
      paddleHit: { volume: 0.5 },
      brickHit: { volume: 0.5 },
      brickBreak: { volume: 0.5 }
    };

    // Execute
    audioManager.setVolume(0.8);

    // Verify
    expect(audioManager.volume).toBe(0.8);
    expect(audioManager.sounds.paddleHit.volume).toBe(0.8);
    expect(audioManager.sounds.brickHit.volume).toBe(0.8);
    expect(audioManager.sounds.brickBreak.volume).toBe(0.8);
  });

  test('setVolume should clamp values between 0 and 1', () => {
    // Execute with value > 1
    audioManager.setVolume(1.5);

    // Verify
    expect(audioManager.volume).toBe(1);

    // Execute with value < 0
    audioManager.setVolume(-0.5);

    // Verify
    expect(audioManager.volume).toBe(0);
  });

  test('generateFallbackSound should create sound when audio file is missing', () => {
    // Setup
    audioManager.audioContext = {
      createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        frequency: {
          value: 0,
          linearRampToValueAtTime: jest.fn()
        },
        type: '',
        start: jest.fn(),
        stop: jest.fn()
      }),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { value: 0 }
      }),
      currentTime: 0,
      destination: {}
    };

    // Execute
    audioManager.generateFallbackSound('paddleHit');

    // Verify
    expect(audioManager.audioContext.createOscillator).toHaveBeenCalled();
    expect(audioManager.audioContext.createGain).toHaveBeenCalled();
  });

  test('should handle audio file errors and initialize fallback audio', () => {
    // Setup - spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Create a new AudioManager instance for this test
    const testAudioManager = new AudioManager();

    // Spy on the testAudioManager's initFallbackAudio method
    const initFallbackAudioSpy = jest.spyOn(testAudioManager, 'initFallbackAudio');

    // Manually call the error handler that would be triggered by the 'error' event
    // This avoids using the DOM event system
    const errorCallback = testAudioManager.sounds.paddleHit._eventListeners.error[0];
    testAudioManager.sounds.paddleHit.error = new Error('Audio file not found');

    // Call the error callback
    errorCallback();

    // Verify
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Audio file not found'));
    expect(initFallbackAudioSpy).toHaveBeenCalled();

    // Cleanup
    consoleWarnSpy.mockRestore();
    initFallbackAudioSpy.mockRestore();
  });

  test('initFallbackAudio should create an AudioContext', () => {
    // Setup - spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Execute
    audioManager.initFallbackAudio();

    // Verify
    expect(window.AudioContext).toHaveBeenCalled();
    expect(audioManager.audioContext).toBeDefined();
    expect(consoleLogSpy).toHaveBeenCalledWith('Using fallback audio generation');

    // Cleanup
    consoleLogSpy.mockRestore();
  });

  test('initFallbackAudio should handle errors', () => {
    // Setup - make AudioContext throw an error
    const originalAudioContext = window.AudioContext;
    window.AudioContext = jest.fn().mockImplementation(() => {
      throw new Error('AudioContext not supported');
    });

    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Execute
    audioManager.initFallbackAudio();

    // Verify
    expect(consoleWarnSpy).toHaveBeenCalledWith('Web Audio API not supported. Sound effects disabled.');

    // Cleanup
    window.AudioContext = originalAudioContext;
    consoleWarnSpy.mockRestore();
  });

  test('play should use fallback sound generation when sound file has an error', () => {
    // Setup
    audioManager.sounds.paddleHit.error = new Error('Audio file not found');
    audioManager.audioContext = {
      createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        frequency: {
          value: 0,
          linearRampToValueAtTime: jest.fn()
        },
        type: '',
        start: jest.fn(),
        stop: jest.fn()
      }),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { value: 0 }
      }),
      currentTime: 0,
      destination: {}
    };

    const generateFallbackSoundSpy = jest.spyOn(audioManager, 'generateFallbackSound');

    // Execute
    audioManager.play('paddleHit');

    // Verify
    expect(generateFallbackSoundSpy).toHaveBeenCalledWith('paddleHit');

    // Cleanup
    generateFallbackSoundSpy.mockRestore();
  });

  test('play should handle errors when playing sounds', () => {
    // Setup
    const mockSound = {
      cloneNode: jest.fn().mockReturnValue({
        play: jest.fn().mockRejectedValue(new Error('Play failed')),
        volume: 0
      }),
      error: null
    };
    audioManager.sounds.paddleHit = mockSound;

    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Execute
    audioManager.play('paddleHit');

    // Verify - need to wait for the promise rejection
    return new Promise(resolve => {
      setTimeout(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('Error playing sound:', expect.any(Error));
        consoleWarnSpy.mockRestore();
        resolve();
      }, 0);
    });
  });

  test('generateFallbackSound should do nothing if audioContext is not defined', () => {
    // Setup
    audioManager.audioContext = null;

    // Execute
    audioManager.generateFallbackSound('paddleHit');

    // Verify - no error should be thrown
    expect(audioManager.audioContext).toBeNull();
  });

  test('generateFallbackSound should handle all sound types', () => {
    // Setup
    const oscillator = {
      connect: jest.fn(),
      frequency: {
        value: 0,
        linearRampToValueAtTime: jest.fn()
      },
      type: '',
      start: jest.fn(),
      stop: jest.fn()
    };

    audioManager.audioContext = {
      createOscillator: jest.fn().mockReturnValue(oscillator),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { value: 0 }
      }),
      currentTime: 0,
      destination: {}
    };

    // Test all sound types
    const soundTypes = [
      'paddleHit', 'brickHit', 'brickBreak', 'wallHit',
      'powerupCollect', 'gameOver', 'levelComplete', 'multiball'
    ];

    for (const soundType of soundTypes) {
      // Reset oscillator properties
      oscillator.type = '';
      oscillator.frequency.value = 0;
      oscillator.frequency.linearRampToValueAtTime.mockClear();
      oscillator.start.mockClear();
      oscillator.stop.mockClear();

      // Execute
      audioManager.generateFallbackSound(soundType);

      // Verify
      expect(oscillator.start).toHaveBeenCalled();
      expect(oscillator.type).toBeDefined();
      expect(oscillator.frequency.value).toBeGreaterThan(0);

      // For sounds with frequency ramps
      if (['powerupCollect', 'gameOver', 'levelComplete', 'multiball'].includes(soundType)) {
        expect(oscillator.frequency.linearRampToValueAtTime).toHaveBeenCalled();
      }
    }
  });
});
