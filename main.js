/* PiSphere · main.js
   Draws the current screen and starts the app. Keep this file last. */
"use strict";

var hosts = null;
function render() {
  if (!hosts) {
    hosts = { top: h("div", { class: "host" }), tick: h("div", { class: "host" }), body: h("div", { class: "host" }), sheet: h("div", { class: "host" }) };
    root.replaceChildren(hosts.top, hosts.tick, hosts.body, hosts.sheet);
  }
  var old = hosts.body.querySelector(".main"), top = old && ui.keep === ui.tab + "|" + ui.room + "|" + ui.admin ? old.scrollTop : 0;
  var head = null, kids, showTick = false;
  if (ui.view === "promo") kids = [promoView()];
  else if (ui.view === "signin") { head = header(); kids = [signinView(), footer(false)]; }
  else if (ui.view === "profile") kids = [profileView()];
  else {
    var room = ui.room ? S.rooms.filter(function (r) { return r.id === ui.room; })[0] : null, body;
    if (ui.admin && isAdmin()) body = adminView();
    else if (ui.tab === "chats") body = room ? roomView(room) : chatsView();
    else if (ui.tab === "meet") body = meetView();
    else if (ui.tab === "feed") body = feedView();
    else body = rewView();
    head = header(); showTick = true;
    kids = [h("main", { class: "main" }, body), nav(), footer(false)];
  }
  if (head) hosts.top.replaceChildren(head); else hosts.top.replaceChildren();
  hosts.body.replaceChildren.apply(hosts.body, kids);
  if (ui.sheet) hosts.sheet.replaceChildren(sheetView()); else hosts.sheet.replaceChildren();
  updateTicker(showTick);
  ui.keep = ui.tab + "|" + ui.room + "|" + ui.admin;
  var now = hosts.body.querySelector(".main"); if (now && top) now.scrollTop = top;
}

load();
if (!S.lang) { var nl = (navigator.language || "en").slice(0, 2).toLowerCase(); S.lang = L[nl] ? nl : "en"; }
document.documentElement.lang = S.lang;
(function prune() {
  var cut = Date.now() - rules().chatDeleteDays * 864e5;
  S.rooms.forEach(function (r) { r.msgs = r.msgs.filter(function (m) { return m.ts > cut; }); });
})();
save();
render();
