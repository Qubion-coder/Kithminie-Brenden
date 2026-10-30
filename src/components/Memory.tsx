import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle, Heart, ImagePlus, Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MEMORY_SCRIPT_URL } from '../utils/appsScript';
import { WEDDING } from '../utils/guest';

type Status = 'ready' | 'uploading' | 'done' | 'error';

interface Item {
  id: string;
  file: File;
  preview: string;
  status: Status;
  error?: string;
}

const MAX_EDGE = 2560;
const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Phone photos are often 5–15 MB; scale them down to a sharp but sensible
 * size so uploads are quick. Falls back to the original when the browser
 * can't decode the format (e.g. HEIC outside Safari) or the result is bigger.
 */
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function uploadOne(file: File): Promise<void> {
  const blob = await prepareImage(file);
  if (blob.size > MAX_BYTES) throw new Error('Photo is too large (max 20 MB).');

  const converted = blob !== file;
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  const body = new URLSearchParams({
    action: 'upload',
    fileName: converted ? `${baseName}.jpg` : file.name,
    mimeType: blob.type || file.type || 'image/jpeg',
    data: await toBase64(blob),
  });

  // Form-encoded keeps this a "simple" request (no CORS preflight), and Apps
  // Script's JSON response is readable, so we can confirm each upload.
  const res = await fetch(MEMORY_SCRIPT_URL, { method: 'POST', body });
  const json = await res.json().catch(() => null);
  if (!json?.ok) throw new Error(json?.error || 'Upload failed.');
}

export const Memory: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const addFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (images.length < Array.from(files).length) toast.error('Only photos can be shared here.');
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'ready' as Status,
      })),
    ]);
  };

  const remove = (id: string) =>
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });

  const setStatus = (id: string, status: Status, error?: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status, error } : i)));

  const pending = items.filter((i) => i.status === 'ready' || i.status === 'error');
  const doneCount = items.filter((i) => i.status === 'done').length;

  const handleUpload = async () => {
    if (!pending.length || uploading) return;
    setUploading(true);
    let failed = 0;
    // One at a time keeps each request small and gives clear per-photo progress.
    for (const item of pending) {
      setStatus(item.id, 'uploading');
      try {
        await uploadOne(item.file);
        setStatus(item.id, 'done');
      } catch (err) {
        failed++;
        setStatus(item.id, 'error', err instanceof Error ? err.message : 'Upload failed.');
      }
    }
    setUploading(false);
    if (failed) toast.error(`${failed} photo${failed > 1 ? 's' : ''} could not be uploaded. Tap Upload to retry.`);
    else toast.success('Thank you! Your memories have been shared.');
  };

  return (
    <div className="min-h-[100dvh] bg-brand-blush py-12 px-4 sm:px-6 font-serif text-stone-800 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-radial from-brand-lavender/25 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="uppercase tracking-[0.4em] text-[10px] sm:text-xs font-semibold text-brand-plum">
            Share Your Memories
          </span>
          <h1 className="font-couple text-[clamp(2.25rem,10vw,4.5rem)] whitespace-nowrap text-stone-800 leading-snug mt-3">
            {WEDDING.brideName} <span className="font-script text-brand-plum">&amp;</span> {WEDDING.groomName}
          </h1>
          <p className="text-stone-500 italic text-lg max-w-md mx-auto mt-2">
            Captured a beautiful moment? Share your photos with us so we can treasure them forever.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="bg-white/80 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(176,137,104,0.15)] relative overflow-hidden space-y-6"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-rose via-brand-plum to-brand-rose" />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`w-full rounded-[2rem] border-2 border-dashed px-6 py-10 flex flex-col items-center gap-3 transition-colors ${
              dragging ? 'border-brand-plum bg-brand-rose/40' : 'border-brand-plum/40 bg-brand-blush/60 hover:bg-brand-rose/30'
            }`}
          >
            <span className="w-14 h-14 rounded-full bg-white border border-brand-lavender/50 shadow flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-brand-plum" />
            </span>
            <span className="text-xl text-stone-700">Choose photos</span>
            <span className="text-sm text-stone-400 italic">Tap to select from your gallery, or drop them here</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />

          {items.length > 0 && (
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((item) => (
                <li key={item.id} className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                  <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                  {item.status === 'ready' && !uploading && (
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-brand-plum animate-spin" />
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 drop-shadow" />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute inset-0 bg-red-50/80 flex flex-col items-center justify-center p-2 text-center" title={item.error}>
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <span className="text-[10px] leading-tight text-red-600 mt-1 line-clamp-2">{item.error}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!pending.length || uploading}
            className="w-full bg-stone-800 text-brand-rose py-4 rounded-full font-serif tracking-[0.3em] font-semibold text-xs uppercase hover:bg-stone-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-brand-plum" />}
            {uploading
              ? `Uploading ${doneCount + 1} of ${items.length}…`
              : pending.length
                ? `Upload ${pending.length} photo${pending.length > 1 ? 's' : ''}`
                : 'Upload'}
          </button>

          {doneCount > 0 && !uploading && !pending.length && (
            <p className="text-center text-stone-600 italic flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-brand-plum fill-brand-lavender/40" />
              {doneCount} photo{doneCount > 1 ? 's' : ''} shared. Thank you!
            </p>
          )}
        </motion.div>

        <p className="text-center text-stone-400 text-sm mt-8 flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" /> Photos go straight to the couple's private album.
        </p>
      </div>
    </div>
  );
};
