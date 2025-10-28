// SOS in Morse code: ... --- ...
// Durations in milliseconds: [on, off, on, off, ...]
export const SOS_VIBRATION_PATTERN: number[] = [
  100, 50, 100, 50, 100, // S
  200,                  // Pause between letters
  300, 50, 300, 50, 300, // O
  200,                  // Pause between letters
  100, 50, 100, 50, 100, // S
];

// Total duration of one SOS pattern cycle
export const SOS_PATTERN_DURATION = SOS_VIBRATION_PATTERN.reduce((a, b) => a + b, 0) + 500; // Add 500ms pause at the end

// New continuous buzz pattern
export const CONTINUOUS_VIBRATION_PATTERN: number[] = [1000]; // 1 second on

// Total duration of one continuous pattern cycle
export const CONTINUOUS_PATTERN_DURATION = 1000 + 200; // 1s on, 200ms off

// Type for pattern names
export type VibrationPattern = 'SOS' | 'CONTINUOUS';
