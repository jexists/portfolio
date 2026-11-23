import type { ReactNode } from 'react';
import styles from './ResumeDocument.module.scss';

// 원본: resume/wip/resume/resume_v16/정주애_이력서_v16.html. 전화번호와 증명사진만 빼고 그대로 옮긴다.
// shortcut: 이력서 문구는 이 파일에 고정돼 있다. 관리자 편집이 필요해지면 mockup 컬렉션 + API로 옮긴다.

function Item({ title, date, children }: { title: string; date: string; children: ReactNode }) {
  return (
    <div className={styles.item}>
      <div className={styles.row}>
        <h3>{title}</h3>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.lines}>{children}</div>
    </div>
  );
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

/** 이력서 화면 (인물정보 카드 "이력서 보기"로 들어온다) */
export function ResumeDocument() {
  return (
    <article className={styles.page} aria-label="정주애 이력서">
      <header>
        <div className={styles.title}>
          <h1>정주애</h1>
          <span className={styles.doc}>이력서</span>
        </div>
        <div className={styles.contact}>
          <a href="mailto:jexists486@gmail.com">
            <Icon>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </Icon>
            jexists486@gmail.com
          </a>
          <a href="https://github.com/jexists" target="_blank" rel="noopener noreferrer">
            <Icon>
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </Icon>
            github.com/jexists
          </a>
        </div>
      </header>

      <h2>경력사항</h2>
      <Item title="주식회사 브레이스 (구 아유레디)" date="2020.08 – 2026.04 | 5년 8개월">
        <div>축구 유니폼 커뮤니티·중고거래 플랫폼 레사모 (4mation.net)</div>
        <div>누적 가입자 8만 명 · 연간 거래 2.6만 건 (2025년 기준, 회사 내부 집계)</div>
        <div>출시 전 합류, 웹 개발 2–3인 조직에서 Angular 프론트엔드·Go 백엔드 풀스택 개발 및 운영</div>
        <div>경매·결제·정산·재고·물류 등 거래 핵심 기능의 사용자 화면, 관리자 화면, API 및 데이터 모델 구현</div>
        <div>Toss·Payple 결제 연동, Redis 락으로 경매 중복 마감 해결, Angular 13 → 20 단계적 업그레이드</div>
      </Item>
      <Item title="성진에이치디에스" date="2020.02 – 2020.04 | 3개월">
        <div>Angular 기반 웹 프로젝트 UI 퍼블리싱·프론트엔드 개발</div>
      </Item>
      <Item title="필리핀 한인 종합 매거진 뉴스게이트" date="2016.05 – 2019.05 | 3년">
        <div>매거진 편집디자인·광고 그래픽 제작, 오프라인 매거진의 온라인 배포 제안·진행</div>
        <div>필리핀 한인 커뮤니티 웹사이트 기획·디자인 및 오픈 후 콘텐츠 운영</div>
      </Item>

      <h2>교육 · 학습 활동</h2>
      <Item title="AX Campus 1기" date="2026.10 – 2026.12">
        <div>주식회사 에이엑스 · FDE 양성 과정 · 96시간 + 4주 실무 교육</div>
        <div>고객 문제 정의부터 기획·개발·연동·배포·평가까지 AI 서비스 구축 흐름 학습</div>
      </Item>
      <Item title="SK네트웍스 Family AI 캠프 30기" date="2026.03 – 2026.09">
        <div>플레이데이터평생교육원 · K-디지털 트레이닝 (KDT) · 960시간</div>
        <div>Python·SQL, 머신러닝·딥러닝, LLM·RAG·멀티에이전트, AWS 학습 및 AI 서비스 개발 실습</div>
      </Item>
      <Item title="C/C++ 프로그래밍 과정" date="2021.07 – 2021.08">
        <div>메가스터디컴퓨터아카데미 신촌학원 · 국비지원 직업훈련 · 60시간</div>
        <div>C/C++ 기초 문법과 프로그래밍 기본 개념 학습</div>
      </Item>
      <Item title="스마트기기 UX/UI 디자인 실무자 과정" date="2019.08 – 2019.12">
        <div>그린컴퓨터아카데미 수원 · 국비지원 직업훈련 · 700시간 · 성적우수상, 개근상</div>
        <div>UX/UI 디자인과 HTML, CSS (SCSS), JavaScript (jQuery) 기초 학습</div>
      </Item>

      <h2>학력사항</h2>
      <Item title="필리핀 산토 토마스 대학교 (University of Santo Tomas, UST)" date="2012.06 – 2016.06">
        <div>BFA in Industrial Design (산업디자인 전공) · 졸업</div>
        <div>GWA 1.76 (최고점 1.00 · 100점 환산 89점) · Dean’s List 총 4회 (2013–2016)</div>
      </Item>

      <h2>보유기술</h2>
      <div className={styles.skill}>
        <h4>개발 기술</h4>
        <div>
          <span className={styles.label}>주요 실무 기술:</span>Angular (TypeScript · RxJS), Go (Gin), MongoDB, Git
        </div>
        <div className={styles.sub}>
          <span className={styles.sublabel}>Angular:</span>사용자·관리자 화면 개발, 웹·앱 웹뷰 공용 화면 구조, 공통 기능 개발, 버전
          업그레이드 (13 → 20)
        </div>
        <div className={styles.sub}>
          <span className={styles.sublabel}>Go (Gin):</span>REST API 설계 및 개발, 외부 서비스 연동, 스케줄러 및 파일 처리 기능 개발
        </div>
        <div className={styles.sub}>
          <span className={styles.sublabel}>MongoDB:</span>서비스 데이터 모델링, Aggregation 집계, Atlas Search 기반 검색 구현
        </div>
        <div>
          <span className={styles.label}>기타 활용 기술:</span>Python, Redis, Firebase, Docker, AWS
        </div>
      </div>
      <div className={styles.skill}>
        <h4>AI 활용</h4>
        <div>
          <span className={styles.label}>바이브 코딩:</span>Claude Code, Codex로 구현·테스트 작성, 결과물 직접 검수
        </div>
        <div>
          <span className={styles.label}>AI 서비스·자동화:</span>RAG 구현 (LangChain · pgvector), MCP 연결, 반복 작업용 스킬 제작
        </div>
      </div>
      <div className={styles.skill}>
        <h4>프로젝트 경험 기술</h4>
        <div>React, Next.js, Vue.js, Python (FastAPI · Django), NestJS, PostgreSQL, Supabase</div>
      </div>
      <div className={styles.skill}>
        <h4>디자인 · 협업 도구</h4>
        <div>Photoshop, Illustrator, InDesign, Figma, Notion</div>
      </div>
    </article>
  );
}
