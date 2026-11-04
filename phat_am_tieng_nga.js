/* PHÁT ÂM TIẾNG NGA cho các file bài giảng HTML.
 * Cách dùng: thêm 1 dòng trước </body> của file HTML:
 *   <script src="../04_cong_cu_ho_tro/phat_am_tieng_nga.js"></script>
 * Mọi đoạn chữ Nga trên trang thành nút bấm: bấm vào là nghe (giọng ru-RU của trình duyệt).
 * Không cần mạng nếu Windows đã cài giọng tiếng Nga; Chrome/Edge có sẵn giọng Nga online.
 */
(function () {
  if (!window.speechSynthesis) return banner("Trình duyệt này không hỗ trợ đọc giọng nói. Hãy mở file bằng Chrome hoặc Edge.");

  var voice = null;
  function pickVoice() {
    var ru = speechSynthesis.getVoices().filter(function (v) { return /^ru/i.test(v.lang); });
    // Ưu tiên giọng tự nhiên (Edge "Natural", Chrome "Google") rồi mới tới giọng hệ thống
    voice = ru.find(function (v) { return /natural|google/i.test(v.name); }) || ru[0] || null;
    return voice;
  }
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
  // Danh sách giọng nạp chậm; sau 2 giây vẫn không có giọng Nga thì báo cách khắc phục
  setTimeout(function () {
    if (!pickVoice()) banner("Máy chưa có giọng đọc tiếng Nga nên bấm sẽ không có tiếng. Cách sửa: mở file bằng Microsoft Edge hoặc Google Chrome (có giọng Nga online), hoặc vào Windows Settings → Time & Language → Speech → Add voices → Русский.");
  }, 2000);

  function say(text) {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text.replace(/́/g, ""));
    u.lang = "ru-RU"; u.rate = 0.8;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  window.sayRu = say;

  var css = document.createElement("style");
  css.textContent = ".ru-say{cursor:pointer;border-bottom:1px dotted #2a6fdb;border-radius:3px}" +
    ".ru-say:hover{background:#e3edff}.ru-say::after{content:' 🔊';font-size:.75em;opacity:.6}" +
    "#ru-banner{position:fixed;left:0;right:0;bottom:0;padding:10px 14px;background:#fff3cd;color:#5c4400;font:14px sans-serif;z-index:9999;border-top:1px solid #e0c060}";
  document.head.appendChild(css);

  // Một "cụm" tiếng Nga: bắt đầu bằng chữ Cyrillic, có thể gồm khoảng trắng, dấu câu, dấu trọng âm
  var RU = /[А-Яа-яЁё][А-Яа-яЁё́\-]*(?:[ ,.!?:;—–]+[А-Яа-яЁё][А-Яа-яЁё́\-]*)*[.!?]?/g;
  var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, TITLE: 1 };
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      for (var p = n.parentNode; p && p !== document.body; p = p.parentNode)
        if (SKIP[p.nodeName] || (p.classList && p.classList.contains("ru-say"))) return NodeFilter.FILTER_REJECT;
      return /[А-Яа-яЁё]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (n) {
    var s = n.nodeValue, frag = document.createDocumentFragment(), last = 0, m;
    RU.lastIndex = 0;
    while ((m = RU.exec(s))) {
      frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      var sp = document.createElement("span");
      sp.className = "ru-say"; sp.title = "Bấm để nghe"; sp.textContent = m[0];
      frag.appendChild(sp);
      last = m.index + m[0].length;
    }
    frag.appendChild(document.createTextNode(s.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".ru-say");
    if (t) { e.preventDefault(); say(t.textContent); }
  });

  function banner(msg) {
    var b = document.createElement("div");
    b.id = "ru-banner"; b.textContent = "🔇 " + msg + "  (bấm để ẩn)";
    b.onclick = function () { b.remove(); };
    document.body.appendChild(b);
  }
})();
