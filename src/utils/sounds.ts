let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

async function playTone(frequency: number, duration: number, volume = 0.5) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') await ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playCreateSound() {
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 80);
  setTimeout(() => playTone(784, 0.18), 160);
}

export function playDeleteSound() {
  playTone(440, 0.15, 0.45);
  setTimeout(() => playTone(349, 0.18, 0.45), 100);
}

export function playUpdateSound() {
  playTone(440, 0.12, 0.45);
  setTimeout(() => playTone(554, 0.14), 80);
}

export function playSendSound() {
  playTone(587, 0.12, 0.45);
  setTimeout(() => playTone(784, 0.18), 100);
}

export function playErrorSound() {
  playTone(294, 0.2, 0.45);
  setTimeout(() => playTone(262, 0.28, 0.45), 120);
}

export function playPopSound() {
  playTone(880, 0.08, 0.4);
  setTimeout(() => playTone(1100, 0.1, 0.35), 40);
}
