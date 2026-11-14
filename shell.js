/* PiSphere · shell.js
   Header, bottom buttons, copyright line. */
"use strict";

function footer(plain) { return h("footer", { class: "foot" + (plain ? " plain" : ""), text: C.copyright }); }
function header() {
  var signed = !!(S.user && S.user.profile);
  return h("header", { class: "hdr" },
    h("div", { class: "brand" }, h("img", { src: "logo.png", alt: "" }), h("b", { text: C.appName })),
    h("div", { class: "hdr-r" },
      signed ? h("button", { class: "avatar", "aria-label": t("photo"), onclick: function () { openSheet({ type: "card", username: me() }); } },
        S.user.profile.pic ? h("img", { src: S.user.profile.pic, alt: "" }) : initials(me())) : null,
      h("button", { class: "pill", "aria-label": t("lang"), onclick: function () { openSheet({ type: "lang" }); } }, ic("globe", 16), S.lang.toUpperCase()),
      signed ? h("button", { class: "pill pi name", onclick: function () { openSheet({ type: "card", username: me() }); }, text: "@" + me() })
        : h("button", { class: "pill pi", onclick: piGo, text: t("signin") })));
}
function nav() {
  var tabs = [["chats", "chat", "n_chats"], ["meet", "meet", "n_meet"], ["feed", "feed", "n_feed"], ["rew", "gift", "n_rew"]];
  return h("nav", { class: "nav", "aria-label": "Main" }, tabs.map(function (x) {
    return h("button", { "aria-current": ui.tab === x[0] && !ui.admin ? "page" : null, onclick: function () { ui.tab = x[0]; ui.room = null; ui.admin = false; render(); } }, ic(x[1]), t(x[2]));
  }));
}
function whoBtn(username, sub, tg) {
  var b = h("button", { class: "who", onclick: function () { openSheet({ type: "card", username: username }); } },
    avatar(username, picOf(username)), h("span", { class: "grow" }, h("b", { text: "@" + username }), sub ? h("span", { class: "tiny", text: sub }) : null));
  return tg ? hold(b, function () { openSheet({ type: "menu", target: tg }); }) : b;
}
function byPin(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); }
function when(ts) { var d = new Date(ts); return d.toLocaleDateString(S.lang, { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString(S.lang, { hour: "2-digit", minute: "2-digit" }); }
