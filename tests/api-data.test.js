import { describe, expect, it } from 'vitest';
import { normalizeAttendanceEvent } from '../src/utils/api-data.js';

describe('normalizeAttendanceEvent', () => {
  it('defaults unmarked roster rows to absent', () => {
    const normalized = normalizeAttendanceEvent({
      event: { id: 'event-1', title: 'Practice' },
      roster: [
        { id: 'member-1', name: 'Anil', status: 'present', late: true },
        { id: 'member-2', name: 'Ashwin', status: '', late: false },
      ],
    });

    expect(normalized.roster[0]).toMatchObject({ status: 'present', late: true });
    expect(normalized.roster[1]).toMatchObject({ status: 'absent', late: false });
  });
});
