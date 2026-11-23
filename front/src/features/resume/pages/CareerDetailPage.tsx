import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Markdown } from '@/components/ui/Markdown';
import { SearchTabsNav } from '@/components/layout/CategoryTabs';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CareerTechBadges } from '../components/ResumeSections';
import { useCareers, useSkills } from '../hooks/useResume';
import styles from './CareerDetailPage.module.scss';

const count = (text: string) => Number(text.replace(/[^0-9]/g, ''));

/** 표에서 "| 이름 | 본인 n건 | 전체 n건 |" 줄을 찾아 [본인, 전체] 로 */
function repoRow(markdown: string, name: string): [number, number] | null {
  const row = markdown.split('\n').find((line) => line.startsWith(`| ${name} |`));
  if (!row) return null;
  const [, mine, total] = row.split('|').slice(1).map((cell) => cell.trim());
  return [count(mine), count(total)];
}

interface BarPart {
  key: string;
  label: string;
  value: number;
}

/** 두 칸 막대 + 양 끝 이름·숫자 (왼쪽 칸 이름은 왼쪽, 오른쪽 칸 이름은 오른쪽) */
function SplitBar({ title, parts }: { title: string; parts: [BarPart, BarPart] }) {
  const total = parts[0].value + parts[1].value;
  const pct = (value: number) => Math.round((value / total) * 100);
  return (
    <figure className={styles.share}>
      <figcaption>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h16M7 16v-5M12 16V6M17 16v-8" />
        </svg>
        {title}
      </figcaption>
      <div className={styles.shareBar} role="img" aria-label={parts.map((part) => `${part.label} ${pct(part.value)}%`).join(', ')}>
        {parts.map((part) => (
          <span key={part.key} data-part={part.key} style={{ flexGrow: part.value }} />
        ))}
      </div>
      <div className={styles.shareLabels}>
        {parts.map((part) => (
          <span key={part.key} data-part={part.key}>
            <strong>
              {part.label} {pct(part.value)}%
            </strong>
            <small>{part.value.toLocaleString()}건</small>
          </span>
        ))}
      </div>
    </figure>
  );
}

/** 백엔드+프론트엔드 저장소: ① 본인 비중 ② 본인 커밋 중 프론트·백 비율 */
function ShareBars({ markdown }: { markdown: string }) {
  const front = repoRow(markdown, '프론트엔드');
  const back = repoRow(markdown, '백엔드');
  if (!front || !back) return null;
  const mine = front[0] + back[0];
  const total = front[1] + back[1];
  return (
    <div className={styles.shares}>
      <SplitBar
        title="전체 중 내가 한 비중 (프론트·백엔드)"
        parts={[
          { key: 'mine', label: '본인', value: mine },
          { key: 'others', label: '다른 개발자', value: total - mine },
        ]}
      />
      <SplitBar
        title="내 커밋 중 프론트·백 비율"
        parts={[
          { key: 'front', label: '프론트엔드', value: front[0] },
          { key: 'back', label: '백엔드', value: back[0] },
        ]}
      />
    </div>
  );
}

/** 경력 상세: 경력 문서(careers.body)를 프로젝트 상세와 같은 열 배치로 보여 준다 */
export function CareerDetailPage() {
  const { id } = useParams();
  const careersQuery = useCareers();
  const skills = useSkills().data ?? [];
  const career = careersQuery.data?.find((item) => item.id === id && item.body);

  const { hash } = useLocation();
  const ready = Boolean(career);

  // 경력 탭에서 내려온 스크롤 위치가 남지 않게 맨 위에서 시작한다. #제목 으로 오면(프로젝트 보기) 본문이 그려진 뒤 그 제목으로 간다
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [id, hash, ready]);

  if (careersQuery.isPending) {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="career" />} />
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
        <SearchHeader tabs={<SearchTabsNav value="career" />} />
        <section className={`${styles.shell} ${styles.notFound}`}>
          <h1>경력을 찾을 수 없습니다</h1>
          <Link to="/search?tab=career">경력 탭으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  // 본문의 "## 서비스 개요" 절은 오른쪽 카드로, 나머지(주요 담당 업무·프로젝트)는 왼쪽 본문으로 나눈다
  const overviewAt = career.body.indexOf('## 서비스 개요');
  const mainAt = career.body.indexOf('\n## ', overviewAt + 1);
  const overview = overviewAt >= 0 ? career.body.slice(overviewAt, mainAt >= 0 ? mainAt : undefined).replace('## 서비스 개요', '').trim() : '';
  // Git 기여는 따로 카드로 뺀다 (소제목 줄 "**Git 기여**" 는 카드 제목이 대신한다)
  const gitAt = overview.indexOf('**Git 기여**');
  const overviewTop = gitAt >= 0 ? overview.slice(0, gitAt) : overview;
  const git = gitAt >= 0 ? overview.slice(gitAt).replace('**Git 기여**', '').trim() : '';
  const mainBody = overviewAt >= 0 ? career.body.slice(0, overviewAt) + (mainAt >= 0 ? career.body.slice(mainAt) : '') : career.body;

  return (
    <main className={styles.page}>
      <SearchHeader tabs={<SearchTabsNav value="career" />} />
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
            <Markdown>{mainBody}</Markdown>
          </article>
        </div>
        {overview ? (
          <aside className={styles.side} aria-label="경력 정보">
            <Card title={career.company}>
              <Markdown>{overviewTop}</Markdown>
              {career.skillIds.length ? (
                <>
                  <p>
                    <strong>기술 스택</strong>
                  </p>
                  <CareerTechBadges career={career} skills={skills} />
                </>
              ) : null}
            </Card>
            {git ? (
              <Card title="Git 기여" note="재직 기간 중, 병합 커밋 제외" className={styles.git}>
                <Markdown>{git}</Markdown>
                <ShareBars markdown={git} />
              </Card>
            ) : null}
          </aside>
        ) : null}
      </div>
      <SiteFooter />
    </main>
  );
}
