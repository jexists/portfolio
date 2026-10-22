import { flattenTokens, tokensToCssVariables } from './applyTokens';

describe('design token conversion', () => {
  it('flattens nested token groups to css custom property names', () => {
    const flattened = flattenTokens({
      color: {
        description: '색상',
        brand: {
          blue: '#4285F4',
        },
      },
      motion: {
        duration: {
          fast: '120ms',
        },
      },
    });

    expect(flattened).toEqual({
      '--color-brand-blue': '#4285F4',
      '--motion-duration-fast': '120ms',
    });
  });

  it('creates a :root css variable block', () => {
    const css = tokensToCssVariables({
      color: {
        brand: {
          red: '#EA4335',
        },
      },
    });

    expect(css).toContain(':root {');
    expect(css).toContain('  --color-brand-red: #EA4335;');
  });
});
