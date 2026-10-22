import tokens from './tokens.json';

type TokenValue = string | number;
type TokenTree = {
  [key: string]: TokenTree | TokenValue;
};

function isTokenTree(value: unknown): value is TokenTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function flattenTokens(
  tree: TokenTree,
  path: string[] = [],
): Record<string, TokenValue> {
  return Object.entries(tree).reduce<Record<string, TokenValue>>((accumulator, [key, value]) => {
    if (key === 'description') {
      return accumulator;
    }

    if (isTokenTree(value)) {
      return {
        ...accumulator,
        ...flattenTokens(value, [...path, key]),
      };
    }

    accumulator[`--${[...path, key].join('-')}`] = value;
    return accumulator;
  }, {});
}

export function tokensToCssVariables(tree: TokenTree): string {
  const declarations = Object.entries(flattenTokens(tree))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `:root {\n${declarations}\n}`;
}

export function applyTokens(target: Document = document): void {
  const styleId = 'portfolio-design-tokens';
  const existing = target.getElementById(styleId);
  const style = existing ?? target.createElement('style');

  style.id = styleId;
  style.textContent = tokensToCssVariables(tokens);

  if (!existing) {
    target.head.append(style);
  }
}
