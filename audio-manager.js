// Audio Manager for Neon Brick Breaker
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.volume = 0.5;

        // Initialize sounds
        this.loadSounds();

        // Add event listener for mute button if in browser environment
        if (typeof document !== 'undefined') {
            const muteButton = document.getElementById('muteButton');
            if (muteButton) {
                muteButton.addEventListener('click', () => this.toggleMute());
            }
        }
    }

    // Load all sound effects
    loadSounds() {
        const soundFiles = {
            paddleHit: 'assets/audio/paddle_hit.mp3',
            brickHit: 'assets/audio/brick_hit.mp3',
            brickBreak: 'assets/audio/brick_break.mp3',
            wallHit: 'assets/audio/wall_hit.mp3',
            powerupCollect: 'assets/audio/powerup_collect.mp3',
            gameOver: 'assets/audio/game_over.mp3',
            levelComplete: 'assets/audio/level_complete.mp3',
            multiball: 'assets/audio/multiball.mp3'
        };

        // Create audio elements for each sound
        for (const [name, path] of Object.entries(soundFiles)) {
            this.sounds[name] = new Audio();
            this.sounds[name].src = path;
            this.sounds[name].volume = this.volume;

            // Add error handling for missing audio files
            this.sounds[name].addEventListener('error', () => {
                console.warn(`Audio file not found: ${path}`);
                // Create a fallback audio context for generating sounds programmatically
                if (!this.audioContext) {
                    this.initFallbackAudio();
                }
            });
        }
    }

    // Initialize fallback audio using Web Audio API
    initFallbackAudio() {
        try {
            if (typeof window !== 'undefined') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Using fallback audio generation');
            }
        } catch (e) {
            console.warn('Web Audio API not supported. Sound effects disabled.');
        }
    }

    // Play a sound by name
    play(soundName) {
        if (this.muted) return;

        // If we have the sound file, play it
        if (this.sounds[soundName] && this.sounds[soundName].error === null) {
            // Clone the audio to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.volume;
            sound.play().catch(e => console.warn('Error playing sound:', e));
            return;
        }

        // Otherwise, generate a fallback sound
        if (this.audioContext) {
            this.generateFallbackSound(soundName);
        }
    }

    // Generate fallback sounds using Web Audio API
    generateFallbackSound(soundName) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Configure sound based on type
        switch (soundName) {
            case 'paddleHit':
                oscillator.type = 'sine';
                oscillator.frequency.value = 300;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'brickHit':
                oscillator.type = 'square';
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'brickBreak':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 500;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
            case 'wallHit':
                oscillator.type = 'sine';
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'powerupCollect':
                oscillator.type = 'sine';
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();

                // Frequency sweep for powerup
                oscillator.frequency.linearRampToValueAtTime(
                    900, this.audioContext.currentTime + 0.2
                );

                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
            case 'gameOver':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 300;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();

                // Frequency sweep down for game over
                oscillator.frequency.linearRampToValueAtTime(
                    100, this.audioContext.currentTime + 0.5
                );

                oscillator.stop(this.audioContext.currentTime + 0.6);
                break;
            case 'levelComplete':
                oscillator.type = 'sine';
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();

                // Frequency sweep up for level complete
                oscillator.frequency.linearRampToValueAtTime(
                    800, this.audioContext.currentTime + 0.3
                );

                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;
            case 'multiball':
                oscillator.type = 'square';
                oscillator.frequency.value = 350;
                gainNode.gain.value = 0.1 * this.volume;
                oscillator.start();

                // Frequency sweep for multiball
                oscillator.frequency.linearRampToValueAtTime(
                    700, this.audioContext.currentTime + 0.1
                );
                oscillator.frequency.linearRampToValueAtTime(
                    350, this.audioContext.currentTime + 0.2
                );
                oscillator.frequency.linearRampToValueAtTime(
                    700, this.audioContext.currentTime + 0.3
                );

                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;
        }
    }

    // Toggle mute state
    toggleMute() {
        this.muted = !this.muted;

        // Update mute button appearance if in browser environment
        if (typeof document !== 'undefined') {
            const muteButton = document.getElementById('muteButton');
            if (muteButton) {
                if (this.muted) {
                    muteButton.textContent = '🔇';
                    muteButton.classList.add('muted');
                } else {
                    muteButton.textContent = '🔊';
                    muteButton.classList.remove('muted');
                }
            }
        }
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        // Update volume for all sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }
}

// Create and export the audio manager
const audioManager = new AudioManager();

// Export for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioManager,
        audioManager
    };
}
