export const ROSTER_EXPORT_FIELDS = [
  { id: 'name', label: 'Name' },
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Email' },
  { id: 'voice', label: 'Voice part' },
  { id: 'range', label: 'Voice range' },
  { id: 'pathway', label: 'Choir pathway' },
  { id: 'role', label: 'Role' },
  { id: 'rate', label: 'Attendance rate', when: 'summary' },
  { id: 'detail', label: 'Attendance detail', when: 'summary' },
  { id: 'status', label: 'Status at this event', when: 'event' },
];

export function fieldsForExport(eventSelected) {
  return ROSTER_EXPORT_FIELDS.filter((field) => {
    if (field.when === 'event') return eventSelected;
    if (field.when === 'summary') return !eventSelected;
    return true;
  });
}
