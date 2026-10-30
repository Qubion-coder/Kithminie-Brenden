// The deployed Apps Script web app (RSVPs + memory uploads). The URL is public
// anyway (it ships in the page), so it doubles as the fallback when the env
// var is not set, e.g. on Vercel.
export const APPS_SCRIPT_URL: string =
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzHb5oAj3hkQ9eHhIQCD1Zb2Kx9xinp75vsDBO_qMK0ASanyCbDn3scimgGHNnuYTjU/exec';
