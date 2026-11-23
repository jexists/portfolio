import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Card } from '@/components/ui/Card';
import { Markdown } from '@/components/ui/Markdown';
import { SearchTabsNav } from '@/components/layout/CategoryTabs';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ProjectThumbnail } from '@/features/projects/components/ProjectCard';
import { LINK_KIND } from '@/features/projects/components/ProjectCollections';
import { SeriesNav } from '@/features/projects/components/SeriesNav';
import { useProject, useProjects, useSeries } from '@/features/projects/hooks/useProjects';
import styles from './ProjectDetailPage.module.scss';

export function ProjectDetailPage() {
  const { slug } = useParams();

  // 학력·프로젝트 탭에서 내려온 스크롤 위치가 남지 않게 맨 위에서 시작한다 (다른 프로젝트로 옮겨 갈 때도)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);
  const projectQuery = useProject(slug);
  const found = projectQuery.data;
  // 준비중(draft) 프로젝트는 상세로 노출하지 않는다 (AC-L2)
  const project = found && !found.meta.draft ? found : null;
  const seriesQuery = useSeries(Boolean(project?.meta.series));
  const others = (useProjects().data ?? []).filter((item) => item.featured && item.slug !== slug);
  const series = project?.meta.series ? seriesQuery.data ?? [] : [];
  const status: 'loading' | 'ready' | 'notFound' = !slug
    ? 'notFound'
    : projectQuery.isPending || (project?.meta.series && seriesQuery.isPending)
      ? 'loading'
      : project
        ? 'ready'
        : 'notFound';

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="projects" />} />
        <div className={styles.shell} aria-label="프로젝트 로딩 중">
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
        </div>
      </main>
    );
  }

  if (status === 'notFound' || !project) {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="projects" />} />
        <section className={`${styles.shell} ${styles.notFound}`}>
          <h1>프로젝트를 찾을 수 없습니다</h1>
          <p>공개되지 않았거나 존재하지 않는 프로젝트입니다.</p>
          <Link to="/search?tab=projects">프로젝트 목록으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const { meta } = project;
  const projectSeries = meta.series ? series.find((item) => item.name === meta.series) : undefined;
  const overview: Array<[string, string | undefined]> = [
    ['과정', meta.course],
    ['기간', `${meta.period.start} – ${meta.period.end}`],
    ['팀', meta.team],
    ['역할', meta.role],
  ];

  return (
    <main className={styles.page}>
      <SearchHeader tabs={<SearchTabsNav value="projects" />} />
      <div className={styles.shell}>
        <div className={styles.main}>
          <section className={styles.hero} aria-label="프로젝트 소개">
            <Link className={styles.back} to="/search?tab=projects">
              &lt; 프로젝트
            </Link>
            <h1>{meta.title}</h1>
            {meta.subtitle ? <p className={styles.subtitle}>{meta.subtitle}</p> : null}
            <p>{meta.summary}</p>
            <div className={styles.tags}>
              {meta.tags.map((tag) => (
                <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
            {meta.images.length ? (
              <div className={styles.cover}>
                <ProjectThumbnail project={meta} caption={`${meta.title} 대표 화면`} />
              </div>
            ) : null}
          </section>
          <article className={styles.markdown} aria-label="프로젝트 상세 내용">
            <Markdown>{project.body}</Markdown>
          </article>
          {meta.images.length > 1 ? (
            <Card title="화면">
              <div className={styles.gallery}>
                {meta.images.map((image) => (
                  <figure key={image.src}>
                    <img src={image.src} alt={image.caption} loading="lazy" />
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </Card>
          ) : null}
          {projectSeries ? (
            <SeriesNav seriesName={projectSeries.name} projects={projectSeries.projects} currentSlug={meta.slug} />
          ) : null}
        </div>
        <aside className={styles.side} aria-label="프로젝트 정보">
          <Card title="개요">
            <dl className={styles.overview}>
              {overview
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
          </Card>
          {meta.links.length ? (
            <Card title="링크">
              <div className={styles.links}>
                {meta.links.map((link, index) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-primary={index === 0}
                  >
                    <span>{link.label}</span>
                    <span className={styles.kind}>{LINK_KIND[link.type]} ↗</span>
                  </a>
                ))}
              </div>
              {meta.linkNote ? <p className={styles.note}>{meta.linkNote}</p> : null}
            </Card>
          ) : null}
          {others.length ? (
            <Card title="다른 대표 프로젝트">
              <ul className={styles.others}>
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link to={`/project/${item.slug}`}>{item.title}</Link>
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
