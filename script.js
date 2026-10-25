(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- theme ---------- */
  const themeBtn = $("#theme");
  const root = document.documentElement;
  const applyTheme = (t) => {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    themeBtn.textContent = t === "dark" ? "☀" : "☾";
  };
  let saved = null;
  try { saved = localStorage.getItem("kwiz-theme"); } catch (e) {}
  applyTheme(saved || "light");
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("kwiz-theme", next); } catch (e) {}
  });

  /* ---------- typing rotator ---------- */
  const words = [
    "UI/UX designer",
    "web & app developer",
    "social media storyteller",
    "pastel enthusiast",
    "thesis survivor",
  ];
  const typed = $("#typed");
  let wi = 0, ci = 0, deleting = false;
  function type() {
    const word = words[wi];
    typed.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 85); }
    else if (!deleting) { deleting = true; setTimeout(type, 1500); }
    else if (ci > 0) { ci--; setTimeout(type, 45); }
    else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 350); }
  }
  if (reduce) typed.textContent = words[0]; else type();

  /* ---------- scroll progress + active nav ---------- */
  const progress = $("#progress");
  const links = $$(".nav nav a");
  const sections = links.map((a) => $(a.getAttribute("href")));
  function onScroll() {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + "%";
    let current = -1;
    sections.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i;
    });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal + counters ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count;
    let n = 0;
    const tick = () => {
      n += 1;
      el.textContent = n;
      if (n < target) setTimeout(tick, 220);
    };
    tick();
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- cursor glow + sparkle trail ---------- */
  const glow = $("#glow");
  const sparkChars = ["✿", "✦", "♡", "✧", "❀"];
  let lastSpark = 0;
  function spawnSpark(x, y, burst = false) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = sparkChars[Math.floor(Math.random() * sparkChars.length)];
    const spread = burst ? 90 : 28;
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--dx", (Math.random() - 0.5) * spread * 2 + "px");
    s.style.setProperty("--dy", (Math.random() * spread + (burst ? -40 : 10)) + "px");
    s.style.setProperty("--r", (Math.random() - 0.5) * 360 + "deg");
    s.style.color = Math.random() > 0.5 ? "#ff8fc7" : "#b99cf5";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
  if (finePointer && !reduce) {
    window.addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      const now = performance.now();
      if (now - lastSpark > 55) { lastSpark = now; spawnSpark(e.clientX, e.clientY); }
    });
  }
  if (!reduce) {
    window.addEventListener("click", (e) => {
      for (let i = 0; i < 10; i++) spawnSpark(e.clientX, e.clientY, true);
    });
  }

  /* ---------- 3D tilt on project cards ---------- */
  if (finePointer && !reduce) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- draggable stickers ---------- */
  $$("[data-drag]").forEach((el) => {
    let sx, sy, ox, oy, dragging = false;
    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      const parent = el.offsetParent.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      // switch from right/bottom anchoring to fixed left/top so it can move freely
      el.style.left = r.left - parent.left + "px";
      el.style.top = r.top - parent.top + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.left); oy = parseFloat(el.style.top);
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      el.style.left = ox + (e.clientX - sx) + "px";
      el.style.top = oy + (e.clientY - sy) + "px";
    });
    const end = () => { dragging = false; };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  });

  /* ---------- placeholder links ---------- */
  $$("[data-todo]").forEach((a) => {
    if (a.getAttribute("href") === "#") a.addEventListener("click", (e) => e.preventDefault());
  });

  /* ---------- footer ---------- */
  $("#year").textContent = new Date().getFullYear();
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
})();
