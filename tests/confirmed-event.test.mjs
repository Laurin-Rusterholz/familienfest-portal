import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { EVENT, attendanceForEvent } from '../netlify/functions/lib/config.mjs';

test('historical responses are classified for the final date without modifying them', () => {
  const cases = [
    [{ status: 'zugesagt', dates: { '2026-11-21': 'passt' } }, 'zugesagt'],
    [{ status: 'zugesagt', dates: { '2026-11-21': 'vielleicht' } }, 'offen'],
    [{ status: 'zugesagt', dates: { '2026-11-21': 'passt-nicht', '2026-11-28': 'passt' } }, 'abgesagt'],
    [{ status: 'zugesagt', dates: { '2026-11-28': 'passt' } }, 'offen'],
    [{ status: 'abgesagt', dates: { '2026-11-21': 'passt' } }, 'abgesagt'],
    [{ status: 'offen' }, 'offen'],
  ];
  for (const [guest, expected] of cases) {
    const before = structuredClone(guest);
    assert.equal(attendanceForEvent(guest), expected);
    assert.deepEqual(guest, before);
  }
});

test('confirmed reservation details are consistent', () => {
  assert.equal(EVENT.dateId, '2026-11-21');
  assert.equal(EVENT.time, '09:30 Uhr');
  assert.match(EVENT.place, /Schwertgasse 27, 9000 St. Gallen/);
  assert.match(EVENT.breakfast, /CHF 28/);
});

for (const file of ['index.html', 'admin.html']) {
  test(`${file} inline JavaScript parses`, () => {
    const html = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      new vm.Script(match[1], { filename: file });
    }
  });
}
