import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type IntroPhase = 'static' | 'logo' | 'typing' | 'cursor';

interface UseIntroSequenceOptions {
  onComplete: () => void;
}

interface TimelineItem {
  delay: number;
}

const TYPED_QUERY = '정주애';
const SELECTED_QUERY = '정주애 포트폴리오';
const TIMELINE: Array<TimelineItem & { phase?: IntroPhase; suggestOpen?: boolean; complete?: true }> = [
  { delay: 1200, phase: 'typing' },
  { delay: 1900, suggestOpen: true },
  { delay: 2600, phase: 'cursor' },
  { delay: 3800, complete: true },
];
const TYPE_TIMELINE = [...TYPED_QUERY].map((_, index) => ({
  delay: 1200 + index * 350,
  text: TYPED_QUERY.slice(0, index + 1),
}));

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function getRelativeDelay(item: TimelineItem, previousItem?: TimelineItem): number {
  return previousItem ? item.delay - previousItem.delay : item.delay;
}

export function useIntroSequence({ onComplete }: UseIntroSequenceOptions) {
  const shouldAutoplay = useMemo(() => !prefersReducedMotion(), []);
  const [phase, setPhase] = useState<IntroPhase>(shouldAutoplay ? 'logo' : 'static');
  const [typedText, setTypedText] = useState(shouldAutoplay ? '' : SELECTED_QUERY);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const complete = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!shouldAutoplay) {
      return undefined;
    }

    function scheduleChain<T extends TimelineItem>(items: T[], onTick: (item: T) => void, index = 0): void {
      const item = items[index];

      if (!item) {
        return;
      }

      const timer = window.setTimeout(() => {
        onTick(item);
        scheduleChain(items, onTick, index + 1);
      }, getRelativeDelay(item, items[index - 1]));

      timersRef.current.push(timer);
    }

    scheduleChain(TIMELINE, (item) => {
      if (item.complete) {
        complete();
        return;
      }

      if (item.phase) {
        setPhase(item.phase);

        if (item.phase === 'cursor') {
          setTypedText(SELECTED_QUERY);
        }
      }

      if (typeof item.suggestOpen === 'boolean') {
        setSuggestOpen(item.suggestOpen);
      }
    });
    scheduleChain(TYPE_TIMELINE, (item) => setTypedText(item.text));

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [complete, shouldAutoplay]);

  return {
    phase,
    typedText,
    suggestOpen,
    skip: complete,
  };
}
