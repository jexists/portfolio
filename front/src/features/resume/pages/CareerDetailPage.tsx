import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Markdown } from '@/components/ui/Markdown';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useCareers, useSkills } from '../hooks/useResume';
import styles from './CareerDetailPage.module.scss';

/** 경력 상세: 경력 문서(careers.body)를 프로젝트 상세와 같은 열 배치로 보여 준다 */
export function CareerDetailPage() {
  const { id } = useParams();
  const careersQuery = useCareers();
  const skills = useSkills().data ?? [];
  const career = careersQuery.data?.find((item) => item.id === id && item.body);

  // 경력 탭에서 내려온 스크롤 위치가 남지 않게 맨 위에서 시작한다
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  if (careersQuery.isPending) {
    return (
      <main className={styles.page}>
        <SearchHeader />
        <div className={styles.shell} aria-label="경력 로딩 중">
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
        </div>
      </main>
    );
  }

  if (!career?.body) {
    return (
      <main className={styles.page}>
        <SearchHeader />
        <section className={`${styles.shell} ${styles.notFound}`}>
          <h1>경력을 찾을 수 없습니다</h1>
          <Link to="/search?tab=career">경력 탭으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const skillName = new Map(skills.map((skill) => [skill.id, skill.name]));
  const others = (careersQuery.data ?? []).filter((item) => !item.minor && item.id !== career.id);

  return (
    <main className={styles.page}>
      <SearchHeader />
      <div className={styles.shell}>
        <div className={styles.main}>
          <section className={styles.hero} aria-label="경력 소개">
            <Link className={styles.back} to="/search?tab=career">
              &lt; 경력
            </Link>
            <h1>{career.companyNote ? `${career.company} (${career.companyNote})` : career.company}</h1>
            <p className={styles.subtitle}>
              {career.role} · {career.period.start} – {career.period.end} ({career.duration})
            </p>
            {career.service ? <p>{career.service}</p> : null}
          </section>
          <article className={styles.body} aria-label="경력 상세 내용">
            <Markdown>{career.body}</Markdown>
          </article>
        </div>
        <aside className={styles.side} aria-label="경력 정보">
          {career.metrics.length ? (
            <Card title="한눈에">
              <dl className={styles.overview}>
                {career.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd>
                      <strong>{metric.value}</strong> <small>{metric.note}</small>
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
          {career.skillIds.length ? (
            <Card title="기술">
              <p className={styles.skills}>{career.skillIds.map((skillId) => skillName.get(skillId) ?? skillId).join(' · ')}</p>
            </Card>
          ) : null}
          {others.length ? (
            <Card title="다른 경력">
              <ul className={styles.others}>
                {others.map((item) => (
                  <li key={item.id}>
                    <Link to={`/search?tab=career#career-${item.id}`}>{item.company}</Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}
