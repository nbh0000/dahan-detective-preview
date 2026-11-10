/* 다한 탐정사무소 · main.js (메인 · 후기 게시판 공용) */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) doc.classList.add('save-data');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const smooth = reduceMotion ? 'auto' : 'smooth';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- 히어로 배경 슬라이드 ---------- */
  (() => {
    const box = $('#heroSlides'), dotsBox = $('#heroDots');
    if (!box || !dotsBox || reduceMotion || saveData) return;
    const heroEl = box.closest('.hero');
    const slides = $$('.hero__slide', box), dots = $$('.hero__dot', dotsBox), pauseBtn = $('#heroPause');
    const DUR = 3500;
    let cur = 0, timer = 0, paused = false, visible = true;
    dotsBox.style.setProperty('--dur', DUR + 'ms');
    // 첫 장이 보인 뒤 나머지 사진을 불러옴
    const ready = () => box.classList.add('is-ready');
    if (document.readyState === 'complete') setTimeout(ready, 300); else addEventListener('load', () => setTimeout(ready, 300));
    const paint = () => {
      dots.forEach((d, i) => {
        d.classList.toggle('is-on', i === cur);
        d.classList.toggle('is-done', i < cur);
        if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (!paused && visible && !document.hidden) timer = setTimeout(() => go(cur + 1), DUR);
    };
    const go = (n) => {
      const prev = slides[cur];
      cur = (n + slides.length) % slides.length;
      slides.forEach((el) => el.classList.remove('is-was'));
      prev.classList.remove('is-on'); prev.classList.add('is-was');
      const next = slides[cur];
      next.style.animation = 'none'; void next.offsetWidth; next.style.animation = '';
      next.classList.add('is-on');
      dots.forEach((d) => d.classList.remove('is-on')); void dotsBox.offsetWidth;
      paint();
      schedule();
    };
    dots.forEach((d, i) => d.addEventListener('click', () => { if (i !== cur) go(i); }));
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      heroEl.classList.toggle('is-paused', paused);
      pauseBtn.setAttribute('aria-label', paused ? '자동 넘김 재생' : '자동 넘김 멈춤');
      pauseBtn.innerHTML = '<i class="ph ph-' + (paused ? 'play' : 'pause') + '" aria-hidden="true"></i>';
      if (paused) clearTimeout(timer); else go(cur + 1);
    });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }).observe(heroEl);
    }
    paint(); schedule();
  })();

  /* ---------- 히어로 렌즈 ---------- */
  const hero = $('.hero');
  const lens = $('#lens');
  if (hero && lens && !reduceMotion && !saveData) {
    if (finePointer.matches) {
      let tx = 62, ty = 46, cx = 62, cy = 46, raf = 0, active = false;
      const tick = () => {
        cx += (tx - cx) * 0.085;
        cy += (ty - cy) * 0.085;
        lens.style.setProperty('--lx', cx.toFixed(2) + '%');
        lens.style.setProperty('--ly', cy.toFixed(2) + '%');
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : 0;
      };
      hero.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 100;
        ty = ((e.clientY - r.top) / r.height) * 100;
        active = true;
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        if (!active) return;
        tx = 62; ty = 46;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    } else {
      hero.classList.add('is-roam');
    }
  }

  /* ---------- 헤더 배경 · 레일 표시 ---------- */
  const hdr = $('#hdr');
  const rail = $('.rail');
  if (hero) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:120px;pointer-events:none';
    hero.prepend(sentinel);
    new IntersectionObserver(([e]) => hdr.classList.toggle('is-solid', !e.isIntersecting)).observe(sentinel);
    new IntersectionObserver(([e]) => rail && rail.classList.toggle('is-on', !e.isIntersecting), { threshold: 0.35 }).observe(hero);
  } else if (rail) {
    rail.classList.add('is-on');
  }

  /* ---------- 현재 섹션 메뉴 표시 (메인) ---------- */
  const navLinks = $$('.gnb a').filter((a) => a.getAttribute('href').startsWith('#'));
  if (navLinks.length) {
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-cur', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => secIO.observe(s));
  }

  /* ---------- 등장 ---------- */
  const revIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revIO.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal').forEach((el) => {
    const sib = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    const idx = sib.indexOf(el);
    if (idx > 0) el.style.transitionDelay = (Math.min(idx, 6) * 0.08) + 's';
    revIO.observe(el);
  });

  /* ---------- 업무분야 ---------- */
  let selectField = () => {};
  const fxWrap = $('#fields .wrap');
  const list = $('#fxList');
  if (fxWrap && list) {
    const items = $$('.fx__item', list);
    const stageImgs = $$('.fx__stage img');
    const tabs = $$('#fields .tabs [role="tab"]');
    const tabsWrap = $('#fields .tabs-wrap');
    const tabsEl = $('#fields .tabs');
    const bar = $('#fxBar');
    let cur = 0;
    const isWide = () => fxWrap.clientWidth >= 900;

    const paint = (i) => {
      cur = i;
      items.forEach((it, n) => {
        it.classList.toggle('is-on', n === i);
        $('.fx__btn', it).setAttribute('aria-expanded', String(n === i));
      });
      stageImgs.forEach((im, n) => im.classList.toggle('is-on', n === i));
      tabs.forEach((t, n) => { t.setAttribute('aria-selected', String(n === i)); t.tabIndex = n === i ? 0 : -1; });
      const tab = tabs[i];
      if (tab && !isWide()) tabsEl.scrollTo({ left: tab.offsetLeft - tabsEl.clientWidth / 2 + tab.clientWidth / 2, behavior: smooth });
    };
    selectField = (i, scrollCarousel) => {
      if (!items[i]) return;
      paint(i);
      if (scrollCarousel && !isWide()) {
        list.scrollTo({ left: items[i].offsetLeft - list.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft), behavior: smooth });
      }
    };
    items.forEach((it, i) => {
      const btn = $('.fx__btn', it);
      btn.addEventListener('click', () => selectField(i));
      btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && isWide()) selectField(i); });
      btn.addEventListener('focus', () => { if (isWide()) selectField(i); });
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectField(i, true));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectField(n, true); tabs[n].focus();
      });
    });
    let sraf = 0;
    list.addEventListener('scroll', () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = 0;
        if (isWide() || items.length < 2) return;
        const max = list.scrollWidth - list.clientWidth;
        const p = max > 0 ? list.scrollLeft / max : 0;
        const w = (list.clientWidth / list.scrollWidth) * 100;
        bar.style.width = w + '%';
        bar.style.transform = `translateX(${w < 100 ? p * (100 / w - 1) * 100 : 0}%)`;
        const step = items[1].offsetLeft - items[0].offsetLeft;
        const n = Math.min(items.length - 1, Math.round(list.scrollLeft / step));
        if (n !== cur) paint(n);
      });
    }, { passive: true });
    list.dispatchEvent(new Event('scroll'));
    if (tabsEl) {
      const tabFade = () => tabsWrap.classList.toggle('at-end', tabsEl.scrollLeft + tabsEl.clientWidth >= tabsEl.scrollWidth - 4);
      tabsEl.addEventListener('scroll', tabFade, { passive: true });
      addEventListener('resize', tabFade, { passive: true });
      tabFade();
    }
  }

  /* ---------- 가로 스크롤 탭 끝 페이드 (후기 게시판) ---------- */
  $$('.board__tabs').forEach((w) => {
    const t = $('.tabs', w);
    const f = () => w.classList.toggle('at-end', t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
    t.addEventListener('scroll', f, { passive: true }); addEventListener('resize', f, { passive: true }); f();
    const curTab = $('[aria-current="page"]', t);
    if (curTab) t.scrollLeft = curTab.offsetLeft - 24;
  });

  /* ---------- 모바일 드로어 ---------- */
  const burger = $('#burger');
  const drawer = $('#drawer');
  if (burger && drawer) {
    const setDrawer = (open) => {
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) setTimeout(() => { const f = $('.drawer__list a, .drawer__sub-btn', drawer); f && f.focus({ preventScroll: true }); }, 350);
    };
    burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
    drawer.addEventListener('click', (e) => {
      const t = e.target.closest('[data-close]');
      if (!t) return;
      if (t.dataset.field) selectField(+t.dataset.field, true);
      setDrawer(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setDrawer(false); burger.focus(); }
    });
    matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setDrawer(false); });
    $$('.drawer__sub-btn').forEach((b) => b.addEventListener('click', () => {
      b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
    }));
  }
  // 다른 페이지에서 /#fields 로 들어올 때 업무분야 지정 (data-field 는 sessionStorage 로 전달)
  $$('a[data-field]').forEach((a) => a.addEventListener('click', () => { try { sessionStorage.setItem('dahanField', a.dataset.field); } catch (_) {} }));
  try {
    const f = sessionStorage.getItem('dahanField');
    if (f !== null && list) { sessionStorage.removeItem('dahanField'); selectField(+f, true); }
  } catch (_) {}

  /* ---------- 상담 신청 폼 → /api/consult.php ---------- */
  const form = $('#qform');
  if (form) {
    const done = $('.qf__done');
    const fields = {
      name: { el: $('#q-name'), err: $('#q-name-err'), check: (v) => v.trim().length >= 1 || '이름을 입력해 주세요. 가명도 괜찮습니다.' },
      tel: { el: $('#q-tel'), err: $('#q-tel-err'), check: (v) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, '')) || '휴대폰 번호를 확인해 주세요. 예: 010-1234-5678' },
      cat: { el: $('#q-cat'), err: $('#q-cat-err'), check: (v) => !!v || '상담 분야를 선택해 주세요.' },
      agree: { el: $('#q-agree'), err: $('#q-agree-err'), check: (_, el) => el.checked || '온라인으로 상담을 신청하시려면 개인정보 수집·이용에 동의해 주세요.' },
    };
    const validate = (k) => {
      const f = fields[k];
      const r = f.check(f.el.value, f.el);
      const ok = r === true;
      f.err.textContent = ok ? '' : r;
      f.el.setAttribute('aria-invalid', String(!ok));
      if (!ok) f.el.setAttribute('aria-describedby', f.err.id); else f.el.removeAttribute('aria-describedby');
      return ok;
    };
    fields.tel.el.addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 11);
      e.target.value = d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
    });
    Object.keys(fields).forEach((k) => {
      const el = fields[k].el;
      el.addEventListener(k === 'agree' || k === 'cat' ? 'change' : 'blur', () => { if (el.value || k !== 'name') validate(k); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(k); });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = Object.keys(fields).filter((k) => !validate(k));
      if (bad.length) { fields[bad[0]].el.focus(); return; }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.classList.add('is-loading');
      fields.agree.err.textContent = '';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.msg || '');
        form.hidden = true; done.hidden = false;
        const h = $('h3', done); h.setAttribute('tabindex', '-1'); h.focus();
      } catch (err) {
        fields.agree.err.textContent = (err.message ? err.message + ' ' : '') + '상담 신청을 보내지 못했습니다. 다시 시도해 주시거나 전화로 문의해 주세요.';
      } finally {
        btn.disabled = false; btn.classList.remove('is-loading');
      }
    });
    $('#qf-reset').addEventListener('click', () => { form.reset(); form.hidden = false; done.hidden = true; fields.name.el.focus(); });
  }

  /* ---------- 개인정보 안내 ---------- */
  const dlg = $('#dlg-privacy');
  if (dlg) {
    $$('[data-dialog="privacy"]').forEach((b) => b.addEventListener('click', () => dlg.showModal()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- 모바일 하단 바: 폼·연락처·푸터와 겹치면 숨김 ---------- */
  const mbar = $('#mbar');
  if (mbar) {
    const hideFor = new Set();
    const mIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? hideFor.add(e.target) : hideFor.delete(e.target)));
      mbar.classList.toggle('is-hidden', hideFor.size > 0);
    }, { threshold: 0.15 });
    [$('#quick'), $('#contact'), $('.ft'), $('.post__cta')].forEach((el) => el && mIO.observe(el));
    const quick = $('#quick');
    if (quick) $('.mbar__main').addEventListener('click', (e) => {
      e.preventDefault();
      quick.scrollIntoView({ behavior: smooth, block: 'center' });
      setTimeout(() => { const n = $('#q-name'); n && n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    });
  }

  /* ---------- 후기 가로 스크롤 ---------- */
  const rvRail = $('#rvRail');
  if (rvRail) {
    const rvBar = $('#rvBar');
    const arrows = $$('.rv-arrow');
    let rr = 0;
    const rvUpdate = () => {
      rr = 0;
      const max = rvRail.scrollWidth - rvRail.clientWidth;
      const w = Math.min(100, (rvRail.clientWidth / rvRail.scrollWidth) * 100);
      const p = max > 0 ? rvRail.scrollLeft / max : 0;
      rvBar.style.width = w + '%';
      rvBar.style.transform = `translateX(${w < 100 ? p * (100 / w - 1) * 100 : 0}%)`;
      if (arrows.length) { arrows[0].disabled = rvRail.scrollLeft <= 2; arrows[1].disabled = rvRail.scrollLeft >= max - 2; }
      rvRail.closest('.wrap').classList.toggle('rv-fits', max <= 2);
    };
    rvRail.addEventListener('scroll', () => { if (!rr) rr = requestAnimationFrame(rvUpdate); }, { passive: true });
    addEventListener('resize', () => { if (!rr) rr = requestAnimationFrame(rvUpdate); }, { passive: true });
    arrows.forEach((b) => b.addEventListener('click', () => {
      const card = $('.rv-card', rvRail);
      rvRail.scrollBy({ left: (card ? card.getBoundingClientRect().width + 14 : 320) * +b.dataset.dir, behavior: smooth });
    }));
    rvUpdate();
  }

  /* ---------- 후기 캡처 가로 스크롤 진행 표시 ---------- */
  const caps = $('#caps'); const capsBar = $('#capsBar');
  if (caps && capsBar) {
    let cr = 0;
    const cu = () => { cr = 0; const max = caps.scrollWidth - caps.clientWidth; const w = Math.min(100, caps.clientWidth / caps.scrollWidth * 100);
      capsBar.style.width = w + '%'; capsBar.style.transform = 'translateX(' + (w < 100 && max > 0 ? caps.scrollLeft / max * (100 / w - 1) * 100 : 0) + '%)';
      capsBar.parentElement.hidden = max <= 2; };
    caps.addEventListener('scroll', () => { if (!cr) cr = requestAnimationFrame(cu); }, { passive: true });
    addEventListener('resize', () => { if (!cr) cr = requestAnimationFrame(cu); }, { passive: true });
    cu();
  }

  /* ---------- 유튜브: 누를 때만 불러오기 ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button.yt[data-yt]');
    if (!b) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
    f.title = b.getAttribute('aria-label') || 'YouTube 영상';
    f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.className = 'yt__frame';
    b.replaceWith(f);
  });

  /* ---------- 후기 사진 크게 보기 ---------- */
  const lb = $('#lightbox');
  const shots = $$('.post__shot');
  if (lb && shots.length) {
    const img = $('img', lb);
    let at = 0;
    const show = (i) => { at = (i + shots.length) % shots.length; img.src = shots[at].dataset.full; img.alt = `후기 사진 ${at + 1} / ${shots.length}`; };
    shots.forEach((s, i) => s.addEventListener('click', () => { show(i); lb.showModal(); }));
    $('.lightbox__prev', lb).addEventListener('click', () => show(at - 1));
    $('.lightbox__next', lb).addEventListener('click', () => show(at + 1));
    lb.classList.toggle('is-single', shots.length < 2);
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(at + (e.clientX < sx ? 1 : -1)); sx = null; });
  }

  /* ---------- 맨 위로 ---------- */
  const toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: smooth }));
})();
