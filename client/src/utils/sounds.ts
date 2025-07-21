// Sound utility for playing UI sound effects
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Create a beep sound with specified frequency and duration
  private createBeep(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.audioContext || !this.enabled) return;

    try {
      // Resume audio context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  // Create a chord sound
  private createChord(frequencies: number[], duration: number, volume: number = 0.2): void {
    frequencies.forEach(freq => {
      this.createBeep(freq, duration, volume / frequencies.length);
    });
  }

  // Success sound - happy chord progression
  playSuccess(): void {
    if (!this.enabled) return;
    setTimeout(() => this.createChord([523.25, 659.25, 783.99], 0.8), 0); // C major chord
    setTimeout(() => this.createChord([587.33, 739.99, 880.00], 0.6), 200); // D major chord
    setTimeout(() => this.createChord([523.25, 659.25, 783.99, 1046.50], 1.2), 400); // C major with octave
  }

  // Error sound - descending tone
  playError(): void {
    if (!this.enabled) return;
    this.createBeep(400, 0.2);
    setTimeout(() => this.createBeep(300, 0.3), 150);
    setTimeout(() => this.createBeep(200, 0.4), 300);
  }

  // Click sound - short beep
  playClick(): void {
    if (!this.enabled) return;
    this.createBeep(800, 0.1, 0.2);
  }

  // Upload sound - ascending tones
  playUpload(): void {
    if (!this.enabled) return;
    this.createBeep(440, 0.15);
    setTimeout(() => this.createBeep(554, 0.15), 100);
    setTimeout(() => this.createBeep(659, 0.2), 200);
  }

  // Payment processing sound - gentle pulse
  playProcessing(): void {
    if (!this.enabled) return;
    const pulseSound = () => {
      this.createBeep(523, 0.3, 0.15);
    };
    pulseSound();
    setTimeout(pulseSound, 600);
    setTimeout(pulseSound, 1200);
  }

  // Copy sound - quick high beep
  playCopy(): void {
    if (!this.enabled) return;
    this.createBeep(1000, 0.08, 0.25);
  }

  // Notification sound - gentle bell-like tone
  playNotification(): void {
    if (!this.enabled) return;
    this.createBeep(880, 0.4, 0.2);
    setTimeout(() => this.createBeep(1108, 0.3, 0.15), 100);
  }

  // Hover sound - subtle high frequency
  playHover(): void {
    if (!this.enabled) return;
    this.createBeep(1200, 0.05, 0.1);
  }

  // Confirmation sound - triumphant progression
  playConfirmation(): void {
    if (!this.enabled) return;
    // Play a beautiful confirmation melody
    const melody = [
      { freq: 523.25, time: 0, duration: 0.3 },     // C
      { freq: 659.25, time: 150, duration: 0.3 },   // E
      { freq: 783.99, time: 300, duration: 0.3 },   // G
      { freq: 1046.50, time: 450, duration: 0.6 },  // C (octave)
      { freq: 880.00, time: 600, duration: 0.4 },   // A
      { freq: 1046.50, time: 800, duration: 0.8 },  // C (octave)
    ];

    melody.forEach(note => {
      setTimeout(() => this.createBeep(note.freq, note.duration, 0.2), note.time);
    });
  }

  // Blockchain sound - futuristic digital tones
  playBlockchain(): void {
    if (!this.enabled) return;
    // Create a futuristic sound pattern
    const digitalTones = [
      { freq: 440, time: 0, duration: 0.1 },
      { freq: 554, time: 50, duration: 0.1 },
      { freq: 659, time: 100, duration: 0.1 },
      { freq: 880, time: 150, duration: 0.2 },
      { freq: 1108, time: 200, duration: 0.15 },
      { freq: 1318, time: 250, duration: 0.3 },
    ];

    digitalTones.forEach(tone => {
      setTimeout(() => this.createBeep(tone.freq, tone.duration, 0.15), tone.time);
    });
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

// Export individual sound functions for easy use
export const playSound = {
  success: () => soundManager.playSuccess(),
  error: () => soundManager.playError(),
  click: () => soundManager.playClick(),
  upload: () => soundManager.playUpload(),
  processing: () => soundManager.playProcessing(),
  copy: () => soundManager.playCopy(),
  notification: () => soundManager.playNotification(),
  hover: () => soundManager.playHover(),
  confirmation: () => soundManager.playConfirmation(),
  blockchain: () => soundManager.playBlockchain(),
};

// Export sound manager for advanced control
export { soundManager };

// Export a hook-like function for React components
export const useSounds = () => {
  return {
    ...playSound,
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
  };
};