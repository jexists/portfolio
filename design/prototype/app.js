// 해시 라우팅 시안: #/ (검색 첫 화면), #/search?tab=..., #/project/<id>
// 레이아웃: 포털 통합검색형 (왼쪽 결과 카드 + 오른쪽 사이드 카드). 색·헤더·칩은 기존 앱 스타일 유지.
(() => {
  const D = window.PORTFOLIO;
  const app = document.getElementById('app');
  const frame = document.getElementById('frame');

  const TABS = [
    ['all', '전체'], ['career', '경력'], ['skills', '기술'],
    ['education', '학력'], ['certs', '자격·수상'], ['projects', '프로젝트'],
  ];
  const LINK_KIND = { live: 'Live', github: 'GitHub', slides: '발표', video: '영상', doc: '문서', pdf: 'PDF' };
  const ICON = {
    search: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    down: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ext = (url, text, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text}<span class="sr-only"> (새 탭)</span></a>`;
  const byId = (list, id) => list.find((x) => x.id === id);
  const period = (p) => `${p.start} – ${p.end}`;
  const host = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const logo = () => `<span class="logo" aria-label="PortFolio">${[...'PortFolio'].map((c) => `<span aria-hidden="true">${c}</span>`).join('')}</span>`;
  const thumb = (title, caption) => `<div class="thumb" role="img" aria-label="${esc(title)} 화면 자리"><span><b>${esc(caption)}</b>캡처 예정</span></div>`;
  const refName = (id) => {
    const p = byId(D.projects, id); if (p) return `<a href="#/project/${p.id}">${esc(p.title)}</a>`;
    const c = byId(D.careers, id); if (c) return `<a href="#/search?tab=career">${esc(c.company)}</a>`;
    return '';
  };
  const cardHead = (title, href) => `<div class="card-head"><h2>${title}</h2>${href ? `<a class="arrow" href="${href}" aria-label="${title} 더보기">${ICON.arrow}</a>` : ''}</div>`;

  // ── 검색 첫 화면 ──
  let introTimers = [];
  const clearIntro = () => { introTimers.forEach(clearTimeout); introTimers = []; };
  function renderIntro() {
    const query = '정주애';
    const suggestions = [['정주애', 'all'], ['정주애 경력', 'career'], ['정주애 프로젝트', 'projects'], ['정주애 기술', 'skills']];
    app.innerHTML = `
      <main class="intro" id="intro">
        <h1>${logo()}</h1>
        <div class="intro-search">
          <form id="intro-form" role="search">
            ${ICON.search}
            <label class="sr-only" for="q">검색어</label>
            <input id="q" autocomplete="off">
            <span class="caret" aria-hidden="true"></span>
          </form>
          <ul class="suggest" id="suggest" hidden>
            ${suggestions.map(([s, t]) => `<li><a href="#/search?tab=${t}">${ICON.search}${s}</a></li>`).join('')}
          </ul>
        </div>
        <nav class="intro-links" aria-label="외부 링크">
          ${D.profile.links.map((l) => ext(l.url, esc(l.label))).join('')}
          <a href="mailto:${esc(D.profile.email)}">이메일</a>
        </nav>
      </main>`;
    const input = document.getElementById('q');
    const go = () => { location.hash = '#/search?tab=all'; };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { input.value = query; document.getElementById('suggest').hidden = false; }
    else {
      [...query].forEach((_, i) => introTimers.push(setTimeout(() => { input.value = query.slice(0, i + 1); }, 600 + i * 300)));
      introTimers.push(setTimeout(() => { document.getElementById('suggest').hidden = false; }, 1700));
      introTimers.push(setTimeout(() => { document.querySelector('#suggest a').setAttribute('aria-current', 'true'); }, 2400));
      introTimers.push(setTimeout(go, 3600));
    }
    document.getElementById('intro-form').addEventListener('submit', (e) => { e.preventDefault(); go(); });
    // 클릭으로만 건너뛴다. 키보드로 첫 화면 안에 들어오면 자동 이동을 멈춘다.
    document.getElementById('intro').addEventListener('click', (e) => { if (!e.target.closest('a, input')) go(); });
    document.getElementById('intro').addEventListener('focusin', clearIntro);
  }

  // ── 공통 헤더 ──
  function header(tab, q = '정주애') {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="header-top">
            <a href="#/" aria-label="첫 화면으로">${logo()}</a>
            <div class="header-search">
              <form role="search" onsubmit="event.preventDefault()">
                <label class="sr-only" for="hq">검색어</label>
                <input id="hq" value="${esc(q)}">${ICON.search}
              </form>
            </div>
            <nav class="header-links" aria-label="외부 링크">${D.profile.links.slice(0, 2).map((l) => ext(l.url, esc(l.label))).join('')}</nav>
          </div>
          <nav class="tabs" aria-label="검색 탭">
            ${TABS.map(([id, label]) => `<a href="#/search?tab=${id}" ${id === tab ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
        </div>
      </header>`;
  }
  const footer = () => `<footer class="footer">© ${esc(D.profile.name)}</footer>`;

  function infoList() {
    const p = D.profile;
    const edu = D.educations[0];
    return `<dl class="info">
            <div><dt>경력</dt><dd>${D.careers.slice(0, 2).map((c) => `<p>${c.period.start}.~${c.period.end}. ${esc(c.company)} ${esc(c.role)}</p>`).join('')}</dd></div>
            <div><dt>학력</dt><dd>${esc(edu.school)} ${esc(edu.major.split(' · ').pop())} 졸업</dd></div>
            <div><dt>자격</dt><dd>${D.certificates.slice(0, 3).map((c) => esc(c.name)).join(', ')}</dd></div>
            <div><dt>사이트</dt><dd class="links">${p.links.map((l) => ext(l.url, esc(l.label))).join('')}</dd></div>
            <div><dt>이메일</dt><dd><a href="mailto:${esc(p.email)}">${esc(p.email)}</a><button class="copy" type="button" data-copy="${esc(p.email)}">복사</button></dd></div>
          </dl>`;
  }

  // ── 인물정보 카드 (모든 탭 맨 위) ──
  function personCard(tab) {
    const p = D.profile;
    return `
      <section class="card person" aria-label="인물정보">
        <h1>${esc(p.name)}</h1>
        <p class="sub"><span class="en">${esc(p.nameEn)}</span> · ${esc(p.role)}, ${esc(p.years)}</p>
        <nav class="chips" aria-label="인물정보 탭">
          ${TABS.map(([id, label]) => `<a class="chip" href="#/search?tab=${id}" ${id === tab ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
        ${tab === 'all' ? `
        <div class="person-body">
          ${infoList()}
          <div class="photo">사진</div>
        </div>` : ''}
      </section>`;
  }

  // ── 오른쪽 사이드 ──
  function side(tab) {
    const p = D.profile;
    const queries = [
      ['정주애 레사모 경매', '#/search?tab=career'], ['정주애 한빛수학', '#/project/hanbit'],
      ['정주애 blog2shorts', '#/project/blog2shorts'], ['정주애 Angular', '#/search?tab=skills'],
      ['정주애 Go MongoDB', '#/search?tab=skills'], ['정주애 교육 과정', '#/search?tab=education'],
    ];
    return `
      <aside class="side side-stack" aria-label="사이드">
        ${tab === 'all' ? `<section class="card">${cardHead('핵심 역량')}
          <ul class="pill-list">${p.strengths.map((s) => `<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join('')}</ul>
        </section>` : `<section class="card side-profile" aria-label="프로필">
          <div class="side-profile-head"><div class="photo">사진</div><div><h2>${esc(p.name)}</h2><p class="muted small">${esc(p.role)} · ${esc(p.years)}</p></div></div>
          ${infoList()}
        </section>`}
        <section class="card">${cardHead('관련 검색어')}
          <ul class="query-list">${queries.map(([q, h]) => `<li><a href="${h}">${ICON.search}${esc(q)}</a></li>`).join('')}</ul>
        </section>
        <section class="card">
          <ul class="link-rows">
            ${p.links.map((l) => `<li>${ext(l.url, `<span class="ico" aria-hidden="true">${esc(l.label[0])}</span><span class="t"><b>${esc(l.label)}</b><span>${esc(host(l.url))}</span></span><span class="chev">${ICON.chev}</span>`)}</li>`).join('')}
            <li><a href="mailto:${esc(p.email)}"><span class="ico" aria-hidden="true">@</span><span class="t"><b>이메일</b><span>${esc(p.email)}</span></span><span class="chev">${ICON.chev}</span></a></li>
          </ul>
        </section>
      </aside>`;
  }

  // ── 전체 ──
  function tile(p, withSummary = false) {
    return `<a class="tile" href="#/project/${p.id}">
      ${thumb(p.title, '대표 이미지')}
      <div class="tile-body">
        <div class="tile-title">${esc(p.title)}${p.subtitle ? ` · ${esc(p.subtitle)}` : ''}</div>
        ${withSummary ? `<p class="tile-sum">${esc(p.summary)}</p>` : ''}
        <div class="tile-meta">${esc(D.projectGroups[p.group])} · ${esc(p.period.split(' ')[0])}</div>
        ${withSummary ? `<div class="tags">${p.stack.slice(0, 4).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>` : ''}
      </div>
    </a>`;
  }
  function tabAll() {
    const p = D.profile;
    const brace = D.careers[0];
    const featured = D.projects.filter((x) => x.featured);
    const workSkills = D.skills.filter((s) => s.usage === 'work' && ['Frontend', 'Backend', 'Database'].includes(s.group));
    const edu = D.educations[0];
    return `
      <section class="card">${cardHead('대표 프로젝트', '#/search?tab=projects')}
        <div class="carousel">
          <div class="rail" id="rail">${featured.map((x) => tile(x)).join('')}</div>
          <button class="rail-next" type="button" data-action="rail" aria-label="다음 프로젝트">${ICON.chev}</button>
        </div>
      </section>

      <article class="card result">
        <div class="source"><span class="dot">경</span>경력 · ${esc(brace.company)}</div>
        <h3><a href="#/search?tab=career">레사모 웹 풀스택 개발 - ${esc(brace.duration)}</a></h3>
        <p class="desc">${esc(p.headline)}.</p>
        <ul class="facts">${p.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        <div class="result-foot"><span>${period(brace.period)}</span><a href="#/search?tab=career">경력 더보기 ${ICON.chev}</a></div>
        <div class="related"><h4>다른 경력</h4><ul>${D.careers.slice(1).map((c) => `<li><a href="#/search?tab=career">${esc(c.company)} - ${esc(c.role)}</a></li>`).join('')}</ul></div>
      </article>

      <article class="card result">
        <div class="source"><span class="dot dot--green">기</span>기술</div>
        <h3><a href="#/search?tab=skills">실무 기술 ${workSkills.length}개 · 프로젝트 기술 ${D.skills.length - workSkills.length}개</a></h3>
        <ul class="facts">${workSkills.slice(0, 5).map((s) => `<li><b>${esc(s.name)}</b> ${esc(s.context)}</li>`).join('')}</ul>
        <div class="result-foot"><span></span><a href="#/search?tab=skills">기술 더보기 ${ICON.chev}</a></div>
      </article>

      <article class="card result">
        <div class="source"><span class="dot dot--yellow">학</span>학력 · 자격</div>
        <h3><a href="#/search?tab=education">${esc(edu.school)}</a></h3>
        <p class="desc">${esc(edu.major)} · ${esc(edu.degree)} (${period(edu.period)})</p>
        <ul class="facts">${D.certificates.slice(0, 3).map((c) => `<li>${esc(c.date)} ${esc(c.name)} · ${esc(c.issuer)}</li>`).join('')}</ul>
        <div class="result-foot"><a href="#/search?tab=education">학력 더보기 ${ICON.chev}</a><a href="#/search?tab=certs">자격·수상 더보기 ${ICON.chev}</a></div>
      </article>`;
  }

  // ── 경력 ──
  function achievement(a, i) {
    const list = (label, items) => items?.length ? `<div><div class="lbl">${label}</div><ul class="bullets">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
    return `<details${i === 0 ? ' open' : ''}><summary><h3>${esc(a.title)}</h3><span class="muted small">${esc(a.period)}</span></summary>
      <div class="body">
        ${a.role ? `<p class="muted">${esc(a.role)}</p>` : ''}
        ${list('주요 업무', a.work)}${list('문제 해결', a.problems)}
        ${a.result ? `<p class="result-box"><b>성과</b> ${esc(a.result)}</p>` : ''}
      </div></details>`;
  }
  function tabCareer() {
    return D.careers.map((c) => `
      <article class="card career" id="career-${c.id}">
        <div class="career-head"><h2>${esc(c.company)}${c.companyNote ? `<small>${esc(c.companyNote)}</small>` : ''}</h2><span class="when">${period(c.period)} · ${esc(c.duration)}</span></div>
        <p class="role">${esc(c.role)}</p>
        ${c.service ? `<p class="service">${esc(c.service)}</p>` : ''}
        ${c.metrics ? `<div class="metrics">${c.metrics.map((m) => `<div><div class="v">${esc(m.value)}</div><div class="l">${esc(m.label)}</div><div class="n">${esc(m.note)}</div></div>`).join('')}</div>` : ''}
        ${c.responsibilities ? `<h3 class="sub-h">역할</h3><ul class="bullets">${c.responsibilities.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        ${c.achievements ? `<h3 class="sub-h">주요 업무와 문제 해결</h3><div class="achv">${c.achievements.map(achievement).join('')}</div>` : ''}
        ${c.extras ? `<h3 class="sub-h">그 밖의 개발·운영</h3><ul class="bullets">${c.extras.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        <h3 class="sub-h">기술</h3>
        <div class="tags">${c.skillIds.map((id) => byId(D.skills, id)).filter(Boolean).map((s) => `<span class="tag">${esc(s.name)}</span>`).join('')}</div>
      </article>`).join('') + `
      <section class="card">${cardHead('그 밖의 경력')}
        <ul class="rows">${D.careerEtc.map((e) => `<li><span class="when">${esc(e.period)}</span><div><div class="what">${esc(e.name)}</div><div class="s">${esc(e.text)}</div></div></li>`).join('')}</ul>
      </section>`;
  }

  // ── 기술 ──
  function tabSkills() {
    return D.skillGroups.map((g) => {
      const items = D.skills.filter((s) => s.group === g);
      if (!items.length) return '';
      return `<section class="card">${cardHead(esc(g))}${items.map((s) => `
        <div class="skill">
          <div class="name">${esc(s.name)} <span class="badge ${s.usage === 'work' ? 'badge--work' : ''}">${s.usage === 'work' ? '실무' : '프로젝트'}</span></div>
          <div><p class="ctx">${esc(s.context)}</p>${s.refs.length ? `<div class="refs">${s.refs.map(refName).join('')}</div>` : ''}</div>
        </div>`).join('')}</section>`;
    }).join('');
  }

  // ── 학력 ──
  function tabEducation() {
    return `
      <section class="card">${cardHead('학력')}
        ${D.educations.map((e) => `
          <div class="career-head"><h2>${esc(e.school)}</h2><span class="when">${period(e.period)}</span></div>
          <p class="muted">${esc(e.place)} · ${esc(e.major)}</p><p>${esc(e.degree)}</p>
          <ul class="bullets" style="margin-top:var(--sp-3)">${e.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`).join('')}
      </section>
      <section class="card">${cardHead('교육')}
        <table class="table"><thead><tr><th>기간</th><th>과정</th><th>기관</th><th>시간</th></tr></thead><tbody>
          ${D.courses.map((c) => `<tr><td>${esc(c.period)}</td><td class="name">${esc(c.name)}</td><td>${esc(c.org)}</td><td>${esc(c.hours)}</td></tr>`).join('')}
        </tbody></table>
      </section>`;
  }

  // ── 자격·수상 ──
  function tabCerts() {
    return `
      <section class="card">${cardHead('자격')}
        <table class="table"><thead><tr><th>취득</th><th>자격</th><th>발급기관</th></tr></thead><tbody>
          ${D.certificates.map((c) => `<tr><td>${esc(c.date)}</td><td><span class="name">${esc(c.name)}</span>${c.note ? ` <span class="muted">${esc(c.note)}</span>` : ''}</td><td>${esc(c.issuer)}</td></tr>`).join('')}
        </tbody></table>
      </section>
      <section class="card">${cardHead('수상')}
        <table class="table"><thead><tr><th>날짜</th><th>수상</th><th>주최</th></tr></thead><tbody>
          ${D.awards.map((a) => `<tr><td>${esc(a.date)}</td><td class="name">${esc(a.name)}</td><td>${esc(a.issuer)}</td></tr>`).join('')}
        </tbody></table>
      </section>`;
  }

  // ── 프로젝트 ──
  let showAll = false; let filter = 'all';
  function tabProjects() {
    const featured = D.projects.filter((p) => p.featured);
    const rest = D.projects.filter((p) => !p.featured && (filter === 'all' || p.group === filter));
    return `
      <section class="card">${cardHead('대표 프로젝트')}
        <div class="grid2">${featured.map((p) => tile(p, true)).join('')}</div>
        ${showAll ? '' : `<button class="more-btn" type="button" data-action="more" aria-expanded="false">프로젝트 더보기 ${D.projects.length - featured.length}개 ${ICON.down}</button>`}
      </section>
      ${showAll ? `
      <section class="card" id="all-projects">${cardHead('모든 프로젝트')}
        <div class="chips" role="group" aria-label="구분" style="margin-bottom:var(--sp-4)">
          ${[['all', '전체'], ...Object.entries(D.projectGroups)].map(([k, v]) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${filter === k}">${v}</button>`).join('')}
        </div>
        <ul class="list-results">${rest.map((p) => `<li>
          <h3><a href="#/project/${p.id}">${esc(p.title)}${p.subtitle ? ` - ${esc(p.subtitle)}` : ''}</a></h3>
          <p>${esc(p.summary)}</p>
          <div class="meta"><span>${esc(p.period)}</span><span>${esc(p.stack.slice(0, 3).join(' · '))}</span>${p.links.slice(0, 2).map((l) => ext(l.url, esc(LINK_KIND[l.type] || l.label))).join('')}</div>
        </li>`).join('') || '<li class="muted">해당 구분의 프로젝트가 없습니다.</li>'}</ul>
      </section>` : ''}`;
  }

  // ── 프로젝트 상세 ──
  function renderDetail(id) {
    const p = byId(D.projects, id);
    if (!p) { location.hash = '#/search?tab=projects'; return; }
    const featured = D.projects.filter((x) => x.featured && x.id !== p.id);
    const d = p.detail;
    const links = p.links.map((l, i) => ext(l.url, `<span>${esc(l.label)}</span><span class="k">${esc(LINK_KIND[l.type] || '')} ↗</span>`, `btn-link ${i === 0 ? 'btn-link--primary' : ''}`)).join('');
    app.innerHTML = `${header('projects', p.title)}
      <main class="page">
        <div class="col">
          <section class="card detail-hero">
            <a class="back" href="#/search?tab=projects">&lt; 프로젝트</a>
            <h1>${esc(p.title)}</h1>
            ${p.subtitle ? `<p class="subtitle">${esc(p.subtitle)}</p>` : ''}
            <p class="summary">${esc(p.summary)}</p>
            <div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>
            <div class="cover">${thumb(p.title, '대표 이미지')}</div>
          </section>
          <article class="card prose">
            ${d ? `
              <h2>배경</h2><p>${esc(d.background)}</p>
              <h2>주요 기능</h2><ul class="feature-list">${d.features.map((f) => `<li><b>${esc(f.who)}</b><span>${esc(f.text)}</span></li>`).join('')}</ul>
              <h2>문제와 해결</h2>${d.cases.map((c) => `<section class="case"><h3>${esc(c.title)}</h3><dl><dt>문제</dt><dd>${esc(c.problem)}</dd><dt>해결</dt><dd>${esc(c.solution)}</dd><dt>결과</dt><dd>${esc(c.result)}</dd></dl></section>`).join('')}
              <h2>성과</h2><ul class="bullets">${d.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
              ${p.images?.length ? `<h2>화면</h2><div class="gallery">${p.images.map((im) => `<figure>${thumb(p.title, im.caption)}<figcaption>${esc(im.caption)}</figcaption></figure>`).join('')}</div>` : ''}
            ` : `<p class="notice">상세 내용은 한빛수학·blog2shorts와 같은 틀(배경 → 주요 기능 → 문제와 해결 → 성과 → 화면)로 채울 예정입니다.</p>`}
          </article>
        </div>
        <aside class="side side-stack" aria-label="프로젝트 정보">
          <section class="card">${cardHead('개요')}
            <dl class="meta-dl">
              ${p.course ? `<div><dt>과정</dt><dd>${esc(p.course)}</dd></div>` : ''}
              <div><dt>기간</dt><dd>${esc(p.period)}</dd></div>
              ${p.team ? `<div><dt>팀</dt><dd>${esc(p.team)}</dd></div>` : ''}
              ${p.role ? `<div><dt>역할</dt><dd>${esc(p.role)}</dd></div>` : ''}
            </dl>
          </section>
          ${links ? `<section class="card">${cardHead('링크')}<div class="btn-links">${links}</div>${p.linkNote ? `<p class="muted small" style="margin-top:var(--sp-3)">${esc(p.linkNote)}</p>` : ''}</section>` : ''}
          <section class="card">${cardHead('다른 대표 프로젝트')}
            <ul class="query-list">${featured.map((x) => `<li><a href="#/project/${x.id}">${ICON.search}${esc(x.title)}</a></li>`).join('')}</ul>
          </section>
        </aside>
      </main>${footer()}`;
  }

  const TAB_VIEWS = { all: tabAll, career: tabCareer, skills: tabSkills, education: tabEducation, certs: tabCerts, projects: tabProjects };
  function renderSearch(tab) {
    const view = TAB_VIEWS[tab] ? tab : 'all';
    app.innerHTML = `${header(view)}<main class="page"><div class="col">${view === 'all' ? personCard(view) : ''}${TAB_VIEWS[view]()}</div>${side(view)}</main>${footer()}`;
  }

  function route() {
    clearIntro();
    const [path, qs] = location.hash.replace(/^#/, '').split('?');
    const params = new URLSearchParams(qs);
    if (path.startsWith('/project/')) renderDetail(decodeURIComponent(path.slice(9)));
    else if (path === '/search') renderSearch(params.get('tab') || 'all');
    else renderIntro();
    window.scrollTo(0, 0);
  }

  // 위임 이벤트: 더보기, 필터, 이메일 복사, 썸네일 넘기기
  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-filter], [data-copy]');
    if (!t) return;
    if (t.dataset.action === 'more') { showAll = true; renderSearch('projects'); document.getElementById('all-projects')?.scrollIntoView(); }
    if (t.dataset.action === 'rail') { const r = document.getElementById('rail'); r.scrollBy({ left: r.clientWidth / 3, behavior: 'smooth' }); }
    if (t.dataset.filter) { filter = t.dataset.filter; renderSearch('projects'); document.getElementById('all-projects')?.scrollIntoView(); }
    if (t.dataset.copy) navigator.clipboard?.writeText(t.dataset.copy).then(() => { t.textContent = '복사됨'; });
  });

  // 시안 도구: 데스크톱 / 모바일 프레임
  document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
    frame.classList.toggle('is-mobile', b.dataset.device === 'mobile');
    document.querySelectorAll('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  window.addEventListener('hashchange', route);
  route();
})();
