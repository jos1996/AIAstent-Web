// ElevenLabs Text-to-Speech Service
// Generates realistic AI speech for the mock interview

const API_ENDPOINT = '/api/elevenlabs-tts';

// Voice IDs from ElevenLabs
// User's custom voice for Smith: wXvR48IpOq9HACltTmt7
// Link: https://elevenlabs.io/app/voice-library?voiceId=Z7RrOqZFTyLpIlzCgfsp
export const ELEVENLABS_VOICES = {
  SMITH: 'wXvR48IpOq9HACltTmt7',    // Custom voice for Smith (from Voice Library)
  ADAM: 'pNInz6obpgDQGcFmaJgB',      // Fallback: Professional male
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',      // Alternative male
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
  const voiceId = options.voiceId || ELEVENLABS_VOICES.SMITH;
  
  console.log('[generateSpeech] Using voice:', voiceId);
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      voiceId: voiceId,
      modelId: options.modelId || 'eleven_multilingual_v2',
    }),
  });

  const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));
  
  // Check for error in response (even if HTTP status is 200)
  if (data.error) {
    console.error('[generateSpeech] API returned error:', data);
    throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
  }
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  if (!data.audio) {
    throw new Error('No audio data in response');
  }

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
