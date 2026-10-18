export const PROFILE_PICTURES = [
  'initials',
  'bubbles',
  'leaf',
  'sun',
  'waves',
  'mountains',
  'moon',
  'flower',
  'planet',
] as const;

export type ProfilePicture = (typeof PROFILE_PICTURES)[number];

export const DEFAULT_PROFILE_PICTURE: ProfilePicture = 'initials';
