// OnlineJá — motor de interações, sem dependências.
// Conceito: "a página é a entrega" — o scroll percorre as 48h de construção.

(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ========================================================
     1. Navegação — menu mobile + estado "scrolled"
     ======================================================== */
  const nav = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
      });
    });
  }

  /* ========================================================
     2. Headings quebrados em palavras (.split)
     ======================================================== */
  const splitEls = Array.from(document.querySelectorAll('.split'));

  splitEls.forEach((el) => {
    if (reducedMotion) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((word, i) => {
        const highlight = /online\?$/i.test(word) ? ' hl' : '';
        return `<span class="w${highlight}" style="--wi:${i}">${word}</span>`;
      })
      .join(' ');
  });

  /* ========================================================
     3. Reveal on scroll (.reveal e .split ganham .in-view)
     ======================================================== */
  const revealEls = Array.from(document.querySelectorAll('.reveal, .split'));

  if (!reducedMotion && 'IntersectionObserver' in window && revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => {
      // o headline do hero entra no load, não no scroll
      if (el.classList.contains('in-load')) {
        requestAnimationFrame(() => el.classList.add('in-view'));
      } else {
        revealIO.observe(el);
      }
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ========================================================
     4. Contadores (stats) e anel das 48h
     ======================================================== */
  const counters = Array.from(document.querySelectorAll('[data-count]'));

  const runCounter = (el, done) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (done) done(eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!reducedMotion && 'IntersectionObserver' in window && counters.length) {
    counters.forEach((el) => { el.textContent = '0'; });
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  // Anel: 0h → 48h com o arco preenchendo
  const ringFg = document.getElementById('ring-fg');
  const ringNum = document.getElementById('ring-num');
  const ringCell = document.querySelector('.bento-a');
  const RING_C = 326.73;

  if (ringFg && ringNum && ringCell) {
    if (!reducedMotion && 'IntersectionObserver' in window) {
      ringNum.textContent = '0h';
      const ringIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const start = performance.now();
              const tick = (now) => {
                const p = clamp((now - start) / 1500, 0, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                ringNum.textContent = `${Math.round(48 * eased)}h`;
                ringFg.style.strokeDashoffset = String(RING_C * (1 - eased));
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
              ringIO.unobserve(ringCell);
            }
          });
        },
        { threshold: 0.5 }
      );
      ringIO.observe(ringCell);
    } else {
      ringFg.style.strokeDashoffset = '0';
    }
  }

  /* ========================================================
     5. CTA — terminal digitando o deploy
     ======================================================== */
  const ctaBand = document.getElementById('cta-band');
  const termLines = Array.from(document.querySelectorAll('#terminal-body .tl'));

  const typeTerminal = () => {
    let lineIdx = 0;

    const typeLine = () => {
      if (lineIdx >= termLines.length) return;
      const line = termLines[lineIdx];
      const text = line.dataset.text || '';
      let charIdx = 0;
      line.classList.add('typing');

      const interval = setInterval(() => {
        charIdx += 1;
        line.textContent = text.slice(0, charIdx);
        if (charIdx >= text.length) {
          clearInterval(interval);
          line.classList.remove('typing');
          lineIdx += 1;
          setTimeout(typeLine, 220);
        }
      }, 16);
    };

    typeLine();
  };

  if (ctaBand) {
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const ctaIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              ctaBand.classList.add('play');
              typeTerminal();
              ctaIO.unobserve(ctaBand);
            }
          });
        },
        { threshold: 0.3 }
      );
      ctaIO.observe(ctaBand);
    } else {
      ctaBand.classList.add('play');
      termLines.forEach((line) => { line.textContent = line.dataset.text || ''; });
    }
  }

  /* ========================================================
     6. Tilt 3D nos cards de modelo (pointer fino)
     ======================================================== */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.model-card[data-tilt]').forEach((card) => {
      let raf = 0;

      card.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            `perspective(900px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-2px)`;
        });
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ========================================================
     7. Cena do hero — o site constrói (scroll no desktop,
        loop temporizado no mobile)
     ======================================================== */
  const heroScene = document.getElementById('hero-scene');
  const heroPanel = document.getElementById('hero-panel');
  const heroUrl = document.getElementById('hero-url');
  const buildStatus = document.getElementById('build-status');
  const scrollHint = document.getElementById('scroll-hint');
  const heroHalo = document.querySelector('.hero-halo');

  const URL_TEXT = 'seunegocio.com.br';
  const STAGE_THRESHOLDS = [0.03, 0.22, 0.42, 0.62, 0.82];
  const isScrolly = heroScene && !reducedMotion && window.innerWidth > 860;
  let heroStage = 0;

  const setStage = (stage) => {
    if (!heroScene || stage === heroStage) return;
    heroStage = stage;
    for (let i = 1; i <= 5; i++) {
      heroScene.classList.toggle(`st${i}`, stage >= i);
    }
    if (buildStatus) {
      const done = stage >= 5;
      buildStatus.textContent = done ? '● no ar' : 'construindo…';
      buildStatus.classList.toggle('ok', done);
    }
  };

  const setUrlChars = (fraction) => {
    if (!heroUrl) return;
    const count = Math.round(clamp(fraction, 0, 1) * URL_TEXT.length);
    heroUrl.textContent = URL_TEXT.slice(0, count);
  };

  if (heroScene && reducedMotion) {
    // Estático completo: tudo montado
    heroScene.classList.add('st1', 'st2', 'st3', 'st4', 'st5');
    if (buildStatus) {
      buildStatus.textContent = '● no ar';
      buildStatus.classList.add('ok');
    }
    if (heroUrl) heroUrl.textContent = URL_TEXT;
  } else if (heroScene && isScrolly) {
    heroScene.classList.add('scrolly');
    if (heroUrl) heroUrl.textContent = '';
  } else if (heroScene) {
    // Mobile/tablet: montagem em loop temporizado
    if (heroUrl) heroUrl.textContent = '';
    const STAGE_MS = [400, 1200, 2000, 2800, 3600];
    const CYCLE_MS = 7200;

    const runCycle = () => {
      setStage(0);
      setUrlChars(0);
      STAGE_MS.forEach((ms, i) => {
        setTimeout(() => setStage(i + 1), ms);
      });
      // digita a URL junto com a montagem
      const t0 = performance.now();
      const typeTick = (now) => {
        const p = clamp((now - t0 - 400) / 2400, 0, 1);
        setUrlChars(p);
        if (p < 1) requestAnimationFrame(typeTick);
      };
      requestAnimationFrame(typeTick);
    };

    runCycle();
    setInterval(runCycle, CYCLE_MS);
  }

  /* ========================================================
     8. Motor de scroll — trilho 48h, deploy log, timeline,
        letreiro reativo, cena do hero e FAB
     ======================================================== */
  const railFill = document.getElementById('rail-fill');
  const railTicks = Array.from(document.querySelectorAll('.rail-tick'));
  const deployPill = document.getElementById('deploy-pill');
  const deployHour = document.getElementById('deploy-hour');
  const deployMsg = document.getElementById('deploy-msg');
  const stepsTrack = document.getElementById('steps-track');
  const stepCards = stepsTrack ? Array.from(stepsTrack.querySelectorAll('.step-card')) : [];
  const marqueeTrack = document.getElementById('marquee-track');
  const whatsFab = document.getElementById('whats-fab');
  const ctaSection = document.getElementById('contato');

  if (reducedMotion) {
    if (whatsFab) whatsFab.classList.add('show');
    if (stepsTrack) {
      stepsTrack.style.setProperty('--steps-progress', '1');
      stepCards.forEach((card) => card.classList.add('lit'));
    }
    return;
  }

  // ---- Métricas de layout ----
  const stageSections = Array.from(document.querySelectorAll('[data-build-hour]'));
  let buildStages = [];
  let ctaAnchor = 1;
  let stepsTop = 0;
  let stepsHeight = 1;
  let sceneTop = 0;
  let sceneRange = 1;
  let viewportH = window.innerHeight;
  let marqueeHalf = 0;

  const measure = () => {
    viewportH = window.innerHeight;
    const yNow = window.scrollY;

    buildStages = stageSections
      .map((el) => ({
        top: el.getBoundingClientRect().top + yNow,
        msg: el.dataset.buildMsg || '',
      }))
      .sort((a, b) => a.top - b.top);

    if (ctaSection) {
      const rect = ctaSection.getBoundingClientRect();
      const ctaCenter = rect.top + yNow + rect.height / 2;
      const maxScroll = document.documentElement.scrollHeight - viewportH;
      ctaAnchor = Math.max(1, Math.min(ctaCenter - viewportH / 2, maxScroll));
    }

    if (stepsTrack) {
      const rect = stepsTrack.getBoundingClientRect();
      stepsTop = rect.top + yNow;
      stepsHeight = Math.max(rect.height, 1);
    }

    if (heroScene && isScrolly) {
      const rect = heroScene.getBoundingClientRect();
      sceneTop = rect.top + yNow;
      sceneRange = Math.max(rect.height - viewportH, 1);
    }

    if (marqueeTrack) {
      marqueeHalf = marqueeTrack.scrollWidth / 2;
    }
  };

  // ---- Letreiro dirigido por JS ----
  if (marqueeTrack) marqueeTrack.classList.add('js-drive');
  let marqueeX = 0;

  // ---- Parallax de mouse no painel do hero ----
  let mouseTX = 0;
  let mouseTY = 0;
  let mouseX = 0;
  let mouseY = 0;

  if (heroScene && finePointer) {
    heroScene.addEventListener('pointermove', (e) => {
      mouseTX = e.clientX / window.innerWidth - 0.5;
      mouseTY = e.clientY / viewportH - 0.5;
    });
    heroScene.addEventListener('pointerleave', () => {
      mouseTX = 0;
      mouseTY = 0;
    });
  }

  // ---- Estado ----
  let currentStageIdx = -1;
  let lastHour = -1;
  let lastY = window.scrollY;
  let velocity = 0;
  let fabShown = false;
  let navScrolled = false;

  const loop = () => {
    const y = window.scrollY;

    velocity = velocity * 0.88 + (y - lastY) * 0.12;
    lastY = y;

    // -- Nav ganha hairline ao rolar --
    const shouldNavScroll = y > 8;
    if (nav && shouldNavScroll !== navScrolled) {
      navScrolled = shouldNavScroll;
      nav.classList.toggle('scrolled', shouldNavScroll);
    }

    // -- Trilho + hora simulada --
    const journey = clamp(y / ctaAnchor, 0, 1);
    const hour = Math.round(journey * 48);

    if (railFill) railFill.style.transform = `scaleX(${journey})`;

    if (hour !== lastHour) {
      lastHour = hour;
      if (deployHour) deployHour.textContent = `${String(hour).padStart(2, '0')}h`;
      if (deployPill) deployPill.classList.toggle('done', hour >= 48);
      railTicks.forEach((tick) => {
        tick.classList.toggle('passed', hour >= parseInt(tick.dataset.hour, 10));
      });
    }

    // -- Mensagem do estágio --
    if (deployMsg && buildStages.length) {
      let idx = 0;
      const probe = y + viewportH * 0.55;
      for (let i = 0; i < buildStages.length; i++) {
        if (buildStages[i].top <= probe) idx = i;
      }
      if (idx !== currentStageIdx) {
        currentStageIdx = idx;
        deployMsg.textContent = buildStages[idx].msg;
      }
    }

    // -- Cena do hero (modo scrolly) --
    if (heroScene && isScrolly) {
      const p = clamp((y - sceneTop) / sceneRange, 0, 1);

      let stage = 0;
      for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
        if (p >= STAGE_THRESHOLDS[i]) stage = i + 1;
      }
      setStage(stage);
      setUrlChars((p - 0.03) / 0.6);

      if (scrollHint) scrollHint.classList.toggle('hide', p > 0.04);

      // painel: entra inclinado e assenta conforme constrói + tilt de mouse
      mouseX += (mouseTX - mouseX) * 0.08;
      mouseY += (mouseTY - mouseY) * 0.08;
      if (heroPanel) {
        const settle = clamp(p * 2.4, 0, 1);
        const introRx = (1 - settle) * 7;
        const scale = 0.96 + settle * 0.04;
        heroPanel.style.transform =
          `rotateX(${(introRx - mouseY * 3).toFixed(2)}deg) rotateY(${(mouseX * 4).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      }
      if (heroHalo) {
        heroHalo.style.transform =
          `translate3d(${(mouseX * 30).toFixed(1)}px, ${(p * 60 + mouseY * 20).toFixed(1)}px, 0)`;
      }
    }

    // -- Timeline do "Como funciona" --
    if (stepsTrack) {
      const p = clamp((y + viewportH * 0.8 - stepsTop) / (stepsHeight * 0.9), 0, 1);
      stepsTrack.style.setProperty('--steps-progress', p.toFixed(4));
      const n = stepCards.length;
      stepCards.forEach((card, i) => {
        const threshold = n > 1 ? i / (n - 1) : 0;
        card.classList.toggle('lit', p >= threshold - 0.04 && p > 0.01);
      });
    }

    // -- Letreiro: base + empurrão do scroll, com leve skew --
    if (marqueeTrack && marqueeHalf > 0) {
      marqueeX -= 0.5 + clamp(velocity * 0.35, -5, 9);
      if (marqueeX <= -marqueeHalf) marqueeX += marqueeHalf;
      if (marqueeX > 0) marqueeX -= marqueeHalf;
      const skew = clamp(velocity * -0.1, -3.5, 3.5);
      marqueeTrack.style.transform = `translateX(${marqueeX.toFixed(2)}px) skewX(${skew.toFixed(2)}deg)`;
    }

    // -- FAB --
    if (whatsFab) {
      const shouldShow = y > viewportH * 1.2;
      if (shouldShow !== fabShown) {
        fabShown = shouldShow;
        whatsFab.classList.toggle('show', shouldShow);
      }
    }

    requestAnimationFrame(loop);
  };

  // ---- Inicialização ----
  measure();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', () => {
    measure();
    setTimeout(measure, 600);
  });

  if (deployPill) {
    setTimeout(() => deployPill.classList.add('on'), 700);
  }

  requestAnimationFrame(loop);
})();
