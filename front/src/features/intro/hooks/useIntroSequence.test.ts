import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIntroSequence } from './useIntroSequence';

function setReducedMotion(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('useIntroSequence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    setReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('advances phases on the intro timeline and completes at the end', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useIntroSequence({ onComplete }));

    expect(result.current.phase).toBe('logo');
    expect(result.current.typedText).toBe('');
    expect(result.current.suggestOpen).toBe(false);

    act(() => vi.advanceTimersByTime(1200));
    expect(result.current.phase).toBe('typing');
    expect(result.current.typedText).toBe('정');
    expect(result.current.suggestOpen).toBe(false);

    act(() => vi.advanceTimersByTime(350));
    expect(result.current.typedText).toBe('정주');
    expect(result.current.suggestOpen).toBe(false);

    act(() => vi.advanceTimersByTime(350));
    expect(result.current.typedText).toBe('정주애');
    expect(result.current.suggestOpen).toBe(true);

    act(() => vi.advanceTimersByTime(350));
    expect(result.current.typedText).toBe('정주애');

    act(() => vi.advanceTimersByTime(350));
    expect(result.current.phase).toBe('cursor');
    expect(result.current.typedText).toBe('정주애 포트폴리오');

    act(() => vi.advanceTimersByTime(1199));
    expect(result.current.phase).toBe('cursor');
    expect(result.current.suggestOpen).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skips immediately', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useIntroSequence({ onComplete }));

    act(() => result.current.skip());

    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(3800));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not autoplay for reduced-motion users', () => {
    setReducedMotion(true);
    const onComplete = vi.fn();
    const { result } = renderHook(() => useIntroSequence({ onComplete }));

    expect(result.current.phase).toBe('static');
    expect(result.current.typedText).toBe('정주애 포트폴리오');
    expect(result.current.suggestOpen).toBe(false);

    act(() => vi.advanceTimersByTime(3800));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('autoplays again on a second render in the same session', () => {
    const firstOnComplete = vi.fn();
    const firstRender = renderHook(() => useIntroSequence({ onComplete: firstOnComplete }));

    act(() => vi.advanceTimersByTime(3800));
    expect(firstOnComplete).toHaveBeenCalledTimes(1);
    firstRender.unmount();

    const secondOnComplete = vi.fn();
    const secondRender = renderHook(() => useIntroSequence({ onComplete: secondOnComplete }));

    expect(secondRender.result.current.phase).toBe('logo');
    expect(secondRender.result.current.typedText).toBe('');

    act(() => vi.advanceTimersByTime(3800));
    expect(secondOnComplete).toHaveBeenCalledTimes(1);
  });
});
