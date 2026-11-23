import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation } from 'react-router';
import { Card } from '@/components/ui/Card';
import { RailButton } from '@/components/ui/RailButton';
import { TechBadge } from '@/components/ui/TechBadge';
import { useRail } from '@/hooks/useRail';
import type { Career, Credential, Education, Period, Skill, SkillSection } from '@/features/resume/types/resume.types';
import { CERTIFICATE_COUNT } from '../utils/profileFacts';
import styles from './ResumeSections.module.scss';

// 시작과 끝이 같으면(한 해짜리 학년 등) 하나만 쓴다
const period = (value: { start: string; end: string }) =>
  !value.end || value.start === value.end ? value.start : `${value.start} – ${value.end}`;

function Bullets({ items }: { items: string[] }) {
  return items.length ? (
    <ul className={styles.bullets}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : null;
}

const careerAnchor = (id: string) => `career-${id}`;

// 기술 이름 → 아이콘 배지 이름 (기술 탭 배지와 같게). 묶인 이름은 바꾸고 Adobe 는 뺀다
const BADGE_SPLIT: Record<string, string[]> = { 'Go (Gin)': ['Go'], 'CSS / SCSS': ['CSS', 'Sass'] };
const badgeNames = (name: string) => BADGE_SPLIT[name] ?? [name.replace(/^Adobe /, '')];

/** 경력의 기술을 아이콘 배지로 (경력 탭 카드·경력 상세 서비스 개요 공용) */
export function CareerTechBadges({ career, skills }: { career: Career; skills: Skill[] }) {
  const skillName = new Map(skills.map((skill) => [skill.id, skill.name]));
  return (
    <ul className={styles.techBadges}>
      {career.skillIds
        .flatMap((id) => badgeNames(skillName.get(id) ?? id))
        .map((name) => (
          <li key={name}>
            <TechBadge name={name} />
          </li>
        ))}
    </ul>
  );
}

/** 내용 속에서 links.text 와 같은 글자(앞에서부터 처음 나오는 곳)만 링크로 건다 */
function FactText({ text, links = [] }: { text: string; links?: Array<{ text: string; url: string }> }) {
  const parts: ReactNode[] = [];
  let rest = text;
  for (const link of links) {
    const at = rest.indexOf(link.text);
    if (at < 0) continue;
    parts.push(
      rest.slice(0, at),
      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
        {link.text}
      </a>,
    );
    rest = rest.slice(at + link.text.length);
  }
  return (
    <>
      {parts}
      {rest}
    </>
  );
}

/** 상세 문서가 있으면 상세 화면, 없으면 경력 탭의 그 회사 위치 */
const careerLink = (career: Career) =>
  career.body ? `/career/${career.id}` : `/search?tab=career#${careerAnchor(career.id)}`;

interface CareerSectionProps {
  careers: Career[];
  skills: Skill[];
}

/** 경력 탭: 경력 타임라인(+ 경력기술서 보기) → 회사별 카드 */
export function CareerSection({ careers, skills }: CareerSectionProps) {
  const location = useLocation();
  const main = careers.filter((career) => !career.minor);
  const minor = careers.filter((career) => career.minor);

  // 타임라인·전체 탭에서 #career-<id> 로 오면 그 회사 카드로 내려간다 (같은 링크를 다시 눌러도 key 가 바뀐다).
  // 헤더 높이만큼 띄우는 건 .career 의 scroll-margin-top 이 맡아서 새로고침 때 브라우저 이동과 위치가 같다
  useEffect(() => {
    if (!location.hash) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }, [location.hash, location.key]);

  return (
    <>
      <HTimeline
        title="경력 타임라인"
        items={main.map((career) => careerItem(career, `/search?tab=career#${careerAnchor(career.id)}`))}
        more={
          <Link className={styles.moreLink} to="/search?tab=careerdoc">
            경력기술서 보기 <span aria-hidden="true">→</span>
          </Link>
        }
      />
      {main.map((career) => (
        <Card key={career.id} ariaLabel={career.company}>
          <article className={styles.career} id={careerAnchor(career.id)}>
            <header className={styles.careerHead}>
              <h3>
                {career.body ? <Link to={`/career/${career.id}`}>{career.company}</Link> : career.company}
                {career.companyNote ? <small>{career.companyNote}</small> : null}
              </h3>
              <span>
                {period(career.period)} · {career.duration}
              </span>
            </header>
            <p className={`${styles.muted} ${styles.careerRole}`}>{career.role}</p>
            {career.facts?.length ? (
              <dl className={styles.careerFacts}>
                {career.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>
                      <FactText text={fact.text} links={fact.links} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : career.service ? (
              <p>{career.service}</p>
            ) : null}
            {career.responsibilities.length ? (
              <>
                <h4 className={styles.subhead}>담당 범위</h4>
                <Bullets items={career.responsibilities} />
              </>
            ) : null}
            {career.collaboration?.length ? (
              <>
                <h4 className={styles.subhead}>협업</h4>
                <Bullets items={career.collaboration} />
              </>
            ) : null}
            {career.skillIds.length ? (
              <>
                <h4 className={styles.subhead}>기술</h4>
                <CareerTechBadges career={career} skills={skills} />
              </>
            ) : null}
            {career.body ? (
              <div className={styles.careerLinks}>
                <Link to={`/career/${career.id}`}>
                  프로젝트 보기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : null}
          </article>
        </Card>
      ))}
      {minor.length ? (
        <Card title="그 밖의 경력">
          <ul className={`${styles.rows} ${styles.minorRows}`}>
            {minor.map((career) => (
              <li key={career.id}>
                <span className={styles.when}>{period(career.period)}</span>
                <div>
                  <p className={styles.strong}>{career.company}</p>
                  <p className={styles.muted}>{career.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}

interface SkillsSectionProps {
  skills: Skill[];
  /** 맨 위 기술 요점 (profiles.json skillSummary) */
  summary: Array<{ label: string; items: string[] }>;
  /** 맨 아래 언어 (profiles.json languages) */
  languages: LabeledText[];
}

interface LabeledText {
  label: string;
  text: string;
}

const SKILL_SECTIONS: Array<{ key: SkillSection; filter: string; title: string; note: string }> = [
  { key: 'work', filter: '실무', title: '실무', note: '회사에서 운영하며 사용' },
  {
    key: 'project',
    filter: '프로젝트',
    title: '프로젝트 기반 기술',
    note: '교육·개인 프로젝트 (AI 코딩 도구로 구현, 기획·설계·검수 직접 진행)',
  },
  { key: 'ai', filter: 'AI', title: 'AI 활용 기술', note: '교육·개인 프로젝트에서 사용' },
  { key: 'design', filter: '디자인', title: '디자인', note: '산업디자인 전공, 뉴스게이트 편집디자인 3년 실무, 교육·개인 프로젝트에서 사용' },
  { key: 'other', filter: '기타', title: '기타 기술 및 도구 경험', note: '' },
];

// 배지 이름 → 아래 카드의 기술 박스 id. 이름이 박스 이름과 다르거나(Gin → Go (Gin)) 묶여 있는 것(Codex → Claude Code · Codex)
const TECH_TARGET: Record<string, string> = {
  Angular: 'angular',
  TypeScript: 'typescript',
  RxJS: 'rxjs',
  Go: 'go',
  Gin: 'go',
  MongoDB: 'mongodb',
  Git: 'git',
  Python: 'python',
  Redis: 'redis',
  Firebase: 'firebase',
  Docker: 'docker-work',
  AWS: 'aws-work',
  HTML: 'html-css',
  CSS: 'css',
  Sass: 'css',
  JavaScript: 'javascript',
  React: 'react',
  'Next.js': 'nextjs',
  'Vue.js': 'vue',
  FastAPI: 'fastapi',
  Django: 'fastapi',
  NestJS: 'nestjs',
  PostgreSQL: 'postgresql',
  Supabase: 'supabase',
  Nginx: 'docker',
  'GitHub Actions': 'actions',
  'Claude Code': 'ai-coding',
  Codex: 'ai-coding',
  MCP: 'ai-coding',
  ChatGPT: 'llm-chat',
  Gemini: 'llm-chat',
  LangChain: 'rag',
  Figma: 'figma',
  Photoshop: 'photoshop',
  Illustrator: 'illustrator',
  InDesign: 'indesign',
};

const skillBoxId = (id: string) => `skill-box-${id}`;
const skillSectionId = (key: SkillSection) => `skill-section-${key}`;

// 기술 요점 줄 → "자세히 보기"로 내려갈 카드
const SUMMARY_SECTION: Record<string, SkillSection> = {
  '주요 실무 기술': 'work',
  '기타 활용 기술': 'work',
  '프로젝트 경험 기술': 'project',
  'AI 활용': 'ai',
  디자인: 'design',
};

/** 카드 위 테두리가 고정 헤더 바로 아래(살짝 띄워서) 보이게 스크롤한다 */
function scrollToSection(key: SkillSection) {
  const card = document.getElementById(skillSectionId(key))?.closest('section');
  if (!card) return;
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
  const gap = parseFloat(getComputedStyle(document.documentElement).fontSize); // 1rem
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({
    top: card.getBoundingClientRect().top + window.scrollY - headerHeight - gap,
    behavior: reduce ? 'auto' : 'smooth',
  });
}

function scrollToSkill(id: string) {
  const box = document.getElementById(skillBoxId(id));
  if (!box) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  // 도착한 박스 테두리를 잠깐 깜빡여 찾기 쉽게 한다. 같은 배지를 다시 눌러도 처음부터 깜빡이게 속성을 지웠다 다시 단다
  box.removeAttribute('data-flash');
  void box.offsetWidth;
  box.setAttribute('data-flash', 'true');
  box.addEventListener('animationend', () => box.removeAttribute('data-flash'), { once: true });
}

/** 기술 이름 배지 목록 (아이콘은 브랜드 색). 누르면 아래 해당 기술 박스로 스크롤한다 */
function TechBadges({ names, onSelect }: { names: string[]; onSelect: (skillId: string) => void }) {
  return (
    <ul className={styles.techBadges}>
      {names.map((name) => {
        const target = TECH_TARGET[name];
        return (
          <li key={name}>
            <TechBadge name={name} onClick={target ? () => onSelect(target) : undefined} />
          </li>
        );
      })}
    </ul>
  );
}

/** 왼쪽 라벨 + 오른쪽 내용 줄 (언어) */
function LabeledRows({ rows }: { rows: LabeledText[] }) {
  return (
    <ul className={styles.rows}>
      {rows.map((row) => (
        <li key={row.label}>
          <span className={styles.rowLabel}>{row.label}</span>
          <p className={styles.rowValue}>{row.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** 기술 박스: 이름·한 줄 설명, 세부 내용이 있으면 박스나 화살표를 눌러 펼친다 */
function SkillBox({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false);
  const expandable = skill.details.length > 0;
  const detailId = `skill-${skill.id}`;

  return (
    <li
      id={skillBoxId(skill.id)}
      className={styles.skillBox}
      data-expandable={expandable}
      onClick={expandable ? (event) => {
        // 펼친 내용 안을 누를 때는 접지 않는다 (글자 선택 등)
        if (!(event.target as HTMLElement).closest(`.${styles.courseDetail}`)) setOpen((value) => !value);
      } : undefined}
    >
      <div className={styles.courseBody}>
        <h3>{skill.name}</h3>
        {skill.summary ? <p className={styles.muted}>{skill.summary}</p> : null}
      </div>
      {expandable ? (
        <button
          className={styles.courseToggle}
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          aria-label={`${skill.name} 내용 ${open ? '접기' : '펼치기'}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
      {expandable ? (
        <div className={styles.courseDetail} id={detailId} hidden={!open}>
          {skill.details.map((detail, index) => (
            <div key={detail.title || index} className={styles.skillDetail}>
              {detail.title ? <h4>{detail.title}</h4> : null}
              <ul className={styles.courseNotes}>
                {detail.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
}

/** 기술 탭: 기술 요점 → 실무 → 프로젝트 기반 기술 → AI 활용 기술 → 디자인 → 기타 → 언어 */
export function SkillsSection({ skills, summary, languages }: SkillsSectionProps) {
  const [filter, setFilter] = useState<SkillSection | 'all'>('all');
  const sections = SKILL_SECTIONS.filter(({ key }) => skills.some((skill) => skill.section === key));

  // 배지의 기술이 필터로 숨어 있으면 전체로 바꾼 뒤(바로 그려지게 flushSync) 스크롤한다
  function selectSkill(skillId: string) {
    const section = skills.find((skill) => skill.id === skillId)?.section;
    if (filter !== 'all' && filter !== section) flushSync(() => setFilter('all'));
    scrollToSkill(skillId);
  }

  return (
    <>
      {summary.length ? (
        <Card title="기술 요점">
          <ul className={styles.rows}>
            {summary.map((row) => {
              const section = SUMMARY_SECTION[row.label];
              return (
                <li key={row.label}>
                  {/* 라벨을 누르면 아래 해당 카드로 내려간다 */}
                  {section ? (
                    <button
                      className={styles.summaryLabel}
                      type="button"
                      onClick={() => scrollToSection(section)}
                      aria-label={`${row.label} 자세히 보기`}
                    >
                      {row.label}
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  ) : (
                    <span className={styles.rowLabel}>{row.label}</span>
                  )}
                  <TechBadges names={row.items} onSelect={selectSkill} />
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {/* 구분 필터: 카드 사이에 떠 보여 지금은 숨긴다. 기술 요점 배지·자세히 보기가 목차 역할을 한다
      <div className={`${styles.sortToggle} ${styles.skillFilter}`} role="group" aria-label="기술 구분">
        {[{ key: 'all' as const, filter: '전체' }, ...sections].map(({ key, filter: label }) => (
          <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      */}

      {sections.map(({ key, title, note }) => {
        if (filter !== 'all' && filter !== key) return null;
        const items = skills.filter((skill) => skill.section === key).sort((a, b) => a.order - b.order);
        if (!items.length) return null;
        // 데이터 순서대로 소제목을 묶는다
        const subgroups = [...new Set(items.map((skill) => skill.subgroup))];
        return (
          <Card key={key} ariaLabel={title}>
            <div className={styles.sectionHead} id={skillSectionId(key)}>
              <h2>
                {title}
                {note ? <small className={styles.headNote}>{note}</small> : null}
              </h2>
            </div>
            <div className={styles.skillGroups}>
              {subgroups.map((subgroup) => (
                <section key={subgroup || key} className={styles.skillGroup} aria-label={subgroup || title}>
                  {subgroup ? <h3>{subgroup}</h3> : null}
                  <ul className={styles.courseList}>
                    {items
                      .filter((skill) => skill.subgroup === subgroup)
                      .map((skill) => (
                        <SkillBox key={skill.id} skill={skill} />
                      ))}
                  </ul>
                </section>
              ))}
            </div>
          </Card>
        );
      })}

      {languages.length ? (
        <Card title="언어">
          <LabeledRows rows={languages} />
        </Card>
      ) : null}
    </>
  );
}

const newestFirst = (a: Education, b: Education) => b.period.start.localeCompare(a.period.start);
const year = (value: string) => value.slice(0, 4);
const yearRange = (value: Education['period']) =>
  year(value.start) === year(value.end) ? year(value.start) : `${year(value.start)}–${year(value.end)}`;

interface GlanceNode {
  id: string;
  name: string;
  period: Education['period'];
  label: string;
  kind: 'school' | 'course';
  top: boolean;
  years?: string;
}

/** 한눈에 보기 노드: 학교는 단계(초·중·고)마다 하나로 묶고, 교육은 중요 과정만.
 * 지금은 화면에서 숨겼다(EducationSection 의 주석). 다시 쓸 때를 위해 export 로 남겨 둔다. */
export function buildGlance(educations: Education[]): GlanceNode[] {
  const nodes: GlanceNode[] = [];
  const levels = new Map<string, Education[]>();
  for (const item of educations) {
    if (item.kind === 'degree') {
      nodes.push({ id: item.id, name: item.name, period: item.period, label: '최고학력', kind: 'school', top: true });
    } else if (item.kind === 'course') {
      if (item.featured) nodes.push({ id: item.id, name: item.name, period: item.period, label: '교육', kind: 'course', top: false });
    } else {
      const level = item.major ?? item.name;
      levels.set(level, [...(levels.get(level) ?? []), item]);
    }
  }
  for (const [level, items] of levels) {
    const sorted = [...items].sort(newestFirst);
    const latest = sorted[0];
    const first = sorted[sorted.length - 1];
    nodes.push({ id: latest.id, name: latest.name, period: { start: first.period.start, end: latest.period.end }, label: level, kind: 'school', top: false });
  }
  return nodes
    .sort((a, b) => b.period.start.localeCompare(a.period.start))
    .map((node) => ({ ...node, years: yearRange(node.period) }));
}

type CourseGroup = 'course' | 'study' | 'etc';
const COURSE_GROUP_LABEL: Record<CourseGroup, string> = { course: '교육 과정', study: '학습 모임·온라인', etc: '기타' };
// 주요 과정은 featured, 학습 모임·온라인 학습은 major 에 구분이 있고, 나머지(고용센터 프로그램 등)는 기타
const courseGroupOf = (item: Education): CourseGroup => (item.featured ? 'course' : item.major ? 'study' : 'etc');

/** 학력 탭: 학력(대학·최근 학교, 더보기로 나머지) → 교육(교육 과정 / 학습 모임·온라인, 화살표로 내용 펼침) */
/** 교육 카드에서 보여 줄 관련 프로젝트 (projects feature 의 ProjectMeta 와 같은 모양의 일부) */
export interface RelatedProject {
  slug: string;
  title: string;
  subtitle?: string;
}

export function EducationSection({ educations, projects = [] }: { educations: Education[]; projects?: RelatedProject[] }) {
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  const [showAll, setShowAll] = useState(false);
  const [courseGroup, setCourseGroup] = useState<CourseGroup>('course');
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());

  function toggleCourse(id: string) {
    setOpenCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const schools = educations.filter((item) => item.kind !== 'course').sort(newestFirst);
  const courses = educations.filter((item) => item.kind === 'course').sort(newestFirst);
  // 대학 + 가장 최근 학교(고3)만 기본으로 보이고, 나머지 학년·중학교·초등학교는 더보기로 펼친다
  const latestSchool = schools.find((item) => item.kind === 'school');
  const visibleSchools = showAll ? schools : schools.filter((item) => item.kind === 'degree' || item === latestSchool);
  const hiddenCount = schools.length - visibleSchools.length;
  const visibleCourses = courses.filter((item) => courseGroupOf(item) === courseGroup);

  return (
    <>
      {/* 학력·교육 한눈에 보기: 나중에 다시 쓸 수 있어 주석으로 남겨 둔다 (buildGlance 참고)
      <Card title="학력·교육 한눈에 보기">
        <div className={styles.legend} aria-hidden="true">
          <span data-kind="school">정규 학력</span>
          <span data-kind="course">교육·연수</span>
        </div>
        <ol className={styles.glance}>
          {buildGlance(educations).map((node) => (
            <li key={node.id} data-kind={node.kind} data-top={node.top}>
              <span className={styles.glanceNode} aria-hidden="true">
                <EducationIcon kind={node.kind} />
              </span>
              <span className={styles.glanceYear}>{node.years}</span>
              <b>{node.name}</b>
              {node.top ? <span className={styles.topBadge}>{node.label}</span> : <small>{node.label}</small>}
            </li>
          ))}
        </ol>
      </Card>
      */}
      {schools.length ? (
        <Card title="학력">
          <ol className={styles.timeline}>
            {visibleSchools.map((item) => (
              <li key={item.id} data-top={item.kind === 'degree'}>
                <article className={styles.schoolCard}>
                  <div className={styles.schoolHead}>
                    <span className={styles.when}>{period(item.period)}</span>
                    <span className={styles.badges}>
                      {item.kind === 'degree' ? <span className={styles.eduBadge} data-tone="top">최고학력</span> : null}
                      {item.degree ? <span className={styles.eduBadge}>{item.degree}</span> : null}
                    </span>
                  </div>
                  {item.kind === 'school' ? (
                    // 초·중·고는 2줄: 기간 / 학교명 + 지역 · 단계·학년
                    <p className={styles.schoolLine}>
                      <b>{item.name}</b>
                      <span>{[item.org, [item.major, item.notes[0]].filter(Boolean).join(' '), ...item.notes.slice(1)].join(' · ')}</span>
                    </p>
                  ) : (
                    <>
                      {/* 대학: 학교명 + 지역 한 줄, 그 아래 단과대·전공 한 줄 */}
                      <h3 className={styles.schoolLine}>
                        <b>{item.name}</b>
                        {item.org ? <span>{item.org}</span> : null}
                      </h3>
                      {item.major ? <p className={styles.muted}>{item.major}</p> : null}
                      {item.notes.length ? <p className={styles.note}>{item.notes.join(' · ')}</p> : null}
                    </>
                  )}
                </article>
              </li>
            ))}
          </ol>
          {hiddenCount || showAll ? (
            <button className={styles.foldButton} type="button" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>
              {showAll ? '접기' : '더보기'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={showAll ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
          ) : null}
        </Card>
      ) : null}
      {courses.length ? (
        <Card ariaLabel="교육">
          <div className={styles.sectionHead}>
            <h2>교육</h2>
            <div className={styles.sortToggle} role="group" aria-label="교육 구분">
              {(Object.keys(COURSE_GROUP_LABEL) as CourseGroup[]).map((value) => (
                <button key={value} type="button" aria-pressed={courseGroup === value} onClick={() => setCourseGroup(value)}>
                  {COURSE_GROUP_LABEL[value]}
                </button>
              ))}
            </div>
          </div>
          <ul className={styles.courseList}>
            {visibleCourses.map((item) => {
              const open = openCourses.has(item.id);
              return (
              <li
                key={item.id}
                data-expandable={item.notes.length > 0}
                // 박스 어디를 눌러도 펼친다. 펼친 내용(프로젝트 링크·레일) 안의 클릭은 제외
                onClick={item.notes.length ? (event) => {
                  if (!(event.target as HTMLElement).closest(`.${styles.courseDetail}`)) toggleCourse(item.id);
                } : undefined}
              >
                <div className={styles.courseBody}>
                  <h3>{item.name}</h3>
                  <p className={styles.muted}>{[item.org, item.major].filter(Boolean).join(' · ')}</p>
                </div>
                <div className={styles.courseMeta}>
                  <span>{period(item.period)}</span>
                  {item.hours ? <small>{item.hours}</small> : null}
                </div>
                {item.notes.length ? (
                  <button
                    className={styles.courseToggle}
                    type="button"
                    aria-expanded={open}
                    aria-controls={`course-${item.id}`}
                    aria-label={`${item.name} 내용 ${open ? '접기' : '펼치기'}`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                ) : (
                  <span className={styles.courseToggle} aria-hidden="true" />
                )}
                {item.notes.length ? (
                  <CourseDetail
                    id={`course-${item.id}`}
                    hidden={!open}
                    notes={item.notes}
                    projects={(item.projectIds ?? []).flatMap((slug) => projectBySlug.get(slug) ?? [])}
                  />
                ) : null}
              </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </>
  );
}

/** 교육 카드 펼친 내용: 배운 것·회고 목록 → 이 과정에서 만든 프로젝트 */
function CourseDetail({ id, hidden, notes, projects }: { id: string; hidden: boolean; notes: string[]; projects: RelatedProject[] }) {
  const rail = useRail<HTMLUListElement>([projects, hidden]);

  return (
    <div className={styles.courseDetail} id={id} hidden={hidden}>
      <ul className={styles.courseNotes}>
        {notes.map((note) => (
          <li key={note} data-retro={note.startsWith('회고:')}>
            {note.startsWith('회고:') ? (
              <>
                <b>회고</b>
                {note.slice('회고:'.length).trim()}
              </>
            ) : (
              note
            )}
          </li>
        ))}
      </ul>
      {projects.length ? (
        <div className={styles.projectRail}>
          <ul ref={rail.ref} onScroll={rail.update} aria-label="이 과정의 프로젝트">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link to={`/project/${project.slug}`}>
                  <b className={styles.projectTitle}>
                    <span className={styles.projectBadge}>프로젝트</span>
                    <span className={styles.projectName}>{project.title}</span>
                  </b>
                  {project.subtitle ? <span className={styles.projectDesc}>{project.subtitle}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
          {rail.edge.start ? null : (
            <button className={styles.projectRailButton} data-side="prev" type="button" aria-label="이전 프로젝트" onClick={() => rail.scroll(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
          )}
          {rail.edge.end ? null : (
            <button className={styles.projectRailButton} data-side="next" type="button" aria-label="다음 프로젝트" onClick={() => rail.scroll(1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** 한눈에 보기(주석 처리됨)에서 쓰는 아이콘 */
export function EducationIcon({ kind }: { kind: Education['kind'] }) {
  return kind === 'course' ? (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24">
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c3 2 9 2 12 0v-5" />
    </svg>
  );
}

export function CredentialsSection({ credentials }: { credentials: Credential[] }) {
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  // 날짜가 YYYY.MM 형식이라 문자열 비교로 최신순 정렬된다
  const byNewest = (kind: Credential['kind']) =>
    credentials.filter((item) => item.kind === kind).sort((a, b) => b.date.localeCompare(a.date));
  const certificates = byNewest('certificate');
  const awards = byNewest('award');
  // 자격은 order 가 앞선 대표 자격(운전면허·웹디자인기능사)만 기본으로 보이고 나머지는 더보기로 펼친다
  const featuredIds = new Set(
    [...certificates].sort((a, b) => a.order - b.order).slice(0, CERTIFICATE_COUNT).map((item) => item.id),
  );
  const visibleCertificates = showAllCertificates ? certificates : certificates.filter((item) => featuredIds.has(item.id));

  const rows = (items: Credential[]) => (
    // 첫 줄 기관(왼쪽)·날짜(오른쪽) → 이름, 디자인은 교육 카드와 같은 박스
    <ul className={styles.courseList}>
      {items.map((item) => (
        <li key={item.id} className={styles.credentialCard}>
          <p className={styles.credentialHead}>
            <span className={styles.when}>{item.issuer}</span>
            <span className={styles.when}>{item.date}</span>
          </p>
          <p className={styles.credentialName}>
            <b>{item.name}</b>
            {item.note ? <span className={styles.credentialNote}>{item.note}</span> : null}
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {certificates.length ? (
        <Card title="자격">
          {rows(visibleCertificates)}
          {certificates.length > featuredIds.size ? (
            <button
              className={styles.foldButton}
              type="button"
              aria-expanded={showAllCertificates}
              onClick={() => setShowAllCertificates((value) => !value)}
            >
              {showAllCertificates ? '접기' : '더보기'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={showAllCertificates ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
          ) : null}
        </Card>
      ) : null}
      {awards.length ? <Card title="수상">{rows(awards)}</Card> : null}
    </>
  );
}

interface ResumeResultCardsProps {
  careers: Career[];
  educations: Education[];
  /** 기술 카드 배지 (기술 요점 첫 줄 = 주요 실무 기술) */
  mainSkills: string[];
  /** 기술 카드 대표 기술 설명 */
  skillHighlights: LabeledText[];
}

/** 전체 탭의 통합검색 결과 형식 카드 (경력·기술·학력/교육) */
export function ResumeResultCards({ careers, educations, mainSkills, skillHighlights }: ResumeResultCardsProps) {
  const [main, ...others] = careers.filter((career) => !career.minor);
  const degree = educations.find((item) => item.kind === 'degree');

  return (
    <>
      {main ? (
        <article className={styles.resultCard} aria-label="경력 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="blue" aria-hidden="true">경</span>경력
          </p>
          <div className={styles.degreeHead}>
            <h3>
              <Link to={careerLink(main)}>{main.company}</Link>
              <span className={styles.when}>
                {period(main.period)} ({main.duration})
              </span>
            </h3>
            <p>{main.highlight?.line ?? main.role}</p>
          </div>
          {main.highlight?.notes.length ? (
            <ul className={styles.facts} data-bullet="dot">
              {main.highlight.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          {others.length ? (
            <div className={styles.related}>
              <h4>다른 경력</h4>
              <ul>
                {others.map((career) => (
                  <li key={career.id}>
                    <Link to={careerLink(career)}>
                      {career.company} - {career.role}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link className={styles.moreLink} to="/search?tab=career">
            경력 더보기 <span aria-hidden="true">→</span>
          </Link>
        </article>
      ) : null}
      {mainSkills.length || skillHighlights.length ? (
        <article className={styles.resultCard} aria-label="기술 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="green" aria-hidden="true">기</span>기술
          </p>
          <h3>
            <Link to="/search?tab=skills">주요 실무 기술</Link>
          </h3>
          {mainSkills.length ? (
            <p className={styles.resultBadges}>
              {mainSkills.map((name) => (
                <TechBadge key={name} name={name} size="sm" />
              ))}
            </p>
          ) : null}
          <ul className={styles.facts}>
            {skillHighlights.map((item) => (
              <li key={item.label}>
                <b>{item.label}</b> {item.text}
              </li>
            ))}
          </ul>
          <Link className={styles.moreLink} to="/search?tab=skills">
            기술 더보기 <span aria-hidden="true">→</span>
          </Link>
        </article>
      ) : null}
      {degree ? (
        <article className={styles.resultCard} aria-label="학력 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="yellow" aria-hidden="true">학</span>학력
          </p>
          <div className={styles.degreeHead}>
            <h3>
              <Link to="/search?tab=education">{degree.highlight?.title ?? degree.name}</Link>
              <span className={styles.when}>{period(degree.period)}</span>
            </h3>
            <p>{degree.highlight?.line ?? [degree.major, degree.degree].filter(Boolean).join(' · ')}</p>
          </div>
          <ul className={styles.facts}>
            {(degree.highlight?.notes ?? degree.notes).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <Link className={styles.moreLink} to="/search?tab=education">
            학력·교육 더보기 <span aria-hidden="true">→</span>
          </Link>
        </article>
      ) : null}
    </>
  );
}

type TimelineKind = 'career' | 'degree' | 'course';

const TIMELINE_LABEL: Record<TimelineKind, string> = { career: '경력', degree: '학력', course: '교육' };

// shortcut: 주요 타임라인에 보일 항목은 id 로 고정, 자주 바뀌면 careers·educations 에 필드를 둔다
const TIMELINE_IDS = ['skn30', 'brace', 'uxui', 'newsgate', 'ust'];

const companyTitle = (career: Career) => (career.companyNote ? `${career.company} (${career.companyNote})` : career.company);

interface TimelineItem {
  id: string;
  kind: TimelineKind;
  period: Period;
  title: string;
  sub: string;
  to: string;
}

const careerItem = (career: Career, to: string): TimelineItem => ({
  id: career.id,
  kind: 'career',
  period: career.period,
  title: companyTitle(career),
  sub: career.role,
  to,
});

/** 가로 타임라인 카드 (최신순). 스크롤바 대신 양 끝 화살표로 넘긴다 */
function HTimeline({ title, items, more }: { title: string; items: TimelineItem[]; more?: ReactNode }) {
  const rail = useRail<HTMLOListElement>([items]);
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => b.period.start.localeCompare(a.period.start));

  return (
    <Card title={title}>
      <div className={styles.hTimelineWrap}>
        <ol className={styles.hTimeline} ref={rail.ref} onScroll={rail.update}>
          {sorted.map((item) => (
            <li key={item.id} data-kind={item.kind}>
              <span className={styles.hTimelineWhen}>{period({ start: item.period.start.slice(0, 7), end: item.period.end.slice(0, 7) })}</span>
              <span className={styles.hTimelineKind}>{TIMELINE_LABEL[item.kind]}</span>
              <Link to={item.to} className={styles.hTimelineTitle}>
                {item.title}
              </Link>
              {item.sub ? <span className={styles.hTimelineSub}>{item.sub}</span> : null}
            </li>
          ))}
        </ol>
        {rail.edge.start ? null : <RailButton side="prev" label="이전 항목" onClick={() => rail.scroll(-1)} />}
        {rail.edge.end ? null : <RailButton side="next" label="다음 항목" onClick={() => rail.scroll(1)} />}
      </div>
      {more}
    </Card>
  );
}

/** 전체 탭: 주요 경력·학력·교육을 최신순으로 가로 타임라인에 놓는다 */
export function ResumeTimeline({ careers, educations }: { careers: Career[]; educations: Education[] }) {
  const items: TimelineItem[] = [
    ...careers.filter((career) => TIMELINE_IDS.includes(career.id)).map((career) => careerItem(career, '/search?tab=career')),
    ...educations
      .filter((item) => TIMELINE_IDS.includes(item.id))
      .map((item) => ({
        id: item.id,
        kind: (item.kind === 'degree' ? 'degree' : 'course') as TimelineKind,
        period: item.period,
        title: item.name,
        sub: item.kind === 'degree' ? item.degree ?? '' : item.org,
        to: '/search?tab=education',
      })),
  ];

  return <HTimeline title="주요 타임라인" items={items} />;
}
