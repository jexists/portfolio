import { Fragment, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import { useRail } from '@/hooks/useRail';
import type { Career, CareerAchievement, Credential, Education, Skill, SkillUsage } from '@/features/resume/types/resume.types';
import { CERTIFICATE_COUNT } from '../utils/profileFacts';
import styles from './ResumeSections.module.scss';

const USAGE_LABEL: Record<SkillUsage, string> = { work: '실무', project: '프로젝트', study: '학습' };
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

function Tags({ names }: { names: string[] }) {
  return (
    <div className={styles.tags}>
      {names.map((name) => (
        <span className={styles.tag} key={name}>
          {name}
        </span>
      ))}
    </div>
  );
}

function Achievement({ item, open }: { item: CareerAchievement; open: boolean }) {
  return (
    <details className={styles.achievement} open={open}>
      <summary>
        <h4>{item.title}</h4>
        <span>{item.period}</span>
      </summary>
      <div className={styles.achievementBody}>
        {item.role ? <p className={styles.muted}>{item.role}</p> : null}
        {item.work.length ? (
          <div>
            <p className={styles.label}>주요 업무</p>
            <Bullets items={item.work} />
          </div>
        ) : null}
        {item.problems.length ? (
          <div>
            <p className={styles.label}>문제 해결</p>
            <Bullets items={item.problems} />
          </div>
        ) : null}
        {item.result ? (
          <p className={styles.result}>
            <b>성과</b> {item.result}
          </p>
        ) : null}
      </div>
    </details>
  );
}

export function CareerSection({ careers, skills }: { careers: Career[]; skills: Skill[] }) {
  const skillName = new Map(skills.map((skill) => [skill.id, skill.name]));
  const main = careers.filter((career) => !career.minor);
  const minor = careers.filter((career) => career.minor);

  return (
    <>
      {main.map((career) => (
        <Card key={career.id} ariaLabel={career.company}>
          <article className={styles.career}>
            <header className={styles.careerHead}>
              <h3>
                {career.company}
                {career.companyNote ? <small>{career.companyNote}</small> : null}
              </h3>
              <span>
                {period(career.period)} · {career.duration}
              </span>
            </header>
            <p className={styles.muted}>{career.role}</p>
            {career.service ? <p>{career.service}</p> : null}
            {career.metrics.length ? (
              <dl className={styles.metrics}>
                {career.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd>
                      <strong>{metric.value}</strong>
                      <small>{metric.note}</small>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {career.responsibilities.length ? (
              <>
                <h4 className={styles.subhead}>역할</h4>
                <Bullets items={career.responsibilities} />
              </>
            ) : null}
            {career.achievements.length ? (
              <>
                <h4 className={styles.subhead}>주요 업무와 문제 해결</h4>
                <div className={styles.achievements}>
                  {career.achievements.map((item, index) => (
                    <Achievement key={item.title} item={item} open={index === 0} />
                  ))}
                </div>
              </>
            ) : null}
            {career.extras.length ? (
              <>
                <h4 className={styles.subhead}>그 밖의 개발·운영</h4>
                <Bullets items={career.extras} />
              </>
            ) : null}
            {career.skillIds.length ? (
              <>
                <h4 className={styles.subhead}>기술</h4>
                <Tags names={career.skillIds.map((id) => skillName.get(id) ?? id)} />
              </>
            ) : null}
          </article>
        </Card>
      ))}
      {minor.length ? (
        <Card title="그 밖의 경력">
          <ul className={styles.rows}>
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
  careers: Career[];
  projectTitles: Record<string, string>;
}

export function SkillsSection({ skills, careers, projectTitles }: SkillsSectionProps) {
  const groups = [...new Set(skills.map((skill) => skill.group))];
  const careerName = new Map(careers.map((career) => [career.id, career.company]));

  return (
    <>
      {groups.map((group) => (
        <Card key={group} title={group}>
          <ul className={styles.skills}>
            {skills
              .filter((skill) => skill.group === group)
              .map((skill) => (
                <li key={skill.id} className={styles.skill}>
                  <p className={styles.skillName}>
                    {skill.name}
                    <span className={styles.badge} data-usage={skill.usage}>
                      {USAGE_LABEL[skill.usage]}
                    </span>
                  </p>
                  <div>
                    <p className={styles.muted}>{skill.context}</p>
                    {skill.projectIds.length || skill.careerIds.length ? (
                      <p className={styles.refs}>
                        {skill.careerIds.map((id) => (
                          <Link key={id} to="/search?tab=career">
                            {careerName.get(id) ?? id}
                          </Link>
                        ))}
                        {skill.projectIds.map((id) => (
                          <Link key={id} to={`/project/${id}`}>
                            {projectTitles[id] ?? id}
                          </Link>
                        ))}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      ))}
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
                      <h3>{item.name}</h3>
                      <p className={styles.muted}>{[item.org, item.major].filter(Boolean).join(' · ')}</p>
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
              <li key={item.id}>
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
                    onClick={() => toggleCourse(item.id)}
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
  const sections: Array<[string, Credential['kind'], string]> = [
    ['자격', 'certificate', '발급기관'],
    ['수상', 'award', '주최'],
  ];

  return (
    <>
      {sections.map(([title, kind, issuerLabel]) => {
        const items = credentials.filter((item) => item.kind === kind);
        return items.length ? (
          <Card key={kind} title={title}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">날짜</th>
                  <th scope="col">{title}</th>
                  <th scope="col">{issuerLabel}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <span className={styles.strong}>{item.name}</span>
                      {item.note ? <span className={styles.muted}> {item.note}</span> : null}
                    </td>
                    <td>{item.issuer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : null;
      })}
    </>
  );
}

interface ResumeResultCardsProps {
  headline: string;
  summary: string[];
  careers: Career[];
  skills: Skill[];
  educations: Education[];
  credentials: Credential[];
}

/** 전체 탭의 통합검색 결과 형식 카드 (경력·기술·학력/자격) */
export function ResumeResultCards({ headline, summary, careers, skills, educations, credentials }: ResumeResultCardsProps) {
  const [main, ...others] = careers.filter((career) => !career.minor);
  const workSkills = skills.filter((skill) => skill.usage === 'work' && ['Frontend', 'Backend', 'Database'].includes(skill.group));
  const degree = educations.find((item) => item.kind === 'degree');
  const certificates = credentials.filter((item) => item.kind === 'certificate').slice(0, CERTIFICATE_COUNT);

  return (
    <>
      {main ? (
        <article className={styles.resultCard} aria-label="경력 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="blue" aria-hidden="true">경</span>경력 · {main.company}
          </p>
          <h3>
            <Link to="/search?tab=career">
              {main.role} - {main.duration}
            </Link>
          </h3>
          <p>{headline}</p>
          <ul className={styles.facts}>
            {summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className={styles.resultFoot}>
            <span>{period(main.period)}</span>
            <Link to="/search?tab=career">경력 더보기 &gt;</Link>
          </div>
          {others.length ? (
            <div className={styles.related}>
              <h4>다른 경력</h4>
              <ul>
                {others.map((career) => (
                  <li key={career.id}>
                    <Link to="/search?tab=career">
                      {career.company} - {career.role}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}
      {workSkills.length ? (
        <article className={styles.resultCard} aria-label="기술 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="green" aria-hidden="true">기</span>기술
          </p>
          <h3>
            <Link to="/search?tab=skills">실무 기술 {workSkills.length}개 · 전체 기술 {skills.length}개</Link>
          </h3>
          <ul className={styles.facts}>
            {workSkills.slice(0, 5).map((skill) => (
              <li key={skill.id}>
                <b>{skill.name}</b> {skill.context}
              </li>
            ))}
          </ul>
          <div className={styles.resultFoot}>
            <span />
            <Link to="/search?tab=skills">기술 더보기 &gt;</Link>
          </div>
        </article>
      ) : null}
      {degree || certificates.length ? (
        <article className={styles.resultCard} aria-label="학력·자격 검색결과">
          <p className={styles.source}>
            <span className={styles.dot} data-tone="yellow" aria-hidden="true">학</span>학력 · 자격
          </p>
          {degree ? (
            <Fragment>
              <h3>
                <Link to="/search?tab=education">{degree.name}</Link>
              </h3>
              <p>
                {[degree.major, degree.degree].filter(Boolean).join(' · ')} ({period(degree.period)})
              </p>
            </Fragment>
          ) : null}
          <ul className={styles.facts}>
            {certificates.map((item) => (
              <li key={item.id}>
                {item.date} {item.name} · {item.issuer}
              </li>
            ))}
          </ul>
          <div className={styles.resultFoot}>
            <Link to="/search?tab=education">학력 더보기 &gt;</Link>
            <Link to="/search?tab=certs">자격·수상 더보기 &gt;</Link>
          </div>
        </article>
      ) : null}
    </>
  );
}
