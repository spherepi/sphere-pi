/* PiSphere · feed.js
   Post feed screen. */
"use strict";

function feedView() {
  var inp = h("input", { type: "text", id: "fd-new", placeholder: t("post_ph"), maxlength: "500", autocomplete: "off" });
  function post(e) {
    e.preventDefault(); var v = clean(inp.value, 500); if (!v) return;
    S.posts.unshift({ id: uid("p"), by: me(), text: v, ts: Date.now(), likes: [], dislikes: [], pinned: false, paid: 0, voided: 0 });
    save(); render();
  }
  var ads = activeAds("feed"), out = [
    h("form", { class: "line", onsubmit: post }, h("label", { class: "sr", for: "fd-new", text: t("post_ph") }), inp, h("button", { class: "btn pri", type: "submit", text: t("post") }))];
  S.posts.slice().sort(function (a, b) { return byPin(a, b) || b.ts - a.ts; }).forEach(function (p, i) {
    var tg = { kind: "post", id: p.id }, u = me();
    function ib(icon, label, n, on, fn) {
      return h("button", { class: "btn " + (on ? "pri" : "flat"), "aria-label": label, "aria-pressed": String(!!on), onclick: fn }, ic(icon, 18), n == null ? null : h("span", { text: String(n) }));
    }
    out.push(h("article", { class: "card" },
      h("div", { class: "line", style: "justify-content:space-between;align-items:center" }, whoBtn(p.by, when(p.ts), tg),
        p.pinned ? h("span", { role: "img", "aria-label": t("pinned"), style: "color:var(--mute);display:flex" }, ic("pin", 18)) : null),
      h("p", { class: "txt", text: p.text }),
      h("div", { class: "acts", style: "grid-template-columns:repeat(4,minmax(0,1fr))" },
        ib("up", t("like"), p.likes.length, p.likes.indexOf(u) >= 0, function () { vote(tg, true); }),
        ib("down", t("dislike"), p.dislikes.length, p.dislikes.indexOf(u) >= 0, function () { if (p.by === u) return; vote(tg, false); }),
        ib("share", t("share"), null, false, function () { try { navigator.clipboard.writeText(p.text).then(function () { toast(t("copied")); }, function () {}); } catch (e) {} }),
        h("button", { class: "btn flat", disabled: p.by === u, onclick: function () { openSheet({ type: "tip", to: p.by }); }, text: t("tip") })),
      h("span", { class: "tiny", text: t("like_rule") })));
    if (i === 0) ads.forEach(function (a) { out.push(adCard(a)); });
  });
  if (!S.posts.length) ads.forEach(function (a) { out.push(adCard(a)); });
  return out;
}
