/* PiSphere · signin.js
   Pi sign-in screen and the Pi SDK login call. */
"use strict";

/* Kept in memory only, never saved: the session App Studio gives after it has checked the Pi access token. */
var piSession = null;

function setUser(name) {
  if (!S.user || S.user.username !== name) {
    /* a different person signed in on this phone: start them with clean data */
    var keep = { lang: S.lang, promoSeen: S.promoSeen, rules: S.rules, ticker: S.ticker };
    S = Object.assign(seed(), keep);
    S.user = { username: name, profile: null };
  }
  save(); ui.view = S.user.profile ? "app" : "profile"; render();
}

/* Pi sign-in.
   1. Pi SDK gives an access token.
   2. The token goes to App Studio, which checks it with Pi.
   3. Only the username App Studio sends back is used. */
function piGo() {
  if (!window.Pi) { toast(t("need_pi")); return; }
  if (piGo.busy) return;
  piGo.busy = true;
  /* Outside Pi Browser the Pi SDK never answers, so tell the person after a few seconds. */
  var slow = setTimeout(function () { piGo.busy = false; if (ui.view === "signin") toast(t("need_pi")); }, 8000);
  Promise.resolve()
    .then(function () { if (!piGo.ready) return window.Pi.init({ version: "2.0" }); })
    .then(function () { piGo.ready = true; return window.Pi.authenticate(["username"], function () {}); })
    .then(function (auth) {
      if (!auth || !auth.accessToken) throw new Error("no token");
      return fetch(C.piLogin, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: auth.accessToken }) });
    })
    .then(function (res) { if (!res.ok) throw new Error("login " + res.status); return res.json(); })
    .then(function (data) {
      var u = cleanUser(data && data.user && data.user.username);
      if (!u || !data.sessionToken) throw new Error("no user");
      clearTimeout(slow); piGo.busy = false;
      piSession = { token: data.sessionToken, uid: String(data.user.uid || "") };
      setUser(u);
    })
    .catch(function () { clearTimeout(slow); piGo.busy = false; toast(t("need_pi")); });
}
function signinView() {
  var kids = [h("h1", { class: "h1", text: t("signin_title") }), h("p", { class: "sub", text: t("need_pi") }),
    h("button", { class: "btn pi", onclick: piGo, text: t("signin") })];
  if (!window.Pi) {
    var inp = h("input", { type: "text", id: "si-user", placeholder: t("user_ph"), maxlength: "31", autocomplete: "off" });
    kids.push(h("div", { class: "card" }, h("p", { class: "note info", text: t("prev") }),
      h("div", { class: "field" }, h("label", { for: "si-user", text: t("user_ph") }), inp),
      h("button", { class: "btn flat", onclick: function () { var u = cleanUser(inp.value); if (u) setUser(u); }, text: t("cont") })));
  }
  return h("main", { class: "main" }, h("div", { class: "center" }, kids));
}
