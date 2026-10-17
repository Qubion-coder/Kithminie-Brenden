import React, { useRef, useState, useEffect, type Ref } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  event?: string | null;
  inviteeName?: string;
  /** True once the intro video has finished; the text animates in then. */
  active?: boolean;
  /** The intro video plays here as the hero background and stays on its last frame. */
  videoRef?: Ref<HTMLVideoElement>;
  videoMuted?: boolean;
  onVideoEnd?: () => void;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.35, delayChildren: 0.6 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const letters: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const letter: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
};

/** Reveals text one letter at a time; must sit inside a variants parent. */
function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span variants={letters} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span key={i} variants={letter} aria-hidden="true" className="inline-block whitespace-pre">
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

function useIsTouchDevice() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }, []);

  return touch;
}

export const Hero: React.FC<HeroProps> = ({ event = 'both', inviteeName, active = true, videoRef, videoMuted = true, onVideoEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const useParallax = !reducedMotion && !isTouch;

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-brand-blush">
      <motion.div
        className="absolute inset-0 z-0 origin-center"
        style={useParallax ? { y: y1, scale } : undefined}
      >
        {/* Intro video; when it ends it rests on its last frame behind the text */}
        <video
          ref={videoRef}
          src="/gemini_generated_video_13ad019c.mp4"
          className="w-full h-full object-cover object-center"
          muted={videoMuted}
          playsInline
          preload="auto"
          onEnded={onVideoEnd}
        />
      </motion.div>

      {/* Soft veil that fades in with the text to keep it readable */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-b from-white/55 via-white/45 to-white/60 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full pt-12 pb-24"
        variants={container}
        initial="hidden"
        animate={active ? 'show' : 'hidden'}
      >
        <motion.h3 variants={item} className="font-serif text-[12px] sm:text-sm tracking-[0.25em] uppercase text-stone-800 mb-6 font-medium">
          We Are Getting Married
        </motion.h3>
        
        <motion.h1 variants={letters} className="font-couple text-5xl sm:text-7xl text-stone-600 mb-10 leading-snug">
          <Letters text="Kithminie " />
          <motion.span variants={letter} className="inline-block font-script text-brand-plum">&</motion.span>
          <Letters text=" Brenden" />
        </motion.h1>

        <motion.p variants={item} className="font-serif text-xs sm:text-sm text-stone-800 max-w-sm tracking-[0.15em] leading-loose mb-10 uppercase font-semibold">
          We request the pleasure of your company<br/>to celebrate our wedding on
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-6 mb-2">
          <div className="flex flex-col items-center border-t border-b border-stone-800 py-1.5 px-2">
            <span className="font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold">December</span>
          </div>
          <span className="font-serif text-7xl sm:text-8xl text-stone-800 font-light leading-none -mt-4">10</span>
          <div className="flex flex-col items-center border-t border-b border-stone-800 py-1.5 px-2">
            <span className="font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold">Wednesday</span>
          </div>
        </motion.div>
        <motion.div variants={item} className="font-serif text-xl sm:text-2xl tracking-[0.25em] text-stone-800 mb-10 font-medium">
          2026
        </motion.div>

        <motion.div variants={item} className="flex flex-col items-center gap-8 mt-2">
          <div className="text-center">
            <h3 className="font-display text-4xl sm:text-5xl text-stone-600 mb-2" style={{ transform: 'rotate(-2deg)' }}>Holy Mass</h3>
            <p className="font-serif text-base sm:text-lg text-stone-800 font-medium tracking-wide">Time: 4:00 pm</p>
            <p className="font-serif italic text-xl sm:text-2xl text-stone-700 tracking-wide mt-1">Venue: St Mary's Church, Colombo 04</p>
          </div>

          <div className="text-center">
            <h3 className="font-display text-4xl sm:text-5xl text-stone-600 mb-2" style={{ transform: 'rotate(-2deg)' }}>Reception</h3>
            <p className="font-serif text-base sm:text-lg text-stone-800 font-medium tracking-wide">Time: 7:00 pm</p>
            <p className="font-serif text-xl sm:text-2xl text-stone-700 tracking-wide mt-1">Venue: Barnhouse, Panadura</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 4, duration: 0.8 }}
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <motion.div 
          animate={{ y: [0, 5, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-stone-500/70 hover:text-stone-800 transition-colors" />
        </motion.div>
      </motion.div>
    </div>
  );
};
