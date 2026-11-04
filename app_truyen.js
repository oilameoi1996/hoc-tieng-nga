// Mục "Truyện": truyện dân gian và truyện cười tiếng Nga, bấm từng từ để xem cách đọc + nghĩa, nghe cả truyện có thanh kéo
(function () {
  const T = window.TRUYEN || [];
  if (!T.length) return;
  const css = document.createElement("style");
  css.textContent = "#stList .sc{display:flex;gap:12px;align-items:center;width:100%;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:8px;color:var(--ink)}" +
    "#stList .sc .e{font-size:30px}#stList .sc b{display:block;font-size:18px}#stList .sc small{color:var(--mute)}#stList .sc.rd{opacity:.65}" +
    "#stRead h3{margin:6px 0 2px;font-size:24px}#stRead .st{margin:0;padding:8px 10px;border-radius:12px;font-size:21px;line-height:1.9}" +
    "#stRead .st.cur{background:#ffd90033}#stRead .vi{display:block;font-size:14px;line-height:1.4;color:var(--mute)}#stRead.novi .vi{display:none}" +
    "#stCtl{position:sticky;top:52px;z-index:6;background:var(--bg);padding:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}" +
    "#stCtl input{flex:1 1 100%;accent-color:var(--acc);height:28px}#stCtl #stPos{font-size:14px;color:var(--mute);margin-left:auto}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.dataset.m = "story"; btn.textContent = "📚 Truyện";
  $("tabs").insertBefore(btn, $("tabs").children[2]);
  const box = document.createElement("div");
  box.id = "story"; box.className = "hide";
  box.innerHTML = `<div id="stList"></div><div id="stRead" class="hide"></div>` +
    `<p class="hint">Truyện dân gian Nga và truyện cười ngắn, kể lại bằng từ vựng A1–A2. Dấu ´ trên chữ là trọng âm. Bấm vào từ gạch chân để nghe, xem cách đọc và nghĩa.</p>`;
  $("res").before(box);

  let read = new Set(store.get("truyenRead", [])), pos = store.get("truyenPos", {}), cur = null, i = 0, playing = false, tok = 0, slow = false, t0 = 0, tick = 0;
  // TTS không cho biết thời lượng: ước lượng theo số ký tự (~11 ký tự/giây ở tốc độ thường) + nghỉ giữa câu
  const dur = j => T[cur].s[j][0].replace(/\u0301/g, "").length / (11.2 * (slow ? 0.6 : 1)) + 0.4;
  const startOf = j => { let t = 0; for (let x = 0; x < j; x++) t += dur(x); return t; };
  const total = () => startOf(T[cur].s.length);
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const save = () => { if (i) pos[cur] = i; else delete pos[cur]; store.set("truyenPos", pos); };
  const list = () => {
    $("stList").innerHTML = `<div class="bar"><span>${T.length} truyện</span><span>Đã đọc: ${read.size}</span></div>` +
      T.map((t, k) => `<button class="sc${read.has(k) ? " rd" : ""}" data-k="${k}"><span class="e">${t.e}</span><span><b>${esc(t.t)}${read.has(k) ? " ✓" : ""}</b><small>${esc(t.vi)} · ${esc(t.k)} · ${pos[k] ? `⏸ đang dở câu ${pos[k] + 1}/${t.s.length}` : `${t.s.length} câu`}</small></span></button>`).join("");
  };
  const words = s => s.split(/(\s+)/).map(w => /[А-Яа-яЁё]/.test(w) ? `<span class="sw">${esc(w)}</span>` : esc(w)).join("");

  function open(k) {
    stop(); cur = k; i = pos[k] || 0;
    const t = T[k], R = $("stRead");
    R.innerHTML = `<button id="stBack">◀ Danh sách truyện</button><h3>${t.e} ${words(t.t)}</h3><div class="mute">${esc(t.vi)} · ${esc(t.k)}</div>` +
      `<div id="stCtl"><button id="stPlay">▶ Đọc truyện</button><button id="stSpeed">🔊 Thường</button><button id="stVi">👁 Nghĩa câu</button><span id="stPos"></span>` +
      `<input id="stBar" type="range" min="0" max="1000" value="0" aria-label="Kéo để chọn đoạn cần nghe"></div>` +
      t.s.map((x, j) => `<p class="st" data-j="${j}">${words(x[0])}<span class="vi">${esc(x[1])}</span></p>`).join("");
    $("stList").classList.add("hide"); R.classList.remove("hide"); R.classList.toggle("novi", store.get("truyenNoVi", false));
    mark(); window.scrollTo(0, 0);
  }
  function mark(scroll) {
    const R = $("stRead"), n = T[cur].s.length;
    R.querySelectorAll(".st").forEach((p, j) => p.classList.toggle("cur", j === i));
    show_t(startOf(i)); save();
    $("stPlay").textContent = playing ? "⏸ Dừng" : i ? "▶ Đọc tiếp" : "▶ Đọc truyện";
    if (scroll) R.querySelector(`.st[data-j="${i}"]`).scrollIntoView({ block: "center", behavior: "smooth" });
  }
  function speak() {
    const my = ++tok, u = new SpeechSynthesisUtterance(T[cur].s[i][0].replace(/́/g, ""));
    u.lang = "ru-RU"; u.rate = 0.8 * (slow ? 0.6 : 1);
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith("ru")); if (v) u.voice = v;
    u.onend = () => {
      if (my !== tok || !playing) return;
      if (i + 1 < T[cur].s.length) { i++; mark(true); speak(); }
      else { playing = false; clearInterval(tick); i = 0; mark(); finish(); }
    };
    if (window.__setRate) __setRate(1);
    t0 = Date.now(); const base = startOf(i), d = dur(i);
    clearInterval(tick); tick = setInterval(() => { if (my === tok && playing) show_t(base + Math.min(d, (Date.now() - t0) / 1000)); else clearInterval(tick); }, 250);
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function stop() { playing = false; tok++; clearInterval(tick); if (window.speechSynthesis) speechSynthesis.cancel(); if (cur !== null && $("stPlay")) mark(); }
  function finish() {
    if (!read.has(cur)) { read.add(cur); store.set("truyenRead", [...read]); }
    markStudy(); celebrate($("stPlay"));
  }
  box.addEventListener("click", e => {
    const b = e.target.closest("button, .st");
    if (!b) return;
    if (b.dataset.k) return open(+b.dataset.k);
    if (b.id === "stBack") { stop(); $("stRead").classList.add("hide"); $("stList").classList.remove("hide"); list(); return; }
    if (b.id === "stPlay") { if (playing) return stop(); if (!window.speechSynthesis) return; playing = true; mark(true); speak(); return; }
    if (b.id === "stSpeed") { slow = !slow; b.textContent = slow ? "🐢 Chậm" : "🔊 Thường"; mark(); if (playing) speak(); return; }
    if (b.id === "stVi") { const R = $("stRead"); R.classList.toggle("novi"); store.set("truyenNoVi", R.classList.contains("novi")); return; }
    // bấm vào từ: popup đọc từ đó nên dừng đọc truyện; bấm vào chỗ trống của câu: nhảy tới câu đó
    if (e.target.closest(".sw")) { if (playing) { playing = false; tok++; mark(); } return; }
    if (b.classList.contains("st")) { i = +b.dataset.j; mark(); if (playing) speak(); }
  });
  box.addEventListener("input", e => {
    if (e.target.id !== "stBar") return;
    const t = e.target.value / 1000 * total(); let j = 0;
    while (j + 1 < T[cur].s.length && startOf(j + 1) <= t) j++;
    if (j !== i) { i = j; mark(true); if (playing) speak(); }
    show_t(t);
  });
  function show_t(t) {
    $("stBar").value = Math.round(t / total() * 1000);
    $("stPos").textContent = `${mmss(t)} / ${mmss(total())} · câu ${i + 1}/${T[cur].s.length}`;
  }

  function show() {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b === btn));
    ["lesson", "alpha", "flash", "quiz", "speak", "fill", "order", "spell", "listen", "mem", "res", "game", "vocab", "nv", "viet"].forEach(id => $(id) && $(id).classList.add("hide"));
    box.classList.remove("hide"); store.set("mode", "story");
    if ($("stRead").classList.contains("hide")) list();
  }
  btn.onclick = show;
  $("tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b !== btn) { box.classList.add("hide"); stop(); } });
  if (store.get("mode", "") === "story") show();
})();
