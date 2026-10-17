import React from 'react';
import { motion } from 'motion/react';

const events = [
  { time: '09:00', title: 'Guest Arrival', desc: 'Welcome and seating' },
  { time: '09:15', title: 'Poruwa', desc: 'Traditional ceremony' },
  { time: '10:30', title: 'Bar Opens', desc: 'Liquor served' },
  { time: '12:00', title: 'Lunch', desc: 'Wedding feast' },
  { time: '12:45', title: 'Dancing', desc: 'Join us on the dance floor' },
  { time: '13:50', title: 'Cake Cutting', desc: 'Sweet celebrations' },
  { time: '14:00', title: 'Band Playing', desc: 'Live music & jam session' },
  { time: '15:30', title: 'Grand Exit', desc: 'Send off the newlyweds' },
];

export const Timeline = () => {
  return (
    <div className="bg-[#FDFBF7] pt-24 pb-48 sm:pt-32 sm:pb-64 relative overflow-hidden flex justify-center w-full">
      {/* Bottom left corner flower */}
      <img 
        src="/ChatGPT Image Sep 3, 2026, 03_34_18 AM - Copy.png" 
        alt="Floral Corner" 
        className="absolute bottom-0 left-0 w-64 sm:w-96 opacity-90 mix-blend-multiply pointer-events-none z-0" 
      />

      <div className="w-full max-w-2xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Top middle flower */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex justify-center"
        >
          <img 
            src="/ChatGPT Image Sep 3, 2026, 03_34_18 AM.png" 
            alt="Floral Top" 
            className="w-20 sm:w-24 h-auto opacity-90 mix-blend-multiply"
          />
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h2 className="text-4xl sm:text-5xl font-display text-[#2A2416] mb-2">The Day</h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative w-full max-w-md mx-auto">
          {events.map((event, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="relative flex items-start mb-12 last:mb-0 group"
            >
              {/* Time */}
              <div className="w-16 sm:w-20 flex-shrink-0 pt-1 text-right">
                <span className="font-serif text-sm sm:text-base text-[#8B6508] tracking-widest tabular-nums font-semibold">
                  {event.time}
                </span>
              </div>

              {/* Dot and Line Container */}
              <div className="flex flex-col items-center mx-4 sm:mx-6 relative">
                {/* Line to next item */}
                {idx !== events.length - 1 && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-[calc(100%+3rem)] bg-[#D4AF37]/40 group-hover:bg-[#D4AF37]/80 transition-colors duration-500" />
                )}
                {/* Dot */}
                <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-[#B8860B] relative z-10 ring-[6px] ring-[#FDFBF7]" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <h3 className="font-serif text-xl sm:text-2xl text-[#2A2416] mb-1 font-medium">{event.title}</h3>
                <p className="text-[11px] sm:text-xs text-[#8B6508]/70 font-sans tracking-wide">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
