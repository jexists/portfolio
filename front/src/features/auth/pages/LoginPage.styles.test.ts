import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tokens from '@/styles/tokens.json';

const styles = readFileSync(resolve('src/features/auth/pages/LoginPage.module.scss'), 'utf8');

describe('Login layout styles', () => {
  it('keeps each provider icon and label centered on one line', () => {
    const buttonDeclarations = styles.match(/\.providerButton\s*\{([^}]*)\}/)?.[1];

    expect(buttonDeclarations).toBeDefined();
    expect(buttonDeclarations).toMatch(/display:\s*inline-flex/);
    expect(buttonDeclarations).toMatch(/align-items:\s*center/);
    expect(buttonDeclarations).toMatch(/justify-content:\s*center/);
    expect(buttonDeclarations).toMatch(/gap:\s*var\(--space-3\)/);
    expect(buttonDeclarations).toMatch(/width:\s*var\(--layout-full\)/);
    expect(buttonDeclarations).toMatch(/height:\s*var\(--login-provider-height\)/);
    expect(buttonDeclarations).toMatch(/white-space:\s*nowrap/);
    expect(tokens.login['provider-height']).toBe('3rem');
    expect(tokens.login['provider-icon-size']).toBe('1.125rem');
  });

  it('uses the compact card proportions and branded hover colors', () => {
    expect(tokens.login['card-width']).toBe('25rem');
    expect(tokens.login['card-padding']).toBe('2.5rem');
    expect(styles).toMatch(/\.card\s*\{[^}]*gap:\s*var\(--space-8\)/s);
    expect(styles).toMatch(/\.card\s*\{[^}]*box-shadow:\s*var\(--shadow-sm\)/s);
    expect(styles).toMatch(/\.kakao:hover\s*\{[^}]*var\(--color-auth-kakao-hover\)/s);
    expect(styles).toMatch(/\.github:hover\s*\{[^}]*var\(--color-auth-github-hover\)/s);
    expect(styles).toMatch(/\.providerButton\s*\{[^}]*transform var\(--motion-duration-normal\)/s);
    expect(styles).toMatch(/\.kakao:hover\s*\{[^}]*translateY\(var\(--motion-translate-hover-lift\)\)/s);
    expect(styles).toMatch(/\.github:hover\s*\{[^}]*box-shadow:\s*var\(--shadow-md\)/s);
  });

  it('positions the muted back button without affecting the centered card flow', () => {
    expect(styles).toMatch(/\.card\s*\{[^}]*position:\s*relative/s);
    expect(styles).toMatch(/\.backButton\s*\{[^}]*position:\s*absolute/s);
    expect(styles).toMatch(/\.backButton\s*\{[^}]*color:\s*var\(--color-text-muted\)/s);
    expect(styles).toMatch(/\.backButton:hover\s*\{[^}]*background:\s*var\(--color-bg-subtle\)/s);
    expect(tokens.login['back-button-inset']).toBe('1rem');
    expect(tokens.login['back-button-size']).toBe('2.5rem');
    expect(tokens.login['back-icon-size']).toBe('1.25rem');
  });

  it('uses the login-specific logo size and places the large offset below it', () => {
    const logoLinkDeclarations = styles.match(/\.logoLink\s*\{([^}]*)\}/)?.[1];

    expect(tokens.login['logo-size']).toBe('2.94rem');
    expect(tokens.login['logo-offset-bottom']).toBe('8.4375rem');
    expect(logoLinkDeclarations).toBeDefined();
    expect(logoLinkDeclarations).toMatch(
      /--font-size-logo:\s*var\(--login-logo-size\)/,
    );
    expect(logoLinkDeclarations).toMatch(
      /--logo-compact-font-size:\s*var\(--login-logo-size\)/,
    );
    expect(logoLinkDeclarations).not.toMatch(/(?:^|[;\s])font-size\s*:/);
    expect(styles).not.toMatch(/\.logoLink\s*\{[^}]*> div\s*\{/s);
    expect(styles).toMatch(/\.logoBlock\s*\{[^}]*margin-top:\s*var\(--space-8\)/s);
    expect(styles).toMatch(/\.logoBlock\s*\{[^}]*margin-bottom:\s*var\(--login-logo-offset-bottom\)/s);
    expect(styles).toMatch(/\.tagline\s*\{[^}]*margin:\s*var\(--space-3\)/s);
  });

  it('lays out accessible purpose cards and disables transitions for reduced motion', () => {
    expect(tokens.login['purpose-card-height']).toBe('6.5rem');
    expect(styles).toMatch(/\.purposeGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
    expect(styles).toMatch(/\.purposeButton\s*\{[^}]*border-radius:\s*var\(--radius-lg\)/s);
    expect(styles).toMatch(/\.purposeButton:hover:not\(:disabled\)\s*\{[^}]*translateY\(var\(--motion-translate-hover-lift\)\)/s);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.providerButton,[^}]*transition:\s*none/s);
  });
});
