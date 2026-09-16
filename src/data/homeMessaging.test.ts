import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('supporting homepage sections reflect the expanded catalog', () => {
  assert.match(read('../components/CategoryBar.tsx'), /appliances, mobility/);
  assert.match(read('../components/HomeServicesSpotlight.tsx'), /Alongside our growing marketplace/);
  assert.match(read('../components/Footer.tsx'), /home and office appliances/);
  assert.match(read('../app/layout.tsx'), /cars and bikes/);
});
