(() => {
  "use strict";
  window.__kwizOK = true;

  /* ---------- helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, has: false };

  /* ---------- toasts + achievements (the gamer side) ---------- */
  const toasts = $("#toasts");
  function toast(icon, title, sub) {
    if (!toasts) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="t-ic"></span><div><b></b><span></span></div>';
    $(".t-ic", t).textContent = icon;
    $("b", t).textContent = title;
    $("div > span", t).textContent = sub || "";
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.firstChild.remove();
    setTimeout(() => t.classList.add("out"), 4200);
    setTimeout(() => t.remove(), 4800);
  }
  const ACH = [
    { id: "quack", ic: "🦆", name: "First quack", desc: "poke the rubber duck" },
    { id: "throw", ic: "🎯", name: "Sticker thrower", desc: "fling a sticker across the hero" },
    { id: "hacker", ic: "💻", name: "Hacker girl", desc: "run a command in the terminal" },
    { id: "owl", ic: "🌙", name: "Night owl", desc: "switch on night mode" },
    { id: "holo", ic: "✨", name: "Holo hunter", desc: "tilt the GWB card" },
    { id: "rain", ic: "🌸", name: "Flower rain", desc: "click the name 5 times" },
    { id: "explorer", ic: "🧭", name: "Explorer", desc: "reach the contact section" },
    { id: "peel", ic: "🍓", name: "Sticker peeler", desc: "click a skill sticker" },
    { id: "player1", ic: "🎮", name: "Player 1 ready", desc: "enter pixel mode (try the Konami code)" },
  ];
  let got = {};
  try { got = JSON.parse(sessionStorage.getItem("kwiz-ach") || "{}"); } catch (e) {}
  const achList = $("#achList");
  function renderAch() {
    if (!achList) return;
    achList.innerHTML = "";
    ACH.forEach((a) => {
      const li = document.createElement("li");
      li.className = got[a.id] ? "got" : "";
      li.innerHTML = '<span class="ach-ic"></span><div><b></b><small></small></div>';
      $(".ach-ic", li).textContent = got[a.id] ? a.ic : "🔒";
      $("b", li).textContent = got[a.id] ? a.name : "???";
      $("small", li).textContent = a.desc;
      achList.appendChild(li);
    });
    const n = Object.keys(got).length;
    $("#achCount").textContent = n;
    $("#achTotal").textContent = ACH.length;
  }
  function unlock(id) {
    if (got[id]) return;
    const a = ACH.find((x) => x.id === id);
    if (!a) return;
    got[id] = 1;
    try { sessionStorage.setItem("kwiz-ach", JSON.stringify(got)); } catch (e) {}
    renderAch();
    toast(a.ic, "achievement unlocked", a.name);
    const tr = $(".trophy");
    if (tr) { tr.classList.remove("pop"); void tr.offsetWidth; tr.classList.add("pop"); }
    if (Object.keys(got).length === ACH.length) setTimeout(() => toast("👑", "all achievements!", "you found everything ✿"), 900);
  }
  renderAch();
  const hud = $("#hud"), hudBtn = $("#hudBtn");
  if (hud && hudBtn) {
    hudBtn.addEventListener("click", () => {
      const open = hud.classList.toggle("open");
      hudBtn.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", (e) => {
      if (hud.classList.contains("open") && !e.target.closest("#hud")) { hud.classList.remove("open"); hudBtn.setAttribute("aria-expanded", false); }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { hud.classList.remove("open"); hudBtn.setAttribute("aria-expanded", false); }
    });
  }

  /* ---------- pixel mode (konami code or `gamer` in the terminal) ---------- */
  function setPixel(on) {
    root.classList.toggle("pixel", on);
    if (on) { unlock("player1"); toast("🎮", "pixel mode ON", "player 1 ready · press START"); }
    else toast("🌸", "pixel mode off", "back to pastel");
    return on;
  }
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.tagName === "INPUT") return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === konami[kpos] ? kpos + 1 : k === konami[0] ? 1 : 0;
    if (kpos === konami.length) { kpos = 0; setPixel(!root.classList.contains("pixel")); }
  });

  /* ---------- theme ---------- */
  const themeBtn = $("#theme");
  function applyTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    themeBtn.textContent = t === "dark" ? "☀" : "☾";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === "dark" ? "#1a1029" : "#fff3f8";
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("kwiz-theme"); } catch (e) {}
  applyTheme(savedTheme || "light");
  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    if (next === "dark") unlock("owl");
    try { localStorage.setItem("kwiz-theme", next); } catch (e) {}
  });

  /* ---------- boot intro ---------- */
  const ready = () => root.classList.add("ready");
  function boot() {
    let seen = false;
    try { seen = sessionStorage.getItem("kwiz-boot") === "1"; } catch (e) {}
    if (seen || reduce) { ready(); return; }
    const el = document.createElement("div");
    el.className = "boot";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="boot-win"><div class="win-bar"><i></i><i></i><i></i><span>kwiz.exe</span></div>' +
      '<div class="boot-body"><svg class="boot-duck" viewBox="0 0 130 110"><use href="#s-duck"/></svg>' +
      '<p class="boot-line" id="bootTxt">booting kwiz ✿</p>' +
      '<div class="boot-bar"><b id="bootFill"></b></div><small id="bootPct">0%</small></div></div>';
    document.body.appendChild(el);
    root.classList.add("booting");
    const fill = $("#bootFill"), pct = $("#bootPct"), txt = $("#bootTxt");
    const lines = ["booting kwiz ✿", "loading pastel palette…", "feeding the rubber duck…", "almost there ✿"];
    let p = 0, done = false;
    const iv = setInterval(() => {
      p = Math.min(100, p + 4 + Math.random() * 9);
      fill.style.width = p + "%";
      pct.textContent = Math.floor(p) + "%";
      txt.textContent = lines[Math.min(3, Math.floor(p / 26))];
      if (p >= 100) finish();
    }, 90);
    function finish() {
      if (done) return;
      done = true;
      clearInterval(iv);
      fill.style.width = "100%";
      pct.textContent = "100%";
      setTimeout(() => {
        el.classList.add("out");
        root.classList.remove("booting");
        ready();
        try { sessionStorage.setItem("kwiz-boot", "1"); } catch (e) {}
        setTimeout(() => el.remove(), 950);
      }, 250);
    }
    el.addEventListener("click", finish);
  }
  boot();

  /* ---------- typing rotator ---------- */
  const words = ["UI/UX designer", "web & app developer", "data girlie", "gamer at heart", "pastel enthusiast", "thesis survivor"];
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

  /* ---------- hero name: letters react to the cursor ---------- */
  const nameWord = $("#nameWord");
  const letters = [];
  if (nameWord) {
    const txt = nameWord.textContent.trim();
    nameWord.textContent = "";
    nameWord.setAttribute("aria-label", txt);
    [...txt].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--k", i);
      s.textContent = c;
      s.setAttribute("aria-hidden", "true");
      nameWord.appendChild(s);
      letters.push(s);
    });
  }
  let nameClicks = 0, nameTimer;
  nameWord && nameWord.addEventListener("click", (e) => {
    nameClicks++;
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => (nameClicks = 0), 1800);
    letters.forEach((l, i) => {
      l.animate([{ translate: "0 0" }, { translate: "0 -26px", rotate: "-8deg" }, { translate: "0 0" }], { duration: 500, delay: i * 60, easing: "ease-out" });
    });
    if (nameClicks >= 5) { nameClicks = 0; petals(); say("flower rain! ✿✿✿"); }
  });
  function petals() {
    unlock("rain");
    const chars = ["✿", "❀", "🌸", "💗", "🍓", "🎀", "🍵", "✦"];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = chars[i % chars.length];
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDelay = Math.random() * 1.2 + "s";
      p.style.setProperty("--sx", (Math.random() - 0.5) * 160 + "px");
      p.style.setProperty("--r", (Math.random() - 0.5) * 900 + "deg");
      p.style.color = Math.random() > 0.5 ? "#ff8fc7" : "#b99cf5";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 5200);
    }
  }

  /* ---------- nav: sliding pill, burger, progress ---------- */
  const nav = $("#nav");
  const navLinks = $$("#navLinks a");
  const pill = $("#navLinks .pill");
  const secs = navLinks.map((a) => $(a.getAttribute("href")));
  const progressEl = $("#progress");
  let activeIdx = -1;
  function movePill() {
    if (!pill) return;
    const a = navLinks[activeIdx];
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    navLinks.forEach((a, k) => a.classList.toggle("active", k === i));
    movePill();
  }
  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  navLinks.forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));
  addEventListener("resize", movePill);

  /* ---------- journey path ---------- */
  const path = $("#path");
  const stops = $$(".stop");
  function updateJourney() {
    if (!path) return;
    const r = path.getBoundingClientRect();
    path.style.setProperty("--p", clamp((innerHeight * 0.62 - r.top) / r.height, 0, 1).toFixed(3));
    stops.forEach((s) => s.classList.toggle("on", s.getBoundingClientRect().top < innerHeight * 0.72));
  }

  const xpFill = $("#xpFill"), xpTxt = $("#xpTxt");
  let questDone = false;
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    const pct = max > 0 ? clamp((scrollY / max) * 100, 0, 100) : 0;
    progressEl.style.width = pct + "%";
    if (xpFill) {
      xpFill.style.width = pct + "%";
      xpTxt.textContent = pct >= 99 ? "MAX" : Math.floor(pct) + "%";
      if (pct >= 99 && !questDone) { questDone = true; toast("🏁", "quest complete", "you scrolled the whole portfolio ✿"); }
    }
    let cur = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) cur = i; });
    setActive(cur);
    updateJourney();
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- custom cursor + sparkles ---------- */
  let dot, ring, label, rx = mouse.x, ry = mouse.y;
  if (fine && !reduce) {
    dot = Object.assign(document.createElement("div"), { className: "cur-dot" });
    ring = Object.assign(document.createElement("div"), { className: "cur-ring" });
    label = Object.assign(document.createElement("div"), { className: "cur-label" });
    document.body.append(dot, ring, label);
    root.classList.add("has-cursor");
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest && e.target.closest("[data-cursor],a,button,[data-drag],input");
      ring.classList.toggle("hover", !!t);
      const txt = t ? t.dataset.cursor || (t.hasAttribute("data-drag") ? "drag me" : "") : "";
      label.textContent = txt;
      label.style.opacity = txt ? 1 : 0;
    });
    document.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget) { dot.style.opacity = ring.style.opacity = label.style.opacity = 0; }
    });
  }
  const sparkChars = ["✿", "✦", "♡", "✧", "❀", "🍓", "🎀"];
  let lastSpark = 0;
  function spawnSpark(x, y, burst) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = sparkChars[Math.floor(Math.random() * sparkChars.length)];
    const spread = burst ? 90 : 28;
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--dx", (Math.random() - 0.5) * spread * 2 + "px");
    s.style.setProperty("--dy", Math.random() * spread + (burst ? -40 : 10) + "px");
    s.style.setProperty("--r", (Math.random() - 0.5) * 360 + "deg");
    s.style.color = Math.random() > 0.5 ? "#ff8fc7" : "#b99cf5";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
  if (fine && !reduce) {
    addEventListener("mousemove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true;
      dot.style.opacity = 1; ring.style.opacity = 1;
      dot.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      label.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      const now = performance.now();
      if (now - lastSpark > 70) { lastSpark = now; spawnSpark(e.clientX, e.clientY, false); }
    });
  }
  if (!reduce) addEventListener("click", (e) => { for (let i = 0; i < 9; i++) spawnSpark(e.clientX, e.clientY, true); });

  /* ---------- tilt + holo (hero card, project windows) ---------- */
  function tilt(el, max, onFirst) {
    let fired = false;
    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      if (!fired && onFirst) { fired = true; onFirst(); }
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      el.classList.add("is-tilt");
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.classList.remove("is-tilt");
    });
  }
  if (!reduce) {
    const holo = $("#holo");
    if (holo) tilt(holo, 14, () => unlock("holo"));
    $$(".win").forEach((w) => tilt(w, 7));
    const idc = $("#idcard");
    if (idc) tilt(idc, 6);
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = "translate(" + (e.clientX - (r.left + r.width / 2)) * 0.25 + "px," + (e.clientY - (r.top + r.height / 2)) * 0.35 + "px)";
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- skill stickers: click = bounce + sparkles ---------- */
  $$(".chips").forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--k", i)));
  $$(".chips span").forEach((c) => {
    c.addEventListener("click", (e) => {
      unlock("peel");
      c.classList.remove("bounce");
      void c.offsetWidth;
      c.classList.add("bounce");
      for (let i = 0; i < 6; i++) spawnSpark(e.clientX, e.clientY, true);
    });
  });

  /* ---------- "what I built" accordions ---------- */
  $$(".win .more").forEach((b) => {
    b.addEventListener("click", () => {
      const w = b.closest(".win");
      const open = w.classList.toggle("open");
      b.setAttribute("aria-expanded", open);
    });
  });

  /* ---------- draggable + throwable stickers ---------- */
  const zone = $("#stickers");
  const stickers = $$("[data-drag]");
  const mqM = matchMedia("(max-width: 760px)");
  let topZ = 10;
  function initPos(el) {
    const s = mqM.matches && el.dataset.m ? el.dataset.m : el.dataset.d;
    const [fx, fy] = s.split(",").map(parseFloat);
    el._f = [fx, fy];
    el._r = parseFloat(el.dataset.r || 0);
    el.style.rotate = el._r + "deg";
  }
  function applyPx(el) {
    const mx = Math.max(0, zone.clientWidth - el.offsetWidth);
    const my = Math.max(0, zone.clientHeight - el.offsetHeight);
    el.style.left = el._f[0] * mx + "px";
    el.style.top = el._f[1] * my + "px";
  }
  function layoutAll(init) {
    stickers.forEach((el) => { if (init) initPos(el); applyPx(el); });
  }
  layoutAll(true);
  addEventListener("resize", () => layoutAll(false));
  mqM.addEventListener && mqM.addEventListener("change", () => layoutAll(true));
  addEventListener("load", () => layoutAll(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layoutAll(false));

  stickers.forEach((el) => {
    let sx, sy, bx, by, lx, ly, lt, vx = 0, vy = 0, raf = null, dragging = false;
    const place = (x, y) => {
      const mx = Math.max(0, zone.clientWidth - el.offsetWidth);
      const my = Math.max(0, zone.clientHeight - el.offsetHeight);
      x = clamp(x, 0, mx); y = clamp(y, 0, my);
      el.style.left = x + "px"; el.style.top = y + "px";
      el._f = [mx ? x / mx : 0, my ? y / my : 0];
      return [x, y, mx, my];
    };
    el.addEventListener("pointerdown", (e) => {
      cancelAnimationFrame(raf);
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
      el.style.zIndex = ++topZ;
      sx = e.clientX; sy = e.clientY;
      bx = el.offsetLeft; by = el.offsetTop;
      lx = e.clientX; ly = e.clientY; lt = performance.now();
      vx = 0; vy = 0;
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      place(bx + (e.clientX - sx), by + (e.clientY - sy));
      const now = performance.now();
      const dt = Math.max(now - lt, 1);
      vx = vx * 0.6 + ((e.clientX - lx) / dt) * 16 * 0.4;
      vy = vy * 0.6 + ((e.clientY - ly) / dt) * 16 * 0.4;
      lx = e.clientX; ly = e.clientY; lt = now;
      if (!reduce) el.style.rotate = el._r + clamp(vx * 1.2, -18, 18) + "deg";
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      el.style.rotate = el._r + "deg";
      if (Math.hypot(vx, vy) > 9) unlock("throw");
      if (reduce) return;
      const step = () => {
        let [x, y, mx, my] = [el.offsetLeft + vx, el.offsetTop + vy, 0, 0];
        mx = Math.max(0, zone.clientWidth - el.offsetWidth);
        my = Math.max(0, zone.clientHeight - el.offsetHeight);
        if (x < 0) { x = 0; vx *= -0.6; }
        if (x > mx) { x = mx; vx *= -0.6; }
        if (y < 0) { y = 0; vy *= -0.6; }
        if (y > my) { y = my; vy *= -0.6; }
        place(x, y);
        vx *= 0.94; vy *= 0.94;
        if (Math.abs(vx) + Math.abs(vy) > 0.4) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  });

  /* ---------- marquee bands (speed follows scroll) ---------- */
  const bands = $$(".band").map((el) => ({ el, track: $(".track", el), dir: +el.dataset.dir, x: 0, w: 0 }));
  function setupBands() {
    bands.forEach((b) => {
      if (!b.base) b.base = [...b.track.children];
      $$(".clone", b.track).forEach((c) => c.remove());
      b.w = b.track.scrollWidth;
      const need = Math.ceil((b.el.clientWidth * 2.2) / Math.max(b.w, 1));
      for (let i = 0; i < need; i++) b.base.forEach((n) => { const c = n.cloneNode(true); c.classList.add("clone"); b.track.appendChild(c); });
      b.x = b.dir < 0 ? 0 : -b.w;
    });
  }
  setupBands();
  addEventListener("resize", setupBands);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupBands);

  /* ---------- background doodles parallax ---------- */
  const doodles = $$(".doodles span").map((el) => ({ el, d: parseFloat(el.dataset.depth), x: 0, y: 0 }));

  /* ---------- rubber duck companion ---------- */
  const duck = $("#duck"), duckBody = $("#duckBody"), duckFlip = $("#duckFlip"), bubble = $("#duckBubble");
  let dx = 24, ddir = 1, walking = false, bubbleT;
  function say(text, ms) {
    bubble.textContent = text;
    bubble.classList.add("show");
    clearTimeout(bubbleT);
    bubbleT = setTimeout(() => bubble.classList.remove("show"), ms || 4200);
  }
  let audio;
  function quack() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      const o = audio.createOscillator(), g = audio.createGain(), f = audio.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(430, t);
      o.frequency.exponentialRampToValueAtTime(210, t + 0.13);
      f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(f); f.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t + 0.22);
    } catch (e) {}
  }
  const duckLines = ["quack!", "explain your bug to me ✿", "have you tried turning it off and on again?", "it's always a missing semicolon ;", "console.log('quack')", "i believe in your code 💗", "gg ez ✿", "have you drunk your matcha today? 🍵", "press START to continue 🎮", "strawberries fix everything 🍓"];
  function pokeDuck(e) {
    unlock("quack");
    quack();
    duckBody.classList.remove("hop");
    void duckBody.offsetWidth;
    duckBody.classList.add("hop");
    say(duckLines[Math.floor(Math.random() * duckLines.length)]);
    const r = duckBody.getBoundingClientRect();
    for (let i = 0; i < 6; i++) spawnSpark(r.left + r.width / 2, r.top + 8, true);
  }
  duckBody.addEventListener("click", pokeDuck);

  let lastSection = null;
  const duckIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting && lastSection !== e.target) {
        lastSection = e.target;
        setTimeout(() => { if (lastSection === e.target) say(e.target.dataset.duck, 4600); }, root.classList.contains("ready") ? 700 : 2200);
      }
    }),
    { threshold: 0.45 }
  );
  $$("[data-duck]").forEach((s) => duckIO.observe(s));
  const contactSec = $("#contact");
  if (contactSec) {
    const exIO = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { unlock("explorer"); exIO.disconnect(); } }), { threshold: 0.35 });
    exIO.observe(contactSec);
  }

  /* ---------- one animation loop for everything that moves ---------- */
  let lastScrollY = scrollY, vel = 0;
  function frame(t) {
    // scroll velocity
    const dy = scrollY - lastScrollY;
    lastScrollY = scrollY;
    vel = lerp(vel, dy, 0.18);

    // cursor ring
    if (ring) {
      rx = lerp(rx, mouse.x, 0.2);
      ry = lerp(ry, mouse.y, 0.2);
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
    }

    // hero letters
    if (fine && !reduce && letters.length && mouse.has) {
      letters.forEach((l) => {
        const r = l.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
        const k = clamp(1 - dist / 260, 0, 1);
        l.style.fontWeight = Math.round(520 + k * 380);
        l.style.translate = "0 " + (-k * 16).toFixed(1) + "px";
        l.style.rotate = (((mouse.x - cx) / 40) * k).toFixed(1) + "deg";
      });
    }

    // marquee bands
    bands.forEach((b) => {
      const speed = 0.7 + Math.min(18, Math.abs(vel)) * 0.7;
      b.x += b.dir * speed;
      if (b.dir < 0 && b.x <= -b.w) b.x += b.w;
      if (b.dir > 0 && b.x >= 0) b.x -= b.w;
      b.track.style.transform = "translate3d(" + b.x + "px,0,0)";
    });

    // doodle parallax
    if (fine && !reduce) {
      const nx = mouse.x / innerWidth - 0.5, ny = mouse.y / innerHeight - 0.5;
      doodles.forEach((o) => {
        o.x = lerp(o.x, nx * o.d * 46, 0.06);
        o.y = lerp(o.y, ny * o.d * 46, 0.06);
        o.el.style.transform = "translate3d(" + o.x.toFixed(1) + "px," + o.y.toFixed(1) + "px,0)";
      });
    }

    // duck walks toward the cursor along the bottom edge
    if (fine && !reduce && mouse.has) {
      const target = clamp(mouse.x - 34, 10, innerWidth - 90);
      const dist = target - dx;
      if (Math.abs(dist) > 46) {
        const step = clamp(dist * 0.025, -3.2, 3.2);
        dx += step;
        ddir = step > 0 ? 1 : -1;
        walking = true;
      } else walking = false;
    }
    duck.style.transform = "translate3d(" + dx.toFixed(1) + "px," + (walking ? -Math.abs(Math.sin(t * 0.014)) * 6 : 0).toFixed(1) + "px,0)";
    duckFlip.style.transform = "scaleX(" + ddir + ")";
    bubble.classList.toggle("flipped", dx > innerWidth - 270);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- the terminal ---------- */
  const body = $("#termBody"), form = $("#termForm"), input = $("#termInput");
  const history = []; let hi = -1;
  function line(parts, cls) {
    const d = document.createElement("div");
    d.className = "ln " + (cls || "t-out");
    (Array.isArray(parts) ? parts : [parts]).forEach((p) => {
      if (typeof p === "string") d.appendChild(document.createTextNode(p));
      else { const a = document.createElement("a"); a.href = p.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = p.text; d.appendChild(a); }
    });
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  const L = (href, text) => ({ href, text });
  const COMMANDS = {
    help: () => [
      "commands:  about · skills · projects · experience · journey · links · whoami · ls · duck · clear",
      "fun:       gamer · achievements · matcha · strawberry",
      ["secret:    try ", "sudo hire kwiz", " ✿"],
    ],
    about: () => [
      "Krizten Antoinette B. Lapuz — 4th-year BSIT @ TUP Manila.",
      "Started in graphic design, social media & journalism, grew into web and mobile app development.",
      "Currently building MySalapi, my thesis.",
    ],
    whoami: () => ["kwiz ✿  (a.k.a. Krizten Antoinette B. Lapuz) · player 1 · LVL 4"],
    skills: () => [
      "development  web dev · app dev · React Native · Laravel · Git & GitHub · HTML/CSS/JS · Android · IT support",
      "design       Figma (UI/UX) · Canva · visual branding · social media graphics",
      "comms        Facebook · Instagram · TikTok · content planning · journalism · report writing",
      "productivity Google Workspace · Microsoft Office · data entry",
      "soft         critical thinking · attention to detail · multitasking · adaptability",
    ],
    projects: () => [
      "1. MySalapi    thesis · Android finance app (2026-2027)",
      "2. StayCrafty  kawaii stationery e-commerce site (2024-2025)",
      "3. Kita-Kita   sari-sari store app concept",
      "4. kriznbows   thrift brand & socials",
    ],
    ls: () => ["mysalapi.app   staycrafty.html   kita-kita.plan   kriznbows.brand"],
    experience: () => [
      "Aug 2024 - Jan 2026  IT & E-Commerce Coordinator @ LJ Farm Supply & General Merchandise",
      "                     social media · Canva promo graphics · listings, inquiries & orders",
    ],
    journey: () => [
      "now     Girls Who Build PH · Google Developer Campus TUP Manila · 4th-year BSIT",
      "event   handled a seminar: Building Generative AI-Powered Applications in Java",
      "before  IT & E-Commerce Coordinator @ LJ Farm Supply & General Merchandise",
      "2023-24 TUPCOMPASS   ·   2022-23 TUPGEAR   ·   2020-22 SHS STEM @ Metro Manila College",
    ],
    links: () => [
      [L("https://github.com/krizxei", "github.com/krizxei")],
      [L("https://www.linkedin.com/in/lapuzkriztenantoinette/", "linkedin.com/in/lapuzkriztenantoinette")],
      [L("https://www.instagram.com/kwiztenn/", "instagram.com/kwiztenn")],
      [L("https://www.facebook.com/kriztenantoinette.lapuz", "facebook.com/kriztenantoinette.lapuz")],
    ],
    gamer: () => {
      const on = setPixel(!root.classList.contains("pixel"));
      return on ? ["player 1 ready ▮ pixel mode ON", "type 'gamer' again to go back to pastel."] : ["pixel mode off ✿ welcome back."];
    },
    achievements: () => ACH.map((a) => (got[a.id] ? "[x] " + a.name : "[ ] ??? — " + a.desc)),
    matcha: () => ["🍵 matcha level: 100%", "status: fueled. ready to ship."],
    strawberry: () => ["🍓 strawberries loaded.", "bug count: 0 (probably)."],
    hello: () => ["hi hi! ✿ type 'help' to see what I can do."],
    date: () => [new Date().toDateString()],
    exit: () => ["you can't leave. the duck is watching. 🦆"],
    duck: () => { setTimeout(pokeDuck, 50); return ["quack."]; },
    "sudo hire kwiz": () => [
      ["access granted ✿  say hi → ", L("https://www.linkedin.com/in/lapuzkriztenantoinette/", "linkedin.com/in/lapuzkriztenantoinette")],
    ],
  };
  COMMANDS.hi = COMMANDS.hello;
  COMMANDS.sudo = () => ["nice try. did you mean: sudo hire kwiz ?"];

  function run(raw) {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const echo = document.createElement("div");
    echo.className = "ln";
    echo.innerHTML = '<span class="t-prompt">guest@kwiz:~$</span> <span class="t-cmd"></span>';
    $(".t-cmd", echo).textContent = raw;
    body.appendChild(echo);
    if (!cmd) return;
    unlock("hacker");
    if (cmd === "clear") { body.innerHTML = ""; return; }
    const fn = COMMANDS[cmd];
    if (!fn) { line("command not found: " + cmd + " — try 'help'", "t-dim"); return; }
    const out = fn();
    out.forEach((ln, i) => {
      if (cmd === "sudo hire kwiz") line(ln, "t-ok");
      else if (cmd === "help" && i >= 1) line(ln, "t-dim");
      else line(ln, "t-out");
    });
  }
  line("welcome to kwiz.sh ✿", "t-ok");
  line("type 'help' — or tap a command below.", "t-dim");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    if (v.trim()) { history.push(v); hi = history.length; }
    run(v);
    input.value = "";
    body.scrollTop = body.scrollHeight;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) { hi = Math.max(0, hi - 1); input.value = history[hi]; e.preventDefault(); }
    if (e.key === "ArrowDown" && history.length) { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; e.preventDefault(); }
  });
  $$(".term-chips button").forEach((b) => b.addEventListener("click", () => run(b.dataset.cmd)));
  $("#term").addEventListener("click", (e) => { if (!e.target.closest("button,a") && fine) input.focus({ preventScroll: true }); });

  /* ---------- footer ---------- */
  $("#year").textContent = new Date().getFullYear();
  $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
})();