// Lộ trình 100 buổi dạng đường đi (bấm vào buổi để mở nội dung) + thanh điều hướng dưới cùng
(function () {
  if (!window.BUOI || !BUOI.length) return;
  const css = document.createElement("style");
  css.textContent =
    "#lPath{padding-bottom:20px}#lPath .top{display:flex;justify-content:space-around;font-weight:700;font-size:17px;margin-bottom:10px}" +
    "#lPath .unit,#lHead{border-radius:14px;padding:12px 14px;color:#fff;margin:18px 0 14px;box-shadow:0 4px 0 #0002}" +
    "#lPath .unit small{display:block;font-weight:700;opacity:.85;font-size:12px;letter-spacing:.5px}#lPath .unit b,#lHead b{font-size:16px}" +
    "#lHead{position:sticky;top:52px;z-index:6;color:#fff;padding:12px 14px;box-shadow:0 4px 0 #0002;margin:0 0 8px;display:flex;align-items:center;gap:8px}#lHead .tx{flex:1;min-width:0}#lHead small{display:block;font-weight:700;opacity:.85;font-size:12px}" +
    "#lHead button{background:#fff3;color:#fff;border:0;font-size:18px;padding:8px 12px;border-radius:10px}" +
    "#lHead+.unit{display:none}#lPath .unit+.node{margin-top:48px}#lParts{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:7;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:12px;max-height:55vh;overflow-y:auto;margin-bottom:8px}" +
    "#lParts button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:10px 12px;font-size:14px;background:none;color:var(--ink)}" +
    "#lParts button.on{font-weight:700;color:var(--acc)}" +
    "#lPath .node{display:block;position:relative;width:72px;height:66px;margin:24px auto;border-radius:50%;border:0;font-size:28px;color:#fff;" +
    "background:var(--nc);box-shadow:0 7px 0 var(--ns);padding:0;transition:transform .1s}#lPath .node:active{transform:translateY(5px);box-shadow:0 2px 0 var(--ns)}" +
    "#lPath .node.lock{--nc:#c9ccd1;--ns:#a4a8ae;color:#7d838a}#lPath .node.done{--nc:#ffc800;--ns:#d9a400}" +
    "#lPath .node.cur{outline:6px solid var(--nc);outline-offset:6px}#lPath .node .n{position:absolute;bottom:-20px;left:0;right:0;font-size:12px;color:var(--mute);font-weight:700}" +
    "#lPath .bub{position:absolute;top:-38px;left:50%;transform:translateX(-50%);background:var(--card);color:var(--nc);border:2px solid var(--line);border-radius:10px;" +
    "padding:3px 10px;font-size:13px;font-weight:800;white-space:nowrap;animation:lb 1.2s infinite}@keyframes lb{50%{transform:translate(-50%,-4px)}}" +
    "#lBack{margin-bottom:10px}" +
    "#bnav{position:fixed;left:0;right:0;bottom:0;z-index:25;display:flex;justify-content:space-around;background:var(--card);border-top:1px solid var(--line);padding:6px 0 8px}" +
    "#bnav button{border:2px solid transparent;background:none;font-size:26px;padding:4px 12px;border-radius:12px;line-height:1}#bnav button small{display:block;font-size:11px;color:var(--mute)}" +
    "#bnav button.on{border-color:var(--acc);background:#1f5fbf18}body{padding-bottom:76px}" +
    "body.fullgame #game{position:fixed;inset:0;z-index:40;background:#000}body.fullgame #gameFrame{height:100%!important;border-radius:0!important}" +
    "#gClose{position:absolute;top:10px;left:8px;z-index:41;font-size:16px;padding:6px 10px;background:#000a;color:#fff;border:0;border-radius:20px}" +
    "body:not(.fullgame) #gClose{display:none}";
  document.head.appendChild(css);

  // ---- đường đi các buổi
  const lesson = $("lesson"), detail = document.createElement("div"), path = document.createElement("div");
  detail.id = "lDetail"; path.id = "lPath";
  while (lesson.firstChild) detail.appendChild(lesson.firstChild);
  detail.insertAdjacentHTML("afterbegin", `<button id="lBack">◀ Lộ trình các buổi</button>`);
  lesson.append(path, detail);
  const COLORS = [["#58cc02", "#46a302"], ["#ce82ff", "#a568cc"], ["#00cd9c", "#00a47d"], ["#ff9600", "#cc7800"], ["#1cb0f6", "#1899d6"], ["#ff4b4b", "#cc3c3c"]];
  const ICON = ["⭐", "📖", "🎧", "🗣️", "✏️", "🏆"];
  const X = [0, 45, 75, 45, 0, -45, -75, -45];

  function render() {
    const done = new Set(store.get("buoiDone", [])), curI = BUOI.findIndex(b => !done.has(b.n));
    const nv = store.get("nhiemVu", {}), st = store.get("streak", { n: 0 });
    let html = `<div class="top"><span>🇷🇺 ${done.size}/${BUOI.length}</span><span>🔥 ${st.n}</span><span>💎 ${nv.gems || 0}</span><span>⚡ ${nv.totalKn || 0}</span></div>`;
    let part = null, u = -1, k = 0;
    BUOI.forEach((b, i) => {
      if (b.part !== part) {
        part = b.part; u++; k = 0;
        const [head, ...rest] = part.split(" · ");
        html += `<div class="unit" data-u="${u}" style="background:${COLORS[u % 6][0]}"><small>${esc(head)} · ${esc(rest.pop() || "")}</small><b>${esc(rest.join(" · ") || b.title)}</b></div>`;
      }
      const [nc, ns] = COLORS[u % 6], isDone = done.has(b.n), isCur = i === curI;
      const cls = isDone ? "done" : isCur ? "cur" : "lock";
      html += `<button class="node ${cls}" data-i="${i}" style="--nc:${nc};--ns:${ns};transform:translateX(${X[k++ % 8]}px)" aria-label="Buổi ${b.n}: ${esc(b.title)}">` +
        `${isDone ? "✓" : b.review ? "🏆" : ICON[i % 6]}${isCur ? `<span class="bub">BẮT ĐẦU</span>` : ""}<span class="n">Buổi ${b.n}</span></button>`;
    });
    path.innerHTML = html.replace('<div class="unit"', `<div id="lHead"><div class="tx"></div><button id="lPick" aria-label="Chọn phần">▼</button><div id="lParts" class="hide"></div></div><div class="unit"`);
    const units = [...path.querySelectorAll(".unit")];
    $("lParts").innerHTML = units.map((x, i) => `<button data-j="${i}">${x.querySelector("small").textContent} · ${x.querySelector("b").textContent}</button>`).join("");
    head();
  }
  // băng tên phần cố định trên đầu: luôn hiện phần đang xem, ▼ để nhảy nhanh tới phần khác
  let curU = -1;
  function head() {
    const h = $("lHead"); if (!h || path.classList.contains("hide")) return;
    const units = [...path.querySelectorAll(".unit")], lim = h.getBoundingClientRect().bottom + 10;
    let j = 0; units.forEach((x, i) => { if (x.getBoundingClientRect().top <= lim) j = i; });
    if (j === curU && h.firstChild.textContent) return;
    curU = j; h.style.background = units[j].style.background; h.firstChild.innerHTML = units[j].innerHTML;
    $("lParts").querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === j));
  }
  window.addEventListener("scroll", head, { passive: true });
  function showPath() {
    render(); detail.classList.add("hide"); path.classList.remove("hide");
    const c = path.querySelector(".node.cur") || path.querySelector(".node:last-child");
    if (c) setTimeout(() => { c.scrollIntoView({ block: "center" }); curU = -1; head(); }, 0);
  }
  path.onclick = e => {
    if (e.target.closest("#lPick")) { $("lParts").classList.toggle("hide"); return; }
    const pj = e.target.closest("[data-j]");
    if (pj) {
      $("lParts").classList.add("hide");
      const x = path.querySelectorAll(".unit")[+pj.dataset.j];
      window.scrollTo(0, x.getBoundingClientRect().top + scrollY - 52);
      return;
    }
    const n = e.target.closest(".node"); if (!n) return;
    $("uSel").value = n.dataset.i; $("uSel").onchange();
    path.classList.add("hide"); detail.classList.remove("hide"); window.scrollTo(0, 0);
  };
  $("lBack").onclick = showPath;
  showPath();

  // ---- thanh dưới cùng: Học, Nhiệm vụ, Quái vật (toàn màn hình), Chữ cái
  const nav = document.createElement("nav");
  nav.id = "bnav";
  nav.innerHTML = [["lesson", "🏠", "Học"], ["nv", "🎁", "Nhiệm vụ"], ["game", "👾", "Quái vật"], ["alpha", "🔤", "Chữ cái"]]
    .map(([m, i, t]) => `<button data-go="${m}">${i}<small>${t}</small></button>`).join("");
  document.body.appendChild(nav);
  const tab = m => document.querySelector(`#tabs [data-m="${m}"]`);
  nav.onclick = e => {
    const b = e.target.closest("[data-go]"); if (!b) return;
    if (b.dataset.go === "lesson" && !$("lesson").classList.contains("hide")) return showPath();
    tab(b.dataset.go).click();
    if (b.dataset.go === "lesson") showPath();
  };
  $("game").insertAdjacentHTML("afterbegin", `<button id="gClose">✕</button>`);
  $("gClose").onclick = () => tab("lesson").click();
  const sync = () => {
    const on = document.querySelector("#tabs button.on");
    nav.querySelectorAll("button").forEach(b => b.classList.toggle("on", !!on && b.dataset.go === on.dataset.m));
    document.body.classList.toggle("fullgame", !$("game").classList.contains("hide"));
  };
  new MutationObserver(sync).observe($("tabs"), { subtree: true, attributes: true, attributeFilter: ["class"] });
  new MutationObserver(sync).observe($("game"), { attributes: true, attributeFilter: ["class"] });
  sync();
})();
