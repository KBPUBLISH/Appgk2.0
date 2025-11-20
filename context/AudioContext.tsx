
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface AudioContextType {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  toggleMusic: () => void;
  toggleSfx: () => void;
  playClick: () => void;
  playBack: () => void;
  playSuccess: () => void;
  playTab: () => void;
}

const AudioContext = createContext<AudioContextType>({
  musicEnabled: true,
  sfxEnabled: true,
  toggleMusic: () => {},
  toggleSfx: () => {},
  playClick: () => {},
  playBack: () => {},
  playSuccess: () => {},
  playTab: () => {},
});

export const useAudio = () => useContext(AudioContext);

// A simple cheerful background loop URL (Creative Commons / Royalty Free placeholder)
const BG_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=playful-15-sec-intro-music-loop-2-21350.mp3";

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context lazily (browsers require interaction first)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // --- SOUND GENERATORS (Synthesizers) ---
  // We use synthesized sounds to avoid loading external files for UI clicks.

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [sfxEnabled, getAudioContext]);

  const playClick = useCallback(() => {
    // Wood-block style click
    playTone(300, 'sine', 0.1, 0.15);
    playTone(400, 'triangle', 0.05, 0.05);
  }, [playTone]);

  const playBack = useCallback(() => {
    // Lower pitch "cancel" or "back" sound
    playTone(200, 'sine', 0.15, 0.1);
  }, [playTone]);

  const playTab = useCallback(() => {
    // Light high pitch tick
    playTone(600, 'sine', 0.05, 0.05);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    
    // Arpeggio
    const now = ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
    });
  }, [sfxEnabled, getAudioContext]);


  // --- BACKGROUND MUSIC LOGIC ---
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio(BG_MUSIC_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3; 
    }

    if (musicEnabled) {
        // Browser autoplay policy might block this until first interaction
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play prevented. Music will start after interaction.");
                // We could add a "one-time global click listener" here to start music
                const startAudio = () => {
                    if (musicEnabled && audioRef.current) audioRef.current.play();
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                };
                document.addEventListener('click', startAudio);
                document.addEventListener('touchstart', startAudio);
            });
        }
    } else {
        audioRef.current.pause();
    }

    return () => {
        // Cleanup not typically needed for singleton global music, but good practice
    };
  }, [musicEnabled]);

  const toggleMusic = () => setMusicEnabled(prev => !prev);
  const toggleSfx = () => setSfxEnabled(prev => !prev);

  return (
    <AudioContext.Provider value={{ 
        musicEnabled, 
        sfxEnabled, 
        toggleMusic, 
        toggleSfx,
        playClick,
        playBack,
        playSuccess,
        playTab
    }}>
      {children}
    </AudioContext.Provider>
  );
};
