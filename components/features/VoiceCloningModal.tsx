import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Mic, Upload, Play, Pause, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { voiceCloningService, ClonedVoice } from '../../services/voiceCloningService';
import { useAudio } from '../../context/AudioContext';
import AudioFileItem from './AudioFileItem';

interface VoiceCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCloned: (voice: ClonedVoice) => void;
}

const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({ isOpen, onClose, onVoiceCloned }) => {
  const { setMusicPaused } = useAudio();
  const [step, setStep] = useState<'form' | 'recording' | 'uploading' | 'success'>('form');
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canAddMore, setCanAddMore] = useState(true);
  const [remainingSlots, setRemainingSlots] = useState(5);
  const [recordingTime, setRecordingTime] = useState(0); // in seconds
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [clonedVoice, setClonedVoice] = useState<ClonedVoice | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  
  // Script for users to read - Gospel story (about 1 minute)
  const recordingScript = "In the beginning, God created the heavens and the earth. He made everything beautiful and good. But people chose to go their own way and sin entered the world. God loved us so much that He sent His only Son, Jesus, to save us. Jesus came to earth, lived a perfect life, and showed us God's love. He performed miracles, healed the sick, and taught us about God's kingdom. Then, Jesus willingly gave His life on the cross to pay for our sins. But death could not hold Him! Three days later, Jesus rose from the dead, showing that He has power over sin and death. Because of Jesus, we can have eternal life and a relationship with God. All we need to do is believe in Him and accept His gift of salvation. This is the good news of the gospel - that God loves us, Jesus saves us, and we can live forever with Him in heaven.";

  useEffect(() => {
    if (isOpen) {
      setCanAddMore(voiceCloningService.canAddMore());
      setRemainingSlots(voiceCloningService.getRemainingSlots());
      // Reset form
      setStep('form');
      setVoiceName('');
      setDescription('');
      setAudioFiles([]);
      setError(null);
      
      // Check microphone permission status
      checkMicrophonePermission();
      
      // Pause background music when modal opens
      setMusicPaused(true);
    } else {
      // Resume background music when modal closes
      setMusicPaused(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
        setPreviewAudio(null);
      }
      // Resume music on cleanup
      setMusicPaused(false);
    };
  }, [isOpen, setMusicPaused, previewAudio]);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state);
        
        // Listen for permission changes
        result.onchange = () => {
          setMicPermission(result.state);
        };
      } else {
        // Fallback: try to access microphone to check permission
        setMicPermission('unknown');
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicPermission('unknown');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      setError('Please select audio files');
      return;
    }

    // Check actual audio duration instead of file size
    let totalDuration = 0;
    const durationPromises = audioFiles.map(file => {
      return new Promise<number>((resolve) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.src = url;
        
        audio.addEventListener('loadedmetadata', () => {
          const duration = audio.duration || 0;
          URL.revokeObjectURL(url);
          resolve(duration);
        });
        
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          resolve(0); // If we can't get duration, assume 0 and let backend handle it
        });
      });
    });
    
    const durations = await Promise.all(durationPromises);
    totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    
    // Check if total duration is at least 60 seconds (1 minute)
    if (totalDuration < 60) {
      const remaining = Math.ceil(60 - totalDuration);
      setError(`Please provide at least 1 minute of audio total. You have ${Math.floor(totalDuration)} seconds. Add ${remaining} more seconds.`);
      return;
    }

    setAudioFiles(prev => [...prev, ...audioFiles]);
    setError(null);
  };

  const startRecording = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone access is not supported in this browser. Please use a modern browser or upload audio files instead.');
        return;
      }

      // Request microphone permission explicitly
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setMicPermission('granted');
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
          
          // Check duration of recorded audio
          const duration = await new Promise<number>((resolve) => {
            const audio = new Audio();
            const url = URL.createObjectURL(audioBlob);
            audio.src = url;
            
            audio.addEventListener('loadedmetadata', () => {
              const dur = audio.duration || 0;
              URL.revokeObjectURL(url);
              resolve(dur);
            });
            
            audio.addEventListener('error', () => {
              URL.revokeObjectURL(url);
              resolve(recordingTime); // Fallback to timer duration
            });
          });
          
          // Only add if duration is meaningful (at least 5 seconds)
          if (duration >= 5) {
            setAudioFiles(prev => [...prev, audioFile]);
            setError(null);
          } else {
            setError(`Recording too short (${Math.floor(duration)}s). Please record for at least 1 minute total.`);
          }
        }
        setRecordedChunks([]);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred. Please try again.');
        setIsRecording(false);
        setStep('form');
      };

      // Set up audio analysis for visual feedback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      analyserRef.current = analyser;
      
      // Start timer
      setRecordingTime(0);
      const timerInterval = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 60 seconds (1 minute)
          if (newTime >= 60) {
            stopRecording();
            return 60;
          }
          return newTime;
        });
      }, 1000);
      timerIntervalRef.current = timerInterval;
      
      // Start audio level visualization
      const updateAudioLevels = () => {
        if (!analyserRef.current || !isRecording) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Get average of first 20 frequency bins for visualization
        const average = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
        const normalized = Math.min(average / 128, 1); // Normalize to 0-1
        
        // Create 5 bars with varying heights based on audio level
        const bars = Array.from({ length: 5 }, (_, i) => {
          const offset = i * 0.2;
          return Math.max(0.2, normalized - offset);
        });
        
        setAudioLevels(bars);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setStep('recording');
      setError(null);
      
      // Ensure music is paused when recording starts
      setMusicPaused(true);
      
      // Start visualization
      updateAudioLevels();
      
      console.log('✅ Recording started');
    } catch (err: any) {
      console.error('Error starting recording:', err);
      
      // Provide specific error messages based on error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        setMicPermission('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone or upload audio files instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Microphone is already in use by another application. Please close other apps using the microphone.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Microphone constraints not supported. Please try uploading audio files instead.');
      } else {
        setError(`Failed to access microphone: ${err.message || 'Unknown error'}. Please check permissions or upload audio files instead.`);
      }
      
      setIsRecording(false);
      setStep('form');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setStep('form');
        
        // Stop timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        // Stop audio visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Reset audio levels
        setAudioLevels([]);
        setRecordingTime(0);
        
        // Music will resume when modal closes, but keep paused while modal is open
        // (in case user wants to record again)
      } catch (err) {
        console.error('Error stopping recording:', err);
        setIsRecording(false);
        setStep('form');
      }
    }
  };

  const removeFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!voiceName.trim()) {
      setError('Please enter a voice name');
      return;
    }

    if (audioFiles.length === 0) {
      setError('Please add at least one audio sample');
      return;
    }

    // Verify total duration is at least 1 minute (check again before submitting)
    try {
      let totalDuration = 0;
      for (const file of audioFiles) {
        const duration = await new Promise<number>((resolve) => {
          const audio = new Audio();
          const url = URL.createObjectURL(file);
          audio.src = url;
          
          const timeout = setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve(0); // Timeout fallback
          }, 5000);
          
          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            const dur = audio.duration || 0;
            URL.revokeObjectURL(url);
            resolve(dur);
          });
          
          audio.addEventListener('error', () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            resolve(0);
          });
        });
        totalDuration += duration;
      }
      
      if (totalDuration < 60) {
        const remaining = Math.ceil(60 - totalDuration);
        setError(`Total audio duration is ${Math.floor(totalDuration)} seconds. Please provide at least 1 minute (60 seconds). Add ${remaining} more seconds.`);
        return;
      }
    } catch (err) {
      console.warn('Could not verify audio duration, proceeding anyway:', err);
      // Continue if we can't verify - let backend/ElevenLabs handle validation
    }

    if (!canAddMore) {
      setError('You have reached the maximum number of cloned voices (5)');
      return;
    }

    setError(null);
    setStep('uploading');

    try {
      console.log('🎤 Starting voice clone:', { voiceName, fileCount: audioFiles.length });
      const result = await ApiService.cloneVoice(voiceName, audioFiles, description);
      
      console.log('📋 Clone result:', result);
      
      if (result.success && result.voice) {
        // Save to local storage
        const saved = voiceCloningService.addClonedVoice(result.voice);
        if (saved) {
          setClonedVoice(result.voice);
          setStep('success');
          onVoiceCloned(result.voice);
          // Don't auto-close - let user preview first
        } else {
          setError('Failed to save voice locally. Please try again.');
          setStep('form');
        }
      } else {
        const errorMsg = result.error || 'Failed to clone voice';
        console.error('❌ Clone failed:', errorMsg);
        
        // Check if it's a format issue
        let displayError = errorMsg;
        if (errorMsg.includes('Invalid request') || errorMsg.includes('audio files')) {
          const hasMpeg4 = audioFiles.some(f => 
            f.type.includes('mp4') || 
            f.type.includes('m4a') || 
            f.type.includes('mpeg4') ||
            f.name.match(/\.(mp4|m4a)$/i)
          );
          
          if (hasMpeg4) {
            displayError = 'MPEG-4 format (MP4/M4A) is not supported by ElevenLabs. Please use MP3, WAV, or OGG format. You can convert your audio file using an online converter or record directly in the app.';
          } else {
            displayError = `${errorMsg}. Supported formats: MP3, WAV, OGG. Please check your audio files.`;
          }
        }
        
        setError(displayError);
        setStep('form');
      }
    } catch (err: any) {
      console.error('❌ Clone voice error:', err);
      setError(err.message || 'Failed to clone voice. Please check the backend console for details.');
      setStep('form');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#8B4513] to-[#5D2E0E] rounded-3xl shadow-2xl border-4 border-[#3E1F07] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#8B4513] to-[#5D2E0E] p-6 border-b-4 border-[#3E1F07] flex items-center justify-between z-10">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Clone Your Voice
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#3E1F07] hover:bg-[#5D2E0E] flex items-center justify-center transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <>
              {/* Info */}
              <div className="mb-6 bg-[#3E1F07]/50 rounded-xl p-4 border-2 border-[#5D2E0E]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-[#FFD700] flex-shrink-0 mt-1" size={20} />
                  <div className="text-white text-sm">
                    <p className="font-bold mb-2">Voice Cloning Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-white/90">
                      <li>Provide at least 1 minute of total audio</li>
                      <li>Use clear, high-quality recordings</li>
                      <li>Speak naturally and consistently</li>
                      <li>Maximum 5 cloned voices per device</li>
                    </ul>
                    <p className="mt-3 text-[#FFD700] font-bold">
                      Remaining slots: {remainingSlots} / 5
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice Name */}
              <div className="mb-4">
                <label className="block text-white font-bold mb-2">Voice Name *</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., My Voice, Mom's Voice"
                  className="w-full px-4 py-3 rounded-xl bg-[#3E1F07] border-2 border-[#5D2E0E] text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-white font-bold mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this voice..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#3E1F07] border-2 border-[#5D2E0E] text-white placeholder-white/50 focus:outline-none focus:border-[#FFD700] resize-none"
                />
              </div>

              {/* Audio Files */}
              <div className="mb-6">
                <label className="block text-white font-bold mb-2">Audio Samples *</label>
                
                {/* Upload Button */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#3E1F07] hover:bg-[#5D2E0E] border-2 border-[#5D2E0E] rounded-xl text-white font-bold transition-colors"
                  >
                    <Upload size={20} />
                    Upload Audio Files
                  </button>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={micPermission === 'denied'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl font-bold transition-colors ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 border-red-700 text-white'
                        : micPermission === 'denied'
                        ? 'bg-gray-600 border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-[#3E1F07] hover:bg-[#5D2E0E] border-[#5D2E0E] text-white'
                    }`}
                    title={micPermission === 'denied' ? 'Microphone permission denied. Please allow access in browser settings.' : ''}
                  >
                    <Mic size={20} />
                    {isRecording ? 'Stop Recording' : micPermission === 'denied' ? 'Permission Denied' : 'Record Audio'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* File List */}
                {audioFiles.length > 0 && (
                  <div className="space-y-2">
                    {audioFiles.map((file, index) => (
                      <AudioFileItem
                        key={index}
                        file={file}
                        onRemove={() => removeFile(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-600/20 border-2 border-red-600 rounded-xl text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-[#3E1F07] hover:bg-[#5D2E0E] border-2 border-[#5D2E0E] rounded-xl text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canAddMore || audioFiles.length === 0 || !voiceName.trim()}
                  className="flex-1 px-6 py-3 bg-[#FFD700] hover:bg-[#ffed4e] disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-[#B8860B] rounded-xl text-[#8B4513] font-bold transition-colors"
                  title={
                    !voiceName.trim() 
                      ? 'Please enter a voice name' 
                      : audioFiles.length === 0 
                      ? 'Please add at least one audio file' 
                      : !canAddMore 
                      ? 'Maximum voices reached (5)' 
                      : ''
                  }
                >
                  Clone Voice
                </button>
                {/* Helper text for disabled state */}
                {(!voiceName.trim() || audioFiles.length === 0) && (
                  <p className="text-center text-white/60 text-xs mt-2">
                    {!voiceName.trim() && 'Enter a voice name to continue'}
                    {!voiceName.trim() && audioFiles.length === 0 && ' • '}
                    {audioFiles.length === 0 && 'Add at least one audio file'}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 'recording' && (
            <div className="text-center py-8">
              {/* Timer */}
              <div className="mb-6">
                <div className="text-6xl font-bold text-white mb-2">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-white/70 text-sm">Record for at least 1 minute</p>
              </div>

              {/* Animated Sound Waves */}
              <div className="flex items-center justify-center gap-2 mb-8 h-20">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 bg-[#FFD700] rounded-full transition-all duration-150"
                    style={{
                      height: audioLevels[i] ? `${audioLevels[i] * 80}px` : '20px',
                      minHeight: '20px',
                      animation: audioLevels.length > 0 ? 'none' : 'pulse 1s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              {/* Recording Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <p className="text-white text-lg font-bold">Recording...</p>
              </div>

              {/* Script to Read */}
              <div className="bg-[#3E1F07]/70 rounded-xl p-6 mb-6 border-2 border-[#5D2E0E] max-h-48 overflow-y-auto">
                <p className="text-white/90 text-sm leading-relaxed text-left">
                  {recordingScript}
                </p>
              </div>
              <p className="text-white/60 text-xs mb-6 italic">
                Read the script above, or speak naturally about anything you'd like
              </p>

              {/* Stop Button */}
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-colors shadow-lg"
              >
                Stop Recording
              </button>
            </div>
          )}

          {step === 'uploading' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FFD700] flex items-center justify-center animate-spin">
                <Upload className="text-[#8B4513]" size={48} />
              </div>
              <p className="text-white text-xl font-bold mb-2">Cloning Voice...</p>
              <p className="text-white/70">This may take a minute</p>
            </div>
          )}

          {step === 'success' && clonedVoice && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-24 h-24 mx-auto mb-6 text-[#FFD700]" />
              <p className="text-white text-xl font-bold mb-2">Voice Cloned Successfully!</p>
              <p className="text-white/70 mb-6">Your voice "{clonedVoice.name}" is now available in the voice selector</p>
              
              {/* Preview Section */}
              <div className="bg-[#3E1F07]/50 rounded-xl p-6 mb-6 border-2 border-[#5D2E0E]">
                <h3 className="text-white font-bold mb-4">Preview Your Voice</h3>
                <p className="text-white/70 text-sm mb-4">
                  Listen to a sample of your cloned voice reading a short text
                </p>
                
                <button
                  onClick={async () => {
                    if (previewing && previewAudio) {
                      // Stop current preview
                      previewAudio.pause();
                      previewAudio.src = '';
                      setPreviewAudio(null);
                      setPreviewing(false);
                      return;
                    }
                    
                    setPreviewing(true);
                    try {
                      // Generate preview using the cloned voice
                      const previewText = "Hello! This is a preview of your cloned voice. I can read stories in this voice for you.";
                      const result = await ApiService.generateTTS(previewText, clonedVoice.voice_id);
                      
                      if (result && result.audioUrl) {
                        const audio = new Audio(result.audioUrl);
                        audio.onended = () => {
                          setPreviewing(false);
                          setPreviewAudio(null);
                        };
                        audio.onerror = () => {
                          setPreviewing(false);
                          setPreviewAudio(null);
                        };
                        setPreviewAudio(audio);
                        await audio.play();
                      } else {
                        setPreviewing(false);
                        alert('Failed to generate preview. Please try again.');
                      }
                    } catch (err: any) {
                      console.error('Preview error:', err);
                      setPreviewing(false);
                      alert('Failed to play preview. Please check your ElevenLabs API key.');
                    }
                  }}
                  className="px-6 py-3 bg-[#FFD700] hover:bg-[#ffed4e] border-2 border-[#B8860B] rounded-xl text-[#8B4513] font-bold transition-colors flex items-center gap-2 mx-auto"
                >
                  {previewing ? (
                    <>
                      <Pause size={20} />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Play Preview
                    </>
                  )}
                </button>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#3E1F07] hover:bg-[#5D2E0E] border-2 border-[#5D2E0E] rounded-xl text-white font-bold transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCloningModal;

