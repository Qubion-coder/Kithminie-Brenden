import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Sparkles, User, Link as LinkIcon, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  GUEST_PREFIXES,
  WEDDING,
  buildInvitationLink,
  buildInvitationMessage,
  formatDisplayName,
  type GuestPrefix,
} from '../utils/guest';

interface Generated {
  link: string;
  displayName: string;
  message: string;
}

/** Clipboard API needs a secure context; fall back to a hidden textarea. */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

export const Admin: React.FC = () => {
  const [prefix, setPrefix] = useState<GuestPrefix>('mr');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [copied, setCopied] = useState<'link' | 'message' | null>(null);

  const previewName = formatDisplayName(prefix, guestName);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Please enter a guest name');
      return;
    }

    const link = buildInvitationLink(window.location.origin, prefix, guestName);
    const displayName = formatDisplayName(prefix, guestName);
    setGenerated({ link, displayName, message: buildInvitationMessage(displayName, link) });
    setCopied(null);
    toast.success('Invitation link generated!');
  };

  // Editing the form makes the generated link stale, so drop it until regenerated.
  const updatePrefix = (value: GuestPrefix) => {
    setPrefix(value);
    setGenerated(null);
  };
  const updateName = (value: string) => {
    setGuestName(value);
    setGenerated(null);
  };

  const handleCopy = (kind: 'link' | 'message') => {
    if (!generated) return;
    copyText(kind === 'link' ? generated.link : generated.message)
      .then(() => {
        setCopied(kind);
        toast.success(kind === 'link' ? 'Link copied!' : 'Message copied!');
        setTimeout(() => setCopied((c) => (c === kind ? null : c)), 3000);
      })
      .catch(() => toast.error('Could not copy. Please select and copy manually.'));
  };

  const copyButton =
    'flex-1 py-3.5 px-6 rounded-full font-sans tracking-[0.2em] font-bold text-[11px] uppercase transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

  return (
    <div className="min-h-screen bg-brand-blush py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 relative overflow-hidden selection:bg-brand-plum/20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-radial from-brand-lavender/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-brand-lavender/40 text-stone-600 hover:text-brand-plum hover:bg-white transition-all shadow-sm font-medium text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Invitation
          </a>
          <span className="px-4 py-1.5 rounded-full bg-brand-rose border border-brand-lavender/30 text-brand-plum text-xs font-bold uppercase tracking-widest shadow-sm">
            Admin
          </span>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-brand-plum" />
            <span className="text-brand-plum uppercase tracking-[0.5em] text-xs font-bold">Invitation Generator</span>
            <Sparkles className="w-5 h-5 text-brand-plum" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-display text-stone-800 mb-4">
            {WEDDING.brideName} <span className="font-script text-brand-plum">&</span> {WEDDING.groomName}
          </h1>
          <p className="text-stone-500 font-serif italic text-lg max-w-xl mx-auto">
            Create a personal invitation link and WhatsApp message for each guest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(176,137,104,0.15)] relative overflow-hidden h-fit"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-rose via-brand-plum to-brand-rose" />

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="prefix" className="block text-xs uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 flex items-center gap-2 ml-1">
                  <User className="w-4 h-4 text-brand-plum" />
                  Select Prefix
                </label>
                <select
                  id="prefix"
                  value={prefix}
                  onChange={(e) => updatePrefix(e.target.value as GuestPrefix)}
                  className="w-full bg-white px-6 py-4 rounded-full border border-stone-200/80 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all font-serif text-lg shadow-inner text-stone-800 cursor-pointer"
                >
                  {GUEST_PREFIXES.map((p) => (
                    <option key={p.code} value={p.code}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="guest-name" className="block text-xs uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 flex items-center gap-2 ml-1">
                  <User className="w-4 h-4 text-brand-plum" />
                  Guest Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  placeholder="e.g. Sanjaya"
                  value={guestName}
                  onChange={(e) => updateName(e.target.value)}
                  className="w-full bg-white px-6 py-4 rounded-full border border-stone-200/80 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all font-serif text-lg shadow-inner text-stone-800 placeholder:text-stone-400"
                />
                {previewName && (
                  <p className="mt-3 ml-1 text-sm text-stone-500 font-serif">
                    Greeting: <span className="text-stone-800 font-semibold">Dear {previewName} ❤️</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-stone-800 text-brand-rose py-5 rounded-full font-sans tracking-[0.3em] font-bold text-xs uppercase hover:bg-stone-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <LinkIcon className="w-4 h-4 text-brand-plum" />
                Generate Link
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(176,137,104,0.15)] space-y-6"
          >
            <div>
              <h3 className="font-serif text-2xl text-stone-800 mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-brand-plum" />
                Generated Link
              </h3>
              {generated ? (
                <a
                  href={generated.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 bg-stone-50 rounded-2xl border border-stone-200/80 font-mono text-sm text-brand-plum break-all hover:underline"
                >
                  {generated.link}
                </a>
              ) : (
                <p className="p-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 font-serif italic">
                  Fill in the form and click Generate Link.
                </p>
              )}
            </div>

            {generated && (
              <div>
                <h3 className="font-serif text-2xl text-stone-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-brand-plum" />
                  Message Preview
                </h3>
                <div className="text-sm text-stone-700 font-serif whitespace-pre-wrap break-words leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                  {generated.message}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!generated}
                onClick={() => handleCopy('link')}
                className={`${copyButton} bg-brand-plum text-white hover:bg-brand-plum/90 shadow-md`}
              >
                {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'link' ? 'Copied!' : 'Copy Link Only'}
              </button>
              <button
                type="button"
                disabled={!generated}
                onClick={() => handleCopy('message')}
                className={`${copyButton} bg-brand-rose text-brand-plum hover:bg-brand-rose/90 border border-brand-lavender/30 shadow-sm`}
              >
                {copied === 'message' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'message' ? 'Copied!' : 'Copy Full Message'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
