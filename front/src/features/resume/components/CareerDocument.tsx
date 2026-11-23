import type { ReactNode } from 'react';
import base from './ResumeDocument.module.scss';
import styles from './CareerDocument.module.scss';

// 원본: resume/wip/경력기술서/경력기술서_v35/정주애_경력기술서_v35.html. 전화번호와 위치만 빼고 그대로 옮긴다.
// shortcut: 경력기술서 문구는 이 파일에 고정돼 있다. 관리자 편집이 필요해지면 mockup 컬렉션 + API로 옮긴다.

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

function Kv({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.kv}>
      <b>{label}</b>
      <span>{children}</span>
    </div>
  );
}

function Firm({ name, date, job, children }: { name: string; date: string; job: string; children: ReactNode }) {
  return (
    <div className={styles.firm}>
      <div className={styles.firmHead}>
        <div className={styles.co}>
          <h3>{name}</h3>
          <span className={styles.date}>{date}</span>
        </div>
        <div className={styles.job}>{job}</div>
      </div>
      <div className={styles.intro}>{children}</div>
    </div>
  );
}

function Sec({ label, items, result }: { label: string; items: ReactNode[]; result?: boolean }) {
  return (
    <div className={styles.sec} data-result={result || undefined}>
      <b>{label}</b>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Proj({ no, title, date, role, children }: { no: string; title: string; date: string; role?: string; children: ReactNode }) {
  return (
    <section className={styles.proj}>
      <div className={styles.ph}>
        <span className={styles.no}>{no}</span>
        <h4>{title}</h4>
        <span className={styles.date}>{date}</span>
      </div>
      {role ? <div className={styles.role}>{role}</div> : null}
      {children}
    </section>
  );
}

/** 경력기술서 화면 (경력 탭 타임라인의 "경력기술서 보기"로 들어온다) */
export function CareerDocument() {
  return (
    <article className={`${base.page} ${styles.page}`} aria-label="정주애 경력기술서">
      <header>
        <div className={base.title}>
          <h1>정주애</h1>
          <span className={base.doc}>경력기술서</span>
        </div>
        <div className={base.contact}>
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

      <h2>경력 요약</h2>
      <ul className={styles.sum}>
        <li>
          웹 풀스택 개발 5년 8개월. 축구 유니폼 거래 플랫폼 레사모를 출시 전부터 개발·운영
          <br />
          (2025년 기준 누적 가입자 8만 명 · 연간 거래 2.6만 건, 회사 내부 집계)
        </li>
        <li>
          웹 개발 2–3인 조직에서 Angular 프론트엔드와 Go 백엔드를 함께 맡아 경매·결제·정산·재고·물류 등 거래 핵심 기능을 규칙
          정의부터 화면·API·데이터 모델·운영까지 담당
        </li>
        <li>PG 2곳 (Toss · Payple)·네이버 커머스 API·배송 추적 API 연동, 스케줄러 자동화, 관리자·사용자 화면 UX 개선</li>
      </ul>

      <h2>경력사항</h2>
      <Firm name="주식회사 브레이스 (구 아유레디)" date="2020.08 – 2026.04 | 5년 8개월" job="웹 풀스택 개발">
        <Kv label="서비스">축구 유니폼 커뮤니티·중고거래 플랫폼 레사모 (4mation.net). 웹, Android·iOS 앱 웹뷰, 관리자 화면</Kv>
        <Kv label="역할">
          출시 전 프론트엔드 (Angular)로 합류, 2021.04부터 백엔드 (Go · MongoDB) 병행
          <br />
          대표가 제시한 기능 방향의 상세 정책·예외 처리 정의와 구현
        </Kv>
        <Kv label="협업">
          5인 이하 회사 (대표, 시기에 따라 앱 개발자·디자이너·마케터 근무)
          <br />
          대표와 기획·우선순위 논의, 앱 개발자와 웹뷰 연동 조율, 운영자 요청을 관리자 화면에 반영
        </Kv>
        <Kv label="기술">Angular (TypeScript · RxJS), Go (Gin), MongoDB, Redis, Firebase</Kv>
      </Firm>

      <div className={styles.subhead}>주요 프로젝트</div>
      <Proj no="01" title="경매" date="2021.12 – 2026.02" role="상세 기획 · 프론트엔드 · 백엔드 · 운영 (경매 원칙은 대표 제시)">
        <Sec
          label="주요 업무"
          items={[
            '입찰·즉시구매·자동입찰·낙찰 등 경매 화면과 API 개발',
            '낙찰 이후 거래 흐름 정의·개발: 자동결제부터 배송·정산까지, 차순위 낙찰·재등록',
          ]}
        />
        <Sec
          label="문제 해결"
          items={[
            '동시 조회로 경매가 두 번 마감·자동결제 2번 → 판매글 번호 단위 Redis 락 (SETNX)으로 한 번만 마감',
            '마감 직전 1분 연장이 현재가보다 낮은 입찰 시도에도 동작 → 입찰이 성공한 경우에만 연장',
            '인기 경매 마감 시각에 서버 장애 → 관리자 화면에서 마감 연장·경매중 복귀, 안내 댓글 자동 등록·캐시 삭제, 마감 시각 분산 규칙 (DB 레플리카 전환은 대표)',
          ]}
        />
        <Sec label="성과" result items={['적용 이후 운영 중 중복 마감 재발 없음, 장애 시 운영자가 관리자 화면에서 직접 복구']} />
      </Proj>
      <Proj no="02" title="통합 검색" date="2025.08 – 2026.02">
        <Sec
          label="문제 해결"
          items={[
            '정규식 검색이라 동의어·줄임말이 검색되지 않음 → Atlas Search 인덱스·쿼리를 구성해 통합 검색·자동완성 개발, 검색 로그로 동의어 후보를 만들어 관리자가 승인·등록',
          ]}
        />
      </Proj>
      <Proj no="03" title="주문·결제·정산" date="2021.11 – 2026.03" role="상세 기획 · 프론트엔드 · 백엔드 · 운영">
        <Sec
          label="주요 업무"
          items={[
            'Toss Payments · Payple 결제·자동결제·취소·웹훅 연동, PG 구분값으로 취소·환불 분기',
            '결제부터 구매확정·반품·환불까지 주문 흐름 정의·개발',
            '운영용 관리자 화면·기능 개발: 판매자 정산·은행 정산용 엑셀, 주문번호별 결제 이력 조회, 부분환불 등',
          ]}
        />
        <Sec
          label="문제 해결"
          items={[
            '화면에 재고가 보여도 이미 팔린 경우 → 결제 승인 전 백엔드 재고 재확인, 판매글·마지막 재고 옵션에 락',
            '정산 끝난 주문의 상태 변경, 이미 팔린 상품에 늦게 들어온 입금 → 정산 완료 주문은 상태 변경 차단, 결제 로그를 남기고 오류·확인 필요 건은 Slack 별도 채널로 분리 전송',
          ]}
        />
        <Sec label="성과" result items={['돈 흐름 예외는 운영자가 Slack으로 바로 확인, 결제 코드 수정 후 E2E 시나리오 39개로 확인']} />
      </Proj>
      <Proj no="04" title="스토어·재고·네이버 연동" date="2021.12 – 2026.03" role="상세 기획 · 프론트엔드 · 백엔드 · 운영 (기능 방향은 대표 제시)">
        <Sec
          label="주요 업무"
          items={['스토어 상품 (단일·옵션·추가 상품)·장바구니·리뷰·Q&A·선물하기·예약딜 개발', '네이버 커머스 API 주문 수집·재고 동기화']}
        />
        <Sec
          label="설계"
          items={[
            '자사 스토어·네이버 스토어·계좌 거래 등 여러 채널에서 판매 → 단일 물품 (유니폼·마킹 이름·번호·패치 등)은 SKU, 단일 물품을 묶은 조합 상품은 BOM으로 재고 구조 분리',
            '판매 가능 수량은 저장하지 않고 입고·채널별 판매·실사 보정으로 계산해 틀린 채널 추적',
          ]}
        />
        <Sec label="성과" result items={['자사 스토어 등록 시 네이버 스토어 자동 등록, 재고 통합 확인·소진 시 자동 품절로 수동 작업 축소']} />
      </Proj>
      <Proj no="05" title="프론트엔드 구조·성능" date="2020.08 – 2026.03">
        <Sec
          label="주요 업무"
          items={[
            '사용자·관리자 화면 대부분의 UI·UX 구현, 웹·앱 웹뷰 공용 화면 구조 (웹뷰 분기·앱 스킴)',
            '화면 lazy 모듈 분리·일부 standalone 전환, 목록 lazy-load와 스켈레톤 UI',
          ]}
        />
        <Sec
          label="문제 해결"
          items={['상품·게시글 본문 이미지를 한꺼번에 받아 CDN 전송량·로딩 부담 → 화면에 들어온 이미지만 불러오는 lazy-load 디렉티브']}
        />
        <Sec label="업그레이드" items={['Angular 13 → 20 단계적 업데이트: Material·Ant Design·Firebase 호환 대응, 미사용 패키지 정리']} />
      </Proj>
      <div className={styles.etc}>
        <div className={styles.ph}>
          <h4>그 밖의 개발·운영</h4>
        </div>
        <Kv label="캐시·DB 부하">글 작성·입찰마다 목록 캐시 전체 삭제 → 바뀐 판매글 키만 삭제, DB 타임아웃 응답은 캐시 제외</Kv>
        <Kv label="물류·배송">택배사 발송 엑셀, 배송 추적 API 스케줄러로 배송완료 자동 처리, 반값택배·합배송</Kv>
        <Kv label="앱 첫 화면 서버 구성">레이아웃 12종을 정의하고 구성·문구를 서버에서 내려줘 앱 업데이트 없이 첫 화면 변경</Kv>
      </div>

      <Firm name="필리핀 한인 종합 매거진 뉴스게이트" date="2016.05 – 2019.05 | 3년" job="편집디자인·콘텐츠">
        <Kv label="회사">1996년부터 발행된 필리핀 최초의 한인 종합 매거진 (마닐라)</Kv>
        <Kv label="역할">
          매거진 편집디자인·광고 그래픽 제작, 오프라인 매거진의 온라인 배포 제안·진행
          <br />
          카카오톡 채널·페이스북 페이지 운영, 한인 커뮤니티 웹사이트 기획·디자인·운영
        </Kv>
        <Kv label="도구">InDesign, Illustrator, Photoshop</Kv>
      </Firm>
    </article>
  );
}
