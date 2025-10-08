import * as Tone from 'tone';

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

export const playFocusStartSound = () => {
  playSound(() => {
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
  });
};

export const playBreakStartSound = () => {
  playSound(() => {
    const synth = new Tone.MetalSynth({
      frequency: 300,
      envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
      harmonicity: 3.1,
      modulationIndex: 22,
      resonance: 3000,
      octaves: 1.5
    }).toDestination();
    synth.triggerAttackRelease("C5", "32n", Tone.now(), 0.8);
  });
};

export const playTickSound = () => {
  playSound(() => {
    const synth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.01,
            release: 0.1,
            attackCurve: "exponential"
        }
    }).toDestination();
    synth.triggerAttackRelease("C4", "8n", Tone.now(), 0.1);
  });
};
