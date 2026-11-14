/* PiSphere · admin.js
   Admin panel: rules, ticker colours, local ads, claims, reset. */
"use strict";

var RULE_LABEL = { spPerPi: "SP for 1 Pi", likesPerSp: "Net likes for 1 SP", chatMsgsPerSp: "Chat messages for 1 SP", meetingPeoplePerSp: "Meeting people for 1 SP",
  channelSpPer100: "Channel SP per 100 members", minPosts24h: "Posts needed in 24 hours", groupLimit: "Group member limit", meetingMinutes: "Meeting minutes",
  meetingPeople: "Meeting people limit", chatDeleteDays: "Chat auto-delete days", dailyRewardCap: "Daily reward SP cap", dailyDislikeLimit: "Dislikes per day",
  weeklyClaimLimit: "Claims per week", userCap: "User cap before waiting list", adEveryMinutes: "Minutes between Pi ads", adRewardSp: "SP for a watched ad", adRewardPerDay: "Rewarded ads per day" };
function resetData() {
  var keep = { lang: S.lang, promoSeen: S.promoSeen, user: S.user, rules: S.rules, ticker: S.ticker };
  S = Object.assign(seed(), keep); save(); ui.sheet = null; ui.room = null; render(); toast(t("a_saved"));
}
function adminView() {
  var r = rules(), k = ticker();
  function saveRules(e) {
    e.preventDefault(); var out = {};
    Object.keys(RULE_LABEL).forEach(function (key) { var n = Math.floor(Number(document.getElementById("ru-" + key).value)); if (n > 0 && n !== C.rules[key]) out[key] = n; });
    S.rules = out; save(); render(); toast(t("a_saved"));
  }
  function saveTicker() {
    S.ticker = { bg: document.getElementById("tk-bg").value, fg: document.getElementById("tk-fg").value, speed: Math.min(200, Math.max(15, Math.floor(Number(document.getElementById("tk-sec").value)) || 45)) };
    save(); render(); toast(t("a_saved"));
  }
  function postAd(e) {
    e.preventDefault(); function v(id) { return document.getElementById(id); }
    var a = { id: uid("a"), title: clean(v("ad-title").value, 60), text: clean(v("ad-text").value, 200), link: clean(v("ad-link").value, 120), city: clean(v("ad-city").value, 40),
      from: v("ad-from").value, to: v("ad-to").value, places: { ticker: v("ad-p-ticker").checked, feed: v("ad-p-feed").checked, chats: v("ad-p-chats").checked, meet: v("ad-p-meet").checked } };
    if (!a.title || !(a.places.ticker || a.places.feed || a.places.chats || a.places.meet)) { toast(t("e_req")); return; }
    S.ads.unshift(a); save(); render(); toast(t("a_saved"));
  }
  function fld(id, label, type, max) { return h("div", { class: "field" }, h("label", { for: id, text: label }), h("input", { type: type || "text", id: id, maxlength: max ? String(max) : null, autocomplete: "off" })); }
  function chk(id, label, on) { return h("label", { class: "chk", for: id }, h("input", { type: "checkbox", id: id, checked: on }), label); }
  function decide(c, ok) {
    c.status = ok ? "approved" : "rejected";
    if (ok) { var o = findTarget(c.target); if (o) { o.voided = o.dislikes.length; if (c.target.kind === "post") postReward(o); } }
    save(); render();
  }
  var open = S.claims.filter(function (c) { return c.status === "open"; });
  return [
    h("div", { class: "line", style: "align-items:center;justify-content:space-between" },
      h("div", {}, h("h1", { class: "h1", text: t("admin") }), h("div", { class: "sub", text: "@" + C.adminUsername })),
      h("span", { class: "tag live", text: C.testMode ? "TEST MODE" : "LIVE" })),
    h("p", { class: "note info", text: t("a_note") }),
    h("form", { class: "card", onsubmit: saveRules }, h("h2", { class: "h2", text: t("a_rules") }),
      Object.keys(RULE_LABEL).map(function (key) {
        return h("div", { class: "rule" }, h("label", { for: "ru-" + key, text: RULE_LABEL[key] }), h("input", { type: "number", id: "ru-" + key, min: "1", step: "1", value: r[key] }));
      }), h("button", { class: "btn pri", type: "submit", text: t("save") })),
    h("div", { class: "card" }, h("h2", { class: "h2", text: t("a_colors") }),
      h("div", { class: "rule" }, h("label", { for: "tk-bg", text: t("a_bg") }), h("input", { type: "color", id: "tk-bg", value: k.bg })),
      h("div", { class: "rule" }, h("label", { for: "tk-fg", text: t("a_fg") }), h("input", { type: "color", id: "tk-fg", value: k.fg })),
      h("div", { class: "rule" }, h("label", { for: "tk-sec", text: "Speed (15 slow \u2013 200 fast)" }), h("input", { type: "number", id: "tk-sec", min: "15", max: "200", step: "5", value: k.speed || 45 })),
      h("button", { class: "btn pri", onclick: saveTicker, text: t("save") })),
    h("form", { class: "card", onsubmit: postAd }, h("h2", { class: "h2", text: t("a_ads") }),
      fld("ad-title", t("a_title"), "text", 60), fld("ad-text", t("a_text"), "text", 200), fld("ad-link", t("a_link"), "text", 120), fld("ad-city", t("a_city"), "text", 40),
      h("div", { class: "row2" }, fld("ad-from", t("a_from"), "date"), fld("ad-to", t("a_to"), "date")),
      h("span", { class: "lbl", text: t("a_places") }),
      h("div", { class: "row2" }, chk("ad-p-ticker", t("a_ticker"), false), chk("ad-p-feed", t("a_feed"), false), chk("ad-p-chats", t("a_chats"), false), chk("ad-p-meet", t("a_meet"), false)),
      h("button", { class: "btn pri", type: "submit", text: t("a_post") })),
    h("h2", { class: "h2", text: t("a_live") + " (" + S.ads.length + ")" }),
    S.ads.length ? S.ads.map(function (a) {
      return h("div", { class: "item" }, h("span", { class: "grow" }, h("b", { text: a.title }),
        h("span", { class: "sub", text: Object.keys(a.places).filter(function (p) { return a.places[p]; }).join(", ") + (a.city ? " · " + a.city : "") + (a.to ? " · → " + a.to : "") })),
        h("button", { class: "btn danger sm", "aria-label": t("del") + ": " + a.title, onclick: function () { S.ads = S.ads.filter(function (x) { return x.id !== a.id; }); save(); render(); } }, ic("trash", 18)));
    }) : h("p", { class: "sub", text: t("empty") }),
    h("h2", { class: "h2", text: t("a_claims") + " (" + open.length + ")" }),
    open.length ? open.map(function (c) {
      var o = findTarget(c.target);
      return h("div", { class: "card" }, h("b", { text: "@" + c.by + " · " + c.target.kind }), h("p", { class: "txt", text: c.text }),
        o ? h("p", { class: "sub", text: (o.text || o.name || "") + "  (+" + o.likes.length + " / -" + o.dislikes.length + ": " + o.dislikes.map(function (d) { return "@" + d; }).join(", ") + ")" }) : null,
        h("div", { class: "row2" }, h("button", { class: "btn pri sm", onclick: function () { decide(c, true); }, text: t("a_ok") }), h("button", { class: "btn flat sm", onclick: function () { decide(c, false); }, text: t("a_no") })));
    }) : h("p", { class: "sub", text: t("empty") }),
    h("button", { class: "btn danger", onclick: function () { openSheet({ type: "reset" }); }, text: t("a_reset") })
  ];
}
