// The deployed Apps Script web app for RSVPs. The URL is public
// anyway (it ships in the page), so it doubles as the fallback when the env
// var is not set, e.g. on Vercel.
export const APPS_SCRIPT_URL: string =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzHb5oAj3hkQ9eHhIQCD1Zb2Kx9xinp75vsDBO_qMK0ASanyCbDn3scimgGHNnuYTjU/exec';

// Photo uploads from /memory go to their own standalone script (memory.gs).
export const MEMORY_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzFytTtDPwtzkSAqQWIjlFv8u3yVht1uEbO22vb1D5cuQINgQWcCdfZi8lLNmSaIr68FQ/exec';
