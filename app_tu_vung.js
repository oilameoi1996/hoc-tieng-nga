// Tab "Từ vựng mới": mỗi lần bấm Cập nhật mở thêm 20-30 từ chưa có trong bài học (kho: kho_tu.js)
(function () {
  const K = window.KHO_TU || [];
  const css = document.createElement("style");
  css.textContent = "#vList .vw{display:flex;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:6px}" +
    "#vList .vw .ru{font-size:20px;font-weight:600}#vList .vw .ph{color:var(--acc);font-size:14px}#vList .vw .tx{flex:1;min-width:0}" +
    "#vList .vw.kn{opacity:.6}#vList .vw button{padding:6px 10px}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.dataset.m = "vocab"; btn.textContent = "🆕 Từ vựng mới";
  $("tabs").insertBefore(btn, $("tabs").children[1]);
  const box = document.createElement("div");
  box.id = "vocab"; box.className = "hide";
  box.innerHTML =
    `<div class="row"><button id="vUpd" class="on">🔄 Cập nhật từ vựng</button><select id="vShow"><option value="new">Đợt mới nhất</option><option value="all">Tất cả từ đã mở</option></select><button id="vQuiz">🎯 Kiểm tra 10 từ</button></div>` +
    `<div class="bar"><span id="vStat"></span><span id="vKn"></span></div>` +
    `<div id="vQBox" class="hide"></div><div id="vList"></div>` +
    `<p class="hint">Kho ${K.length} từ A1–A2 theo các chủ đề của chuẩn ТРКИ-1 (gia đình, nhà cửa, đồ ăn, thành phố, công việc...), đã bỏ những từ có sẵn trong 100 buổi học. Bấm 📖 để tra từ trên Wiktionary ngay trong app (cần mạng), bấm nút ◀ của điện thoại để quay lại.</p>`;
  $("res").before(box);

  let batches = store.get("vocabBatches", []), kn = new Set(store.get("vocabKnown", []));
  const opened = () => batches.flat();

  function render() {
    const o = opened(), left = K.length - o.length;
    $("vStat").textContent = `Đã mở ${o.length}/${K.length} từ · đợt ${batches.length}`;
    $("vKn").textContent = `Đã thuộc: ${o.filter(i => kn.has(i)).length}`;
    $("vUpd").disabled = !left;
    $("vUpd").textContent = left ? `🔄 Cập nhật từ vựng (+${Math.min(left, 20)}–${Math.min(left, 30)} từ)` : "✅ Đã mở hết kho từ";
    const ids = $("vShow").value === "all" ? o.slice().reverse() : (batches[batches.length - 1] || []);
    $("vList").innerHTML = ids.length ? ids.map(i => {
      const w = K[i];
      return `<div class="vw${kn.has(i) ? " kn" : ""}"><button data-say="${i}">🔊</button><div class="tx"><div class="ru">${esc(w.ru)}</div>` +
        `<div class="ph">${esc(w.ph)}</div><div>${esc(w.vi)} <span class="tag">${esc(w.t)}</span></div></div>` +
        `<button data-wk="${i}" title="Tra Wiktionary">📖</button><button data-kn="${i}">${kn.has(i) ? "↺" : "✓"}</button></div>`;
    }).join("") : `<div class="card"><div class="mid">Bấm “Cập nhật từ vựng” để nhận từ mới 🎁</div></div>`;
  }

  $("vUpd").onclick = () => {
    const have = new Set(opened()), rest = K.map((_, i) => i).filter(i => !have.has(i));
    if (!rest.length) return;
    const n = 20 + Math.floor(Math.random() * 11);
    batches.push(rest.slice(0, n)); store.set("vocabBatches", batches);
    $("vShow").value = "new"; $("vQBox").classList.add("hide");
    markStudy(); render(); celebrate($("vUpd"));
  };
  $("vShow").onchange = render;
  $("vList").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.say) say(K[b.dataset.say].ru);
    if (b.dataset.wk) location.href = "https://en.wiktionary.org/wiki/" + encodeURIComponent(K[b.dataset.wk].ru.replace(/́/g, "")) + "#Russian";
    if (b.dataset.kn) { const i = +b.dataset.kn; kn.has(i) ? kn.delete(i) : kn.add(i); store.set("vocabKnown", [...kn]); render(); }
  };

  let q = null;
  $("vQuiz").onclick = () => {
    const o = opened();
    if (o.length < 4) { alert("Cần mở ít nhất 4 từ: bấm “Cập nhật từ vựng” trước."); return; }
    q = { list: shuffle(o).slice(0, 10), i: 0, score: 0 };
    $("vQBox").classList.remove("hide"); ask();
  };
  function ask() {
    const qb = $("vQBox");
    if (q.i >= q.list.length) {
      qb.innerHTML = `<div class="card" style="min-height:0"><div class="big">${q.score}/${q.list.length}</div><button id="vQClose">Đóng</button></div>`;
      $("vQClose").onclick = () => qb.classList.add("hide"); return;
    }
    const a = q.list[q.i], opts = shuffle([a, ...shuffle(opened().filter(i => i !== a && K[i].vi !== K[a].vi)).slice(0, 3)]);
    qb.innerHTML = `<div class="bar"><span>Từ ${q.i + 1}/${q.list.length}</span><span>Đúng: ${q.score}</span></div>` +
      `<div class="card" style="min-height:0;margin-bottom:12px"><div class="big">${esc(K[a].ru)}</div><div class="mute">${esc(K[a].ph)}</div><div class="opts"></div></div>`;
    say(K[a].ru);
    const ob = qb.querySelector(".opts");
    opts.forEach(i => {
      const b = document.createElement("button"); b.textContent = K[i].vi;
      b.onclick = () => {
        ob.querySelectorAll("button").forEach(x => x.disabled = true);
        if (i === a) { b.classList.add("ok"); q.score++; celebrate(b); } else { b.classList.add("bad"); ob.children[opts.indexOf(a)].classList.add("ok"); }
        markStudy(); setTimeout(() => { q.i++; ask(); }, i === a ? 900 : 2000);
      };
      ob.appendChild(b);
    });
  }

  function show() {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b === btn));
    ["lesson", "alpha", "flash", "quiz", "speak", "fill", "order", "spell", "listen", "mem", "res", "game"].forEach(id => $(id).classList.add("hide"));
    box.classList.remove("hide"); store.set("mode", "vocab"); render();
  }
  btn.onclick = show;
  $("tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b !== btn) box.classList.add("hide"); });
  if (store.get("mode", "") === "vocab") show();
})();
