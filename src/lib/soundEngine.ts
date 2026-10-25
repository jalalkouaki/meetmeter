// Web Audio API Sound Synthesizer for ambient, non-startling meeting cues

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a gentle, harmonic chime (e.g. 15 min or 1 min warning).
   */
  playChime(type: 'warning-15m' | 'warning-1m' | 'overtime' | 'start' | 'stop', volume: number = 0.5): void {
    if (volume <= 0) return;

    try {
      const ctx = this.getContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.min(1, Math.max(0, volume)) * 0.3, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'start') {
        // Ascending pleasant major chord (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          this.playTone(ctx, masterGain, freq, now + idx * 0.08, 0.4);
        });
      } else if (type === 'stop') {
        // Soft resolving chord (G5 -> E5 -> C5)
        [783.99, 659.25, 523.25].forEach((freq, idx) => {
          this.playTone(ctx, masterGain, freq, now + idx * 0.08, 0.45);
        });
      } else if (type === 'warning-15m') {
        // Gentle bell (two soft tones)
        this.playTone(ctx, masterGain, 587.33, now, 0.5); // D5
        this.playTone(ctx, masterGain, 880.00, now + 0.15, 0.6); // A5
      } else if (type === 'warning-1m') {
        // Noticeable but pleasant double chime
        this.playTone(ctx, masterGain, 698.46, now, 0.4); // F5
        this.playTone(ctx, masterGain, 880.00, now + 0.12, 0.5); // A5
      } else if (type === 'overtime') {
        // Soft low pulse
        this.playTone(ctx, masterGain, 440.00, now, 0.6, 'sine');
      }
    } catch (e) {
      console.warn('Audio playback not supported or blocked:', e);
    }
  }

  private playTone(
    ctx: AudioContext,
    destination: GainNode,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    // Natural attack and decay envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.5, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const soundEngine = new SoundEngine();
