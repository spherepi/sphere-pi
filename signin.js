/* PiSphere · signin.js
   Pi sign-in screen and the Pi SDK login call. */
"use strict";

function setUser(name) { S.user = { username: name, profile: null }; save(); ui.view = "profile"; render(); }
function piGo() {
  if (!window.Pi) { toast(t("need_pi")); return; }
  try {
    if (!piGo.ready) { window.Pi.init({ version: "2.0", sandbox: !!C.piSandbox }); piGo.ready = true; }
    window.Pi.authenticate(["username"], function () {}).then(function (a) {
      var u = cleanUser(a && a.user && a.user.username);
      if (u) { S.piUid = a.user.uid || ""; setUser(u); } else toast(t("need_pi"));
    }, function () { toast(t("need_pi")); });
  } catch (e) { toast(t("need_pi")); }
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
