// Tab "Tập viết": chọn chữ, xem cách viết từng nét, rồi dùng ngón tay vuốt theo nét chữ mờ
(function () {
  // khung 100x140: đỉnh chữ hoa y=20, đỉnh chữ thường y=50, dòng kẻ chân y=110, chân chữ dài y=135
  const UP = {
    "А": ["M50 20 L15 110", "M50 20 L85 110", "M28 78 L72 78"],
    "Б": ["M75 20 L25 20", "M25 20 L25 110", "M25 62 L55 62 Q80 62 80 86 Q80 110 55 110 L25 110"],
    "В": ["M25 20 L25 110", "M25 20 L52 20 Q72 20 72 41 Q72 62 50 62 L25 62", "M50 62 Q80 62 80 86 Q80 110 52 110 L25 110"],
    "Г": ["M25 20 L25 110", "M25 20 L78 20"],
    "Д": ["M38 20 Q36 85 18 110", "M38 20 L75 20 L75 110", "M10 130 L10 110 L90 110 L90 130"],
    "Е": ["M25 20 L25 110", "M25 20 L75 20", "M25 64 L68 64", "M25 110 L75 110"],
    "Ё": ["M25 20 L25 110", "M25 20 L75 20", "M25 64 L68 64", "M25 110 L75 110", "M40 6 L40 10", "M60 6 L60 10"],
    "Ж": ["M12 20 L50 64", "M50 64 L12 110", "M50 20 L50 110", "M88 20 L50 64", "M50 64 L88 110"],
    "З": ["M25 30 Q50 10 70 30 Q78 55 45 62 Q80 66 75 95 Q55 120 22 100"],
    "И": ["M25 20 L25 110", "M75 20 L25 110", "M75 20 L75 110"],
    "Й": ["M25 20 L25 110", "M75 20 L25 110", "M75 20 L75 110", "M38 6 Q50 16 62 6"],
    "К": ["M25 20 L25 110", "M75 20 L25 66", "M40 52 L78 110"],
    "Л": ["M40 20 Q38 90 15 110", "M40 20 L80 20 L80 110"],
    "М": ["M18 110 L18 20 L50 85 L82 20 L82 110"],
    "Н": ["M25 20 L25 110", "M75 20 L75 110", "M25 64 L75 64"],
    "О": ["M50 20 Q15 20 15 65 Q15 110 50 110 Q85 110 85 65 Q85 20 50 20"],
    "П": ["M25 20 L25 110", "M25 20 L75 20 L75 110"],
    "Р": ["M25 20 L25 110", "M25 20 L52 20 Q78 20 78 44 Q78 68 52 68 L25 68"],
    "С": ["M80 32 Q65 18 50 20 Q15 22 15 65 Q15 108 50 110 Q68 110 80 96"],
    "Т": ["M15 20 L85 20", "M50 20 L50 110"],
    "У": ["M18 20 L50 75", "M82 20 L45 100 Q38 115 22 110"],
    "Ф": ["M50 15 L50 115", "M50 35 Q15 35 15 62 Q15 88 50 88 Q85 88 85 62 Q85 35 50 35"],
    "Х": ["M18 20 L82 110", "M82 20 L18 110"],
    "Ц": ["M22 20 L22 110 L80 110", "M80 20 L80 110", "M80 110 L90 110 L90 130"],
    "Ч": ["M25 20 Q25 64 60 64 L75 64", "M75 20 L75 110"],
    "Ш": ["M15 20 L15 110 L85 110", "M50 20 L50 110", "M85 20 L85 110"],
    "Щ": ["M12 20 L12 110 L82 110", "M47 20 L47 110", "M82 20 L82 110", "M82 110 L92 110 L92 130"],
    "Ъ": ["M10 20 L30 20", "M30 20 L30 110 L58 110 Q85 110 85 86 Q85 62 58 62 L30 62"],
    "Ы": ["M18 20 L18 110 L40 110 Q60 110 60 86 Q60 62 40 62 L18 62", "M82 20 L82 110"],
    "Ь": ["M28 20 L28 110 L55 110 Q82 110 82 86 Q82 62 55 62 L28 62"],
    "Э": ["M20 32 Q35 18 50 20 Q85 22 85 65 Q85 108 50 110 Q32 110 20 96", "M42 64 L84 64"],
    "Ю": ["M15 20 L15 110", "M15 64 L35 64", "M62 20 Q35 20 35 65 Q35 110 62 110 Q88 110 88 65 Q88 20 62 20"],
    "Я": ["M75 20 L75 110", "M75 20 L48 20 Q22 20 22 43 Q22 66 48 66 L75 66", "M50 66 L22 110"],
  };
  // chữ thường khác dạng chữ hoa; các chữ còn lại là chữ hoa thu nhỏ vào cỡ chữ thường
  const LOW = {
    "а": ["M72 62 Q60 48 45 50 Q20 54 20 82 Q20 110 45 110 Q65 110 72 92", "M72 50 L72 110"],
    "б": ["M75 18 Q35 22 28 75 Q25 110 50 110 Q78 110 78 85 Q78 60 50 60 Q30 60 26 75"],
    "е": ["M22 80 L78 80 Q78 50 50 50 Q22 50 22 80 Q22 110 50 110 Q68 110 76 98"],
    "ё": ["M22 80 L78 80 Q78 50 50 50 Q22 50 22 80 Q22 110 50 110 Q68 110 76 98", "M40 38 L40 42", "M60 38 L60 42"],
    "р": ["M25 50 L25 135", "M25 62 Q35 50 50 50 Q78 50 78 80 Q78 110 50 110 Q35 110 25 98"],
    "у": ["M20 50 L50 108", "M80 50 L45 125 Q38 138 22 133"],
    "ф": ["M50 25 L50 135", "M50 55 Q18 55 18 80 Q18 105 50 105 Q82 105 82 80 Q82 55 50 55"],
  };
  const small = p => p.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => x + " " + Math.round(50 + (y - 20) * 2 / 3));
  const strokesOf = (ch, lower) => lower ? LOW[ch.toLowerCase()] || UP[ch].map(small) : UP[ch];
  const LET = Object.keys(UP);
  const TOL = 10;

  const css = document.createElement("style");
  css.textContent = "#viet .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px;margin-bottom:12px}" +
    "#viet .grid button{padding:8px 0;font-size:20px}#viet .grid button.dn{border-color:var(--ok);color:var(--ok)}" +
    "#viet .pad{display:flex;justify-content:center}#viet svg{width:min(100%,380px);touch-action:none;background:#fff8f8;border:1px solid var(--line);border-radius:12px}" +
    "#viet .t{fill:none;stroke:#c9ced6;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}#viet .t.ok{stroke:#1e8a4c}#viet .t.now{stroke:#9db7e8}" +
    "#viet .ink{fill:none;stroke:#e0342f;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}#viet .demo{fill:none;stroke:#e0342f;stroke-width:6;stroke-linecap:round}" +
    "#viet .dd,#viet .gd{fill:#ffcf33;stroke:#7a4b00;stroke-width:1}#viet .gl{stroke:#7ed6a5;stroke-width:.6}#viet .gl.b{stroke:#f08a8a}#viet .st{fill:#1f5fbf}#viet .sn{fill:#fff;font:bold 6px sans-serif;text-anchor:middle;dominant-baseline:central}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.dataset.m = "viet"; btn.textContent = "✍️ Tập viết";
  $("tabs").insertBefore(btn, document.querySelector('#tabs [data-m="alpha"]').nextSibling);
  const box = document.createElement("div");
  box.id = "viet"; box.className = "hide";
  box.innerHTML = `<div class="grid" id="wGrid"></div>` +
    `<div class="row"><button id="wPrev">◀</button><select id="wCase"><option value="0">Chữ hoa</option><option value="1">Chữ thường</option></select>` +
    `<button id="wDemo">▶ Xem cách viết</button><button id="wSay">🔊</button><button id="wClear">↺ Viết lại</button><button id="wNext">▶</button></div>` +
    `<div class="bar"><span id="wInfo"></span><span id="wDone"></span></div><div class="pad" id="wPad"></div>` +
    `<p class="hint">Vuốt ngón tay theo nét đang sáng màu xanh, bắt đầu từ chấm có số, đi theo hướng chấm vàng đang chạy. Đúng nét thì nét chuyển xanh lá và sang nét tiếp theo.</p>`;
  $("res").before(box);

  let li = 0, strokes = [], cur = 0, ink = null, pts = [], busy = false;
  let done = new Set(store.get("vietDone", []));
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  let svg;

  function grid() {
    $("wGrid").innerHTML = LET.map((c, i) => `<button data-i="${i}" class="${i === li ? "on" : ""} ${done.has(c + $("wCase").value) ? "dn" : ""}">${c}${c.toLowerCase()}</button>`).join("");
    $("wDone").textContent = `Đã viết đúng ${done.size}/66`;
  }
  function load() {
    const ch = LET[li], lower = $("wCase").value === "1";
    const glyph = lower ? ch.toLowerCase() : ch;
    $("wInfo").textContent = `Chữ ${glyph} · ${strokesOf(ch, lower).length} nét`;
    $("wPad").innerHTML = "";
    svg = el("svg", { viewBox: "0 0 100 140" });
    [[20, ""], [50, ""], [110, "b"], [135, ""]].forEach(([y, c]) => svg.appendChild(el("line", { x1: 0, x2: 100, y1: y, y2: y, class: "gl " + c })));
    strokes = strokesOf(ch, lower).map(d => { const p = el("path", { d, class: "t" }); svg.appendChild(p); return p; });
    $("wPad").appendChild(svg);
    svg.appendChild(el("circle", { r: 3.5, class: "gd" }));
    cur = 0; mark(); grid(); guideT0 = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function mark() {
    svg.querySelectorAll(".st,.sn").forEach(e => e.remove());
    strokes.forEach((p, i) => p.classList.toggle("now", i === cur));
    if (cur >= strokes.length) return;
    const s = strokes[cur].getPointAtLength(0);
    svg.appendChild(el("circle", { cx: s.x, cy: s.y, r: 4.5, class: "st" }));
    const n = el("text", { x: s.x, y: s.y, class: "sn" }); n.textContent = cur + 1; svg.appendChild(n);
  }
  const near = (a, list) => list.some(b => Math.hypot(a.x - b.x, a.y - b.y) <= TOL);
  function check(path, user) {
    const L = path.getTotalLength(), samp = [];
    for (let l = 0; l <= L; l += 2) samp.push(path.getPointAtLength(l));
    if (L < 8) { const m = path.getPointAtLength(L / 2); return user.some(u => Math.hypot(u.x - m.x, u.y - m.y) <= TOL * 1.5); }
    const cov = samp.filter(s => near(s, user)).length / samp.length;
    const fit = user.filter(u => near(u, samp)).length / user.length;
    const st = Math.hypot(user[0].x - samp[0].x, user[0].y - samp[0].y) <= TOL * 2;
    return cov >= 0.75 && fit >= 0.7 && st;
  }
  const toSvg = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

  $("wPad").addEventListener("pointerdown", e => {
    if (!svg || busy || cur >= strokes.length) return;
    svg.setPointerCapture(e.pointerId);
    const p = toSvg(e); pts = [{ x: p.x, y: p.y }];
    ink = el("polyline", { class: "ink", points: `${p.x},${p.y}` }); svg.appendChild(ink);
  });
  $("wPad").addEventListener("pointermove", e => {
    if (!ink) return;
    const p = toSvg(e); pts.push({ x: p.x, y: p.y });
    ink.setAttribute("points", ink.getAttribute("points") + ` ${p.x},${p.y}`);
  });
  const up = () => {
    if (!ink) return;
    const ok = check(strokes[cur], pts); ink.remove(); ink = null;
    markStudy();
    if (!ok) { svg.classList.remove("shake"); void svg.offsetWidth; svg.classList.add("shake"); return; }
    strokes[cur].classList.add("ok"); cur++; mark(); guideT0 = performance.now();
    if (cur === strokes.length) {
      done.add(LET[li] + $("wCase").value); store.set("vietDone", [...done]);
      celebrate(svg); say(LET[li] + " " + LET[li].toLowerCase()); grid();
    }
  };
  $("wPad").addEventListener("pointerup", up);
  $("wPad").addEventListener("pointercancel", up);

  // chấm nhỏ chạy theo nét: khi xem mẫu thì kéo nét đỏ theo, khi tập thì lặp lại trên nét đang cần viết
  const DUR = 1200;
  let raf = 0, guideT0 = 0;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    const dot = svg && svg.querySelector(".gd");
    if (!dot) return;
    if (busy || ink || cur >= strokes.length) { dot.style.display = "none"; return; }
    const p = strokes[cur], k = ((t - guideT0) % (DUR + 700)) / DUR;
    dot.style.display = k > 1 ? "none" : "";
    if (k <= 1) { const q = p.getPointAtLength(p.getTotalLength() * k); dot.setAttribute("cx", q.x); dot.setAttribute("cy", q.y); }
  }
  $("wDemo").onclick = () => {
    if (busy) return; busy = true; load();
    const ds = strokes.map(p => { const d = el("path", { d: p.getAttribute("d"), class: "demo" }), L = p.getTotalLength() + 1; d.style.strokeDasharray = L; d.style.strokeDashoffset = L; svg.appendChild(d); return d; });
    const dot = el("circle", { r: 3.5, class: "dd" }); svg.appendChild(dot);
    let i = 0, t0 = 0;
    const step = t => {
      if (!t0) t0 = t;
      const p = strokes[i], L = p.getTotalLength(), k = Math.min(1, (t - t0) / DUR), q = p.getPointAtLength(L * k);
      ds[i].style.strokeDashoffset = (L + 1) * (1 - k); dot.setAttribute("cx", q.x); dot.setAttribute("cy", q.y);
      if (k < 1) return requestAnimationFrame(step);
      if (++i < ds.length) { t0 = t + 300; return setTimeout(() => requestAnimationFrame(step), 300); }
      setTimeout(() => { ds.forEach(d => d.remove()); dot.remove(); busy = false; guideT0 = performance.now(); }, 800);
    };
    requestAnimationFrame(step);
  };
  $("wClear").onclick = load;
  $("wSay").onclick = () => say(LET[li] + " " + LET[li].toLowerCase());
  $("wPrev").onclick = () => { li = (li + LET.length - 1) % LET.length; load(); };
  $("wNext").onclick = () => { li = (li + 1) % LET.length; load(); };
  $("wCase").onchange = load;
  $("wGrid").onclick = e => { const b = e.target.closest("[data-i]"); if (b) { li = +b.dataset.i; load(); } };

  function show() {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b === btn));
    ["lesson", "alpha", "flash", "quiz", "speak", "fill", "order", "spell", "listen", "mem", "res", "game", "vocab", "nv"].forEach(id => $(id) && $(id).classList.add("hide"));
    box.classList.remove("hide"); store.set("mode", "viet"); if (!svg) load();
  }
  btn.onclick = show;
  $("tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b !== btn) box.classList.add("hide"); });
  if (store.get("mode", "") === "viet") show();
})();
