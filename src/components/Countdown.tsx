import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface CountdownProps {
  targetDate: Date;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      const days = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24));
      const minutes = Math.max(0, Math.floor((difference / 1000 / 60) % 60));
      const seconds = Math.max(0, Math.floor((difference / 1000) % 60));

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);


  return (
    <div className="relative w-full overflow-visible flex flex-col items-center justify-center pt-10 pb-20">
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto px-4">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="uppercase tracking-[0.4em] text-[10px] sm:text-xs font-semibold mb-4 text-[#8B6508] text-center font-serif"
        >
          The countdown
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl mb-16 sm:mb-20 text-center text-[#2A2416]"
        >
          Forever begins in
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full"
        >
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-20 h-24 sm:w-28 sm:h-32 bg-white rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(212,175,55,0.15)] flex items-center justify-center mb-4 sm:mb-5 border border-[#D4AF37]/10">
                <span className="font-serif text-4xl sm:text-6xl font-medium text-[#2A2416] tabular-nums">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <span className="font-serif text-[9px] sm:text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8B6508]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>


    </div>
  );
};
