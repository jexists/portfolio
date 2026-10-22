import { existsSync } from 'node:fs';
import path from 'node:path';
import manifest from './manifest.json';

interface ManifestEntry {
  name: string;
  role: string;
  path: string;
  variants: string[];
  tokens: string[];
  states: string[];
}

describe('design manifest', () => {
  it('uses the expected entry schema and points to existing paths', () => {
    const entries: ManifestEntry[] = [...manifest.pages, ...manifest.components];

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry).toEqual({
        name: expect.any(String),
        role: expect.any(String),
        path: expect.any(String),
        variants: expect.any(Array),
        tokens: expect.any(Array),
        states: expect.any(Array),
      });
      expect(existsSync(path.resolve(process.cwd(), entry.path))).toBe(true);
    }
  });
});
