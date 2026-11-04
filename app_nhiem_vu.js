// Tab "Nhiệm vụ": nhiệm vụ tháng, nhiệm vụ hằng ngày có rương thưởng, và thống kê hoạt động
(function () {
  const pad = n => String(n).padStart(2, "0");
  const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let nv = store.get("nhiemVu", { days: {}, totalKn: 0 });
  nv.gems = nv.gems || 0; nv.freeze = nv.freeze || 0; nv.frozen = nv.frozen || []; nv.badgeGems = nv.badgeGems || {};
  const FREEZE_MAX = 10, SHOP = [{ n: 1, cost: 50, t: "Đóng băng streak 1 ngày" }, { n: 7, cost: 300, t: "Gói đóng băng 1 tuần (7 ngày)" }];
  const day = () => nv.days[dkey(new Date())] = nv.days[dkey(new Date())] || { kn: 0, sec: 0, buoi: 0, open: [], ok: {}, act: {}, tab: {}, upd: 0, q: pick(dkey(new Date())) };
  const save = () => store.set("nhiemVu", nv);
  const N = (o, k) => (o || {})[k] || 0;
  // kho nhiệm vụ; mỗi ngày bốc ngẫu nhiên 3 cái theo ngày nên ngày nào cũng khác
  const POOL = [
    { t: "Kiếm 20 KN", goal: 20, val: d => d.kn },
    { t: "Kiếm 30 KN", goal: 30, val: d => d.kn },
    { t: "Kiếm 50 KN", goal: 50, val: d => d.kn },
    { t: "Học trong 5 phút", goal: 5, val: d => Math.floor(d.sec / 60) },
    { t: "Học trong 10 phút", goal: 10, val: d => Math.floor(d.sec / 60) },
    { t: "Học trong 15 phút", goal: 15, val: d => Math.floor(d.sec / 60) },
    { t: "Học xong buổi tiếp theo trong lộ trình", goal: 1, val: d => d.buoi },
    { t: "Trả lời đúng 10 câu Trắc nghiệm", goal: 10, val: d => N(d.ok, "quiz") },
    { t: "Điền đúng 8 câu ở Điền từ", goal: 8, val: d => N(d.ok, "fill") },
    { t: "Sắp xếp đúng 5 câu", goal: 5, val: d => N(d.ok, "order") },
    { t: "Ghép đúng 5 từ ở Ghép chữ", goal: 5, val: d => N(d.ok, "spell") },
    { t: "Nghe và chọn đúng 8 chữ", goal: 8, val: d => N(d.ok, "listen") },
    { t: "Lật 20 thẻ câu giao tiếp", goal: 20, val: d => N(d.act, "flash") },
    { t: "Tìm 6 cặp ở Lật cặp", goal: 6, val: d => N(d.act, "mem") },
    { t: "Đoán đúng 10 chữ cái", goal: 10, val: d => N(d.ok, "alpha") },
    { t: "Tập viết đúng 3 chữ cái", goal: 3, val: d => N(d.ok, "viet") },
    { t: "Chơi Đẩy lùi quái vật 5 phút", goal: 5, val: d => Math.floor(N(d.tab, "game") / 60) },
    { t: "Cập nhật từ vựng mới 1 lần", goal: 1, val: d => d.upd || 0 },
    { t: "Đúng 8 từ khi Kiểm tra từ mới", goal: 8, val: d => N(d.ok, "vocab") },
  ];
  function pick(k) {
    let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const ids = POOL.map((_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids.slice(0, 3);
  }
  const quests = d => d.q.map(i => POOL[i]);
  const MONTH_GOAL = 70, QUEST_PTS = 1;
  const doneCount = d => quests(d).filter(q => q.val(d) >= q.goal).length;

  function addKn(n) { day().kn += n; nv.totalKn += n; save(); if (!box.classList.contains("hide")) render(); }
  // KN: +1 mỗi lần làm bài, +3 mỗi câu đúng; học xong một buổi +10
  const _ms = window.markStudy, _ce = window.celebrate, _set = store.set;
  let cur = store.get("mode", "lesson");
  const inc = (o, k) => { const d = day(); d[o][k] = (d[o][k] || 0) + 1; };
  // lỡ bỏ ngày: nếu đủ đóng băng thì tự dùng để giữ streak (trang gốc reset streak khi ngày học trước không phải hôm qua)
  function useFreeze() {
    const s = store.get("streak", { day: "", n: 0 }), now = new Date();
    if (!s.day || !s.n) return;
    const last = new Date(s.day), gap = Math.round((new Date(now.toDateString()) - new Date(last.toDateString())) / 864e5) - 1;
    if (gap < 1 || gap > nv.freeze) return;
    for (let i = 1; i <= gap; i++) { const t = new Date(last); t.setDate(last.getDate() + i); nv.frozen.push(dkey(t)); }
    nv.freeze -= gap; save();
    _set.call(store, "streak", { day: new Date(now - 864e5).toDateString(), n: s.n });
    setTimeout(() => alert(`🧊 Đã dùng ${gap} đóng băng để giữ chuỗi ${s.n} ngày học!`), 300);
  }
  window.markStudy = function () { useFreeze(); inc("act", cur); addKn(1); return _ms.apply(this, arguments); };
  window.celebrate = function () { inc("ok", cur); addKn(3); return _ce.apply(this, arguments); };
  let buoiN = store.get("buoiDone", []).length;
  store.set = function (k, v) {
    if (k === "buoiDone") { if (v.length > buoiN) { day().buoi++; addKn(10); } buoiN = v.length; }
    if (k === "vocabBatches") { day().upd++; save(); }
    return _set.call(this, k, v);
  };
  setInterval(() => { if (!document.hidden) { const d = day(); d.sec += 10; d.tab[cur] = (d.tab[cur] || 0) + 10; save(); if (!box.classList.contains("hide")) render(); } }, 10000);

  const css = document.createElement("style");
  css.textContent = "#nv{--pk:#d0609f}#nv .hd{background:var(--pk);color:#fff;border-radius:14px;padding:18px 16px 16px;margin-bottom:16px}" +
    "#nv .hd h2{margin:0;font-size:24px}#nv .hd .tm{opacity:.9;font-weight:600;font-size:14px;margin:4px 0 12px}" +
    "#nv .mb{background:#1d2226;border-radius:12px;padding:14px;color:#fff}#nv .mb b{display:block;margin-bottom:8px;font-size:17px}" +
    "#nv .pb{position:relative;height:22px;background:#3a4147;border-radius:11px;overflow:hidden}#nv .pb i{position:absolute;inset:0 auto 0 0;background:var(--pk);border-radius:11px}" +
    "#nv .pb span{position:absolute;inset:0;text-align:center;font-size:13px;font-weight:700;line-height:22px;color:#fff}" +
    "#nv .sec{display:flex;justify-content:space-between;color:var(--mute);font-weight:700;font-size:13px;letter-spacing:.5px;margin:18px 2px 8px}" +
    "#nv .q{display:flex;gap:12px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px}" +
    "#nv .q .tx{flex:1;min-width:0}#nv .q .tx div{font-weight:600;margin-bottom:6px}" +
    "#nv .ch{font-size:40px;line-height:1;border:0;background:none;padding:4px}#nv .ch.lock{filter:grayscale(1);opacity:.45}" +
    "#nv .ch.ready{animation:nvb 1s infinite}@keyframes nvb{50%{transform:scale(1.15) rotate(-6deg)}}" +
    "#nv .st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#nv .st div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center}" +
    "#nv .st b{display:block;font-size:20px}#nv .st small{color:var(--mute)}" +
    "#nv .wk{display:flex;gap:6px;align-items:flex-end;height:120px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px}" +
    "#nv .wk div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;font-size:11px;color:var(--mute)}" +
    "#nv .wk i{display:block;width:100%;background:var(--pk);border-radius:4px 4px 0 0;min-height:2px}#nv .wk .td{color:var(--ink);font-weight:700}" +
    "#nv .sk{display:flex;align-items:center;justify-content:space-between;background:#1d2226;color:#fff;border-radius:14px;padding:16px 20px;margin-bottom:8px}" +
    "#nv .sk b{font-size:52px;color:#ff4b4b;line-height:1}#nv .sk small{display:block;color:#ff6b5b;font-weight:700;font-size:18px}#nv .sk .fl{font-size:64px}" +
    "#nv .cal{background:#1d2226;color:#fff;border-radius:14px;padding:12px}#nv .cal .nav{display:flex;justify-content:space-between;align-items:center;font-weight:700;margin-bottom:8px}" +
    "#nv .cal .nav button{background:none;border:0;color:#9aa;font-size:22px;padding:2px 12px}" +
    "#nv .cal .g{display:grid;grid-template-columns:repeat(7,1fr);row-gap:6px;text-align:center}#nv .cal .h{color:#8a949c;font-weight:700;font-size:13px}" +
    "#nv .cal .c{height:34px;line-height:34px;font-weight:700;color:#5d6870}#nv .cal .c.ms{color:#e04b4b;background:#3a2328}#nv .cal .c.on{color:#2a1208;background:linear-gradient(#ffa13c,#f0453a)}" +
    "#nv .cal .c.l{border-radius:17px 0 0 17px}#nv .cal .c.r{border-radius:0 17px 17px 0}#nv .cal .c.l.r{border-radius:17px}#nv .cal .c.td{box-shadow:inset 0 0 0 2px #fff}" +
    "#nv .cal .c.fz{background:#2b6ca3;color:#fff}#nv .gm{display:flex;gap:8px;margin-bottom:12px}#nv .gm span{flex:1;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center;font-weight:700;font-size:18px}" +
    "#nv .shop{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px}#nv .shop .tx{flex:1}#nv .shop .tx small{color:var(--mute);display:block}" +
    "#nv .cal .sum{margin-top:10px;font-size:14px;color:#cfd6db;text-align:center}" +
    "#nv .bd{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center}#nv .bd div{font-size:13px;font-weight:700}" +
    "#nv .bd i{display:flex;align-items:center;justify-content:center;width:72px;height:72px;margin:0 auto 4px;border-radius:50%;font-size:38px;font-style:normal;background:radial-gradient(#fff6,#0000) ,var(--bc);border:4px solid #fff8}" +
    "#nv .bd .no i{filter:grayscale(1);opacity:.35}#nv .bd .no{color:var(--mute)}#nv .bd .lk i{background:#3a4147;font-size:30px}";
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.dataset.m = "nv"; btn.textContent = "🎁 Nhiệm vụ";
  $("tabs").insertBefore(btn, $("tabs").children[1]);
  const box = document.createElement("div");
  box.id = "nv"; box.className = "hide";
  $("res").before(box);

  const MONTHS = ["Một", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Mười Hai"];
  const BADGE = [["❄️", "#7cc4ff"], ["💝", "#ff8fb1"], ["🌸", "#ffb3d1"], ["🌧️", "#8fb8ff"], ["🌼", "#ffe066"], ["☀️", "#ffb347"],
    ["🏖️", "#5ed3c5"], ["🍉", "#7bd88f"], ["📚", "#b48cff"], ["🍂", "#ff9f5a"], ["🪆", "#ff6b6b"], ["🎄", "#4cc782"]];
  const studied = k => ((nv.days[k] || {}).kn || 0) > 0;
  const monthPts = ym => Object.entries(nv.days).filter(([k]) => k.startsWith(ym)).reduce((s, [, x]) => s + doneCount(x) * QUEST_PTS, 0);
  let calOff = 0;
  function calendar(now) {
    const m = new Date(now.getFullYear(), now.getMonth() + calOff, 1), y = m.getFullYear(), mo = m.getMonth();
    const n = new Date(y, mo + 1, 0).getDate(), lead = (m.getDay() + 6) % 7, today = dkey(now);
    const key = i => `${y}-${pad(mo + 1)}-${pad(i)}`;
    let cells = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(h => `<div class="h">${h}</div>`).join("") + "<div></div>".repeat(lead);
    let done = 0, past = 0, frz = 0;
    for (let i = 1; i <= n; i++) {
      const k = key(i), on = studied(k), col = (lead + i - 1) % 7, isPast = k <= today;
      if (isPast) { past++; if (on) done++; else if (nv.frozen.includes(k)) frz++; }
      const prev = i > 1 && col > 0 && studied(key(i - 1)), next = i < n && col < 6 && studied(key(i + 1));
      const fz = !on && nv.frozen.includes(k);
      const cls = fz ? "fz l r" : on ? `on${prev ? "" : " l"}${next ? "" : " r"}` : isPast && k !== today ? "ms l r" : "";
      cells += `<div class="c ${cls}${k === today ? " td" : ""}">${fz ? "🧊" : i}</div>`;
    }
    const miss = past - done;
    const sum = !past ? "Tháng này chưa tới" : miss ? `Đã học ${done}/${past} ngày · thiếu ${miss} ngày${frz ? ` (đã đóng băng ${frz})` : ""}${calOff ? "" : " (tính tới hôm nay)"}` : `✅ Học đủ ${done}/${past} ngày`;
    return `<div class="cal"><div class="nav"><button data-cal="-1">‹</button><span>tháng ${mo + 1} năm ${y}</span><button data-cal="1" ${calOff >= 0 ? "disabled" : ""}>›</button></div>` +
      `<div class="g">${cells}</div><div class="sum">${sum}</div></div>`;
  }
  function badges(now) {
    const years = [...new Set([now.getFullYear(), ...Object.keys(nv.days).map(k => +k.slice(0, 4))])].sort((a, b) => b - a);
    return years.map(y => `<div class="sec"><span>HUY HIỆU ${y}</span></div><div class="bd">` + BADGE.map(([e, c], i) => {
      const ym = `${y}-${pad(i + 1)}`, cur = ym === dkey(now).slice(0, 7), fut = ym > dkey(now).slice(0, 7), got = monthPts(ym) >= MONTH_GOAL;
      return `<div class="${fut ? "lk no" : got ? "" : "no"}" style="--bc:${c}"><i>${fut ? "🔒" : e}</i>Tháng ${i + 1}${cur && !got ? `<br><small>${monthPts(ym)}/${MONTH_GOAL}</small>` : ""}</div>`;
    }).join("") + "</div>").join("");
  }
  const bar = (v, g) => `<div class="pb"><i style="width:${Math.min(100, v / g * 100)}%"></i><span>${Math.min(v, g)} / ${g}</span></div>`;

  function render() {
    const now = new Date(), d = day(), ym = dkey(now).slice(0, 7);
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
    const pts = monthPts(ym);
    // huy hiệu tháng thưởng 100 kim cương, mỗi tháng một lần
    if (pts >= MONTH_GOAL && !nv.badgeGems[ym]) { nv.badgeGems[ym] = 1; nv.gems += 100; save(); setTimeout(() => alert(`🏅 Nhận huy hiệu tháng ${now.getMonth() + 1}! +100 💎`), 300); }
    const mins = Math.ceil((new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now) / 60000);
    const left = mins >= 60 ? `${Math.floor(mins / 60)} GIỜ` : `${mins} PHÚT`;
    const week = [...Array(7)].map((_, i) => { const t = new Date(now); t.setDate(now.getDate() - 6 + i); return t; });
    const wkKn = week.map(t => (nv.days[dkey(t)] || {}).kn || 0), maxKn = Math.max(30, ...wkKn);
    const all = Object.values(nv.days), totMin = Math.floor(all.reduce((s, x) => s + x.sec, 0) / 60);
    const st = store.get("streak", { n: 0 }), words = store.get("vocabBatches", []).flat().length;
    box.innerHTML =
      `<div class="hd"><h2>Nhiệm vụ tháng ${MONTHS[now.getMonth()]}</h2><div class="tm">⏱ ${daysLeft} NGÀY</div>` +
      `<div class="mb"><b>${pts >= MONTH_GOAL ? `🏅 Đã nhận huy hiệu tháng ${now.getMonth() + 1}! ` : ""}Kiếm ${MONTH_GOAL} điểm nhiệm vụ để nhận huy hiệu ${BADGE[now.getMonth()][0]}</b>${bar(pts, MONTH_GOAL)}</div></div>` +
      `<div class="sec"><span>NHIỆM VỤ HẰNG NGÀY</span><span>⏱ ${left}</span></div>` +
      quests(d).map((q, i) => {
        const v = q.val(d), ok = v >= q.goal, op = d.open[i];
        return `<div class="q"><div class="tx"><div>${q.t}</div>${bar(v, q.goal)}</div>` +
          `<button class="ch ${op ? "" : ok ? "ready" : "lock"}" data-ch="${i}" ${ok && !op ? "" : "disabled"} title="Rương thưởng">${op ? "🎉" : "🎁"}</button></div>`;
      }).join("") +
      `<div class="sec"><span>KHO BÁU</span></div><div class="gm"><span>💎 ${nv.gems}</span><span>🧊 ${nv.freeze}/${FREEZE_MAX}</span></div>` +
      `<div class="sec"><span>STREAK</span></div><div class="sk"><div><b>${st.n}</b><small>ngày streak!</small></div><span class="fl">🔥</span></div>` +
      `<div class="sec"><span>LỊCH HỌC THEO THÁNG</span></div>${calendar(now)}` +
      `<div class="sec"><span>CỬA HÀNG</span></div>` +
      SHOP.map((it, i) => `<div class="shop"><span style="font-size:32px">🧊</span><div class="tx">${it.t}<small>Lỡ bỏ ngày học thì tự dùng để giữ streak. Giữ tối đa ${FREEZE_MAX}.</small></div>` +
        `<button data-buy="${i}" ${nv.gems < it.cost || nv.freeze + it.n > FREEZE_MAX ? "disabled" : ""}>💎 ${it.cost}</button></div>`).join("") +
      `<div class="sec"><span>HOẠT ĐỘNG 7 NGÀY (KN)</span><span>Hôm nay ${d.kn} KN</span></div>` +
      `<div class="wk">${week.map((t, i) => `<div class="${i === 6 ? "td" : ""}">${wkKn[i] || ""}<i style="height:${wkKn[i] / maxKn * 80}%"></i>${["CN", "T2", "T3", "T4", "T5", "T6", "T7"][t.getDay()]}</div>`).join("")}</div>` +
      `<div class="sec"><span>THÀNH TÍCH</span></div>` +
      `<div class="st"><div><b>🔥 ${st.n}</b><small>ngày liên tiếp</small></div><div><b>⚡ ${nv.totalKn}</b><small>tổng KN</small></div><div><b>⏱ ${totMin}</b><small>phút đã học</small></div>` +
      `<div><b>📚 ${store.get("buoiDone", []).length}</b><small>buổi đã xong</small></div><div><b>⭐ ${store.get("known", []).length}</b><small>câu đã thuộc</small></div><div><b>🆕 ${words}</b><small>từ mới đã mở</small></div></div>` +
      `<div class="sec"><span>HUY HIỆU THỬ THÁCH THÁNG</span></div>${badges(now)}` +
      `<p class="hint">Ngày có làm bài (có KN) được tô màu trên lịch. Kim cương 💎: mở rương được 5–15, nhận huy hiệu tháng được 100. KN: +1 mỗi lần làm bài, +3 mỗi câu đúng, +10 khi học xong một buổi. Mỗi nhiệm vụ ngày hoàn thành được ${QUEST_PTS} điểm nhiệm vụ tháng; đủ ${MONTH_GOAL} điểm trong tháng thì nhận huy hiệu tháng đó; mở rương để nhận thêm KN.</p>`;
  }

  box.onclick = e => {
    const by = e.target.closest("[data-buy]");
    if (by) { const it = SHOP[+by.dataset.buy]; if (nv.gems >= it.cost && nv.freeze + it.n <= FREEZE_MAX) { nv.gems -= it.cost; nv.freeze += it.n; save(); render(); } return; }
    const c = e.target.closest("[data-cal]"); if (c) { calOff = Math.min(0, calOff + +c.dataset.cal); render(); return; }
    const b = e.target.closest("[data-ch]"); if (!b || b.disabled) return;
    const d = day(), bonus = 5 + 5 * Math.floor(Math.random() * 3), gem = 5 + Math.floor(Math.random() * 11);
    nv.gems += gem;
    d.open[+b.dataset.ch] = true; save();
    _ce(b); addKn(bonus); render();
    setTimeout(() => alert(`🎁 Rương thưởng: +${gem} 💎 và +${bonus} KN!`), 300);
  };

  function show() {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b === btn));
    ["lesson", "alpha", "flash", "quiz", "speak", "fill", "order", "spell", "listen", "mem", "res", "game", "vocab"].forEach(id => $(id) && $(id).classList.add("hide"));
    box.classList.remove("hide"); _set.call(store, "mode", "nv"); render();
  }
  btn.onclick = show;
  $("tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; cur = b.dataset.m; if (b !== btn) box.classList.add("hide"); });
  if (store.get("mode", "") === "nv") show();
})();
