/* ============================================================
   CONSTELUTIONS — interactions
   starfield · live constellation · header · reveal · form
   ============================================================ */
(function () {
  "use strict";

  /* ---------- starfield ---------- */
  function buildStars() {
    document.querySelectorAll("[data-stars]").forEach(function (field) {
      if (field.dataset.built) return;
      field.dataset.built = "1";
      var n = parseInt(field.dataset.stars, 10) || 60;
      var html = "";
      for (var i = 0; i < n; i++) {
        var size = Math.random() < 0.85 ? Math.random() * 1.4 + 0.6 : Math.random() * 1.6 + 1.8;
        var base = (Math.random() * 0.3 + 0.1).toFixed(2);
        var peak = (Math.random() * 0.4 + 0.5).toFixed(2);
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
  function buildConstellation() {
    var canvas = document.querySelector("[data-constellation]");
    if (!canvas || canvas.dataset.built) return;
    canvas.dataset.built = "1";
    var ctx = canvas.getContext("2d");
    var W,
      H,
      dpr,
      mx = -999,
      my = -999;
    var N = 36;
    var nodes = [];

    function resize() {
      dpr = window.devicePixelRatio || 1;
      var r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    for (var i = 0; i < N; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.6 + 1,
        big: Math.random() < 0.18,
      });
    }
    canvas.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    canvas.addEventListener("mouseleave", function () {
      mx = -999;
      my = -999;
    });

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N; i++) {
        var a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        var ddx = mx - a.x,
          ddy = my - a.y,
          dd = Math.hypot(ddx, ddy);
        if (dd < 140) {
          a.x += ddx * 0.002;
          a.y += ddy * 0.002;
        }
        for (var j = i + 1; j < N; j++) {
          var b = nodes[j];
          var dx = a.x - b.x,
            dy = a.y - b.y,
            d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.strokeStyle = "oklch(0.66 0.16 266 / " + (0.42 * (1 - d / 120)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < N; k++) {
        var n = nodes[k];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.big ? n.r * 1.8 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.big ? "oklch(0.8 0.11 228)" : "oklch(0.92 0.02 240 / 0.85)";
        if (n.big) {
          ctx.shadowColor = "oklch(0.8 0.11 228)";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(frame);
    }
    frame();
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }
  }

  /* ---------- header scroll state ---------- */
  function header() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var on = function () {
      h.classList.toggle("scrolled", window.scrollY > 12);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  function mobileNav() {
    var btn = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
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
  function reveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) {
        e.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
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

  /* ---------- nav section highlight ---------- */
  function navHighlight() {
    var anchorLinks = document.querySelectorAll(".nav-links a[href^='/#']");
    var homeLink = document.querySelector(".nav-links a[href='/']");
    if (!("IntersectionObserver" in window)) return;

    var allNavLinks = document.querySelectorAll(".nav-links a");
    var sectionMap = {};
    anchorLinks.forEach(function (a) {
      var id = a.getAttribute("href").replace("/#", "");
      var el = document.getElementById(id);
      if (el) sectionMap[id] = a;
    });

    if (!Object.keys(sectionMap).length) return;

    var visible = {};
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.intersectionRatio;
        });
        var best = null,
          bestRatio = -1;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestRatio) {
            bestRatio = visible[id];
            best = id;
          }
        });
        allNavLinks.forEach(function (a) {
          a.classList.remove("active");
        });
        if (best && bestRatio > 0 && sectionMap[best]) {
          sectionMap[best].classList.add("active");
        } else if (homeLink) {
          homeLink.classList.add("active");
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    Object.keys(sectionMap).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
  }

  /* ---------- contact form ---------- */
  function contactForm() {
    var form = document.querySelector("form.card");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelector(".form-fields");
      var ok = form.querySelector(".form-success");
      if (fields && ok) {
        fields.style.display = "none";
        ok.classList.add("show");
      }
    });
  }

  function init() {
    buildStars();
    buildConstellation();
    header();
    mobileNav();
    reveal();
    navHighlight();
    contactForm();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
