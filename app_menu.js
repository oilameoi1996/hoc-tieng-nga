// Các mục chuyển vào thanh bên mở bằng nút ☰ để không che nội dung chính
(function () {
  const tabs = $("tabs"), h1 = document.querySelector("h1");
  const css = document.createElement("style");
  css.textContent = "#topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;background:var(--bg);padding:8px 0;margin:-8px 0 8px}" +
    "#topbar button{font-size:24px;line-height:1;padding:6px 12px;border:0;background:none}#topbar b{font-size:19px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#drawer{position:fixed;top:0;bottom:0;left:0;width:min(80vw,300px);z-index:31;background:#141414;color:#eee;transform:translateX(-102%);transition:transform .25s;overflow-y:auto;padding:20px 12px}" +
    "#drawer.open{transform:none}#drawer h2{margin:4px 8px 16px;font-size:24px}" +
    "#drawer #tabs{flex-direction:column;flex-wrap:nowrap;gap:2px;margin:0}#drawer #tabs button{background:none;border:0;color:#eee;text-align:left;padding:13px 12px;font-size:17px;border-radius:12px}" +
    "#drawer #tabs :is([data-m=lesson],[data-m=nv],[data-m=game],[data-m=alpha]){display:none}#drawer #tabs button.on{background:#3a3a3c;color:#fff}#scrim{position:fixed;inset:0;z-index:30;background:#0008;display:none}#scrim.open{display:block}";
  document.head.appendChild(css);
  const bar = document.createElement("div");
  bar.id = "topbar"; bar.innerHTML = `<button id="menuBtn" aria-label="Mở danh sách mục">☰</button><b id="menuTitle"></b>`;
  h1.before(bar); h1.style.display = "none";
  const dr = document.createElement("nav");
  dr.id = "drawer"; dr.innerHTML = `<h2>${h1.innerHTML}</h2>`;
  dr.appendChild(tabs); document.body.appendChild(dr);
  const scrim = document.createElement("div"); scrim.id = "scrim"; document.body.appendChild(scrim);
  const title = () => { const on = tabs.querySelector("button.on"); $("menuTitle").textContent = on ? on.textContent : h1.textContent; };
  const toggle = open => { dr.classList.toggle("open", open); scrim.classList.toggle("open", open); };
  $("menuBtn").onclick = () => toggle(true);
  scrim.onclick = () => toggle(false);
  tabs.addEventListener("click", e => { if (e.target.closest("button")) { toggle(false); setTimeout(title); window.scrollTo(0, 0); } });
  title();
})();
