/* ============================================================
   CONSTELUTIONS — interactions
   starfield · live constellation · header · reveal · form
   ============================================================ */
(function () {
  "use strict";

  /* ---------- starfield ---------- */
  function buildStars(): void {
    document.querySelectorAll<HTMLElement>("[data-stars]").forEach(function (field) {
      if (field.dataset.built) return;
      field.dataset.built = "1";
      const n = parseInt(field.dataset.stars ?? "60", 10) || 60;
      let html = "";
      for (let i = 0; i < n; i++) {
        const size = Math.random() < 0.85 ? Math.random() * 1.4 + 0.6 : Math.random() * 1.6 + 1.8;
        const base = (Math.random() * 0.3 + 0.1).toFixed(2);
        const peak = (Math.random() * 0.4 + 0.5).toFixed(2);
        html +=
          '<span class="star" style="left:' +
          (Math.random() * 100).toFixed(2) +
          "%;top:" +
          (Math.random() * 100).toFixed(2) +
          "%;width:" +
          size.toFixed(1) +
          "px;height:" +
          size.toFixed(1) +
          "px;--base:" +
          base +
          ";--peak:" +
          peak +
          ";--dur:" +
          (Math.random() * 4 + 3).toFixed(1) +
          "s;--delay:" +
          (Math.random() * 5).toFixed(1) +
          's"></span>';
      }
      field.innerHTML = html;
    });
  }

  /* ---------- live constellation canvas ---------- */
  interface ConstellationNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    big: boolean;
  }

  function buildConstellation(): void {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-constellation]");
    if (!canvas || canvas.dataset.built) return;
    canvas.dataset.built = "1";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Both canvas and ctx are verified non-null above; closures below capture them safely.
    const safeCanvas = canvas as HTMLCanvasElement;
    const safeCtx = ctx as CanvasRenderingContext2D;

    let W = 0, H = 0, dpr = 1;
    let mx = -999, my = -999;
    const N = 36;
    const nodes: ConstellationNode[] = [];

    // Measured from the parent wrapper, never from the canvas itself: the
    // canvas's own width/height attributes (set below) must never be able to
    // feed back into the box size we read here, or a ResizeObserver on the
    // canvas can end up in a self-sustaining resize loop (observed in some
    // Chromium forks that don't fully ignore a canvas's intrinsic size once
    // CSS gives it an explicit width/height).
    const wrap = safeCanvas.parentElement ?? safeCanvas;
    function resize(): void {
      dpr = window.devicePixelRatio || 1;
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      safeCanvas.width = Math.max(1, W * dpr);
      safeCanvas.height = Math.max(1, H * dpr);
      safeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    for (let i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.6 + 1,
        big: Math.random() < 0.18,
      });
    }
    safeCanvas.addEventListener("mousemove", function (e: MouseEvent) {
      const r = safeCanvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    safeCanvas.addEventListener("mouseleave", function () {
      mx = -999;
      my = -999;
    });

    function isLight(): boolean {
      const t = document.documentElement.getAttribute("data-theme");
      if (t === "light") return true;
      if (t === "dark") return false;
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    }

    // Decorative background animation, so it is capped at ~30fps instead of
    // running at whatever the display refreshes at (often 60-120Hz) — that
    // roughly halves its ongoing script + paint cost.
    //
    // Motion below MUST be scaled by `step` rather than applied once per
    // frame. Every velocity here is expressed per frame, so a frame cap
    // silently doubles as a speed cap: capping 60fps -> 30fps halved the
    // drift AND halved the cursor attraction, and on a 120Hz display the
    // quantised interval lands nearer 24fps, making the speed depend on the
    // viewer's monitor. Scaling by elapsed time decouples the two, so the cap
    // saves the CPU without touching the apparent speed.
    // 2ms of slack, because a 30fps target falls exactly on every 2nd frame of
    // a 60Hz display: comparing ~33.333 against ~33.333 flips on float error,
    // so it painted every 2nd frame sometimes and every 3rd other times,
    // averaging 24fps with visible judder. The slack makes it every 2nd frame,
    // deterministically, and still lands near 30fps at 120/144Hz.
    const FRAME_INTERVAL = 1000 / 30 - 2;
    const REFERENCE_FRAME = 1000 / 60; // the rate the velocities were tuned at
    let lastFrameTime = 0;
    function frame(now: number): void {
      requestAnimationFrame(frame);

      // First callback: seed the clock instead of treating the whole
      // navigation-to-now span as one elapsed frame.
      if (lastFrameTime === 0) {
        lastFrameTime = now;
        return;
      }
      const elapsed = now - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = now;
      // Clamped: rAF is paused while the tab is backgrounded, so on return
      // `elapsed` can be many seconds and would teleport every node.
      const step = Math.min(elapsed, 100) / REFERENCE_FRAME;

      safeCtx.clearRect(0, 0, W, H);
      const light = isLight();
      for (let i = 0; i < N; i++) {
        const a = nodes[i];
        a.x += a.vx * step;
        a.y += a.vy * step;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const ddx = mx - a.x,
          ddy = my - a.y,
          dd = Math.hypot(ddx, ddy);
        if (dd < 140) {
          a.x += ddx * 0.002 * step;
          a.y += ddy * 0.002 * step;
        }
        for (let j = i + 1; j < N; j++) {
          const b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y,
            d = Math.hypot(dx, dy);
          if (d < 120) {
            const alpha = (light ? 0.75 : 0.42) * (1 - d / 120);
            const lineColor = light
              ? "oklch(0.35 0.14 266 / " + alpha.toFixed(3) + ")"
              : "oklch(0.66 0.16 266 / " + alpha.toFixed(3) + ")";
            safeCtx.strokeStyle = lineColor;
            safeCtx.lineWidth = light ? 1.5 : 1;
            safeCtx.beginPath();
            safeCtx.moveTo(a.x, a.y);
            safeCtx.lineTo(b.x, b.y);
            safeCtx.stroke();
          }
        }
      }
      for (let k = 0; k < N; k++) {
        const n = nodes[k];
        safeCtx.beginPath();
        safeCtx.arc(n.x, n.y, n.big ? n.r * 1.8 : n.r, 0, Math.PI * 2);
        safeCtx.fillStyle = n.big ? "oklch(0.8 0.11 228)" : "oklch(0.92 0.02 240 / 0.85)";
        if (n.big) {
          safeCtx.shadowColor = "oklch(0.8 0.11 228)";
          safeCtx.shadowBlur = 10;
        }
        safeCtx.fill();
        safeCtx.shadowBlur = 0;
      }
    }
    requestAnimationFrame(frame);
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(wrap);
    } else {
      window.addEventListener("resize", resize);
    }
  }

  /* ---------- header scroll state ---------- */
  function header(): void {
    const h = document.querySelector<HTMLElement>(".site-header");
    if (!h) return;
    const on = function () {
      h.classList.toggle("scrolled", window.scrollY > 12);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  function mobileNav(): void {
    const btn = document.querySelector<HTMLElement>(".nav-toggle");
    const links = document.querySelector<HTMLElement>(".nav-links");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function reveal(): void {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) {
        e.classList.add("in");
      });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  }

  /* ---------- theme toggle ---------- */
  function themeToggle(): void {
    document.querySelectorAll<HTMLElement>("[data-set-theme]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const theme = btn.getAttribute("data-set-theme");
        if (!theme) return;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("cl_theme", theme);
      });
    });
  }

  /* ---------- contact form ---------- */
  function contactForm(): void {
    const form = document.querySelector<HTMLFormElement>("form.card");
    if (!form) return;
    form.addEventListener("submit", function (e: Event) {
      e.preventDefault();
      const fields = form.querySelector<HTMLElement>(".form-fields");
      const ok = form.querySelector<HTMLElement>(".form-success");
      if (fields && ok) {
        fields.style.display = "none";
        ok.classList.add("show");
      }
    });
  }

  function init(): void {
    // buildConstellation() reads layout (getBoundingClientRect) to size its
    // canvas; running it before buildStars()'s DOM writes avoids forcing a
    // synchronous reflow (a write immediately followed by a geometry read).
    buildConstellation();
    buildStars();
    header();
    mobileNav();
    reveal();
    contactForm();
    themeToggle();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
