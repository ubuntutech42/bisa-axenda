import * as Tone from 'tone';

export type PomodoroSoundPreset = 'default' | 'bell' | 'chime' | 'soft';

const playSound = async (callback: () => void) => {
  try {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    callback();
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};

function focusDefault() {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
      attackCurve: 'exponential'
    }
  }).toDestination();
  synth.triggerAttackRelease("C2", "8n");
}

function focusBell() {
  const synth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
    harmonicity: 2,
    modulationIndex: 20,
    resonance: 2000,
    octaves: 0.5
  }).toDestination();
  synth.triggerAttackRelease("C4", "8n", Tone.now(), 0.6);
}

function focusChime() {
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.5 }
  }).toDestination();
  synth.triggerAttackRelease("C5", "8n", Tone.now(), 0.4);
}

function focusSoft() {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 1,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.01, release: 0.8 }
  }).toDestination();
  synth.triggerAttackRelease("C3", "8n", Tone.now(), 0.3);
}

function breakDefault() {
  const synth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
    harmonicity: 3.1,
    modulationIndex: 22,
    resonance: 3000,
    octaves: 1.5
  }).toDestination();
  synth.triggerAttackRelease("C5", "32n", Tone.now(), 0.8);
}

function breakBell() {
  const synth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.15, release: 0.08 },
    harmonicity: 2.5,
    modulationIndex: 18,
    resonance: 2500,
    octaves: 1
  }).toDestination();
  synth.triggerAttackRelease("E5", "16n", Tone.now(), 0.5);
}

function breakChime() {
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0.6 }
  }).toDestination();
  synth.triggerAttackRelease("G5", "4n", Tone.now(), 0.35);
}

function breakSoft() {
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.2, sustain: 0, release: 0.4 }
  }).toDestination();
  synth.triggerAttackRelease("A4", "8n", Tone.now(), 0.25);
}

const FOCUS_SOUNDS: Record<PomodoroSoundPreset, () => void> = {
  default: focusDefault,
  bell: focusBell,
  chime: focusChime,
  soft: focusSoft,
};

const BREAK_SOUNDS: Record<PomodoroSoundPreset, () => void> = {
  default: breakDefault,
  bell: breakBell,
  chime: breakChime,
  soft: breakSoft,
};

export const POMODORO_SOUND_OPTIONS: { value: PomodoroSoundPreset; label: string }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'bell', label: 'Sino' },
  { value: 'chime', label: 'Sino suave' },
  { value: 'soft', label: 'Suave' },
];

export function playFocusStartSound(preset: PomodoroSoundPreset = 'default') {
  playSound(() => FOCUS_SOUNDS[preset]?.() ?? FOCUS_SOUNDS.default());
}

export function playBreakStartSound(preset: PomodoroSoundPreset = 'default') {
  playSound(() => BREAK_SOUNDS[preset]?.() ?? BREAK_SOUNDS.default());
}

export function playFocusStartSoundWithPreset(preset: PomodoroSoundPreset | undefined) {
  playFocusStartSound(preset ?? 'default');
}

export function playShortBreakSoundWithPreset(preset: PomodoroSoundPreset | undefined) {
  playBreakStartSound(preset ?? 'default');
}

export function playLongBreakSoundWithPreset(preset: PomodoroSoundPreset | undefined) {
  playBreakStartSound(preset ?? 'default');
}

export const playTickSound = () => {
  playSound(() => {
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.01,
        release: 0.1,
        attackCurve: 'exponential'
      }
    }).toDestination();
    synth.triggerAttackRelease("C4", "8n", Tone.now(), 0.1);
  });
};
