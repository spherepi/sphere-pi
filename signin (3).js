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
var PI_BUILD = "build 6";
var piStep = "", piErr = "";
function piFail(msg) { piGo.busy = false; piErr = piStep + ": " + msg; if (ui.view === "signin") render(); }
function piGo() {
  if (!window.Pi) { piStep = "Pi SDK"; piFail("not loaded"); toast(t("need_pi")); return; }
  if (piGo.busy) return;
  piGo.busy = true; piErr = "";
  /* If nothing answers for a while, say which step is stuck. The sign-in still finishes if the answer comes later. */
  var slow = setTimeout(function () { if (ui.view === "signin") { piErr = piStep + ": no answer yet"; render(); } }, 15000);
  piStep = "1 Pi.init";
  Promise.resolve()
    .then(function () { if (!piGo.ready) return window.Pi.init({ version: "2.0" }); })
    .then(function () { piGo.ready = true; piStep = "2 Pi.authenticate"; return window.Pi.authenticate(["username"], function () {}); })
    .then(function (auth) {
      if (!auth || !auth.accessToken) throw new Error("no access token");
      if (!C.piLogin) throw new Error("config.js is old (no piLogin)");
      piStep = "3 App Studio login";
      return fetch(C.piLogin, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: auth.accessToken }) });
    })
    .then(function (res) {
      if (!res.ok) return res.text().then(function (x) { throw new Error("HTTP " + res.status + " " + String(x).slice(0, 160)); });
      piStep = "4 App Studio reply"; return res.json();
    })
    .then(function (data) {
      var u = cleanUser(data && data.user && data.user.username);
      if (!u || !data.sessionToken) throw new Error("no user in reply");
      clearTimeout(slow); piGo.busy = false; piErr = "";
      piSession = { token: data.sessionToken, uid: String(data.user.uid || "") };
      setUser(u);
    })
    .catch(function (e) { clearTimeout(slow); piFail(String((e && e.message) || e).slice(0, 200)); toast(t("need_pi")); });
}
function signinView() {
  var kids = [h("h1", { class: "h1", text: t("signin_title") }), h("p", { class: "sub", text: t("need_pi") }),
    h("button", { class: "btn pi", onclick: piGo, text: t("signin") })];
  if (!window.Pi || C.testLogin) {
    var inp = h("input", { type: "text", id: "si-user", placeholder: t("user_ph"), maxlength: "31", autocomplete: "off" });
    kids.push(h("div", { class: "card" }, h("p", { class: "note info", text: t("prev") }),
      h("div", { class: "field" }, h("label", { for: "si-user", text: t("user_ph") }), inp),
      h("button", { class: "btn flat", onclick: function () { var u = cleanUser(inp.value); if (u) setUser(u); }, text: t("cont") })));
  }
  /* small status box, so a failed sign-in says exactly where it stopped */
  kids.push(h("p", { class: "tiny", text: PI_BUILD + " \u00b7 Pi SDK: " + (window.Pi ? "loaded" : "not loaded") + " \u00b7 login address: " + (C.piLogin ? "set" : "missing") }));
  if (piErr) kids.push(h("p", { class: "note err", role: "alert", text: "Sign-in stopped at step " + piErr }));
  return h("main", { class: "main" }, h("div", { class: "center" }, kids));
}
