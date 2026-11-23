import { assetUrl } from './assetUrl';

describe('assetUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('prefixes the deploy base path to public images only', () => {
    vi.stubEnv('BASE_URL', '/portfolio/');
    expect(assetUrl('/images/profile/avatar.webp')).toBe('/portfolio/images/profile/avatar.webp');
    expect(assetUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  it('leaves the path alone at the site root', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(assetUrl('/images/a.png')).toBe('/images/a.png');
  });
});
