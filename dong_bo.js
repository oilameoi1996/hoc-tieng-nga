// Đồng bộ tiến độ (mọi thứ trong localStorage) giữa web và app qua tài khoản Google: Firebase Auth + Firestore.
// Cần firebase_goi.js và firebase_cau_hinh.js nạp trước file này.
(function () {
  var LS = localStorage, META = "__dongBo", CH = window.FIREBASE_CAU_HINH, ONLINE = window.WEB_ONLINE || "";
  var bo = function (k) { return !k || k === META || k.indexOf("firebase") === 0 || /^__.*__$/.test(k); };
  var bam = function (s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };

  // gộp hai bản cùng bị sửa: danh sách lấy hợp, số lấy lớn hơn, còn lại giữ bản của máy này
  function gop(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      var m = new Map(); b.concat(a).forEach(function (x) { m.set(JSON.stringify(x), x); }); return Array.from(m.values());
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
      var o = {}; Object.keys(b).concat(Object.keys(a)).forEach(function (k) { o[k] = k in a && k in b ? gop(a[k], b[k]) : k in a ? a[k] : b[k]; }); return o;
    }
    return typeof a === "number" && typeof b === "number" ? Math.max(a, b) : a;
  }
  function gopChuoi(a, b) { try { return JSON.stringify(gop(JSON.parse(a), JSON.parse(b))); } catch (e) { return a; } }

  // so 3 bên: máy này, trên mạng, và lần đồng bộ trước (meta) để biết bên nào đã đổi
  function tron(local, meta, remote, now) {
    var h = meta.h || {}, t = meta.t || {}, rd = remote.d || {}, rt = remote.t || {};
    var ghi = {}, gui = { d: {}, t: {} }, m = { uid: meta.uid, h: {}, t: {} };
    Object.keys(rd).concat(Object.keys(local)).forEach(function (k) {
      if (bo(k) || k in m.h) return;
      var lv = local[k], rv = rd[k], v;
      var lDoi = lv !== undefined && h[k] !== bam(lv), rDoi = rv !== undefined && (rt[k] || 0) !== (t[k] || 0);
      if (rv === undefined) v = lv; // shortcut: xoá một mục không được đồng bộ (máy khác vẫn còn thì lấy về lại)
      else if (lv === undefined || lv === rv) v = rv;
      else if (lDoi && rDoi) v = gopChuoi(lv, rv);
      else v = lDoi ? lv : rv;
      if (v !== lv) ghi[k] = v;
      if (v !== rv) { gui.d[k] = v; gui.t[k] = now; }
      m.h[k] = bam(v); m.t[k] = v !== rv ? now : rt[k] || 0;
    });
    return { ghi: ghi, gui: gui, meta: m };
  }
  window.__dongBoTron = tron; // để tự kiểm tra

  var nut, user = null, auth, db, dang = false, lai = false, hen = 0, tuGhi = false, lanCuoi = "";
  function hien(chu, tieuDe) { if (nut) { nut.textContent = chu; nut.title = tieuDe || ""; } }
  function docMeta() { try { return JSON.parse(LS.getItem(META)) || {}; } catch (e) { return {}; } }

  function dongBo(moMay) {
    if (!user) return Promise.resolve();
    if (dang) { lai = true; return Promise.resolve(); }
    dang = true; hien("☁⏳", "Đang đồng bộ…");
    var ref = FB.doc(db, "tien_do_tieng_nga", user.uid);
    return FB.getDoc(ref).then(function (snap) {
      var local = {}, meta = docMeta();
      if (meta.uid !== user.uid) meta = { uid: user.uid }; // đổi tài khoản: coi như lần đầu, gộp hết
      for (var i = 0; i < LS.length; i++) { var k = LS.key(i), v = LS.getItem(k); if (!bo(k) && v.length < 300000) local[k] = v; }
      var r = tron(local, meta, snap.exists() ? snap.data() : {}, Date.now());
      r.meta.uid = user.uid;
      var p = Object.keys(r.gui.d).length ? FB.setDoc(ref, r.gui, { merge: true }) : null;
      return Promise.resolve(p).then(function () {
        tuGhi = true;
        try { Object.keys(r.ghi).forEach(function (k) { LS.setItem(k, r.ghi[k]); }); LS.setItem(META, JSON.stringify(r.meta)); } finally { tuGhi = false; }
        lanCuoi = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        hien("☁✓", "Đã đồng bộ lúc " + lanCuoi);
        // vừa mở: có tiến độ từ máy khác thì nạp lại trang để hiện đúng (mỗi phiên tối đa 1 lần)
        if (moMay && Object.keys(r.ghi).length && !sessionStorage.getItem("dongBoTaiLai")) {
          sessionStorage.setItem("dongBoTaiLai", "1"); location.reload();
        }
      });
    }).catch(function (e) { console.warn("dong bo", e); hien("☁⚠", "Chưa đồng bộ được (mất mạng?). Sẽ thử lại."); })
      .then(function () { dang = false; if (lai) { lai = false; henGio(); } });
  }
  function henGio() { if (!hen) hen = setTimeout(function () { hen = 0; dongBo(); }, 20000); }

  function dangNhapToken(t) {
    if (!auth || !t) return;
    hien("☁⏳", "Đang đăng nhập…");
    FB.signInWithCredential(auth, FB.GoogleAuthProvider.credential(t)).catch(function (e) {
      alert("Đăng nhập không được: " + (e.code || e.message) + "\nThử bấm ☁ đăng nhập lại."); hien("☁", "Đăng nhập Google để đồng bộ");
    });
  }
  // shortcut: không có nonce, app khác có thể gửi token của tài khoản khác qua deep link; thêm nonce nếu app được phát hành rộng
  window.__dangNhapApp = dangNhapToken;

  function bamNut() {
    if (!CH) return alert("Chưa gắn cấu hình Firebase (file firebase_cau_hinh.js).");
    if (user) {
      if (confirm("Đang đồng bộ tiến độ với " + (user.email || "tài khoản Google") + (lanCuoi ? "\nLần cuối: " + lanCuoi : "") + "\n\nĐăng xuất khỏi máy này?")) FB.signOut(auth);
      else dongBo();
      return;
    }
    if (window.Android) { location.href = ONLINE + "dang_nhap_app.html"; return; } // app mở Chrome để đăng nhập
    if (!/^https?:/.test(location.protocol)) {
      if (confirm("Trang đang mở từ file trên máy nên không đăng nhập Google được.\nMở bản online để học và đồng bộ?")) window.open(ONLINE, "_blank");
      return;
    }
    var gg = new FB.GoogleAuthProvider(); gg.setCustomParameters({ prompt: "select_account" });
    FB.signInWithPopup(auth, gg, FB.browserPopupRedirectResolver).catch(function (e) {
      if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") alert("Đăng nhập không được: " + (e.code || e.message));
    });
  }

  // ghi gì vào localStorage thì trong vòng 20 giây sẽ đồng bộ (học xong một phần là lên mạng)
  var _set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { _set.call(this, k, v); if (this === LS && !tuGhi && !bo(k)) henGio(); };
  // rời trang/app thì đẩy lên ngay; quay lại thì kéo về (app Android gọi 2 hàm này ở onPause/onResume)
  window.__dongBoDong = function () { clearTimeout(hen); hen = 0; dongBo(); };
  window.__dongBoMo = function () { dongBo(true); };
  document.addEventListener("visibilitychange", function () { if (document.hidden) __dongBoDong(); else __dongBoMo(); });

  function gan() {
    nut = document.createElement("button");
    nut.id = "dongBoBtn"; nut.type = "button"; nut.onclick = bamNut;
    nut.style.cssText = "border:0;background:none;font-size:18px;padding:6px 8px;cursor:pointer;white-space:nowrap";
    var top = document.getElementById("topbar");
    if (top) top.appendChild(nut);
    else { nut.style.cssText += ";position:fixed;top:8px;right:10px;z-index:40;background:#fff;border-radius:16px;box-shadow:0 1px 4px #0003"; document.body.appendChild(nut); }
    hien("☁", "Đăng nhập Google để đồng bộ tiến độ giữa web và điện thoại");
  }

  function batDau() {
    gan();
    if (!CH || !window.FB) return;
    var app = FB.initializeApp(CH);
    auth = FB.initializeAuth(app, { persistence: [FB.indexedDBLocalPersistence, FB.browserLocalPersistence] });
    db = FB.getFirestore(app);
    if (window.FIREBASE_EMU) { FB.connectAuthEmulator(auth, "http://" + FIREBASE_EMU.auth, { disableWarnings: true }); FB.connectFirestoreEmulator(db, FIREBASE_EMU.host, FIREBASE_EMU.port); }
    FB.onAuthStateChanged(auth, function (u) {
      user = u;
      if (u) dongBo(true); else hien("☁", "Đăng nhập Google để đồng bộ tiến độ giữa web và điện thoại");
    });
    // app vừa được Chrome mở lại kèm mã đăng nhập (app đã bị tắt trước đó)
    if (window.Android && Android.layTokenDangNhap) dangNhapToken(Android.layTokenDangNhap());
  }
  if (document.readyState === "complete") batDau(); else addEventListener("load", batDau);
})();
