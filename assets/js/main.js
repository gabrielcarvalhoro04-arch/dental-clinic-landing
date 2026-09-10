/* =====================================================================
   Clínica Bortolotto Odontologia — interações e animações
   Vanilla JS, sem dependências. Degrada com elegância:
   - sem JS, tudo aparece;
   - com "movimento reduzido", animações não essenciais são desligadas;
   - se algo falhar, um failsafe garante que todo o conteúdo fique visível.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = reduceMotion.matches;

  var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

  // .hidden (IDL) não existe em SVGElement — usar o atributo diretamente
  function toggleHidden(el, on) { if (el) el.toggleAttribute("hidden", !!on); }

  /* ----------------------------------------------------------------
     1. Cabeçalho: estado "rolado"
  ---------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var isScrolled = false;
  function updateHeader() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var next = y > 24;
    if (next !== isScrolled) {
      isScrolled = next;
      header.classList.toggle("is-scrolled", isScrolled);
    }
  }

  /* ----------------------------------------------------------------
     1b. Alternador de tema (escuro / marfim) — persiste em localStorage
  ---------------------------------------------------------------- */
  (function themeToggle() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    function current() {
      return root.getAttribute("data-theme") === "light" ? "light" : "dark";
    }
    function apply(theme, persist) {
      if (theme === "light") root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
      btn.setAttribute("aria-pressed", String(theme === "light"));
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme === "light" ? "#f4efe2" : "#0b0b0d");
      if (persist) { try { localStorage.setItem("theme", theme); } catch (e) {} }
    }
    apply(current(), false);
    btn.addEventListener("click", function () {
      apply(current() === "light" ? "dark" : "light", true);
    });
    // segue a preferência do sistema enquanto o usuário não escolher manualmente
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onMq = function (e) {
      var saved;
      try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (!saved) apply(e.matches ? "light" : "dark");
    };
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(onMq);
  })();

  /* ----------------------------------------------------------------
     2. Menu mobile
  ---------------------------------------------------------------- */
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.querySelector(".nav");
  var scrim = document.querySelector(".nav-scrim");

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggleHidden(toggle.querySelector(".icon-open"), open);
    toggleHidden(toggle.querySelector(".icon-close"), !open);
    if (open) {
      var first = nav.querySelector("a, button");
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav && nav.classList.contains("is-open")) {
      setMenu(false);
      if (toggle) toggle.focus();
    }
  });

  document.querySelectorAll('.nav a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  var desktopMQ = window.matchMedia("(min-width: 861px)");
  (desktopMQ.addEventListener ? desktopMQ.addEventListener.bind(desktopMQ, "change") : desktopMQ.addListener.bind(desktopMQ))(function (ev) {
    if (ev.matches) setMenu(false);
  });

  /* ----------------------------------------------------------------
     3. Rolagem suave com compensação do cabeçalho
  ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + (window.pageYOffset || 0) - headerH - 12;
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ----------------------------------------------------------------
     4. Navegação: destaca a seção visível
  ---------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          if (l.getAttribute("href") === "#" + entry.target.id) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ----------------------------------------------------------------
     5. Mídia do hero e fotos: mostra quando estiver pronta
  ---------------------------------------------------------------- */
  function markReady(el) { el.classList.add("is-ready"); }

  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    if (prefersReduced) {
      heroVideo.removeAttribute("autoplay");
      try { heroVideo.pause(); } catch (e) {}
    } else {
      var tryPlay = function () {
        heroVideo.muted = true;               // pré-requisito para autoplay
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () {});
      };
      heroVideo.addEventListener("loadeddata", tryPlay);
      heroVideo.addEventListener("canplay", tryPlay);
      tryPlay();
      // alguns navegadores só liberam autoplay após o 1º gesto/rolagem — tenta de novo
      var kick = function () { tryPlay(); };
      window.addEventListener("pointerdown", kick, { once: true, passive: true });
      window.addEventListener("scroll", kick, { once: true, passive: true });
      window.addEventListener("touchstart", kick, { once: true, passive: true });
    }
    heroVideo.addEventListener("error", function () { heroVideo.classList.add("is-error"); });
  }

  document.querySelectorAll(".hero__img, .split__media img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) markReady(img);
    img.addEventListener("load", function () { markReady(img); });
    img.addEventListener("error", function () { img.remove(); });
  });

  /* ----------------------------------------------------------------
     6. Revelação ao rolar (IntersectionObserver + classe CSS)
  ---------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function revealAll() { revealEls.forEach(function (el) { el.classList.add("is-in"); }); }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    // pequeno atraso escalonado entre irmãos que entram juntos
    var groupTimers = new WeakMap();
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var siblings = parent ? Array.prototype.filter.call(parent.children, function (c) { return c.hasAttribute("data-reveal"); }) : [el];
        var i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
        el.classList.add("is-in");
        obs.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* Divisória de seção que "desenha" ao entrar */
  var hairlineSections = Array.prototype.slice.call(document.querySelectorAll(".section--hairline"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    hairlineSections.forEach(function (s) { s.classList.add("rule-in"); });
  } else {
    var lineObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("rule-in");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
    hairlineSections.forEach(function (s) { lineObs.observe(s); });
  }

  /* ----------------------------------------------------------------
     7. Contadores de números
  ---------------------------------------------------------------- */
  function formatNumber(value, decimals) {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;
    if (prefersReduced) { el.textContent = formatNumber(target, decimals); return; }

    var duration = 1500;
    var startTime = null;
    var done = false;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (p < 1) raf(step); else done = true;
    }
    raf(step);
    // failsafe: se o rAF não avançar, garante o valor final
    setTimeout(function () { if (!done) el.textContent = formatNumber(target, decimals); }, duration + 900);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cObs.observe(c); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ----------------------------------------------------------------
     8. Parallax leve do hero (rAF, só quando permitido)
  ---------------------------------------------------------------- */
  if (!prefersReduced) {
    var media = document.querySelector(".hero__media");
    var heroContent = document.querySelector(".hero__content");
    var hero = document.querySelector(".hero");
    var ticking = false;

    function applyParallax() {
      ticking = false;
      if (!hero) return;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // fora da tela
      var y = window.pageYOffset || 0;
      var vh = window.innerHeight || 1;
      var progress = Math.min(Math.max(y / vh, 0), 1);
      if (media) media.style.transform = "translate3d(0," + (progress * 60) + "px,0)";
      if (heroContent) {
        heroContent.style.transform = "translate3d(0," + (progress * -34) + "px,0)";
        heroContent.style.opacity = String(1 - progress * 0.6);
      }
    }
    function onScrollParallax() {
      if (!ticking) { ticking = true; raf(applyParallax); }
    }
    // só ativa parallax em telas maiores (evita custo em mobile modesto)
    if (window.matchMedia("(min-width: 700px)").matches) {
      window.addEventListener("scroll", onScrollParallax, { passive: true });
      window.addEventListener("resize", onScrollParallax, { passive: true });
      applyParallax();
    }
  }

  /* ----------------------------------------------------------------
     9. Carrossel de depoimentos (acessível)
  ---------------------------------------------------------------- */
  (function slider() {
    var el = document.querySelector("[data-slider]");
    if (!el) return;

    var track = el.querySelector(".slider__track");
    var slides = Array.prototype.slice.call(el.querySelectorAll(".slide"));
    var prevBtn = el.querySelector("[data-slider-prev]");
    var nextBtn = el.querySelector("[data-slider-next]");
    var pauseBtn = el.querySelector("[data-slider-pause]");
    var curEl = el.querySelector("[data-slider-cur]");
    var live = el.querySelector("[data-slider-live]");
    var total = slides.length;
    var index = 0;
    var timer = null;
    var playing = !prefersReduced && total > 1;
    var DELAY = 7000;

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, i) {
        s.setAttribute("aria-hidden", String(i !== index));
        s.querySelectorAll("a, button").forEach(function (f) {
          if (i === index) f.removeAttribute("tabindex");
          else f.setAttribute("tabindex", "-1");
        });
      });
      if (curEl) curEl.textContent = pad(index + 1);
      if (live) live.textContent = "Depoimento " + (index + 1) + " de " + total;
    }

    function go(i, userAction) {
      index = (i + total) % total;
      render();
      if (userAction) restart();
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() { if (!playing) return; stop(); timer = window.setInterval(next, DELAY); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { if (playing) start(); }

    function setPlaying(state) {
      playing = state;
      if (pauseBtn) {
        pauseBtn.setAttribute("aria-pressed", String(!state));
        var lab = pauseBtn.querySelector(".label");
        if (lab) lab.textContent = state ? "Pausar apresentação" : "Reproduzir apresentação";
        toggleHidden(pauseBtn.querySelector(".icon-pause"), !state);
        toggleHidden(pauseBtn.querySelector(".icon-play"), state);
      }
      if (state) start(); else stop();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    if (pauseBtn) pauseBtn.addEventListener("click", function () { setPlaying(!playing); });

    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", restart);
    el.addEventListener("focusin", stop);
    el.addEventListener("focusout", restart);

    el.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); restart(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); restart(); }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else restart();
    });

    render();
    setPlaying(playing);
  })();

  /* ----------------------------------------------------------------
     9b. Lightbox de vídeo (thumbnail -> modal acessível)
  ---------------------------------------------------------------- */
  (function videoDialog() {
    var modal = document.querySelector("[data-video-modal]");
    if (!modal) return;

    var stage = modal.querySelector("[data-video-stage]");
    var closeBtn = modal.querySelector("[data-video-close]");
    var dialog = modal.querySelector(".video-modal__dialog");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-video-dialog]"));
    if (!triggers.length) return;

    var lastFocused = null;
    var isOpen = false;

    function isEmbed(src) {
      return /youtube\.com|youtu\.be|vimeo\.com|player\.|\/embed\//i.test(src);
    }

    function buildPlayer(src, title) {
      stage.textContent = "";
      var node;
      if (isEmbed(src)) {
        node = document.createElement("iframe");
        node.src = src;
        node.title = title || "Vídeo";
        node.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        node.setAttribute("allowfullscreen", "");
        node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      } else {
        node = document.createElement("video");
        node.src = src;
        node.controls = true;
        node.playsInline = true;
        node.setAttribute("playsinline", "");
        if (!prefersReduced) {
          node.autoplay = true;
          node.addEventListener("loadeddata", function () {
            var p = node.play();
            if (p && p.catch) p.catch(function () {});
          });
        }
      }
      stage.appendChild(node);
      return node;
    }

    function onKeydown(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = dialog.querySelectorAll('button, video, iframe, a[href], [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open(trigger) {
      if (isOpen) return;
      var src = trigger.getAttribute("data-video-src");
      if (!src) return;
      lastFocused = trigger;
      buildPlayer(src, trigger.getAttribute("aria-label"));
      modal.hidden = false;
      document.body.classList.add("modal-open");
      // força reflow para a transição valer
      void modal.offsetWidth;
      modal.classList.add("is-open");
      isOpen = true;
      document.addEventListener("keydown", onKeydown, true);
      closeBtn.focus();
    }

    function finalizeClose() {
      modal.hidden = true;
      stage.textContent = "";
      modal.removeEventListener("transitionend", onEnd);
    }
    function onEnd(e) {
      if (e.target === modal || e.target === dialog) finalizeClose();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeydown, true);
      // pausa imediata do vídeo local (o som não pode continuar durante o fade)
      var v = stage.querySelector("video");
      if (v) { try { v.pause(); } catch (e) {} }
      if (prefersReduced) { finalizeClose(); }
      else {
        modal.addEventListener("transitionend", onEnd);
        window.setTimeout(finalizeClose, 500); // failsafe se transitionend não disparar
      }
      if (lastFocused) { try { lastFocused.focus({ preventScroll: true }); } catch (e) {} }
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function () { open(t); });
    });
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close(); // clique fora do dialog
    });
  })();

  /* ----------------------------------------------------------------
     9c. Jornada — sticky scroll reveal (vanilla, sem dependências)
     O texto rola normalmente; o painel fixo à direita troca de
     conteúdo conforme o passo visível. Sem JS ou com "movimento
     reduzido", todos os passos ficam visíveis (o painel some).
  ---------------------------------------------------------------- */
  (function journey() {
    var wrap = document.querySelector("[data-journey]");
    if (!wrap) return;

    var steps = Array.prototype.slice.call(wrap.querySelectorAll("[data-journey-step]"));
    var panels = Array.prototype.slice.call(wrap.querySelectorAll("[data-journey-panel]"));
    if (!steps.length) return;

    function activate(idx) {
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      panels.forEach(function (p, i) { p.classList.toggle("is-active", i === idx); });
    }

    if (prefersReduced || !("IntersectionObserver" in window)) {
      steps.forEach(function (s) { s.classList.add("is-active"); });
      if (panels[0]) panels[0].classList.add("is-active");
      return;
    }

    var current = -1;
    var jObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = parseInt(entry.target.getAttribute("data-journey-step"), 10) || 0;
        if (idx !== current) { current = idx; activate(idx); }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    steps.forEach(function (s) { jObs.observe(s); });
    activate(0);
  })();

  /* ----------------------------------------------------------------
     9c. Partículas de luz dourada na seção de agendamento
  ---------------------------------------------------------------- */
  (function ctaGlow() {
    var host = document.querySelector("[data-glow]");
    if (!host || prefersReduced) return;
    var count = window.matchMedia("(max-width: 640px)").matches ? 10 : 16;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var d = document.createElement("span");
      d.className = "glow-dot";
      d.style.left = (Math.random() * 100).toFixed(2) + "%";
      d.style.setProperty("--sz", (2 + Math.random() * 4).toFixed(1) + "px");
      d.style.setProperty("--dur", (10 + Math.random() * 11).toFixed(1) + "s");
      d.style.setProperty("--delay", (-Math.random() * 16).toFixed(1) + "s");
      d.style.setProperty("--rise", (-(120 + Math.random() * 170)).toFixed(0) + "px");
      d.style.setProperty("--drift", ((Math.random() * 2 - 1) * 26).toFixed(0) + "px");
      d.style.setProperty("--op", (0.22 + Math.random() * 0.4).toFixed(2));
      frag.appendChild(d);
    }
    host.appendChild(frag);
  })();

  /* ----------------------------------------------------------------
     10. Ano no rodapé
  ---------------------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------
     11. Scroll listener + failsafe de visibilidade
  ---------------------------------------------------------------- */
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  window.addEventListener("load", function () {
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(function (el) { el.classList.add("is-in"); });
      document.querySelectorAll(".section--hairline:not(.rule-in)").forEach(function (el) { el.classList.add("rule-in"); });
    }, 2600);
  });

  // Reage a mudança na preferência de movimento
  var mmHandler = function () { if (reduceMotion.matches) revealAll(); };
  (reduceMotion.addEventListener ? reduceMotion.addEventListener.bind(reduceMotion, "change") : reduceMotion.addListener.bind(reduceMotion))(mmHandler);
})();
