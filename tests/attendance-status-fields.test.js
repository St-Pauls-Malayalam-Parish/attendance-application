import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { AttendanceStatusFields } from '../src/components/AttendanceStatusFields.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function DualRoster({ initialStatus = 'present' }) {
  const [member, setMember] = useState({
    id: 'member-1',
    status: initialStatus,
    late: false,
  });

  function onUpdate(patch) {
    setMember((current) => ({ ...current, ...patch }));
  }

  return createElement(
    'div',
    null,
    createElement(AttendanceStatusFields, { member, onUpdate, namePrefix: 'status' }),
    createElement(AttendanceStatusFields, { member, onUpdate, namePrefix: 'status' })
  );
}

function radioGroups() {
  const radios = [...document.querySelectorAll('input[type="radio"]')];
  const groups = new Map();
  for (const radio of radios) {
    const group = groups.get(radio.name) ?? [];
    group.push(radio);
    groups.set(radio.name, group);
  }
  return [...groups.values()];
}

function checkedValue(group) {
  return group.find((radio) => radio.checked)?.value ?? null;
}

describe('AttendanceStatusFields', () => {
  it('keeps table and card copies as separate radio groups that stay in sync', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(DualRoster));
    });

    const groups = radioGroups();
    expect(groups).toHaveLength(2);
    expect(groups.map(checkedValue)).toEqual(['present', 'present']);

    const absent = groups[0].find((radio) => radio.value === 'absent');
    await act(async () => {
      absent.click();
    });

    const afterClick = radioGroups();
    expect(afterClick).toHaveLength(2);
    expect(afterClick.map(checkedValue)).toEqual(['absent', 'absent']);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
