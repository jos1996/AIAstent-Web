// ElevenLabs Text-to-Speech Service
// Generates realistic AI speech for the mock interview

const API_ENDPOINT = '/api/elevenlabs-tts';

// Voice IDs from ElevenLabs - verified working voices
export const ELEVENLABS_VOICES = {
  ADAM: 'pNInz6obpgDQGcFmaJgB',      // Professional male (default for Smith) - Free tier
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',      // Alternative male
  ANTONI: 'ErXwobaYiN019PkySvjV',    // Young male
} as const;

export type VoiceId = typeof ELEVENLABS_VOICES[keyof typeof ELEVENLABS_VOICES];

interface TTSResponse {
  audio: string;
  format: string;
  voiceId: string;
}

interface TTSOptions {
  voiceId?: VoiceId;
  modelId?: string;
}

/**
 * Generate speech from text using ElevenLabs API
 * Returns a base64-encoded MP3 that can be played directly
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<string> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      voiceId: options.voiceId || ELEVENLABS_VOICES.JOSH,
      modelId: options.modelId || 'eleven_multilingual_v2',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data: TTSResponse = await response.json();
  return data.audio;
}

/**
 * Play base64 audio using HTML5 Audio
 * Returns a promise that resolves when playback ends
 */
export function playBase64Audio(
  base64Audio: string,
  onStart?: () => void,
  onEnd?: () => void
): HTMLAudioElement {
  const audioSrc = `data:audio/mpeg;base64,${base64Audio}`;
  const audio = new Audio(audioSrc);
  
  audio.addEventListener('play', () => {
    onStart?.();
  });
  
  audio.addEventListener('ended', () => {
    onEnd?.();
  });
  
  audio.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);
    onEnd?.();
  });
  
  // Preload and play
  audio.load();
  audio.play().catch(err => {
    console.error('Audio play failed:', err);
    onEnd?.();
  });
  
  return audio;
}

/**
 * Main function: Generate and play speech in one call
 * Returns a promise that resolves when playback ends
 */
export async function speakWithElevenLabs(
  text: string,
  options: TTSOptions & {
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  const { onStart, onEnd, ...ttsOptions } = options;
  
  // Generate audio
  const base64Audio = await generateSpeech(text, ttsOptions);
  
  // Play and wait for completion
  return new Promise((resolve) => {
    playBase64Audio(
      base64Audio,
      () => {
        onStart?.();
      },
      () => {
        onEnd?.();
        resolve();
      }
    );
  });
}

/**
 * Check if ElevenLabs is available (API key configured)
 */
export async function isElevenLabsAvailable(): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test' }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
