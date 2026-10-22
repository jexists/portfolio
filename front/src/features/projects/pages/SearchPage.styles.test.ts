import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tokens from '@/styles/tokens.json';

const headerStyles = readFileSync(resolve('src/components/layout/SearchHeader.module.scss'), 'utf8');
const searchStyles = readFileSync(resolve('src/features/projects/pages/SearchPage.module.scss'), 'utf8');
const detailStyles = readFileSync(resolve('src/features/projects/pages/ProjectDetailPage.module.scss'), 'utf8');

describe('shared search content layout', () => {
  it('keeps the logo visible in a fixed content-offset column', () => {
    expect(tokens.search['content-offset']).toContain('--search-header-logo-column-width');
    expect(tokens.search['content-offset']).toContain('--search-header-column-gap');
    expect(tokens.search['content-max-width']).toBe('43rem');
    expect(tokens.search).not.toHaveProperty('bar-max-width');
    expect(tokens.search).not.toHaveProperty('content-responsive-offset');

    expect(headerStyles).toMatch(
      /grid-template-columns:\s*var\(--search-content-offset\)\s+minmax\(var\(--space-0\), var\(--search-content-max-width\)\)/,
    );
    expect(headerStyles).toMatch(/max-width:\s*var\(--search-header-max-width\)/);
    expect(headerStyles).toMatch(/padding-inline:\s*var\(--search-content-padding-x\)/);

    const logoLinkRule = headerStyles.match(/\.logoLink\s*\{[^}]*\}/s)?.[0];
    expect(logoLinkRule).toBeDefined();
    expect(logoLinkRule).not.toMatch(/overflow:\s*hidden/);
  });

  it.each([
    ['search results', searchStyles],
    ['project detail', detailStyles],
  ])('aligns the %s shell to the header search column', (_name, styles) => {
    expect(styles).toMatch(/\.shell\s*\{[^}]*max-width:\s*var\(--search-header-max-width\)/s);
    expect(styles).toMatch(
      /\.shell\s*\{[^}]*grid-template-columns:\s*var\(--search-content-offset\)\s+minmax\(var\(--space-0\), var\(--search-content-max-width\)\)/s,
    );
    expect(styles).toMatch(/\.shell\s*>\s*\*\s*\{[^}]*grid-column:\s*2/s);
    expect(styles).toMatch(/padding-inline:\s*var\(--search-content-padding-x\)/);
    expect(styles).not.toMatch(/\.shell\s*\{[^}]*\n\s+gap:/s);
  });
});
