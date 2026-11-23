import { Fragment } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import type { Career, CareerAchievement, Credential, Education, Skill, SkillUsage } from '@/features/resume/types/resume.types';
import styles from './ResumeSections.module.scss';

const USAGE_LABEL: Record<SkillUsage, string> = { work: '실무', project: '프로젝트', study: '학습' };
const period = (value: { start: string; end: string }) => `${value.start} – ${value.end}`;

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

export function EducationSection({ educations }: { educations: Education[] }) {
  const degrees = educations.filter((item) => item.kind === 'degree');
  const courses = educations.filter((item) => item.kind === 'course');

  return (
    <>
      {degrees.length ? (
        <Card title="학력">
          {degrees.map((item) => (
            <article key={item.id} className={styles.degree}>
              <header className={styles.careerHead}>
                <h3>{item.name}</h3>
                <span>{period(item.period)}</span>
              </header>
              <p className={styles.muted}>{[item.org, item.major].filter(Boolean).join(' · ')}</p>
              {item.degree ? <p>{item.degree}</p> : null}
              <Bullets items={item.notes} />
            </article>
          ))}
        </Card>
      ) : null}
      {courses.length ? (
        <Card title="교육">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">기간</th>
                <th scope="col">과정</th>
                <th scope="col">기관</th>
                <th scope="col">시간</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((item) => (
                <tr key={item.id}>
                  <td>{period(item.period)}</td>
                  <td className={styles.strong}>{item.name}</td>
                  <td>{item.org}</td>
                  <td>{item.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </>
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
  const certificates = credentials.filter((item) => item.kind === 'certificate').slice(0, 3);

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
