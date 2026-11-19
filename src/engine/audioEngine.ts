/**
 * NEXUS-GRAPHRAG: Web Audio API Telemetry & Agentic Soundscape Engine
 * Lead Software Engineer & AI Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (val) {
      this.ensureContext();
      this.playTone(587.33, 0.08, 'sine', 0.06);
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    volume = 0.06,
    delaySec = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  public playNodeSelect(): void {
    this.playTone(740, 0.07, 'triangle', 0.05);
    this.playTone(1108.73, 0.09, 'sine', 0.035, 0.03);
  }

  public playAgentStep(stepIndex: number): void {
    // Ascending pentatonic cyber-chime across LangGraph nodes
    const scale = [440, 523.25, 587.33, 659.25, 783.99];
    const freq = scale[stepIndex % scale.length];
    this.playTone(freq, 0.11, 'sine', 0.055);
  }

  public playSelfCorrection(): void {
    // Amber warning double-chirp indicating LangGraph Critic rollback
    this.playTone(466.16, 0.11, 'sawtooth', 0.04, 0);
    this.playTone(392.0, 0.14, 'triangle', 0.05, 0.11);
    this.playTone(587.33, 0.12, 'sine', 0.05, 0.24);
  }

  public playSuccessChord(): void {
    this.playTone(523.25, 0.18, 'sine', 0.045, 0);
    this.playTone(659.25, 0.2, 'sine', 0.04, 0.05);
    this.playTone(783.99, 0.25, 'triangle', 0.04, 0.1);
  }

  public playSecurityAlert(): void {
    // Low-pass / dual-tone firewall block alarm
    this.playTone(196.0, 0.16, 'sawtooth', 0.06, 0);
    this.playTone(146.83, 0.22, 'sawtooth', 0.065, 0.15);
    this.playTone(130.81, 0.24, 'square', 0.04, 0.32);
  }

  public playBenchmarkPing(): void {
    this.playTone(880, 0.06, 'sine', 0.045, 0);
    this.playTone(1318.5, 0.12, 'sine', 0.05, 0.06);
  }
}
