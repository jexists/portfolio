import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/free-mode';
import styles from './CategoryTabs.module.scss';

export type SearchTab = 'all' | 'career' | 'skills' | 'education' | 'certs' | 'projects';

/** 검색결과 탭. 인물정보 카드의 칩 탭도 같은 목록을 쓴다. */
export const searchTabs: Array<{ value: SearchTab; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'career', label: '경력' },
  { value: 'skills', label: '기술' },
  { value: 'education', label: '학력' },
  { value: 'certs', label: '자격·수상' },
  { value: 'projects', label: '프로젝트' },
];
const tabs = searchTabs;

export function isSearchTab(value: string | null): value is SearchTab {
  return tabs.some((tab) => tab.value === value);
}

interface CategoryTabsProps {
  value: SearchTab;
  onChange: (value: SearchTab) => void;
}

type IndicatorStyle = CSSProperties & {
  '--search-tab-indicator-width': string;
  '--search-tab-indicator-x': string;
};

const initialIndicatorStyle: IndicatorStyle = {
  '--search-tab-indicator-width': '0px',
  '--search-tab-indicator-x': '0px',
};

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>(initialIndicatorStyle);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.value === value),
    0,
  );

  useLayoutEffect(() => {
    const activeTab = tabRefs.current[activeIndex];
    const activeSlide = activeTab?.parentElement;

    if (activeTab && activeSlide) {
      setIndicatorStyle({
        '--search-tab-indicator-width': `${activeTab.offsetWidth}px`,
        '--search-tab-indicator-x': `${activeSlide.offsetLeft + activeTab.offsetLeft}px`,
      });
    }

    swiper?.slideTo(activeIndex);
  }, [activeIndex, swiper]);

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === undefined) return;

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onChange(tabs[nextIndex].value);
  };

  return (
    <nav className={styles.tabs} aria-label="검색 탭">
      <Swiper
        className={styles.tabList}
        modules={[FreeMode]}
        slidesPerView="auto"
        freeMode={{ enabled: true, momentum: true }}
        grabCursor
        simulateTouch
        role="tablist"
        aria-label="검색 탭"
        onSwiper={setSwiper}
        style={indicatorStyle}
      >
        {tabs.map((tab, index) => (
          <SwiperSlide className={styles.tabSlide} role="presentation" key={tab.value}>
            <button
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              className={styles.tab}
              type="button"
              role="tab"
              aria-selected={value === tab.value}
              tabIndex={value === tab.value ? 0 : -1}
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => moveSelection(event, index)}
            >
              {tab.label}
            </button>
          </SwiperSlide>
        ))}
        <span className={styles.indicator} slot="wrapper-end" aria-hidden="true" />
      </Swiper>
    </nav>
  );
}
