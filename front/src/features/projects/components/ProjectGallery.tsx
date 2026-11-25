import { useEffect, useRef, useState } from 'react';
import { RailButton } from '@/components/ui/RailButton';
import type { ProjectImage } from '@/features/projects/types/project.types';
import styles from './ProjectGallery.module.scss';

/** 프로젝트 상세 "화면": 한 장씩 넘기는 캐러셀, 누르면 전체보기(dialog) */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const last = images.length - 1;

  function go(next: number) {
    const target = Math.min(Math.max(next, 0), last);
    setIndex(target);
    const track = trackRef.current;
    track?.scrollTo({ left: target * track.clientWidth });
  }

  // 손가락으로 넘겨도(스크롤 스냅) 위치 표시가 따라가게 한다
  function syncFromScroll() {
    const track = trackRef.current;
    if (track?.clientWidth) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  // 지금 장의 썸네일이 줄 밖에 있으면 보이게 옮긴다 (페이지 세로 스크롤은 건드리지 않는다)
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const { offsetLeft, offsetWidth } = thumb;
    if (offsetLeft < strip.scrollLeft || offsetLeft + offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: offsetLeft - (strip.clientWidth - offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [index]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // 전체보기 중 ←/→ 로 넘긴다 (Esc 는 dialog 기본 동작)
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(index + 1);
      if (event.key === 'ArrowLeft') go(index - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const image = images[index];
  // "4차 · AI 챗봇" 처럼 앞에 붙은 차수는 배지로 떼어 낸다
  const [, phase, title = image.caption] = /^(\d+차) · (.+)$/.exec(image.caption) ?? [];
  const arrows = (
    <>
      {index > 0 ? <RailButton side="prev" label="이전 화면" onClick={() => go(index - 1)} /> : null}
      {index < last ? <RailButton side="next" label="다음 화면" onClick={() => go(index + 1)} /> : null}
    </>
  );

  return (
    <div className={styles.gallery} role="group" aria-label="화면 캐러셀">
      <div className={styles.frame}>
        <div className={styles.track} ref={trackRef} onScroll={syncFromScroll}>
          {images.map((item, itemIndex) => (
            <button
              key={item.src}
              className={styles.slide}
              type="button"
              aria-label={`${item.caption} 크게 보기`}
              aria-hidden={itemIndex !== index}
              tabIndex={itemIndex === index ? 0 : -1}
              onClick={() => setOpen(true)}
            >
              {/* 지금 장과 다음 장만 바로 받고 나머지는 넘길 때 받는다 */}
              <img src={item.src} alt="" loading={itemIndex <= index + 1 ? 'eager' : 'lazy'} />
            </button>
          ))}
        </div>
        {/* 사진 바로 아래 어두운 띠: 설명은 가운데, 위치는 오른쪽 */}
        <div className={styles.bar}>
          <p className={styles.caption}>
            {phase ? <span className={styles.phase}>{phase}</span> : null}
            {title}
          </p>
          <span className={styles.count}>
            {index + 1} / {images.length}
          </span>
        </div>
        {open ? null : arrows}
      </div>
      <div className={styles.thumbs} ref={thumbsRef}>
        {images.map((item, itemIndex) => (
          <button
            key={item.src}
            className={styles.thumb}
            type="button"
            aria-label={`${item.caption} 보기`}
            aria-current={itemIndex === index}
            onClick={() => go(itemIndex)}
          >
            <img src={item.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={image.caption}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === event.currentTarget && setOpen(false)}
      >
        {open ? (
          <>
            <div className={styles.dialogHeader}>
              <p>
                {image.caption} · {index + 1} / {images.length}
              </p>
              <button className={styles.close} type="button" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
            <div className={styles.stage}>
              <div className={styles.viewer}>
                <img src={image.src} alt={image.caption} />
              </div>
              {arrows}
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
