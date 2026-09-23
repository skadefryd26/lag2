import assert from 'node:assert/strict';
import { test } from 'node:test';
import { peopleAhead } from './queue.js';

test('fiktiv kø går ned hvert femte sekund', () => {
  for (const [seconds, expected] of [[0, 21], [4, 21], [5, 20], [89, 4], [90, 3], [104, 1], [105, 0], [200, 0]]) {
    assert.equal(peopleAhead(seconds), expected, `${seconds} sekunder`);
  }
});
