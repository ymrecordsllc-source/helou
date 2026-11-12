// Lightweight Web Audio API synthesizer for listening to album tracks & releases

class SynthesizedMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private currentNote = 0;
  private onTimeUpdateCallback: ((timeSec: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private durationSec = 180;
  private currentTime = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTrack(title: string, trackNumber: number, onTimeUpdate?: (sec: number) => void, onEnd?: () => void) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentNote = 0;
    this.currentTime = 0;
    this.onTimeUpdateCallback = onTimeUpdate || null;
    this.onEndCallback = onEnd || null;

    // Musical scale derived from track title
    const scales = [
      [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major
      [220.00, 246.94, 261.63, 293.66, 329.63, 392.00], // A Minor
      [311.13, 349.23, 392.00, 466.16, 523.25, 622.25], // Eb K-pop vibe
      [293.66, 329.63, 369.99, 440.00, 493.88, 587.33]  // D Major
    ];
    const scale = scales[Math.abs(trackNumber) % scales.length];

    this.timer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      this.currentTime += 0.5;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime);
      }

      // Play a harmonic synthesizer note
      const freq = scale[this.currentNote % scale.length];
      this.playSynthNote(freq);

      // Play rhythm kick/snare every alternate beat
      if (this.currentNote % 2 === 0) {
        this.playBeat();
      }

      this.currentNote++;

      if (this.currentTime >= this.durationSec) {
        this.stop();
        if (this.onEndCallback) this.onEndCallback();
      }
    }, 500);
  }

  private playSynthNote(freq: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  private playBeat() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      // ignore
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.currentTime = 0;
    this.currentNote = 0;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const musicEngine = new SynthesizedMusicEngine();
