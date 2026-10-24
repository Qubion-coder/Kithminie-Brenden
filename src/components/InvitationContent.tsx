import type { Ref } from 'react';
import { motion } from 'motion/react';
import { Music, VolumeX, Heart } from 'lucide-react';
import { Hero } from './Hero';
import { CeremonyDetails } from './CeremonyDetails';
import { Location } from './Location';

import { Countdown } from './Countdown';
import { RSVPForm } from './RSVPForm';

import { DeferredMount } from './DeferredMount';

interface InvitationContentProps {
  active: boolean;
  eventParam: string;
  fullInviteeName: string;
  eventLabel: string;
  weddingDate: Date;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  introVideoRef: Ref<HTMLVideoElement>;
  introMuted: boolean;
  onIntroEnd: () => void;
}

export function InvitationContent({
  active,
  eventParam,
  fullInviteeName,
  eventLabel,
  weddingDate,
  isMusicPlaying,
  onToggleMusic,
  introVideoRef,
  introMuted,
  onIntroEnd,
}: InvitationContentProps) {
  return (
    <motion.div
      className="font-sans text-stone-800 bg-brand-blush selection:bg-brand-plum/20"
    >
      {active && (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        onClick={onToggleMusic}
        className="fixed top-6 right-6 z-50 w-12 sm:w-14 h-12 sm:h-14 bg-white/70 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(176,137,104,0.15)] flex items-center justify-center border border-brand-lavender/50 text-brand-plum hover:scale-105 transition-all duration-300"
      >
        {isMusicPlaying ? (
          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </motion.button>
      )}

      <Hero
        event={eventParam}
        inviteeName={fullInviteeName}
        active={active}
        videoRef={introVideoRef}
        videoMuted={introMuted}
        onVideoEnd={onIntroEnd}
      />


      <DeferredMount active={active} delay={180} minHeight="40vh">
        <div className="py-24 sm:py-32 px-6 sm:px-16 lg:px-28 bg-[#FBFAF7] bg-[url('/35582a9af3fc2b22af5804ce2756caca.jpg')] bg-[length:100%_100%] bg-no-repeat relative overflow-hidden">
          <CeremonyDetails event={eventParam} />
        </div>
      </DeferredMount>

      <DeferredMount active={active} delay={240} minHeight="40vh">
        <div className="pt-24 pb-12 sm:py-32 bg-gradient-to-b from-white via-brand-rose/30 to-brand-blush relative overflow-hidden">
          <Location event={eventParam} />
        </div>
      </DeferredMount>



      <DeferredMount active={active} delay={360} minHeight="20vh">
        <div className="py-24 sm:py-32 relative overflow-hidden bg-[#FDFBF7]">
          <div className="relative z-10">
            <Countdown targetDate={weddingDate} />
          </div>
        </div>
      </DeferredMount>

      <DeferredMount active={active} delay={420} minHeight="30vh">
        <div className="pb-24 sm:pb-32 bg-[#d5cfbf] relative overflow-hidden">
          <video
            src="/hero-bg-l-slFnvE.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="block w-full sm:max-w-md sm:mx-auto h-auto pointer-events-none mb-12 sm:mb-16"
          />
          <RSVPForm inviteeName={fullInviteeName} eventName={eventLabel} eventParam={eventParam} />
        </div>
      </DeferredMount>



      <DeferredMount active={active} delay={520}>
        <footer className="py-12 bg-white border-t border-brand-lavender/20 text-center relative overflow-hidden mt-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-lavender/10 blur-[80px] rounded-full pointer-events-none" />
          <Heart className="w-6 h-6 mx-auto mb-6 text-brand-plum fill-brand-lavender/20" />
          <p className="font-couple text-4xl sm:text-5xl text-stone-800 mb-2 leading-snug">Kithminie <span className="font-script text-brand-plum">&</span> Brenden</p>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] font-sans text-stone-400 font-semibold block mb-4">
            December 10, 2026
          </span>
          
          <div className="w-12 h-[1px] bg-brand-lavender/30 mx-auto my-6" />

          <p className="text-[9px] sm:text-[10px] font-sans tracking-[0.2em] text-stone-400 uppercase">
            Want a beautiful wedding website like this? <br className="sm:hidden" />Create yours with{' '}
            <a 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#D4AF37] hover:text-brand-plum font-bold underline decoration-[#D4AF37]/40 hover:decoration-brand-plum/40 underline-offset-4 transition-colors" 
              href="https://wa.me/94707819074"
            >
              Invitemint
            </a>
          </p>
        </footer>
      </DeferredMount>
    </motion.div>
  );
}
