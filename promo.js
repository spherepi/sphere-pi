/* PiSphere · promo.js
   Promo video shown when the app opens. */
"use strict";

function afterPromo() {
  S.promoSeen = true; save();
  /* Inside Pi Browser the person is checked with Pi every time the app opens. */
  var known = C.testLogin && S.user;   /* test login on: someone already entered on this device, let them straight in */
  if (window.Pi && !piSession && !known) { ui.view = "signin"; render(); piGo(); return; }
  ui.view = !S.user ? "signin" : (!S.user.profile ? "profile" : "app"); render();
}
function promoView() {
  var skip = h("button", { class: "btn flat sm", onclick: afterPromo, text: t("skip") });
  var v = h("video", { src: "promo.mp4", autoplay: true, playsInline: true, playsinline: true, "aria-label": "PiSphere promo" });
  v.addEventListener("ended", afterPromo);
  v.addEventListener("error", function () { skip.textContent = t("cont"); });
  /* Phones refuse to start sound before the first touch. If that happens, play silently and switch the sound on at the first touch. */
  function unmute() { v.muted = false; if (v.paused) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } }
  setTimeout(function () {
    v.muted = false;
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      v.muted = true; var q = v.play(); if (q && q.catch) q.catch(function () { skip.textContent = t("cont"); });
      v.addEventListener("pointerdown", unmute, { once: true });
      document.addEventListener("pointerdown", function once() { document.removeEventListener("pointerdown", once); if (ui.view === "promo") unmute(); });
    });
  }, 0);
  return h("div", { class: "promo" }, v, h("div", { class: "promo-bar" }, skip), footer(true));
}
