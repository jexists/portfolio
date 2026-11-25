import { useRef } from "react";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { TechIcon } from "@/components/ui/TechBadge";
import { LoadError, PageSkeleton } from "@/components/ui/PageState";
import { SearchTabsNav } from "@/components/layout/CategoryTabs";
import { SearchHeader } from "@/components/layout/SearchHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProjectThumbnail } from "@/features/projects/components/ProjectCard";
import { ProjectGallery } from "@/features/projects/components/ProjectGallery";
import { LinkRows } from "@/features/profile";
import { SeriesNav } from "@/features/projects/components/SeriesNav";
import {
  useProject,
  useProjects,
  useSeries,
} from "@/features/projects/hooks/useProjects";
import galleryStyles from "../components/ProjectGallery.module.scss";
import type {
  ProjectLinkType,
  ProjectMeta,
} from "@/features/projects/types/project.types";
import styles from "./ProjectDetailPage.module.scss";

// 브랜드 로고가 없는 링크 종류의 아이콘 (GitHub 은 주소로 로고를 찾는다)
const LINK_ICON: Partial<Record<ProjectLinkType, "web" | "doc">> = {
  live: "web",
  slides: "doc",
  doc: "doc",
  pdf: "doc",
};

// 링크 카드 순서: 서비스 → 발표 자료 → 영상·문서 → GitHub
const LINK_ORDER: ProjectLinkType[] = [
  "live",
  "slides",
  "video",
  "doc",
  "pdf",
  "github",
];

