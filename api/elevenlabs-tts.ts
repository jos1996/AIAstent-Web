import type { VercelRequest, VercelResponse } from '@vercel/node';

// ElevenLabs API Key - stored securely on server side
const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY ||
  process.env.VITE_ELEVENLABS_API_KEY ||
  '';

// Default voice ID for Smith (custom voice from ElevenLabs Voice Library)
// Voice link: https://elevenlabs.io/app/voice-library?voiceId=Z7RrOqZFTyLpIlzCgfsp
// Voice ID: wXvR48IpOq9HACltTmt7
const DEFAULT_VOICE_ID = 'wXvR48IpOq9HACltTmt7';

// Model ID for multilingual v2 (high quality, supports English excellently)
const MODEL_ID = 'eleven_multilingual_v2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voiceId = DEFAULT_VOICE_ID, modelId = MODEL_ID } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'ElevenLabs API error', 
        details: errorText 
      });
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();

    // Return audio as base64 (easier to handle in browser)
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return res.status(200).json({
      audio: base64Audio,
      format: 'audio/mpeg',
      voiceId: voiceId,
    });

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate speech',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
