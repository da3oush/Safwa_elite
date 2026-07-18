/* ==========================================================================
   ELITE REAL ESTATE GROUP — Shared JavaScript
   Sticky nav · Mobile menu · Scroll reveal · Counters · Accordion ·
   Tabs · Filters · Lightbox · Forms · Back to top
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Sticky header ---------- */
  const header = document.querySelector('.site-header');
  const backTop = document.querySelector('.back-top');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    if (backTop) backTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1800;
        const start = performance.now();
        const step = now => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Accordion (FAQ) ---------- */
  // open any items marked .open on load with a measured height
  document.querySelectorAll('.acc-item.open .acc-body').forEach(body => {
    body.style.maxHeight = body.scrollHeight + 'px';
  });
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const body = item.querySelector('.acc-body');
      const isOpen = item.classList.contains('open');

      // close siblings
      item.closest('.accordion').querySelectorAll('.acc-item.open').forEach(open => {
        if (open !== item) {
          open.classList.remove('open');
          open.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
          open.querySelector('.acc-body').style.maxHeight = null;
        }
      });

      item.classList.toggle('open', !isOpen);
      head.setAttribute('aria-expanded', String(!isOpen));
      body.style.maxHeight = isOpen ? null : body.scrollHeight + 'px';
    });
  });

  /* ---------- Tabs (floor plans etc.) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(tabsWrap => {
    const buttons = tabsWrap.querySelectorAll('[data-tab]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const scope = tabsWrap.parentElement;
        scope.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = scope.querySelector('#' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  });

  /* ---------- Filters (gallery / projects) ---------- */
  document.querySelectorAll('[data-filter-bar]').forEach(bar => {
    const pills = bar.querySelectorAll('.filter-pill');
    const targetSel = bar.dataset.filterTarget;
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.filter;
        document.querySelectorAll(targetSel + ' [data-category]').forEach(item => {
          item.classList.toggle('hidden', cat !== 'all' && item.dataset.category !== cat);
        });
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lightbox-caption');
    let items = [];
    let index = 0;

    const collect = () =>
      Array.from(document.querySelectorAll('[data-lightbox]')).filter(el => !el.classList.contains('hidden'));

    const show = i => {
      items = collect();
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const el = items[index];
      lbImg.src = el.dataset.full || el.querySelector('img').src;
      if (lbCap) lbCap.textContent = el.dataset.caption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-lightbox]');
      if (trigger) {
        e.preventDefault();
        show(collect().indexOf(trigger));
      }
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------- Forms (prototype submit) ---------- */
  document.querySelectorAll('form[data-prototype]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const success = form.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        form.querySelectorAll('input, textarea, select').forEach(f => (f.value = ''));
        setTimeout(() => success.classList.remove('show'), 6000);
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
