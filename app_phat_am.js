// Luyện phát âm: gạch chân từng từ; bấm vào từ thì nghe từ đó và hiện popup nghĩa (tu_dien.js)
(function () {
  const css = document.createElement("style");
  css.textContent = "#sCard .sw,#sResult .w,#story .sw{cursor:pointer;text-decoration:underline dotted;text-underline-offset:6px;text-decoration-thickness:2px;border-radius:6px}" +
    "#sCard .sw:active,#sResult .w:active,#sCard .sw.sel,#sResult .w.sel,#story .sw.sel{background:#1f5fbf22}#sResult .w.bad{text-decoration:underline wavy}" +
    "#wPop{position:absolute;z-index:30;max-width:260px;background:#2b3440;color:#fff;border-radius:14px;padding:10px 14px;box-shadow:0 6px 18px #0004;text-align:center;font-size:15px}" +
    "#wPop:before{content:'';position:absolute;top:-8px;left:var(--ax,50%);margin-left:-8px;border:8px solid transparent;border-top:0;border-bottom-color:#2b3440}" +
    "#wPop b{display:block;font-size:20px;margin-bottom:2px}#wPop .d{color:#8fc1ff;font-size:15px}#wPop .m{margin-bottom:8px}#wPop button{background:#fff2;color:#fff;border:0;border-radius:10px;padding:6px 10px;margin:0 3px;font-size:14px}";
  document.head.appendChild(css);
  const wrap = () => {
    const big = $("sCard").querySelector(".big");
    if (!big || big.querySelector(".sw")) return;
    big.innerHTML = big.textContent.split(/(\s+)/).map(w => /[А-Яа-яЁё]/.test(w) ? `<span class="sw">${esc(w)}</span>` : esc(w)).join("");
    if (!$("sCard").querySelector(".swh")) $("sCard").insertAdjacentHTML("beforeend", `<div class="hint swh">Bấm vào từng từ gạch chân để nghe và xem nghĩa</div>`);
  };
  new MutationObserver(wrap).observe($("sCard"), { childList: true });
  wrap();

  // tốc độ: 🐢 Chậm = 0.6× bản thường, áp dụng cho cả file mp3 lẫn giọng máy
  const SLOW = 0.6, orig = window.say;
  let rate = 1;
  window.say = t => { rate = 1; orig(t); };
  const sayAt = (t, r) => { rate = r; orig(t); };
  window.__setRate = r => { rate = r; };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { this.playbackRate = rate; return play.apply(this, arguments); };
  if (window.speechSynthesis) {
    const spk = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = u => { u.rate = (u.rate || 1) * rate; spk(u); };
  }
  const L = $("sListen");
  L.textContent = "🔊 Thường";
  L.insertAdjacentHTML("beforebegin", `<button id="sSlow">🐢 Chậm</button>`);
  L.onclick = () => sayAt(sp.ru, 1);
  $("sSlow").onclick = () => sayAt(sp.ru, SLOW);

  // ưu tiên file mp3 giọng thật nếu có
  const clean = el => el.textContent.replace(/[.,!?;:«»„“"()—–/…]/g, "").trim();
  const spoken = w => { const lo = w.toLowerCase(); return AU[lo.replace(/́/g, "")] ? lo : w; };
  const D = window.TU_DIEN || {};
  const pop = document.createElement("div");
  pop.id = "wPop"; pop.className = "hide"; document.body.appendChild(pop);
  let cur = null;
  const close = () => { pop.classList.add("hide"); if (cur) cur.classList.remove("sel"); cur = null; };
  function open(el) {
    close(); cur = el; el.classList.add("sel");
    const w = clean(el), key = w.toLowerCase().replace(/́/g, "");
    const d = window.docTu && /\u0301|ё/i.test(w) ? docTu(w) : "";
    pop.innerHTML = `<b>${esc(w)}</b>${d ? `<div class="d">[${esc(d)}]</div>` : ""}<div class="m">${esc(D[key] || "(chưa có nghĩa riêng, xem nghĩa cả câu bên dưới)")}</div>` +
      `<button data-r="${SLOW}">🐢 Chậm</button><button data-r="1">🔊 Thường</button>`;
    pop.classList.remove("hide");
    const r = el.getBoundingClientRect(), pw = pop.offsetWidth;
    const left = Math.max(8, Math.min(innerWidth - pw - 8, r.left + r.width / 2 - pw / 2));
    pop.style.left = left + "px"; pop.style.top = (r.bottom + scrollY + 10) + "px";
    pop.style.setProperty("--ax", (r.left + r.width / 2 - left) + "px");
    sayAt(spoken(w), 1);
  }
  pop.onclick = e => { const b = e.target.closest("[data-r]"); if (b && cur) sayAt(spoken(clean(cur)), +b.dataset.r); };
  document.addEventListener("click", e => {
    if (pop.contains(e.target)) return;
    const w = e.target.closest("#sCard .sw,#sResult .w,#story .sw");
    w && w !== cur ? open(w) : close();
  }, true);
  window.addEventListener("scroll", close, { passive: true });
})();
