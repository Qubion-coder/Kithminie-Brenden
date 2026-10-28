/** Couple names used across the invitation and the admin message. */
export const WEDDING = {
  groomName: 'Brenden',
  brideName: 'Kithminie',
} as const;

export const GUEST_PREFIXES = [
  { code: 'mr', label: 'Mr.' },
  { code: 'mrs', label: 'Mrs.' },
  { code: 'miss', label: 'Miss' },
  { code: 'mrmrs', label: 'Mr. & Mrs.' },
  { code: 'family', label: 'Family' },
  { code: 'dear', label: 'Dear' },
] as const;

export type GuestPrefix = (typeof GUEST_PREFIXES)[number]['code'];

const isPrefix = (code: string): code is GuestPrefix =>
  GUEST_PREFIXES.some((p) => p.code === code);

/**
 * Combines prefix and name for display. "Dear" adds nothing here: the
 * message greeting already starts with "Dear", so it must not be doubled.
 */
export function formatDisplayName(prefix: GuestPrefix, name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  switch (prefix) {
    case 'family':
      return `${trimmed} and Family`;
    case 'dear':
      return trimmed;
    default:
      return `${GUEST_PREFIXES.find((p) => p.code === prefix)!.label} ${trimmed}`;
  }
}

/**
 * {origin}/{guestName}, with the prefix as ?p= unless it adds nothing ("Dear")
 * and the table number as ?t= when one is assigned.
 */
export function buildInvitationLink(origin: string, prefix: GuestPrefix, name: string, table = ''): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const params = new URLSearchParams();
  if (prefix !== 'dear') params.set('p', prefix);
  if (table.trim()) params.set('t', table.trim());
  const query = params.toString();
  return `${origin}/${encodeURIComponent(trimmed)}${query ? `?${query}` : ''}`;
}

/** The guest's table number from ?t=, or '' when none was assigned. */
export function readTableFromLocation(location: Location): string {
  return (new URLSearchParams(location.search).get('t') || '').trim();
}

export function buildInvitationMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groomName} & ${WEDDING.brideName}`;
}

/**
 * Reads the guest from the current URL: /{guestName}?p={prefix}.
 * Older links in the ?title=&name= form still work.
 */
export function readGuestFromLocation(location: Location): string {
  const params = new URLSearchParams(location.search);

  const legacyName = params.get('name');
  if (legacyName) return `${params.get('title') || ''} ${legacyName}`.trim();

  const segment = location.pathname.replace(/^\/+|\/+$/g, '');
  if (!segment || segment.includes('/')) return '';

  let name: string;
  try {
    name = decodeURIComponent(segment);
  } catch {
    return '';
  }

  const prefix = params.get('p') || 'dear';
  return formatDisplayName(isPrefix(prefix) ? prefix : 'dear', name);
}
