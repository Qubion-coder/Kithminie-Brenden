import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { readTableFromLocation } from '../utils/guest';

import { APPS_SCRIPT_URL as RSVP_SCRIPT_URL } from '../utils/appsScript';

interface RSVPFormProps {
  inviteeName?: string;
  eventName?: string;
  eventParam?: string;
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ inviteeName = '', eventName = 'the celebration', eventParam = 'both' }) => {
  const searchParams = new URLSearchParams(window.location.search);
  const guestsParam = searchParams.get('guests') || '1';
  const tableNumber = readTableFromLocation(window.location);

  const [formData, setFormData] = useState({
    fullName: inviteeName,
    attendance: 'yes',
    guests: guestsParam,
    thoughts: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (inviteeName) {
      setFormData(prev => ({ ...prev, fullName: inviteeName }));
    }
  }, [inviteeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {

      if (!RSVP_SCRIPT_URL) throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not set');

      // Form-encoded so Apps Script receives the fields in e.parameter.
      const payload = new URLSearchParams({
        fullName: formData.fullName.trim(),
        attendance: formData.attendance,
        guests: formData.attendance === 'yes' ? formData.guests : '0',
        thoughts: formData.thoughts.trim(),
        link: window.location.href,
      });

      // Apps Script does not send CORS headers, so the response is opaque;
      // a network failure still rejects and lands in the catch below.
      await fetch(RSVP_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });

      setStatus('success');
      toast.success('Your RSVP has been warmly received!');
      setFormData({ fullName: inviteeName, attendance: 'yes', guests: guestsParam, thoughts: '' });
    } catch (error) {
      console.error('Error sending RSVP: ', error);
      setStatus('error');
      toast.error('Could not submit RSVP. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 relative py-4 sm:py-6">
      {/* Premium ambient backdrop & glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-brand-lavender/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="glass p-6 sm:p-10 lg:p-12 rounded-[2.5rem] sm:rounded-[3rem] border border-white/40 shadow-[0_30px_60px_rgba(176,137,104,0.1)] relative overflow-hidden bg-white/60 backdrop-blur-3xl lg:flex items-center gap-10 lg:gap-16"
      >
        {/* Soft top border line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-rose via-brand-plum/80 to-brand-rose" />

        {/* Left Side: Elegant Text */}
        <div className="lg:w-1/2 lg:pr-6 mb-8 lg:mb-0 relative text-center lg:text-left">
          <Sparkles className="absolute -top-6 -left-6 w-12 h-12 text-brand-lavender/30 animate-pulse" />

          <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-4">
            <span className="text-brand-plum uppercase tracking-[0.5em] text-[10px] sm:text-[11px] font-bold drop-shadow-sm">
              Kindly Respond
            </span>
            <div className="hidden lg:block w-16 h-[1px] bg-gradient-to-r from-brand-plum/60 to-transparent" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display text-stone-800 tracking-tight leading-[1.1] mb-4 drop-shadow-sm">
            Reserve <span className="italic font-light text-brand-plum">Your</span> Seat
          </h2>

          <p className="text-stone-500/90 font-serif text-base sm:text-lg leading-relaxed mb-6">
            We would be delighted by your presence at our wedding.
            <br />
            Kindly confirm your availability by <span className="text-stone-700 font-semibold">10th November 2026</span>.
          </p>

          {tableNumber && (
            <div className="inline-flex flex-col items-center px-8 py-4 mb-6 rounded-[1.5rem] bg-white/70 border border-brand-plum/30 shadow-sm">
              <span className="font-serif uppercase tracking-[0.3em] text-[10px] sm:text-[11px] font-semibold text-brand-plum">
                You are seated at
              </span>
              <span className="font-serif font-medium tracking-[0.05em] text-4xl sm:text-5xl text-stone-800 leading-tight">
                Table {tableNumber}
              </span>
            </div>
          )}

          <div className="w-12 h-[1px] bg-brand-lavender/50 mx-auto lg:mx-0" />
        </div>

        {/* Right Side: Flowing Form */}
        <div className="lg:w-1/2 relative z-10">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 px-8 bg-white/70 rounded-[2rem] border border-white shadow-xl"
              >
                <div className="w-24 h-24 bg-green-50/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-4xl font-display text-stone-800 mb-4 tracking-tight drop-shadow-sm">With Gratitude</h3>
                <p className="text-stone-500/90 leading-relaxed font-serif text-lg mb-8">
                  Your response has been warmly received. We cannot wait to celebrate with you!
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 rounded-full border border-brand-lavender/30 text-brand-plum font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-brand-lavender/10 transition-all duration-300 shadow-sm"
                >
                  Update Response
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-5 bg-white/40 p-6 sm:p-8 rounded-[2rem] border border-white shadow-[0_15px_30px_rgba(0,0,0,0.05)]"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-2 ml-2">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="E.g., John & Jane Doe"
                    className="w-full bg-white/80 px-6 py-3 rounded-full border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 font-serif italic text-base shadow-inner placeholder:text-stone-300"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-2 ml-2">Reserved Seats</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-white/80 px-6 py-3 rounded-full border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 font-serif italic text-base shadow-inner placeholder:text-stone-300"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  />
                  <p className="text-[9px] text-stone-400 mt-1.5 ml-3 italic">Number of seats you will be taking</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-2 ml-2">Attendance</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attendance: 'yes' })}
                      className={`flex-1 py-3 rounded-full border transition-all duration-300 font-serif italic text-base shadow-sm flex items-center justify-center gap-2 ${formData.attendance === 'yes'
                          ? 'bg-brand-lavender/30 border-brand-plum/50 text-brand-plum font-medium'
                          : 'bg-white/80 border-stone-200/60 text-stone-400 hover:border-brand-lavender/50 hover:text-stone-500'
                        }`}
                    >
                      {formData.attendance === 'yes' && <Heart className="w-4 h-4 fill-brand-plum/30" />}
                      Yes, I'll be there
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attendance: 'no' })}
                      className={`flex-1 py-3 rounded-full border transition-all duration-300 font-serif italic text-base shadow-sm ${formData.attendance === 'no'
                          ? 'bg-stone-100 border-stone-300 text-stone-600 font-medium'
                          : 'bg-white/80 border-stone-200/60 text-stone-400 hover:border-stone-300 hover:text-stone-500'
                        }`}
                    >
                      Can't make it
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-2 ml-2">A thought for the couple</label>
                  <textarea
                    placeholder="Share your wishes, thoughts, or advice..."
                    className="w-full bg-white/80 px-6 py-3 rounded-[2rem] border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 h-20 resize-none font-serif italic text-base shadow-inner placeholder:text-stone-300"
                    value={formData.thoughts}
                    onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={status === 'loading'}
                    type="submit"
                    className="w-full bg-stone-800 text-brand-rose py-5 rounded-full font-sans tracking-[0.3em] font-bold text-[11px] uppercase hover:bg-stone-900 transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirm Attendance'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
