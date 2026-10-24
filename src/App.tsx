import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';

import { InvitationContent } from './components/InvitationContent';
import { Admin } from './components/Admin';
import { INVITATION_IMAGE_URLS, preloadImages } from './utils/preloadImages';
import { readGuestFromLocation } from './utils/guest';

const isAdminRoute = () => /^\/admin\/?$/.test(window.location.pathname);

export default function App() {
  const [appState, setAppState] = useState<'initial' | 'playing' | 'invitation'>('initial');
  const [assetsReady, setAssetsReady] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const params = new URLSearchParams(window.location.search);
  const eventParam = params.get('event') || 'both';

  const fullInviteeName = isAdminRoute() ? '' : readGuestFromLocation(window.location);
  let eventLabel = 'Our Wedding Celebration';
  const weddingDate = new Date('2026-12-10T16:00:00');

  useEffect(() => {
    if (isAdminRoute()) return;

    let cancelled = false;
    preloadImages([...INVITATION_IMAGE_URLS]).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

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
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [appState, handleMusicStart]);

  const handleTransitionVideoEnd = useCallback(() => {
    setAppState('invitation');
    window.scrollTo(0, 0);
  }, []);

  // Stop the intro; the hero parks on the last frame and reveals the text.
  const handleSkipVideo = useCallback(() => {
    videoRef.current?.pause();
    handleTransitionVideoEnd();
  }, [handleTransitionVideoEnd]);

  // Keep the page still until the intro video is done.
  useEffect(() => {
    if (isAdminRoute()) return;
    document.body.style.overflow = appState === 'invitation' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [appState]);

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
        introVideoRef={videoRef}
        onIntroEnd={handleTransitionVideoEnd}
      />

      {appState === 'initial' && (
        <button
          type="button"
          className="fixed inset-0 z-[100] cursor-pointer flex items-end justify-center pb-[18vh]"
          onClick={handleStartVideo}
          aria-label="Open the invitation"
        >
          <span className="animate-pulse px-7 py-3 rounded-full bg-white/70 backdrop-blur-md border border-brand-plum/40 shadow-lg font-serif uppercase tracking-[0.3em] text-xs sm:text-sm text-stone-700">
            Tap to open
          </span>
        </button>
      )}

      {appState === 'playing' && (
        <button
          className="fixed bottom-6 right-6 text-white/70 hover:text-white px-4 py-2 rounded-full bg-black/20 backdrop-blur-md transition-colors z-[100] text-sm font-sans"
          onClick={handleSkipVideo}
        >
          Skip Video
        </button>
      )}
    </>
  );
}
