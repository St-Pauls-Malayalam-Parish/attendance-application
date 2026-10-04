import { describe, expect, it } from 'vitest';
import { dateTimeLocalToUtc, formatEventDateTime, toDateTimeLocal } from '../src/utils/event-datetime.js';

describe('event datetime helpers', () => {
  it('round-trips datetime-local through UTC ISO in the browser timezone', () => {
    const local = '2026-10-04T18:30';
    const utc = dateTimeLocalToUtc(local);
    expect(utc).toMatch(/Z$/);
    expect(dateTimeLocalToUtc(toDateTimeLocal(utc))).toBe(utc);
  });

  it('formats stored UTC for local display', () => {
    const label = formatEventDateTime('2026-10-04T13:00:00.000Z');
    expect(label).toMatch(/Oct/);
    expect(label).toMatch(/2026/);
  });
});
