# ElevenLabs TTS Integration Plan

## Goal Description
Integrate ElevenLabs Text-to-Speech into the Book Reader. Features include:
- **Play Button**: Read text in the current text box.
- **Word Highlighting**: Highlight words in real-time as they are spoken (Karaoke style).
- **Voice Selection**: Choose from predefined characters.
- **Voice Cloning**: Allow users to clone their own voice.
- **Caching**: Store generated audio and alignment data to reuse for future users.

## User Review Required
- **API Key**: Need to add ElevenLabs API key to `.env`.
- **Audio Storage**: Generated audio files will be saved to the local uploads directory (or GCS if configured).

## Proposed Changes

### Backend

#### [NEW] `backend/src/models/TTSCache.js`
Mongoose model to store:
- `textHash` (hash of the text content for quick lookup)
- `voiceId`
- `audioUrl`
- `alignmentData` (JSON)

#### [NEW] `backend/src/routes/tts.js`
- **POST /generate**:
    - Check `TTSCache` for existing audio.
    - If miss: Call ElevenLabs API with `timestamp_granularity=word`.
    - Save audio to disk/GCS.
    - Save to DB.
    - Return URL and alignment.
- **GET /voices**: Fetch available voices (filtered list + user cloned voices).
- **POST /clone**: Upload sample, call ElevenLabs `add_voice`, return new voice ID.

#### [MODIFY] `backend/src/index.js`
- Register new tts routes.

### Frontend (Main App)

#### [MODIFY] `pages/BookReaderPage.tsx`
- Add "Play" button to text boxes (or a global play button for the active box).
- Add `VoiceSelector` modal/dropdown.
- Implement `AudioPlayer` logic:
    - Fetch audio/alignment.
    - Play audio.
    - `requestAnimationFrame` loop to update highlighted word based on `currentTime`.
    - Render text as `<span>` elements for each word to allow individual highlighting.

#### [NEW] `components/VoiceCloner.tsx`
- Component to record/upload audio sample and name for voice cloning.

## Verification Plan

### Manual Verification
1. **TTS**: Select a voice, click play, verify audio plays and words highlight in sync.
2. **Caching**: Play the same text twice; verify the second time loads instantly (no API call).
3. **Cloning**: Upload a sample, create a voice, and use it to read text.
