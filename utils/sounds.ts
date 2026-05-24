let ctx: AudioContext | null = null;
let _muted = false;

export const setMuted = (v: boolean) => { _muted = v; };
export const isSoundMuted = () => _muted;

const getCtx = (): AudioContext => {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

export const playCardFlip = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const dur = 0.1;
    const buf = c.createBuffer(1, Math.round(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1400;
    filt.Q.value = 0.6;
    const gain = c.createGain();
    gain.gain.value = 0.16;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(c.destination);
    src.start();
  } catch { /* AudioContext not yet allowed by browser */ }
};

export const playRoundWin = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.55);
    });
  } catch { /* ignore */ }
};

export const playRoundLose = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    [329.63, 246.94].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);
      osc.frequency.linearRampToValueAtTime(freq * 0.88, now + i * 0.18 + 0.35);
      gain.gain.setValueAtTime(0.1, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.45);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.5);
    });
  } catch { /* ignore */ }
};

export const playRoundDraw = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch { /* ignore */ }
};

export const playGameWin = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.14, now + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.9);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.95);
    });
  } catch { /* ignore */ }
};

export const playGameLose = () => {
  if (_muted) return;
  try {
    const c = getCtx();
    const now = c.currentTime;
    [392, 349.23, 311.13, 261.63].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.11, now + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.7);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.75);
    });
  } catch { /* ignore */ }
};
