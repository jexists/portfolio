import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const styles = readFileSync(resolve('src/features/intro/pages/IntroPage.module.scss'), 'utf8');

describe('Intro search surface styles', () => {
  it('switches suggestion radii immediately while height remains animated', () => {
    const openSurfaceDeclarations = styles.match(
      /\.searchSurface\[data-suggest-open='true'\]\s*\{([^{}]*?)\.searchBox/s,
    )?.[1];
    const openSearchBoxDeclarations = styles.match(
      /\.searchSurface\[data-suggest-open='true'\][\s\S]*?\.searchBox\s*\{([^}]*)\}/,
    )?.[1];

    expect(styles).not.toMatch(/transition:\s*border-radius\b/);
    expect(styles).toMatch(
      /\.searchSurface\s*\{[^}]*border-radius:\s*var\(--radius-pill\)/s,
    );
    expect(styles).toMatch(
      /\.searchSurface\[data-suggest-open='true'\]\s*\{\s*border-radius:\s*var\(--intro-suggest-surface-radius\)/s,
    );
    expect(styles).toMatch(
      /\.searchSurface\[data-suggest-open='true'\][\s\S]*?\.searchBox\s*\{\s*border-radius:\s*var\(--radius-pill\) var\(--radius-pill\) var\(--space-0\) var\(--space-0\)/,
    );
    expect(styles).toMatch(
      /grid-template-rows var\(--motion-duration-normal\) var\(--motion-easing-standard\)/,
    );
    expect(openSurfaceDeclarations).toBeDefined();
    expect(openSearchBoxDeclarations).toBeDefined();
    expect(openSurfaceDeclarations).not.toMatch(/(?:width|padding|box-shadow|transition):/);
    expect(openSearchBoxDeclarations).not.toMatch(/(?:width|padding|box-shadow|transition):/);
    expect(styles.match(/box-shadow:/g)).toHaveLength(1);
  });
});
