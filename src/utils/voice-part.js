const CHOIR_VOICE_PARTS = new Set(['soprano', 'alto', 'tenor', 'bass']);

export function voicePartNeedsUpdate(user) {
  if (!user) return false;
  if (typeof user.voicePartNeedsUpdate === 'boolean') {
    return user.voicePartNeedsUpdate;
  }
  return !CHOIR_VOICE_PARTS.has(user.voicePart);
}
