/* PiSphere · sheets.js
   Pop-up panels: hold menu, profile card, tip, send, receive, language, new chat or group, claim, settings. */
"use strict";

function openSheet(s) { ui.sheet = s; ui.err = ""; render(); }
function closeSheet() { ui.sheet = null; ui.err = ""; render(); }
function sheetView() {
  var s = ui.sheet, body;
  if (s.type === "menu") body = menuSheet(s.target);
  else if (s.type === "card") body = cardSheet(s.username);
  else if (s.type === "tip") body = tipSheet(s.to, "h_tip");
  else if (s.type === "send") body = tipSheet("", "h_send");
  else if (s.type === "receive") body = [h("p", { class: "sub", text: t("recv_note") }), h("p", { class: "h1", text: "@" + me() }),
    h("button", { class: "btn flat", onclick: function () { try { navigator.clipboard.writeText("@" + me()).then(function () { toast(t("copied")); }, function () {}); } catch (e) {} }, text: t("copy") })];
  else if (s.type === "hold-bal") body = h("div", { class: "row2" },
    h("button", { class: "btn pri", onclick: function () { openSheet({ type: "send" }); }, text: t("send") }),
    h("button", { class: "btn flat", onclick: function () { openSheet({ type: "receive" }); }, text: t("receive") }));
  else if (s.type === "lang") body = h("div", { class: "langs" }, C.languages.map(function (l) {
    return h("button", { class: "btn " + (S.lang === l[0] ? "pri" : "flat"), lang: l[0], onclick: function () { S.lang = l[0]; save(); document.documentElement.lang = l[0]; closeSheet(); }, text: l[1] });
  }));
  else if (s.type === "new") body = newSheet(s.kind);
  else if (s.type === "claim") body = claimSheet(s.target);
  else if (s.type === "settings") body = [
    h("button", { class: "btn flat", onclick: function () { ui.sheet = null; ui.editing = true; ui.view = "profile"; render(); }, text: t("edit") }),
    h("button", { class: "btn flat", onclick: function () { openSheet({ type: "lang" }); } }, ic("globe"), t("lang")),
    isAdmin() ? h("button", { class: "btn pri", onclick: function () { ui.sheet = null; ui.admin = true; render(); }, text: t("admin") }) : null];
  else if (s.type === "reset") body = [h("p", { class: "note warn", text: t("a_reset_q") }),
    h("button", { class: "btn danger", onclick: resetData, text: t("a_yes") })];
  return h("div", { class: "veil", onclick: function (e) { if (e.target === e.currentTarget) closeSheet(); } },
    h("section", { class: "sheet", role: "dialog", "aria-modal": "true" }, body,
      ui.err ? h("p", { class: "note err", role: "alert", text: ui.err }) : null,
      h("button", { class: "btn flat", onclick: closeSheet, text: t("close") })));
}
function menuSheet(tg) {
  var o = findTarget(tg); if (!o) return h("p", { class: "sub", text: t("empty") });
  var owner = ownerOf(tg, o), pins = tg.kind !== "msg", inDm = false;
  if (tg.kind === "msg") { var rm = S.rooms.filter(function (x) { return x.id === tg.room; })[0]; inDm = !!rm && rm.type === "dm"; }
  var votes = !!o.likes && !inDm;
  function mb(icon, label, fn, on, cls) { return h("button", { class: "btn " + (cls || ""), disabled: !on, onclick: fn }, ic(icon, 18), label); }
  return [
    h("div", { class: "who" }, avatar(owner, picOf(owner)), h("b", { text: "@" + owner })),
    h("div", { class: "menu" },
      mb("up", t("like"), function () { ui.sheet = null; vote(tg, true); }, votes),
      mb("down", t("dislike"), function () { ui.sheet = null; vote(tg, false); }, votes && owner !== me()),
      mb("tip", t("tip"), function () { openSheet({ type: "tip", to: owner }); }, owner !== me(), "pri"),
      mb("pin", t("pin"), function () { setPin(tg, true); }, pins && !o.pinned),
      mb("unpin", t("unpin"), function () { setPin(tg, false); }, pins && !!o.pinned),
      mb("trash", t("del"), function () { removeTarget(tg); }, canDelete(tg, o))),
    votes && owner === me() && o.dislikes.length > (o.voided || 0)
      ? h("button", { class: "btn flat", onclick: function () { openSheet({ type: "claim", target: tg }); } }, ic("flag", 18), t("claim")) : null
  ];
}
function cardSheet(username) {
  var mine = username === me(), p = mine ? S.user.profile : null, rows;
  if (p && (mine || p.pub)) rows = h("div", { class: "kv" },
    h("div", {}, h("span", { text: t("contact") }), h("span", { text: mine ? p.mobile : maskPhone(p.mobile) })),
    h("div", {}, h("span", { text: t("email") }), h("span", { text: mine ? p.email : maskMail(p.email) })),
    h("div", {}, h("span", { text: t("country") }), h("span", { text: p.country })),
    h("div", {}, h("span", { text: t("state") + ", " + t("city") }), h("span", { text: p.state + ", " + p.city })));
  else rows = h("p", { class: "note info", text: mine ? t("priv_note") : t("soon") });
  return [
    h("div", { class: "who" }, avatar(username, picOf(username), "lg"),
      h("span", { class: "grow" }, h("b", { text: p ? p.name : "@" + username }), h("span", { class: "sub", text: "@" + username })),
      p ? h("span", { class: "tag" + (p.pub ? " live" : ""), text: p.pub ? t("pubb") : t("privb") }) : null),
    rows,
    mine ? null : h("button", { class: "btn pri", onclick: function () { openSheet({ type: "tip", to: username }); } }, ic("tip", 18), t("tip"))
  ];
}
function tipSheet(to, key) {
  var user = h("input", { type: "text", id: "tp-user", placeholder: t("user_ph"), value: to, maxlength: "31", autocomplete: "off" });
  var amt = h("input", { type: "number", id: "tp-amt", placeholder: t("amt"), min: "1", step: "1", inputmode: "numeric" });
  function go() {
    var u = cleanUser(user.value), n = Math.floor(Number(amt.value));
    if (!u || u.toLowerCase() === me().toLowerCase() || !(n > 0) || n > S.sp) { ui.err = t("e_amt"); render(); return; }
    credit(-n, key, "@" + u); save(); ui.sheet = null; ui.err = ""; render(); toast(t("tip_ok"));
  }
  return [h("b", { text: to ? t("tip_to") + " @" + to : t("send") }),
    to ? null : h("div", { class: "field" }, h("label", { for: "tp-user", text: t("user_ph") }), user),
    h("div", { class: "field" }, h("label", { for: "tp-amt", text: t("amt") + " (" + S.sp + " SP)" }), amt),
    h("button", { class: "btn pri", onclick: go, text: t("send") })];
}
function newSheet(kind) {
  var label = kind === "dm" ? t("user_ph") : t("name_ph");
  var inp = h("input", { type: "text", id: "nw-name", placeholder: label, maxlength: "40", autocomplete: "off" });
  function go() {
    var v = kind === "dm" ? cleanUser(inp.value) : clean(inp.value, 40);
    if (!v || (kind === "dm" && v.toLowerCase() === me().toLowerCase())) return;
    if (kind === "meet") S.meets.unshift({ id: String(Math.floor(100000 + Math.random() * 900000)), name: v, owner: me(), pinned: false });
    else S.rooms.unshift({ id: uid("r"), type: kind, name: kind === "dm" ? "@" + v : v, peer: kind === "dm" ? v : null, owner: me(), members: 1, pinned: false, msgs: [] });
    save(); closeSheet();
  }
  var title = { dm: "new_chat", group: "new_group", channel: "new_channel", meet: "m_create" }[kind];
  return [h("b", { text: t(title) }), h("div", { class: "field" }, h("label", { for: "nw-name", text: label }), inp),
    h("button", { class: "btn pri", onclick: go, text: t("create") })];
}
function claimSheet(tg) {
  var ta = h("textarea", { id: "cl-text", placeholder: t("claim_ph"), maxlength: "300" });
  function go() {
    var txt = clean(ta.value, 300); if (!txt) return;
    var wk = today().slice(0, 8) + Math.floor(new Date().getDate() / 7);
    if (S.claimWeek.d !== wk) S.claimWeek = { d: wk, n: 0 };
    if (S.claimWeek.n >= rules().weeklyClaimLimit) { ui.err = t("lim_dis"); render(); return; }
    S.claimWeek.n++; S.claims.unshift({ id: uid("c"), target: tg, by: me(), text: txt, ts: Date.now(), status: "open" });
    save(); ui.sheet = null; render(); toast(t("claim_ok"));
  }
  return [h("b", { text: t("claim") }), h("label", { class: "sr", for: "cl-text", text: t("claim_ph") }), ta,
    h("button", { class: "btn pri", onclick: go, text: t("send") })];
}
