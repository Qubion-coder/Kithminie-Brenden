import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'sonner';

import { InvitationContent } from './components/InvitationContent';
import { Admin } from './components/Admin';
import { INVITATION_IMAGE_URLS, preloadImages } from './utils/preloadImages';

const isAdminRoute = () => window.location.pathname === '/admin';

export default function App() {
  const [appState, setAppState] = useState<'initial' | 'playing' | 'invitation'>('initial');
  const [assetsReady, setAssetsReady] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const params = new URLSearchParams(window.location.search);
  const titleParam = params.get('title') || '';
  const nameParam = params.get('name') || '';
  const eventParam = params.get('event') || 'both';

  const fullInviteeName = `${titleParam} ${nameParam}`.trim();
  let eventLabel = 'Our Wedding Celebration';
  const weddingDate = new Date('2026-12-10T16:00:00');

  useEffect(() => {
    if (isAdminRoute()) return;

    let cancelled = false;
    preloadImages([...INVITATION_IMAGE_URLS]).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    const videoLink = document.createElement('link');
    videoLink.rel = 'preload';
    videoLink.as = 'video';
    videoLink.href = '/gemini_generated_video_13ad019c.mp4';
    document.head.appendChild(videoLink);

    return () => {
      cancelled = true;
    };
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/shania_twain_-_u_are_still_the_one_(mp3.pm).mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'none';
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleMusicStart = useCallback(() => {
    setIsMusicPlaying(true);
    const audio = ensureAudio();
    audio.play().catch(console.error);
  }, [ensureAudio]);

  const toggleMusic = useCallback(() => {
    const audio = ensureAudio();
    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsMusicPlaying((playing) => !playing);
  }, [ensureAudio, isMusicPlaying]);

  const handleStartVideo = useCallback(() => {
    if (appState !== 'initial') return;
    setAppState('playing');
    handleMusicStart();
    if (videoRef.current) {
      videoRef.current.muted = false; // ensure it's unmuted
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [appState, handleMusicStart]);

  const handleTransitionVideoEnd = useCallback(() => {
    setAppState('invitation');
    window.scrollTo(0, 0);
  }, []);

  if (isAdminRoute()) {
    return (
      <>
        <Toaster position="top-center" />
        <Admin />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <InvitationContent
        active={appState === 'invitation'}
        eventParam={eventParam}
        fullInviteeName={fullInviteeName}
        eventLabel={eventLabel}
        weddingDate={weddingDate}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
      />

      <AnimatePresence>
        {appState !== 'invitation' && (
          <motion.div
            key="intro-video"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
            onClick={appState === 'initial' ? handleStartVideo : undefined}
          >
            <video
              ref={videoRef}
              src="/gemini_generated_video_13ad019c.mp4"
              className="w-full h-full object-cover"
              muted={appState === 'initial'}
              playsInline
              onEnded={handleTransitionVideoEnd}
            />
            {appState === 'playing' && (
              <button
                className="absolute bottom-6 right-6 text-white/50 hover:text-white px-4 py-2 rounded-full bg-white/10 backdrop-blur-md transition-colors z-50 text-sm font-sans"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransitionVideoEnd();
                }}
              >
                Skip Video
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
