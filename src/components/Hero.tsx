import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  event?: string | null;
  inviteeName?: string;
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

export const Hero: React.FC<HeroProps> = ({ event = 'both', inviteeName }) => {
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
        <img
          src="/ChatGPT Image Sep 25, 2026, 06_29_05 PM.png"
          alt="Wedding Background"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full pt-12 pb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h3 className="font-serif text-[12px] sm:text-sm tracking-[0.25em] uppercase text-stone-800 mb-6 font-medium">
          We Are Getting Married
        </h3>
        
        <div className="font-serif text-5xl sm:text-6xl text-stone-600 mb-6 font-medium leading-none tracking-tight" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
          KB
        </div>
        
        <h1 className="font-display text-5xl sm:text-7xl text-stone-600 mb-10" style={{ fontFamily: '"Great Vibes", cursive', transform: 'rotate(-2deg)' }}>
          Kithminie & Brenden
        </h1>

        <p className="font-serif text-xs sm:text-sm text-stone-800 max-w-sm tracking-[0.15em] leading-loose mb-10 uppercase font-semibold">
          We request the pleasure of your company<br/>to celebrate our wedding on
        </p>

        <div className="flex items-center justify-center gap-6 mb-2">
          <div className="flex flex-col items-center border-t border-b border-stone-800 py-1.5 px-2">
            <span className="font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold">December</span>
          </div>
          <span className="font-serif text-7xl sm:text-8xl text-stone-800 font-light leading-none -mt-4">10</span>
          <div className="flex flex-col items-center border-t border-b border-stone-800 py-1.5 px-2">
            <span className="font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-bold">Wednesday</span>
          </div>
        </div>
        <div className="font-serif text-xl sm:text-2xl tracking-[0.25em] text-stone-800 mb-10 font-medium">
          2026
        </div>

        <div className="flex flex-col items-center gap-8 mt-2">
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
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
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
