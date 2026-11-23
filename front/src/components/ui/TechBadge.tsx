import type { MouseEventHandler } from 'react';
import {
  siClaude,
  siCss,
  siDjango,
  siDocker,
  siFastapi,
  siFigma,
  siFirebase,
  siGin,
  siGit,
  siGithubactions,
  siGo,
  siGooglegemini,
  siHtml5,
  siJavascript,
  siLangchain,
  siModelcontextprotocol,
  siMongodb,
  siNestjs,
  siNextdotjs,
  siNginx,
  siPostgresql,
  siPython,
  siReact,
  siReactivex,
  siRedis,
  siSass,
  siSupabase,
  siTypescript,
  siVuedotjs,
  siAngular,
  type SimpleIcon,
} from 'simple-icons';
import styles from './TechBadge.module.scss';

// 기술 이름 → Simple Icons 아이콘. 없는 이름(AWS·OpenAI·Adobe 등 상표 문제로 빠진 것)은 글자만 보인다
const TECH_ICONS: Record<string, SimpleIcon> = {
  Angular: siAngular,
  TypeScript: siTypescript,
  RxJS: siReactivex,
  Go: siGo,
  Gin: siGin,
  MongoDB: siMongodb,
  Git: siGit,
  Python: siPython,
  Redis: siRedis,
  Firebase: siFirebase,
  Docker: siDocker,
  HTML: siHtml5,
  CSS: siCss,
  Sass: siSass,
  JavaScript: siJavascript,
  React: siReact,
  'Next.js': siNextdotjs,
  'Vue.js': siVuedotjs,
  FastAPI: siFastapi,
  Django: siDjango,
  NestJS: siNestjs,
  PostgreSQL: siPostgresql,
  Supabase: siSupabase,
  Nginx: siNginx,
  'GitHub Actions': siGithubactions,
  'Claude Code': siClaude,
  Gemini: siGooglegemini,
  LangChain: siLangchain,
  MCP: siModelcontextprotocol,
  Figma: siFigma,
};

interface TechBadgeProps {
  name: string;
  /** 있으면 누를 수 있는 버튼, 없으면 표시용 */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: 'md' | 'sm';
}

/** 기술 이름 배지: 연한 회색 바탕 + 브랜드 색 아이콘 (Simple Icons) */
export function TechBadge({ name, onClick, size = 'md' }: TechBadgeProps) {
  const icon = TECH_ICONS[name];
  const content = (
    <>
      {icon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: `#${icon.hex}` }}>
          <path d={icon.path} />
        </svg>
      ) : null}
      {name}
    </>
  );
  return onClick ? (
    <button className={styles.badge} data-size={size} type="button" onClick={onClick} aria-label={`${name} 설명으로 이동`}>
      {content}
    </button>
  ) : (
    <span className={styles.badge} data-size={size}>
      {content}
    </span>
  );
}
