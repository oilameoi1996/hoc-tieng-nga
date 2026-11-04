// Cách đọc gần đúng theo kiểu chữ Việt từ chữ Nga có dấu trọng âm, ví dụ тебя́ → ti-BIA (âm tiết in hoa = nhấn)
window.docTu = function (w) {
  const C = { б: "b", в: "v", г: "g", д: "đ", ж: "j", з: "z", й: "i", к: "k", л: "l", м: "m", н: "n", п: "p", р: "r", с: "x", т: "t", ф: "ph", х: "kh", ц: "ts", ч: "ch", ш: "s", щ: "sh", ь: "", ъ: "" };
  const V = "аеёиоуыэюя", u = [];
  for (const ch of w.toLowerCase()) {
    if (ch === "́") { const l = u[u.length - 1]; if (l && l.v) l.s = 1; continue; }
    if (V.includes(ch) || C[ch] !== undefined) u.push({ c: ch, v: V.includes(ch) });
  }
  const vs = u.filter(x => x.v);
  if (!vs.some(x => x.s)) { const yo = vs.find(x => x.c === "ё"); if (yo) yo.s = 1; else if (vs.length === 1) vs[0].s = 1; }
  const syl = []; let cons = [];
  u.forEach((x, i) => {
    if (!x.v) { if (x.c === "й" && syl.length && !cons.length) syl[syl.length - 1].t += "i"; else if (C[x.c]) cons.push(C[x.c]); return; }
    const p = u[i - 1], soft = !p || p.v || p.c === "ь" || p.c === "ъ";
    const m = { а: "a", и: "i", у: "u", ы: "ư", э: "e", о: x.s ? "ô" : "a", ё: "iô", ю: "iu", я: "ia", е: x.s || soft ? "iê" : "i" }[x.c];
    // giữa hai nguyên âm có từ 2 phụ âm: phụ âm đầu thuộc về âm tiết trước (мед-ве́дь)
    if (syl.length && cons.length > 1) syl[syl.length - 1].t += cons.shift();
    syl.push({ t: cons.join("") + m, s: x.s }); cons = [];
  });
  if (cons.length && syl.length) syl[syl.length - 1].t += cons.join("");
  return syl.map(s => s.s ? s.t.toUpperCase() : s.t).join("-");
};
console.assert(docTu("тебя́") === "ti-BIA" && docTu("приве́т") === "pri-VIÊT" && docTu("молоко́") === "ma-la-KÔ", "docTu self-check");
