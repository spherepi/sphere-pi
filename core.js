/* PiSphere · core.js
   Shared basics: saved data, small helper tools, icons, press-and-hold. */
"use strict";

var C = window.PS_CONFIG, R = window.PS_RULES, L = window.PS_I18N;
var KEY = "pisphere_v1";
var root = document.getElementById("root");
function seed() {
  var now = Date.now();
  return {
    lang: null, promoSeen: false, user: null, sp: 0, hist: [], msgCount: 0, chatPaid: 0,
    rooms: [
      { id: "r1", type: "group", name: "Global Pioneers Hub", owner: "PiSphere", members: 1, pinned: true, msgs: [] },
      { id: "r2", type: "group", name: "Local Business Network", owner: "PiSphere", members: 1, pinned: false, msgs: [] },
      { id: "r3", type: "channel", name: "PiSphere Updates", owner: "PiSphere", members: 1, pinned: false,
        msgs: [{ id: "m1", by: "PiSphere", text: "Welcome. This channel carries app updates.", ts: now, likes: [], dislikes: [] }] }
    ],
    posts: [{ id: "p1", by: "PiSphere", text: "PiSphere is in test mode. Post, like, tip and tell us what breaks.", ts: now, likes: [], dislikes: [], pinned: false, paid: 0, voided: 0 }],
    meets: [], ads: [], claims: [], rules: {}, ticker: null,
    rewardDay: { d: "", n: 0 }, disDay: { d: "", n: 0 }, claimWeek: { d: "", n: 0 }, once: {}
  };
}
var S;
function load() {
  try { var raw = localStorage.getItem(KEY); if (raw) { S = Object.assign(seed(), JSON.parse(raw)); return; } } catch (e) {}
  S = seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function rules() { return Object.assign({}, C.rules, S.rules); }
function ticker() { return Object.assign({}, C.ticker, S.ticker || {}); }

var ui = { view: "promo", tab: "chats", sub: "dm", room: null, sheet: null, admin: false, editing: false, err: "" };
function t(k) { var d = L[S.lang] || {}; return d[k] != null ? d[k] : (L.en[k] != null ? L.en[k] : k); }
function today() { return new Date().toISOString().slice(0, 10); }
function uid(p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function me() { return S.user ? S.user.username : ""; }
function isPublic() { return !!(S.user && S.user.profile && S.user.profile.pub); }
function isAdmin() { return me().toLowerCase() === C.adminUsername.toLowerCase(); }
function clean(s, n) { return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n || 200); }
function cleanUser(s) { return String(s || "").replace(/^@+/, "").replace(/[^A-Za-z0-9_.]/g, "").slice(0, 30); }
function maskPhone(p) { p = String(p || ""); return p.length < 5 ? "••••" : p.slice(0, 2) + "••••••" + p.slice(-2); }
function maskMail(m) { var a = String(m || "").split("@"); return a.length < 2 ? "••••" : a[0].slice(0, 2) + "••••@" + a[1]; }
function initials(n) { return (String(n || "?").replace(/[^A-Za-z0-9]/g, "").slice(0, 2) || "?").toUpperCase(); }

function h(tag, props) {
  var el = document.createElement(tag), i, k;
  props = props || {};
  for (k in props) {
    if (props[k] == null || props[k] === false) continue;
    if (k === "class") el.className = props[k];
    else if (k === "text") el.textContent = props[k];
    else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), props[k]);
    else if (k === "value") el.value = props[k];
    else if (k === "checked" || k === "disabled" || k === "muted" || k === "autoplay" || k === "playsInline") el[k] = !!props[k];
    else el.setAttribute(k, props[k] === true ? "" : props[k]);
  }
  for (i = 2; i < arguments.length; i++) add(el, arguments[i]);
  return el;
}
function add(el, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
  el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
}
var ICON = {
  chat: "M4 5h16v11H9l-5 4z", meet: "M3 7h12v10H3zM15 10l6-3v10l-6-3", feed: "M4 5h16v14H4zM8 9h8M8 13h8",
  gift: "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  gear: "M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100",
  up: "M7 11v9H4v-9zM7 11l4-7c1.500 0 2.500 1 2.500 2.500V10h5a2 2 0 0 1 2 2.300l-1 6a2 2 0 0 1-2 1.700H7",
  down: "M7 13V4H4v9zM7 13l4 7c1.500 0 2.500-1 2.500-2.500V14h5a2 2 0 0 0 2-2.300l-1-6A2 2 0 0 0 17.500 4H7",
  share: "M14 5l6 6-6 6M20 11H9a5 5 0 0 0-5 5v3", pin: "M9 4h6l-1 6 3 3H7l3-3zM12 13v7", unpin: "M9 4h6l-1 6 3 3H7l3-3zM12 13v7M4 4l16 16",
  trash: "M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13", plus: "M12 5v14M5 12h14", back: "M15 5l-7 7 7 7",
  tip: "M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16M12 8v8M9 11l3-3 3 3", cam: "M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.500 3.500 0 1 0 0 7a3.500 3.500 0 0 0 0-7",
  play: "M4 5h16v14H4zM10 9l5 3-5 3z", list: "M5 6h14M5 12h14M5 18h8", flag: "M5 21V4h12l-2 4 2 4H5"
};
function ic(name, size) {
  var ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), p = document.createElementNS(ns, "path");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size || 20); s.setAttribute("height", size || 20);
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.8");
  s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
  p.setAttribute("d", ICON[name]); s.appendChild(p); return s;
}
function toast(msg) {
  var old = document.querySelector(".toast"); if (old) old.remove();
  var el = h("div", { class: "toast", role: "status", text: msg });
  document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2400);
}
/* press and hold; also right-click on a computer */
function hold(el, fn) {
  var timer = null, x = 0, y = 0;
  function stop() { if (timer) { clearTimeout(timer); timer = null; } }
  el.addEventListener("pointerdown", function (e) {
    x = e.clientX; y = e.clientY; stop();
    timer = setTimeout(function () { timer = null; el._held = true; fn(); }, 550);
  });
  el.addEventListener("pointermove", function (e) { if (Math.abs(e.clientX - x) > 10 || Math.abs(e.clientY - y) > 10) stop(); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (n) { el.addEventListener(n, stop); });
  el.addEventListener("click", function (e) { if (el._held) { el._held = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  el.addEventListener("contextmenu", function (e) { e.preventDefault(); stop(); fn(); });
  return el;
}
function avatar(name, pic, cls) {
  return h("span", { class: "avatar " + (cls || "sm"), "aria-hidden": "true" }, pic ? h("img", { src: pic, alt: "" }) : initials(name));
}
function picOf(username) { return username === me() && S.user.profile ? S.user.profile.pic : null; }
