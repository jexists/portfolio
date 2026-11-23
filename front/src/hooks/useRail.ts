import { useEffect, useRef, useState } from 'react';

/** 가로 스크롤 레일: 양 끝 도달 여부와 한 칸(보이는 폭의 1/step) 이동 */
export function useRail<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = [], step = 3) {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  function update() {
    const rail = ref.current;
    if (rail) setEdge({ start: rail.scrollLeft <= 1, end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 });
  }

  function scroll(direction: 1 | -1) {
    const rail = ref.current;
    rail?.scrollBy({ left: (direction * rail.clientWidth) / step, behavior: 'smooth' });
  }

  // 호출한 쪽이 넘긴 deps 가 바뀔 때만 다시 잰다
  useEffect(update, deps);

  return { ref, edge, update, scroll };
}
