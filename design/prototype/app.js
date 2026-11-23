// 해시 라우팅 시안: #/ (검색 첫 화면), #/search?tab=..., #/project/<id>
(() => {
  const D = window.PORTFOLIO;
  const app = document.getElementById('app');
  const frame = document.getElementById('frame');

  const TABS = [
    ['all', '전체'], ['career', '경력'], ['skills', '기술'],
    ['education', '학력'], ['certs', '자격·수상'], ['projects', '프로젝트'],
  ];
  const LINK_KIND = { live: 'Live', github: 'GitHub', slides: '발표', video: '영상', doc: '문서', pdf: 'PDF' };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ext = (url, text, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text}<span class="sr-only"> (새 탭)</span></a>`;
  const byId = (list, id) => list.find((x) => x.id === id);
  const period = (p) => `${p.start} – ${p.end}`;
  const logo = (cls = '') => `<span class="logo ${cls}" aria-label="PortFolio">${[...'PortFolio'].map((c) => `<span aria-hidden="true">${c}</span>`).join('')}</span>`;
  const refName = (id) => {
    const p = byId(D.projects, id); if (p) return `<a href="#/project/${p.id}">${esc(p.title)}</a>`;
    const c = byId(D.careers, id); if (c) return `<a href="#/search?tab=career">${esc(c.company)}</a>`;
    return '';
  };
  const placeholder = (title, caption) => `<div class="thumb" role="img" aria-label="${esc(title)} 화면 자리"><span><b>${esc(caption || title)}</b>캡처 예정 (Phase 5)</span></div>`;

  // ── 검색 첫 화면 ──
  let introTimers = [];
  function renderIntro() {
    const query = '정주애';
    const suggestions = ['정주애', '정주애 경력', '정주애 프로젝트', '정주애 기술'];
    const targets = ['all', 'career', 'projects', 'skills'];
    app.innerHTML = `
      <main class="intro" id="intro">
        <h1>${logo()}</h1>
        <div class="search-box">
          <form id="intro-form" role="search">
            <label class="sr-only" for="q">검색어</label>
            <input id="q" autocomplete="off" value="">
            <span class="caret" aria-hidden="true"></span>
          </form>
          <ul class="suggest" id="suggest" hidden>
            ${suggestions.map((s, i) => `<li><a href="#/search?tab=${targets[i]}">${s}</a></li>`).join('')}
          </ul>
        </div>
        <nav class="intro-links" aria-label="외부 링크">
          ${D.profile.links.map((l) => ext(l.url, esc(l.label))).join('')}
          <a href="mailto:${esc(D.profile.email)}">이메일</a>
        </nav>
      </main>`;
    const input = document.getElementById('q');
    const go = () => { location.hash = '#/search?tab=all'; };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { input.value = query; document.getElementById('suggest').hidden = false; }
    else {
      [...query].forEach((_, i) => introTimers.push(setTimeout(() => { input.value = query.slice(0, i + 1); }, 600 + i * 300)));
      introTimers.push(setTimeout(() => { document.getElementById('suggest').hidden = false; }, 1700));
      introTimers.push(setTimeout(() => { document.querySelector('#suggest a').setAttribute('aria-current', 'true'); }, 2400));
      introTimers.push(setTimeout(go, 3600));
    }
    document.getElementById('intro-form').addEventListener('submit', (e) => { e.preventDefault(); go(); });
    // 클릭으로만 건너뛴다. 키보드 Tab 이동은 막지 않는다.
    document.getElementById('intro').addEventListener('click', (e) => { if (!e.target.closest('a, input')) go(); });
    // 키보드로 첫 화면 안에 들어오면 자동 이동을 멈춘다.
    document.getElementById('intro').addEventListener('focusin', clearIntro);
  }
  const clearIntro = () => { introTimers.forEach(clearTimeout); introTimers = []; };

  // ── 공통 헤더 ──
  function header(tab, q = '정주애') {
    return `
      <header class="header">
        <div class="header-inner">
          <div class="header-top">
            <a href="#/" aria-label="첫 화면으로">${logo('logo--sm')}</a>
            <div class="search-box">
              <form role="search" onsubmit="event.preventDefault()">
                <label class="sr-only" for="hq">검색어</label>
                <input id="hq" value="${esc(q)}">
              </form>
            </div>
            <nav class="header-links" aria-label="외부 링크">
              ${D.profile.links.slice(0, 2).map((l) => ext(l.url, esc(l.label))).join('')}
            </nav>
          </div>
          <nav class="tabs" aria-label="섹션">
            ${TABS.map(([id, label]) => `<a href="#/search?tab=${id}" ${id === tab ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
        </div>
      </header>`;
  }
  const footer = () => `<footer class="footer">© ${esc(D.profile.name)}</footer>`;

  // ── 전체 ──
  function tabAll() {
    const p = D.profile;
    const featured = D.projects.filter((x) => x.featured).slice(0, 4);
    const coreSkills = D.skills.filter((s) => s.usage === 'work' && ['Frontend', 'Backend', 'Database'].includes(s.group));
    return `
      <div class="overview">
        <div>
          <section class="section">
            <p class="headline">${esc(p.headline)}</p>
            <ul class="bullets" style="margin-top:var(--sp-4)">${p.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          </section>
          <section class="section">
            <div class="section-head"><h2>핵심 역량</h2></div>
            <ul class="strengths">${p.strengths.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ul>
          </section>
          <section class="section">
            <div class="section-head"><h2>경력</h2><a class="more" href="#/search?tab=career">경력 전체 보기 →</a></div>
            <ul class="row-list">${D.careers.map((c) => `<li><span class="when">${period(c.period)}</span><div><div class="what">${esc(c.company)}</div><div class="sub">${esc(c.role)} · ${esc(c.duration)}</div></div></li>`).join('')}</ul>
          </section>
          <section class="section">
            <div class="section-head"><h2>대표 프로젝트</h2><a class="more" href="#/search?tab=projects">프로젝트 전체 보기 →</a></div>
            <div class="featured-grid">${featured.map(card).join('')}</div>
          </section>
          <section class="section">
            <div class="section-head"><h2>실무 기술</h2><a class="more" href="#/search?tab=skills">기술 전체 보기 →</a></div>
            <div class="skill-inline">${coreSkills.map((s) => `<span class="tag">${esc(s.name)}</span>`).join('')}</div>
          </section>
          <section class="section">
            <div class="section-head"><h2>학력 · 자격</h2><a class="more" href="#/search?tab=education">학력 보기 →</a></div>
            <ul class="row-list">
              ${D.educations.map((e) => `<li><span class="when">${period(e.period)}</span><div><div class="what">${esc(e.school)}</div><div class="sub">${esc(e.major)} · ${esc(e.degree)}</div></div></li>`).join('')}
              ${D.certificates.slice(0, 3).map((c) => `<li><span class="when">${esc(c.date)}</span><div><div class="what">${esc(c.name)}</div><div class="sub">${esc(c.issuer)}</div></div></li>`).join('')}
            </ul>
          </section>
        </div>
        <aside class="profile-panel" aria-label="프로필">
          <div class="photo">사진</div>
          <h1>${esc(p.name)}<span class="en">${esc(p.nameEn)}</span></h1>
          <p class="role">${esc(p.role)} · ${esc(p.years)}</p>
          <dl class="facts">
            <dt>거주지</dt><dd>${esc(p.location)}</dd>
            <dt>이메일</dt><dd><a href="mailto:${esc(p.email)}">${esc(p.email)}</a><button class="copy" type="button" data-copy="${esc(p.email)}">복사</button></dd>
            ${p.links.map((l) => `<dt>${esc(l.label)}</dt><dd>${ext(l.url, esc(l.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')))}</dd>`).join('')}
          </dl>
        </aside>
      </div>`;
  }

  // ── 경력 ──
  function achievement(a, i) {
    const list = (label, items) => items?.length ? `<div><div class="lbl">${label}</div><ul class="bullets">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
    return `<details${i === 0 ? ' open' : ''}><summary><h3>${esc(a.title)}</h3><span class="muted small">${esc(a.period)}</span></summary>
      <div class="body">
        ${a.role ? `<p class="muted">${esc(a.role)}</p>` : ''}
        ${list('주요 업무', a.work)}${list('문제 해결', a.problems)}
        ${a.result ? `<p class="result"><b>성과</b> ${esc(a.result)}</p>` : ''}
      </div></details>`;
  }
  function tabCareer() {
    return `
      <h1 class="page-title">경력</h1>
      <div class="timeline" style="margin-top:var(--sp-6)">
        ${D.careers.map((c) => `
          <article class="career" id="career-${c.id}">
            <div class="career-when"><strong>${period(c.period)}</strong>${esc(c.duration)}</div>
            <div>
              <h2>${esc(c.company)}${c.companyNote ? `<small>${esc(c.companyNote)}</small>` : ''}</h2>
              <p class="role">${esc(c.role)}</p>
              ${c.service ? `<p class="service">${esc(c.service)}</p>` : ''}
              ${c.metrics ? `<div class="metrics">${c.metrics.map((m) => `<div><div class="v">${esc(m.value)}</div><div class="l">${esc(m.label)}</div><div class="n">${esc(m.note)}</div></div>`).join('')}</div>` : ''}
              ${c.responsibilities ? `<h3 class="sub-h">역할</h3><ul class="bullets">${c.responsibilities.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
              ${c.achievements ? `<h3 class="sub-h">주요 업무와 문제 해결</h3><div class="achv">${c.achievements.map(achievement).join('')}</div>` : ''}
              ${c.extras ? `<h3 class="sub-h">그 밖의 개발·운영</h3><ul class="bullets">${c.extras.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
              <h3 class="sub-h">기술</h3>
              <div class="tags">${c.skillIds.map((id) => byId(D.skills, id)).filter(Boolean).map((s) => `<span class="tag">${esc(s.name)}</span>`).join('')}</div>
            </div>
          </article>`).join('')}
        <article class="career">
          <div class="career-when"><strong>그 밖의 경력</strong></div>
          <ul class="row-list">${D.careerEtc.map((e) => `<li><span class="when">${esc(e.period)}</span><div><div class="what">${esc(e.name)}</div><div class="sub">${esc(e.text)}</div></div></li>`).join('')}</ul>
        </article>
      </div>`;
  }

  // ── 기술 ──
  function tabSkills() {
    return `
      <h1 class="page-title">기술</h1>
      <div style="margin-top:var(--sp-5)">
        ${D.skillGroups.map((g) => {
          const items = D.skills.filter((s) => s.group === g);
          if (!items.length) return '';
          return `<section class="skill-group"><h2>${esc(g)}</h2><div>${items.map((s) => `
            <div class="skill">
              <div class="name">${esc(s.name)} <span class="badge ${s.usage === 'work' ? 'badge--work' : ''}">${s.usage === 'work' ? '실무' : '프로젝트'}</span></div>
              <div><p class="ctx">${esc(s.context)}</p>${s.refs.length ? `<div class="refs">${s.refs.map(refName).join('')}</div>` : ''}</div>
            </div>`).join('')}</div></section>`;
        }).join('')}
      </div>`;
  }

  // ── 학력 ──
  function tabEducation() {
    return `
      <h1 class="page-title">학력</h1>
      <section class="section" style="margin-top:var(--sp-5)">
        <div class="section-head"><h2>학력</h2></div>
        ${D.educations.map((e) => `
          <div class="edu-card">
            <div class="career-when"><strong>${period(e.period)}</strong>${esc(e.place)}</div>
            <div><h3>${esc(e.school)}</h3><p class="muted">${esc(e.major)}</p><p>${esc(e.degree)}</p>
              <ul class="bullets" style="margin-top:var(--sp-3)">${e.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>
          </div>`).join('')}
      </section>
      <section class="section">
        <div class="section-head"><h2>교육</h2></div>
        <table class="table"><thead><tr><th>기간</th><th>과정</th><th>기관</th><th>시간</th></tr></thead><tbody>
          ${D.courses.map((c) => `<tr><td>${esc(c.period)}</td><td class="name">${esc(c.name)}</td><td>${esc(c.org)}</td><td>${esc(c.hours)}</td></tr>`).join('')}
        </tbody></table>
      </section>`;
  }

  // ── 자격·수상 ──
  function tabCerts() {
    return `
      <h1 class="page-title">자격 · 수상</h1>
      <section class="section" style="margin-top:var(--sp-5)">
        <div class="section-head"><h2>자격</h2></div>
        <table class="table"><thead><tr><th>취득</th><th>자격</th><th>발급기관</th></tr></thead><tbody>
          ${D.certificates.map((c) => `<tr><td>${esc(c.date)}</td><td><span class="name">${esc(c.name)}</span>${c.note ? ` <span class="muted">${esc(c.note)}</span>` : ''}</td><td>${esc(c.issuer)}</td></tr>`).join('')}
        </tbody></table>
      </section>
      <section class="section">
        <div class="section-head"><h2>수상</h2></div>
        <table class="table"><thead><tr><th>날짜</th><th>수상</th><th>주최</th></tr></thead><tbody>
          ${D.awards.map((a) => `<tr><td>${esc(a.date)}</td><td class="name">${esc(a.name)}</td><td>${esc(a.issuer)}</td></tr>`).join('')}
        </tbody></table>
      </section>`;
  }

  // ── 프로젝트 ──
  function card(p) {
    return `<a class="card" href="#/project/${p.id}">
      ${placeholder(p.title, '대표 이미지')}
      <div class="meta">${esc(D.projectGroups[p.group])} · ${esc(p.period)}${p.team ? ` · ${esc(p.team.replace(/ \(.*\)/, ''))}` : ''}</div>
      <h3>${esc(p.title)}${p.subtitle ? `<span>${esc(p.subtitle)}</span>` : ''}</h3>
      <p>${esc(p.summary)}</p>
      ${p.highlights ? `<ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      <div class="tags">${p.stack.slice(0, 5).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    </a>`;
  }
  const compactRow = (p) => `<li>
    <span class="muted small">${esc(p.period)}</span>
    <div><div class="t"><a href="#/project/${p.id}">${esc(p.title)}</a></div><div class="s">${esc(p.summary)}</div></div>
    <div class="l">${p.links.slice(0, 2).map((l) => ext(l.url, esc(LINK_KIND[l.type] || l.label))).join('')}</div>
  </li>`;
  let showAll = false; let filter = 'all';
  function tabProjects() {
    const featured = D.projects.filter((p) => p.featured);
    const rest = D.projects.filter((p) => !p.featured && (filter === 'all' || p.group === filter));
    return `
      <h1 class="page-title">프로젝트</h1>
      <section class="section" style="margin-top:var(--sp-5)">
        <div class="section-head"><h2>대표 프로젝트</h2></div>
        <div class="featured-grid">${featured.map(card).join('')}</div>
        ${showAll ? '' : `<button class="more-btn" type="button" data-action="more" aria-expanded="false">프로젝트 더보기 (${D.projects.length - featured.length}개)</button>`}
      </section>
      ${showAll ? `
      <section class="section" id="all-projects">
        <div class="section-head"><h2>모든 프로젝트</h2></div>
        <div class="filters" role="group" aria-label="구분">
          ${[['all', '전체'], ...Object.entries(D.projectGroups)].map(([k, v]) => `<button type="button" data-filter="${k}" aria-pressed="${filter === k}">${v}</button>`).join('')}
        </div>
        <ul class="compact">${rest.map(compactRow).join('') || '<li class="muted">해당 구분의 프로젝트가 없습니다.</li>'}</ul>
      </section>` : ''}`;
  }

  // ── 프로젝트 상세 ──
  function renderDetail(id) {
    const p = byId(D.projects, id);
    if (!p) { location.hash = '#/search?tab=projects'; return; }
    const order = D.projects.filter((x) => x.featured);
    const idx = order.indexOf(p);
    const prev = idx > 0 ? order[idx - 1] : null;
    const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    const d = p.detail;
    const links = p.links.map((l, i) => ext(l.url, `<span>${esc(l.label)}</span><span class="k">${esc(LINK_KIND[l.type] || '')} ↗</span>`, `link-btn ${i === 0 ? 'link-btn--primary' : ''}`)).join('');
    app.innerHTML = `${header('projects', p.title)}
      <main class="page">
        <p class="crumb"><a href="#/search?tab=projects">&lt; 프로젝트</a></p>
        <div class="detail-hero">
          <h1>${esc(p.title)}</h1>
          ${p.subtitle ? `<p class="subtitle">${esc(p.subtitle)}</p>` : ''}
          <p class="summary">${esc(p.summary)}</p>
        </div>
        <div class="detail-cover">${placeholder(p.title, '대표 이미지 (16:8)')}</div>
        <div class="detail-grid">
          <article class="prose">
            ${d ? `
              <h2>배경</h2><p>${esc(d.background)}</p>
              <h2>주요 기능</h2><ul class="feature-list">${d.features.map((f) => `<li><b>${esc(f.who)}</b><span>${esc(f.text)}</span></li>`).join('')}</ul>
              <h2>문제와 해결</h2>${d.cases.map((c) => `<section class="case"><h3>${esc(c.title)}</h3><dl><dt>문제</dt><dd>${esc(c.problem)}</dd><dt>해결</dt><dd>${esc(c.solution)}</dd><dt>결과</dt><dd>${esc(c.result)}</dd></dl></section>`).join('')}
              <h2>성과</h2><ul class="bullets">${d.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
              ${p.images?.length ? `<h2>화면</h2><div class="gallery">${p.images.map((im) => `<figure>${placeholder(p.title, im.caption)}<figcaption>${esc(im.caption)}</figcaption></figure>`).join('')}</div>` : ''}
            ` : `<div class="notice">이 프로젝트의 상세 내용은 한빛수학·blog2shorts와 같은 틀(배경 → 주요 기능 → 문제와 해결 → 성과 → 화면)로 채울 예정입니다.</div>`}
          </article>
          <aside class="overview-box" aria-label="프로젝트 개요">
            <dl>
              ${p.course ? `<div><dt>과정</dt><dd>${esc(p.course)}</dd></div>` : ''}
              <div><dt>기간</dt><dd>${esc(p.period)}</dd></div>
              ${p.team ? `<div><dt>팀</dt><dd>${esc(p.team)}</dd></div>` : ''}
              ${p.role ? `<div><dt>역할</dt><dd>${esc(p.role)}</dd></div>` : ''}
              <div><dt>기술</dt><dd class="tags" style="margin-top:4px">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</dd></div>
            </dl>
            ${links ? `<div class="link-list">${links}</div>` : ''}
            ${p.linkNote ? `<p class="muted small" style="margin-top:var(--sp-3)">${esc(p.linkNote)}</p>` : ''}
          </aside>
        </div>
        ${idx >= 0 ? `<nav class="pager" aria-label="다른 프로젝트">
          <div>${prev ? `<a href="#/project/${prev.id}"><span>← 이전</span>${esc(prev.title)}</a>` : ''}</div>
          <div class="next">${next ? `<a href="#/project/${next.id}"><span>다음 →</span>${esc(next.title)}</a>` : ''}</div>
        </nav>` : ''}
      </main>${footer()}`;
  }

  const TAB_VIEWS = { all: tabAll, career: tabCareer, skills: tabSkills, education: tabEducation, certs: tabCerts, projects: tabProjects };
  function renderSearch(tab) {
    const view = TAB_VIEWS[tab] ? tab : 'all';
    app.innerHTML = `${header(view)}<main class="page">${view === 'all' ? `<p class="result-meta">정주애에 대한 검색 결과</p>` : ''}${TAB_VIEWS[view]()}</main>${footer()}`;
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

  // 위임 이벤트: 더보기, 필터, 이메일 복사
  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-filter], [data-copy]');
    if (!t) return;
    if (t.dataset.action === 'more') { showAll = true; renderSearch('projects'); document.getElementById('all-projects')?.scrollIntoView(); }
    if (t.dataset.filter) { filter = t.dataset.filter; renderSearch('projects'); document.getElementById('all-projects')?.scrollIntoView(); }
    if (t.dataset.copy) navigator.clipboard?.writeText(t.dataset.copy).then(() => { t.textContent = '복사됨'; });
  });

  // 시안 도구: 데스크톱 / 모바일 프레임
  document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
    const mobile = b.dataset.device === 'mobile';
    frame.classList.toggle('is-mobile', mobile);
    document.querySelectorAll('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  window.addEventListener('hashchange', route);
  route();
})();