export function ProjectDetailPage() {
  const { slug } = useParams();
  const coverDialogRef = useRef<HTMLDialogElement>(null);

  const projectQuery = useProject(slug);
  const found = projectQuery.data;
  // 준비중(draft) 프로젝트는 상세로 노출하지 않는다 (AC-L2)
  const project = found && !found.meta.draft ? found : null;
  const seriesQuery = useSeries(Boolean(project?.meta.series));
  const others = (useProjects().data ?? []).filter(
    (item) => item.featured && item.slug !== slug,
  );
  const series = project?.meta.series ? (seriesQuery.data ?? []) : [];
  const status: "loading" | "ready" | "notFound" = !slug
    ? "notFound"
    : projectQuery.isPending || (project?.meta.series && seriesQuery.isPending)
      ? "loading"
      : project
        ? "ready"
        : "notFound";

  if (status === "loading") {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="projects" />} />
        <div className={styles.shell}>
          <PageSkeleton label="프로젝트 로딩 중" />
        </div>
        <SiteFooter />
      </main>
    );
  }

  // 인터넷·서버 문제는 "없는 프로젝트"와 구분해서 원인과 다시 시도를 보여 준다
  if (projectQuery.isError) {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="projects" />} />
        <div className={styles.shell}>
          <LoadError error={projectQuery.error} />
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (status === "notFound" || !project) {
    return (
      <main className={styles.page}>
        <SearchHeader tabs={<SearchTabsNav value="projects" />} />
        <section className={`${styles.shell} ${styles.notFound}`}>
          <h1>프로젝트를 찾을 수 없습니다</h1>
          <p>공개되지 않았거나 존재하지 않는 프로젝트입니다.</p>
          <Link to="/search?tab=projects">프로젝트 목록으로 돌아가기</Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const { meta } = project;
  const projectSeries = meta.series
    ? series.find((item) => item.name === meta.series)
    : undefined;
  const overview: Array<[string, string | undefined]> = [
    ["과정", meta.course],
    ["기간", `${meta.period.start} – ${meta.period.end}`],
    ["팀", meta.team],
    ["역할", meta.role],
  ];

  return (
    <main className={styles.page}>
      <SearchHeader
        query={meta.title}
        tabs={<SearchTabsNav value="projects" />}
      />
      <div className={styles.shell}>
        <div className={styles.main}>
          <section className={styles.hero} aria-label="프로젝트 소개">
            <Link className={styles.back} to="/search?tab=projects">
              &lt; 프로젝트
            </Link>
            <div className={styles.intro}>
              <h1>{meta.title}</h1>
              {meta.subtitle ? (
                <p className={styles.subtitle}>{meta.subtitle}</p>
              ) : null}
            </div>
            {meta.images.length ? (
              <button
                className={styles.cover}
                type="button"
                aria-label={`${meta.title} 대표 화면 크게 보기`}
                onClick={() => coverDialogRef.current?.showModal()}
              >
                <ProjectThumbnail project={meta} caption="" />
              </button>
            ) : null}
            <p className={styles.summary}>{meta.summary}</p>
            <div className={styles.tags}>
              {meta.tags.map((tag) => (
                <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`}>
                  <TechIcon name={tag} />
                  {tag}
                </Link>
              ))}
            </div>
            {meta.images.length ? (
              // 전체보기는 화면 캐러셀의 dialog 모양을 그대로 쓴다
              <dialog
                ref={coverDialogRef}
                className={galleryStyles.dialog}
                aria-label={`${meta.title} 대표 화면`}
                onClick={(event) =>
                  event.target === event.currentTarget &&
                  event.currentTarget.close()
                }
              >
                <div className={galleryStyles.dialogHeader}>
                  <p>{meta.images[0].caption}</p>
                  <button
                    className={galleryStyles.close}
                    type="button"
                    onClick={() => coverDialogRef.current?.close()}
                  >
                    닫기
                  </button>
                </div>
                <div className={galleryStyles.stage}>
                  <div className={galleryStyles.viewer}>
                    <img
                      src={meta.images[0].src}
                      alt={meta.images[0].caption}
                    />
                  </div>
                </div>
              </dialog>
            ) : null}
          </section>
          <article className={styles.markdown} aria-label="프로젝트 상세 내용">
            <Markdown>{project.body}</Markdown>
          </article>
          {meta.images.length > 1 ? (
            <Card title="화면">
              <ProjectGallery images={meta.images} />
            </Card>
          ) : null}
          {projectSeries ? (
            <SeriesNav
              seriesName={projectSeries.name}
              projects={projectSeries.projects}
              currentSlug={meta.slug}
            />
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
            <Card title="링크" badge={meta.linkStatus}>
              <LinkRows
                rows={[...meta.links]
                  .sort(
                    (a, b) =>
                      LINK_ORDER.indexOf(a.type) - LINK_ORDER.indexOf(b.type),
                  )
                  .map((link) => ({
                    key: link.url,
                    href: link.url,
                    label: link.label,
                    external: true,
                    icon: LINK_ICON[link.type],
                  }))}
              />
              {meta.linkNote ? (
                <p className={styles.note}>{meta.linkNote}</p>
              ) : null}
            </Card>
          ) : null}
          {others.length ? (
            <Card title="다른 대표 프로젝트">
              <OtherProjects projects={others} />
            </Card>
          ) : null}
        </aside>
      </div>
      <SiteFooter />
    </main>
  );
}

const SearchIcon = () => (
  <svg className={styles.otherIcon} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** 다른 대표 프로젝트: 돋보기 + 제목 + 썸네일 줄, 누르면 그 프로젝트로 이동 */
function OtherProjects({ projects }: { projects: ProjectMeta[] }) {
  return (
    <ul className={styles.others}>
      {projects.map((item) => (
        <li key={item.slug}>
          <Link className={styles.otherRow} to={`/project/${item.slug}`}>
            <SearchIcon />
            <b>{item.title}</b>
            {item.images.length ? (
              <span className={styles.otherThumb}>
                <ProjectThumbnail project={item} caption="" />
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// 펼치는(아코디언) 버전: 줄을 누르면 설명·큰 썸네일이 열리고, 설명을 누르면 이동한다.
// 지금은 바로 이동하는 위 버전을 쓴다. 다시 쓰려면 주석을 풀고 위 OtherProjects 를 지우며,
// react import 에 useId·useState 를 다시 넣고 <svg> 부분을 <SearchIcon /> 으로 바꾼다.
// /** 다른 대표 프로젝트 아코디언: 닫힌 줄은 작은 썸네일, 펼치면 설명과 큰 썸네일로 내려간다 */
// function OtherProjects({ projects }: { projects: ProjectMeta[] }) {
//   const [open, setOpen] = useState(-1);
//   const baseId = useId();
//
//   return (
//     <ul className={styles.others}>
//       {projects.map((item, index) => {
//         const expanded = open === index;
//         const panelId = `${baseId}-${index}`;
//         const thumb = item.images.length ? (
//           <span className={styles.otherThumb}>
//             <ProjectThumbnail project={item} caption="" />
//           </span>
//         ) : null;
//         return (
//           <li key={item.slug} data-open={expanded}>
//             <button
//               type="button"
//               aria-expanded={expanded}
//               aria-controls={panelId}
//               onClick={() => setOpen(expanded ? -1 : index)}
//             >
//               <svg
//                 className={styles.otherIcon}
//                 viewBox="0 0 24 24"
//                 aria-hidden="true"
//               >
//                 <circle cx="11" cy="11" r="7" />
//                 <path d="m20 20-3.5-3.5" />
//               </svg>
//               <b>{item.title}</b>
//               {expanded ? null : thumb}
//             </button>
//             <Link
//               id={panelId}
//               className={styles.otherPanel}
//               to={`/project/${item.slug}`}
//               hidden={!expanded}
//             >
//               <span>{item.summary}</span>
//               {thumb}
//             </Link>
//           </li>
//         );
//       })}
//     </ul>
//   );
// }
