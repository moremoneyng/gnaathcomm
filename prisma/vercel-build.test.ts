import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('Vercel builds generate Prisma Client before compiling Next.js', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

  assert.match(packageJson.scripts.build, /prisma generate/);
  assert.match(packageJson.scripts.postinstall, /prisma generate/);
});
