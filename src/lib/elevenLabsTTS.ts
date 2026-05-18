// ElevenLabs Text-to-Speech Service
// Calls ElevenLabs API directly from the browser (no serverless proxy)

// API key from environment
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_f48ffca4342f3e2c82ee1f7dceda5d781a68b970cc7fa85a';

// Voice IDs from ElevenLabs
// User's selected voice from Voice Library
export const ELEVENLABS_VOICES = {
  SMITH: '7rQX8r6PVq3gfJ8rZzyE',     // User's voice from Voice Library
  ADAM: 'pNInz6obpgDQGcFmaJgB',      // Fallback: Professional male (free tier)
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',      // Alternative male
} as const;

export type VoiceId = typeof ELEVENLABS_VOICES[keyof typeof ELEVENLABS_VOICES];

interface TTSOptions {
  voiceId?: VoiceId;
  modelId?: string;
}

// Global audio ref so we can stop playback from outside
let currentAudio: HTMLAudioElement | null = null;

export function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Generate speech by calling ElevenLabs API directly from browser.
 * Returns a Blob URL that can be played with HTML5 Audio.
 */
async function generateSpeechBlob(
  text: string,
  voiceId: string,
  modelId: string
): Promise<string> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  console.log('[ElevenLabs] POST', url);
  console.log('[ElevenLabs] Voice:', voiceId, '| Text:', text.substring(0, 80));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown');
    console.error('[ElevenLabs] API error', res.status, errBody);
    throw new Error(`ElevenLabs ${res.status}: ${errBody}`);
  }

  const blob = await res.blob();
  console.log('[ElevenLabs] Got audio blob, size:', blob.size);
  
  if (blob.size < 100) {
    throw new Error('Audio blob too small — likely empty');
  }

  return URL.createObjectURL(blob);
}

/**
 * Main function: Generate and play speech in one call.
 * Calls ElevenLabs directly — no serverless proxy.
 */
export async function speakWithElevenLabs(
  text: string,
  options: TTSOptions & {
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  const { onStart, onEnd, voiceId, modelId } = options;
  const voice = voiceId || ELEVENLABS_VOICES.SMITH;
  const model = modelId || 'eleven_multilingual_v2';

  // Generate audio blob URL
  const blobUrl = await generateSpeechBlob(text, voice, model);

  // Play it
  return new Promise<void>((resolve) => {
    const audio = new Audio(blobUrl);
    currentAudio = audio;

    audio.onplay = () => {
      console.log('[ElevenLabs] Audio playing');
      onStart?.();
    };

    audio.onended = () => {
      console.log('[ElevenLabs] Audio ended');
      URL.revokeObjectURL(blobUrl);
      currentAudio = null;
      onEnd?.();
      resolve();
    };

    audio.onerror = (e) => {
      console.error('[ElevenLabs] Audio playback error:', e);
      URL.revokeObjectURL(blobUrl);
      currentAudio = null;
      onEnd?.();
      resolve();
    };

    audio.play().catch((err) => {
      console.error('[ElevenLabs] play() rejected:', err);
      URL.revokeObjectURL(blobUrl);
      currentAudio = null;
      onEnd?.();
      resolve();
    });
  });
}

/**
 * Check if ElevenLabs is available (just checks API key exists)
 */
export async function isElevenLabsAvailable(): Promise<boolean> {
  if (!API_KEY || API_KEY.length < 10) {
    console.warn('[ElevenLabs] No API key configured');
    return false;
  }
  console.log('[ElevenLabs] API key found, length:', API_KEY.length);
  return true;
}
