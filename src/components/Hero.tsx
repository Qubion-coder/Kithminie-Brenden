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

  // The intro is two clips: the envelope, then the scene. The second sits
  // underneath, preloaded, and takes over when the first ends so there is
  // no black gap; the hero then rests on its last frame.
  const sceneRef = useRef<HTMLVideoElement>(null);
  const [onScene, setOnScene] = useState(false);

  const handleEnvelopeEnded = () => {
    setOnScene(true);
    const scene = sceneRef.current;
    if (scene) {
      scene.muted = videoMuted;
      scene.currentTime = 0;
      // Some mobile browsers block sound on a second clip; fall back to muted.
      scene.play().catch(() => {
        scene.muted = true;
        scene.play().catch(console.error);
      });
    }
  };

  // Skipped: park the scene on its last frame instead of playing it.
  useEffect(() => {
    if (!active) return;
    const scene = sceneRef.current;
    if (!scene || scene.ended) return;
    setOnScene(true);
    scene.pause();
    const toEnd = () => {
      scene.currentTime = Math.max(0, scene.duration - 0.05);
    };
    if (Number.isFinite(scene.duration)) toEnd();
    else scene.addEventListener('loadedmetadata', toEnd, { once: true });
  }, [active]);

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
        <video
          ref={sceneRef}
          src="/intro-2-scene.mp4#t=0.001"
          className="absolute inset-0 w-full h-full object-cover object-center"
          muted={videoMuted}
          playsInline
          preload="auto"
          onEnded={onVideoEnd}
        />
        <video
          ref={videoRef}
          src="/intro-1-envelope.mp4#t=0.001"
          className={`absolute inset-0 w-full h-full object-cover object-center ${onScene ? 'opacity-0' : ''}`}
          muted={videoMuted}
          playsInline
          preload="auto"
          onEnded={handleEnvelopeEnded}
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
        {/* The quote is ~29.4em wide in Cormorant italic; size it to fill the width on one line. */}
        <motion.figure variants={item} className="mb-6">
          <blockquote className="font-serif italic text-[min(1.25rem,calc((100vw_-_2rem)/31))] whitespace-nowrap leading-relaxed text-stone-800">
            &ldquo;Set me as a seal upon your heart, a seal upon your arm, for love is strong as death&rdquo;
          </blockquote>
          <figcaption className="mt-1 font-serif italic text-[min(1.25rem,calc((100vw_-_2rem)/31))] leading-relaxed text-stone-800">
            Song of Solomon
          </figcaption>
        </motion.figure>
        
        <motion.h1 variants={letters} className="font-couple text-[clamp(1.5rem,9.5vw,4.5rem)] whitespace-nowrap text-stone-600 mb-4 leading-snug">
          <Letters text="Kithminie " />
          <motion.span variants={letter} className="inline-block font-script text-brand-plum">&</motion.span>
          <Letters text=" Brenden" />
        </motion.h1>

        <motion.div variants={item} className="font-serif italic text-stone-700 text-sm sm:text-base leading-relaxed mb-8">
          <p>Daughter of Mr &amp; Mrs Palihawadena</p>
          <p className="font-script not-italic text-brand-plum text-xl leading-none my-1">&amp;</p>
          <p>Son of Mr &amp; Mrs De Silva</p>
        </motion.div>

        <motion.div variants={item} className="font-serif uppercase text-stone-800 text-[11px] sm:text-sm tracking-[0.25em] leading-loose font-semibold max-w-sm space-y-4">
          <p>Together with their families</p>
          <div>
            <p>Request the honor of</p>
            <p className="normal-case tracking-normal font-normal text-2xl sm:text-3xl font-display text-brand-plum mt-3 pb-1 border-b border-stone-800/40 inline-block min-w-[10rem]">
              {inviteeName || 'your presence'}
            </p>
          </div>
          <p>As they exchange wedding vows</p>
          <p>On</p>
        </motion.div>

        <motion.div variants={item} className="font-serif text-lg sm:text-2xl tracking-[0.15em] text-stone-800 font-medium mt-3">
          10th December 2026
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
