import { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { SearchHeader } from '@/components/layout/SearchHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LinksCard, ProfileCard, ProfileSide, StrengthsCard, useProfile } from '@/features/profile';
import {
  buildProfileFacts,
  CareerSection,
  CredentialsSection,
  EducationSection,
  ResumeDocument,
  ResumeResultCards,
  ResumeTimeline,
  SkillsSection,
  useCareers,
  useCredentials,
  useEducations,
  useSkills,
} from '@/features/resume';
import { CategoryTabs, isSearchTab, type SearchTab } from '@/features/projects/components/CategoryTabs';
import { FeaturedRail, ProjectsTab } from '@/features/projects/components/ProjectCollections';
import { useProjects } from '@/features/projects/hooks/useProjects';
import styles from './SearchPage.module.scss';

export function SearchPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromIntro = Boolean(location.state && 'fromIntro' in location.state && location.state.fromIntro);
  const rawTab = searchParams.get('tab');
  const tag = searchParams.get('tag');
  // ?tag= 만 있으면(상세 화면의 기술 태그) 프로젝트 탭으로 본다
  const tab: SearchTab = isSearchTab(rawTab) ? rawTab : tag ? 'projects' : 'all';

  const profile = useProfile().data;
  const projects = useProjects().data;
  const careers = useCareers().data;
  const skills = useSkills().data;
  const educations = useEducations().data;
  const credentials = useCredentials().data;

  const facts = useMemo(
    () => buildProfileFacts(careers ?? [], educations ?? []),
    [careers, educations],
  );
  const featured = useMemo(() => (projects ?? []).filter((project) => project.featured), [projects]);

  // 탭이 바뀌면(탭 버튼·"더보기" 링크 모두) 브라우저가 스크롤을 유지하므로 맨 위로 올린다.
  // #career-<id> 처럼 위치가 붙어 오면 그 탭이 직접 스크롤한다 (탭이 바뀔 때만 실행)
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 });
  }, [tab]);

  function changeTab(next: SearchTab) {
    setSearchParams(next === 'all' ? {} : { tab: next });
  }

  function clearTag() {
    setSearchParams({ tab: 'projects' }, { replace: true });
  }

  const ready = Boolean(profile && projects && careers && skills && educations && credentials);

  return (
    <main className={styles.page} data-from-intro={fromIntro}>
      <SearchHeader tabs={<CategoryTabs value={tab} onChange={changeTab} />} />
      {!ready || !profile || !projects || !careers || !skills || !educations || !credentials ? (
        <div className={styles.shell}>
          <SearchSkeleton />
        </div>
      ) : (
        <div className={styles.shell}>
          <div className={styles.main} data-tab={tab}>
            {tab === 'all' ? (
              <>
                <ProfileCard profile={profile} facts={facts} />
                <ResumeTimeline careers={careers} educations={educations} />
                <FeaturedRail projects={featured} />
                <ResumeResultCards
                  careers={careers}
                  educations={educations}
                  mainSkills={profile.skillSummary?.[0]?.items ?? []}
                  skillHighlights={profile.skillHighlights ?? []}
                />
              </>
            ) : null}
            {tab === 'resume' ? <ResumeDocument /> : null}
            {tab === 'career' ? <CareerSection careers={careers} skills={skills} summary={profile.summary} /> : null}
            {tab === 'skills' ? (
              <SkillsSection skills={skills} summary={profile.skillSummary ?? []} languages={profile.languages ?? []} />
            ) : null}
            {tab === 'education' ? <EducationSection educations={educations} projects={projects} /> : null}
            {tab === 'certs' ? <CredentialsSection credentials={credentials} /> : null}
            {tab === 'projects' ? <ProjectsTab key={tag ?? ''} projects={projects} tag={tag} onClearTag={clearTag} /> : null}
          </div>
          {/* 이력서는 문서만 보여 준다 */}
          {tab === 'resume' ? null : (
          <aside className={styles.side} aria-label="사이드 정보">
            {tab === 'all' ? <StrengthsCard strengths={profile.strengths} /> : <ProfileSide profile={profile} facts={facts} />}
            {/* 관련 검색어: 지금은 숨긴다. 다시 쓰려면 주석을 풀고 import 에 buildRelatedQueries, RelatedQueries 를 더한다
            <RelatedQueries
              queries={buildRelatedQueries(
                profile.name,
                featured,
                skills.filter((skill) => skill.usage === 'work').map((skill) => skill.name),
              )}
            />
            */}
            <LinksCard profile={profile} />
          </aside>
          )}
        </div>
      )}
      <SiteFooter />
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
