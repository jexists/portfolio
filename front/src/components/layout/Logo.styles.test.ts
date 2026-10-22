import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tokens from '@/styles/tokens.json';

const styles = readFileSync(resolve('src/components/layout/Logo.module.scss'), 'utf8');

describe('Logo butterfly motion', () => {
  it('uses the slower flight timing for the flight and following idle motion', () => {
    expect(tokens.motion.duration.butterfly).toBe('2200ms');
    expect(tokens.motion.delay['butterfly-idle']).toBe('2200ms');
  });

  it('flies in from above-right along an S-curve with a matching fallback', () => {
    expect(tokens.intro['butterfly-flight-path']).toMatch(/^path\('M 260 -620 C/);
    expect(styles).toMatch(/@keyframes butterfly-flight-fallback[\s\S]*?28%[\s\S]*?50%[\s\S]*?70%/);
    expect(styles).toMatch(/@supports \(offset-path: path/);
  });

  it('keeps the reduced-motion landing state', () => {
    expect(styles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?offset-path:\s*none;[\s\S]*?transform:\s*none;/,
    );
  });
});
