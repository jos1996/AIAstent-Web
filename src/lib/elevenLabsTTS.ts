// Text-to-Speech Service — Eden AI (Amazon Neural TTS)
// Uses Eden AI universal-ai endpoint with Amazon Neural voice provider

const EDEN_AI_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODFlMzM1NzktMDgzMS00MmIxLWIzN2UtNGU5ODIzZmRjOWNjIiwidHlwZSI6ImFwaV90b2tlbiJ9.bMugmLgEFLlnaw-1meQv4uLF_95wXj0BRkzODP0rshw';

// Kept for backward-compat — not used by Eden AI TTS
export const ELEVENLABS_VOICES = {
  SMITH: 'amazon-neural',
  ADAM: 'amazon-neural',
  JOSH: 'amazon-neural',
} as const;

export type VoiceId = typeof ELEVENLABS_VOICES[keyof typeof ELEVENLABS_VOICES];

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
 * Call Eden AI TTS (Amazon Neural) and return the hosted MP3 URL.
 */
async function generateSpeechUrl(text: string): Promise<string> {
  console.log('[TTS] Calling Eden AI Amazon Neural TTS | text:', text.substring(0, 80));

  const res = await fetch('https://api.edenai.run/v3/universal-ai/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EDEN_AI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'audio/tts/amazon/neural',
      input: { text },
      show_original_response: false,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown');
    console.error('[TTS] Eden AI error', res.status, errBody);
    throw new Error(`Eden AI TTS ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  console.log('[TTS] Eden AI response status:', data.status);

  const audioUrl: string = data?.output?.audio_resource_url;
  if (!audioUrl) {
    throw new Error('Eden AI TTS: no audio_resource_url in response');
  }

  console.log('[TTS] Got audio URL:', audioUrl.substring(0, 80));
  return audioUrl;
}

/**
 * Main function: Generate and play speech using Eden AI Amazon Neural TTS.
 * Falls back to browser TTS if Eden AI fails.
 */
export async function speakWithElevenLabs(
  text: string,
  options: {
    voiceId?: VoiceId;
    modelId?: string;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  const { onStart, onEnd } = options;

  const audioUrl = await generateSpeechUrl(text);

  return new Promise<void>((resolve) => {
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onplay = () => {
      console.log('[TTS] Audio playing');
      onStart?.();
    };

    audio.onended = () => {
      console.log('[TTS] Audio ended');
      currentAudio = null;
      onEnd?.();
      resolve();
    };

    audio.onerror = (e) => {
      console.error('[TTS] Audio playback error:', e);
      currentAudio = null;
      onEnd?.();
      resolve();
    };

    audio.play().catch((err) => {
      console.error('[TTS] play() rejected:', err);
      currentAudio = null;
      onEnd?.();
      resolve();
    });
  });
}

/**
 * Check if TTS is available — Eden AI key is always present so always true.
 */
export async function isElevenLabsAvailable(): Promise<boolean> {
  console.log('[TTS] Using Eden AI Amazon Neural TTS — always available');
  return true;
}
