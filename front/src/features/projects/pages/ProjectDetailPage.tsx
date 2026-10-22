import ReactMarkdown from 'react-markdown';
import { Link, useNavigate, useParams } from 'react-router';
import { Chip } from '@/components/ui/Chip';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { SeriesNav } from '@/features/projects/components/SeriesNav';
import { useProject, useSeries } from '@/features/projects/hooks/useProjects';
import styles from './ProjectDetailPage.module.scss';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProject(slug);
  const found = projectQuery.data;
  // 준비중(draft) 프로젝트는 상세로 노출하지 않는다 (AC-L2)
  const project = found && !found.meta.draft ? found : null;
  const seriesQuery = useSeries(Boolean(project?.meta.series));
  const series = project?.meta.series ? seriesQuery.data ?? [] : [];
  const status: 'loading' | 'ready' | 'notFound' = !slug
    ? 'notFound'
    : projectQuery.isPending || (project?.meta.series && seriesQuery.isPending)
      ? 'loading'
      : project
        ? 'ready'
        : 'notFound';

  function openTag(tag: string) {
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  }

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <SearchHeader />
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
        <SearchHeader />
        <section className={`${styles.shell} ${styles.notFound}`}>
          <h1>프로젝트를 찾을 수 없습니다</h1>
          <p>공개되지 않았거나 존재하지 않는 프로젝트입니다.</p>
          <Link to="/search">검색결과로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const projectSeries = project.meta.series
    ? series.find((item) => item.name === project.meta.series)
    : undefined;

  return (
    <main className={styles.page}>
      <SearchHeader />
      <article className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.badge}>{project.meta.kind ?? '프로젝트'}</span>
          <h1>{project.meta.title}</h1>
          <p>{project.meta.summary}</p>
          <time dateTime={project.meta.publishedAt}>{project.meta.publishedAt}</time>
          <div className={styles.tags}>
            {project.meta.tags.map((tag) => (
              <Chip key={tag} label={tag} ariaLabel={`${tag} 태그`} onClick={() => openTag(tag)} />
            ))}
          </div>
          {project.meta.link || project.meta.github ? (
            <div className={styles.actions}>
              {project.meta.link ? (
                <a href={project.meta.link} target="_blank" rel="noreferrer">
                  라이브 보기
                </a>
              ) : null}
              {project.meta.github ? (
                <a href={project.meta.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              ) : null}
            </div>
          ) : null}
        </header>
        <div className={styles.markdown}>
          <ReactMarkdown>{project.body}</ReactMarkdown>
        </div>
        {projectSeries ? (
          <SeriesNav
            seriesName={projectSeries.name}
            projects={projectSeries.projects}
            currentSlug={project.meta.slug}
          />
        ) : null}
      </article>
    </main>
  );
}
