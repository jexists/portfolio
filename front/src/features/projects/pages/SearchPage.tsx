import { type CSSProperties, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { CategoryTabs, type CategoryTab } from '@/features/projects/components/CategoryTabs';
import { Chip } from '@/components/ui/Chip';
import { ProfileCard, type Profile, useProfile } from '@/features/profile';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { useProjects, useTags } from '@/features/projects/hooks/useProjects';
import type { Category, ProjectMeta } from '@/features/projects/types/project.types';
import styles from './SearchPage.module.scss';

interface SearchContent {
  profile: Profile;
  projects: ProjectMeta[];
  tags: string[];
}

const categories: Category[] = ['resume', 'publishing', 'design', 'study', 'etc'];

function isCategory(value: string | null): value is Category {
  return value !== null && categories.some((category) => category === value);
}

type SectionStyle = CSSProperties & {
  '--search-section-index': number;
};

export function SearchPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromIntro = Boolean(location.state && 'fromIntro' in location.state && location.state.fromIntro);
  const tab = searchParams.get('tab');
  const category: CategoryTab = isCategory(tab) ? tab : 'all';
  const [activeTag, setActiveTag] = useState<string | null>(() => searchParams.get('tag'));

  const profileQuery = useProfile();
  const projectsQuery = useProjects({ includeDrafts: true });
  const tagsQuery = useTags();
  const content = useMemo<SearchContent | null>(
    () =>
      profileQuery.data && projectsQuery.data && tagsQuery.data
        ? { profile: profileQuery.data, projects: projectsQuery.data, tags: tagsQuery.data }
        : null,
    [profileQuery.data, projectsQuery.data, tagsQuery.data],
  );

  const effectiveActiveTag = content && activeTag && content.tags.includes(activeTag) ? activeTag : null;

  const filteredProjects = useMemo(() => {
    if (!content) {
      return [];
    }

    return content.projects
      .filter((project) => !effectiveActiveTag || project.tags.includes(effectiveActiveTag))
      .sort((left, right) => Number(Boolean(left.draft)) - Number(Boolean(right.draft)));
  }, [content, effectiveActiveTag]);

  function changeCategory(nextCategory: CategoryTab) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextCategory === 'all') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', nextCategory);
    }

    setSearchParams(nextSearchParams);
  }

  function toggleTag(tag: string) {
    const nextActiveTag = effectiveActiveTag === tag ? null : tag;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextActiveTag) {
      nextSearchParams.set('tag', nextActiveTag);
    } else {
      nextSearchParams.delete('tag');
    }

    setActiveTag(nextActiveTag);
    setSearchParams(nextSearchParams, { replace: true });
  }

  function applyKeyword(keyword: string | null) {
    if (keyword === null) {
      if (effectiveActiveTag) {
        toggleTag(effectiveActiveTag);
      }
    } else if (content?.tags.includes(keyword)) {
      toggleTag(keyword);
    }
  }

  return (
    <main className={styles.page} data-from-intro={fromIntro}>
      <SearchHeader tabs={<CategoryTabs value={category} onChange={changeCategory} />} />
      <div className={styles.shell}>
        {category === 'all' && !content ? (
          <SearchSkeleton />
        ) : category === 'all' && content ? (
          <>
            <section className={styles.section} style={{ '--search-section-index': 0 } as SectionStyle}>
              <ProfileCard
                profile={content.profile}
                activeKeyword={effectiveActiveTag}
                onKeywordClick={applyKeyword}
              />
            </section>
            <section
              className={styles.section}
              style={{ '--search-section-index': 1 } as SectionStyle}
              aria-label="태그 필터"
            >
              <h2>태그 필터</h2>
              <div className={styles.chips}>
                {content.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    ariaLabel={`${tag} 태그 필터`}
                    active={effectiveActiveTag === tag}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </section>
            <section className={styles.section} style={{ '--search-section-index': 2 } as SectionStyle}>
              <h2>프로젝트</h2>
              {filteredProjects.length > 0 ? (
                <div className={styles.grid}>
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>검색결과가 없습니다</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function SearchSkeleton() {
  return (
    <div className={styles.skeleton} aria-label="검색결과 로딩 중">
      <span />
      <span />
      <span />
    </div>
  );
}
