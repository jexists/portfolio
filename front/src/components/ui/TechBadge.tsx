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
  siDify,
  siFfmpeg,
  siJetpackcompose,
  siJquery,
  siKotlin,
  siLanggraph,
  siPandas,
  siPrisma,
  siStreamlit,
  siTypeorm,
  siVite,
  siVitest,
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
  Claude: siClaude,
  Dify: siDify,
  FFmpeg: siFfmpeg,
  ffmpeg: siFfmpeg,
  'Jetpack Compose': siJetpackcompose,
  jQuery: siJquery,
  Kotlin: siKotlin,
  LangGraph: siLanggraph,
  pandas: siPandas,
  Prisma: siPrisma,
  SCSS: siSass,
  Streamlit: siStreamlit,
  TypeORM: siTypeorm,
  Vite: siVite,
  Vitest: siVitest,
};

// Simple Icons 에 없는 것(Adobe·OpenAI·AWS)은 로고 대신 색 네모 + 글자로 그린다 (브랜드 색은 Simple Icons hex 처럼 인라인).
// 글자가 세 자면 size 를 줄인다
const LETTER_ICONS: Record<string, { text: string; fg: string; bg: string; size?: number }> = {
  Photoshop: { text: 'Ps', fg: '#31A8FF', bg: '#001E36' },
  Illustrator: { text: 'Ai', fg: '#FF9A00', bg: '#330000' },
  InDesign: { text: 'Id', fg: '#FF3366', bg: '#49021F' },
  ChatGPT: { text: 'GPT', fg: '#FFFFFF', bg: '#10A37F', size: 9 },
  Codex: { text: 'Cx', fg: '#FFFFFF', bg: '#000000' },
  AWS: { text: 'aws', fg: '#FF9900', bg: '#232F3E', size: 10 },
  OpenAI: { text: 'AI', fg: '#FFFFFF', bg: '#000000' },
  'OpenAI TTS': { text: 'AI', fg: '#FFFFFF', bg: '#000000' },
  // pgvector 는 PostgreSQL 확장이라 PostgreSQL 브랜드 파랑
  pgvector: { text: 'pv', fg: '#FFFFFF', bg: '#4169E1' },
};

interface TechBadgeProps {
  name: string;
  /** 있으면 누를 수 있는 버튼, 없으면 표시용 */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: 'md' | 'sm';
}

/** 기술 이름의 브랜드 아이콘 (Simple Icons). 없으면 null */
export function TechIcon({ name }: { name: string }) {
  const icon = TECH_ICONS[name];
  const letter = LETTER_ICONS[name];
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: `#${icon.hex}` }}>
        <path d={icon.path} />
      </svg>
    );
  }
  if (letter) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill={letter.bg} />
        <text x="12" y="16.5" textAnchor="middle" fontSize={letter.size ?? 12} fontWeight="700" fill={letter.fg}>
          {letter.text}
        </text>
      </svg>
    );
  }
  return null;
}

/** 기술 이름 배지: 연한 회색 바탕 + 브랜드 색 아이콘 (Simple Icons) */
export function TechBadge({ name, onClick, size = 'md' }: TechBadgeProps) {
  const content = (
    <>
      <TechIcon name={name} />
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
