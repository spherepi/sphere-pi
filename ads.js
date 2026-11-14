/* PiSphere · ads.js
   Local ads: which ads show where, the ad card, and the running strip under the header. */
"use strict";

function activeAds(place) {
  var d = today(), city = S.user && S.user.profile ? S.user.profile.city.toLowerCase() : "";
  return S.ads.filter(function (a) {
    return a.places[place] && (!a.from || a.from <= d) && (!a.to || a.to >= d) && (!a.city || a.city.toLowerCase() === city);
  });
}
function adCard(a) {
  return h("article", { class: "card ad" },
    h("span", { class: "tag", style: "align-self:flex-start", text: t("sponsored").toUpperCase() }),
    h("b", { text: a.title }), a.text ? h("p", { class: "txt", text: a.text }) : null,
    a.link ? h("span", { class: "sub", text: a.link }) : null);
}

var tickSig = "";
function updateTicker(show) {
  if (!show) { hosts.tick.replaceChildren(); tickSig = ""; return; }
  var ads = activeAds("ticker"), k = ticker();
  var text = ads.length ? ads.map(function (a) { return a.title + (a.text ? " \u00b7 " + a.text : "") + (a.link ? " \u00b7 " + a.link : ""); }).join("     \u2022     ") : t("ad_default");
  var speed = Math.min(200, Math.max(15, Number(k.speed) || 45));
  var sig = [text, k.bg, k.fg, speed, S.lang].join("|");
  if (sig === tickSig) return;
  tickSig = sig;
  function unit() { return h("span", { class: "tick-unit", text: text }); }
  var g1 = h("span", { class: "tick-grp" }, unit()), track = h("div", { class: "tick-track" }, g1), win = h("div", { class: "tick-win" }, track);
  track.style.color = k.fg;
  var box = h("div", { class: "ticker" }, h("span", { class: "tag", text: t("ad") }), win); box.style.background = k.bg;
  hosts.tick.replaceChildren(box);
  requestAnimationFrame(function () {
    var w = g1.offsetWidth, W = win.offsetWidth; if (!w || !W) return;
    for (var n = Math.ceil(W / w) + 1, i = 1; i < n; i++) g1.appendChild(unit());
    var g2 = g1.cloneNode(true); g2.setAttribute("aria-hidden", "true"); track.appendChild(g2);
    track.style.animationDuration = (g1.offsetWidth / speed).toFixed(2) + "s"; track.classList.add("go");
  });
}
