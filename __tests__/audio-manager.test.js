// Import AudioManager for testing
const AudioManager = require('../audio-manager').AudioManager;

describe('Audio Manager', () => {
  let audioManager;
  
  beforeEach(() => {
    // Reset DOM elements
    document.getElementById = jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn(),
      textContent: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    }));
    
    // Create a new AudioManager instance
    audioManager = new AudioManager();
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
});
