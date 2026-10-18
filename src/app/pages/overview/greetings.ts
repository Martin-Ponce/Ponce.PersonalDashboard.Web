/** Keys under `overview.greetings`; each text gets {{name}}. */
export const GREETING_KEYS = [
  'welcomeBack',
  'yo',
  'whatsUp',
  'heyThere',
  'goodToSeeYou',
  'lookWhosBack',
  'howdy',
  'readyToRoll',
  'helloAgain',
  'niceToHaveYouBack',
] as const;

export type GreetingKey = (typeof GREETING_KEYS)[number];

const LAST_GREETING_STORAGE_KEY = 'overview-last-greeting';

/** Random greeting, never the same as last time. */
export function pickGreeting(random: () => number = Math.random): GreetingKey {
  const last = readLast();
  const options = GREETING_KEYS.filter((key) => key !== last);
  const picked = options[Math.floor(random() * options.length)];
  try {
    localStorage.setItem(LAST_GREETING_STORAGE_KEY, picked);
  } catch {
    // Storage can be blocked (private mode); a repeat is fine.
  }
  return picked;
}

function readLast(): string | null {
  try {
    return localStorage.getItem(LAST_GREETING_STORAGE_KEY);
  } catch {
    return null;
  }
}
