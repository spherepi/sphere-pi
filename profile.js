/* PiSphere · profile.js
   Profile form and photo upload. */
"use strict";

function shrink(file, done) {
  if (!file || (file.type && file.type.indexOf("image/") !== 0) || file.size > 3e7) { done(null); return; }
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas"), s = Math.min(img.width, img.height); c.width = c.height = 160;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
      done(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = function () { done(null); }; img.src = fr.result;
  };
  fr.onerror = function () { done(null); }; fr.readAsDataURL(file);
}
function profileView() {
  var p = (S.user && S.user.profile) || { name: "", mobile: "", email: "", country: "", state: "", city: "", pic: null, pub: true };
  var draft = { pic: p.pic, pub: p.pub !== false };
  function field(id, label, type, val, max) {
    return h("div", { class: "field" }, h("label", { for: id, text: label }), h("input", { type: type, id: id, value: val, maxlength: String(max), autocomplete: "off" }));
  }
  var pic = avatar(S.user.username, draft.pic, "lg");
  var file = h("input", { type: "file", id: "pf-file", accept: "image/*", class: "sr", onchange: function () {
    shrink(file.files[0], function (d) { if (d) { draft.pic = d; pic.replaceChildren(h("img", { src: d, alt: "" })); } else toast(t("e_pic")); });
  } });
  var pubB = h("button", { class: "btn", type: "button", onclick: function () { draft.pub = true; paint(); }, text: t("pub") });
  var privB = h("button", { class: "btn", type: "button", onclick: function () { draft.pub = false; paint(); }, text: t("priv") });
  function paint() {
    pubB.className = "btn " + (draft.pub ? "pri" : "flat"); privB.className = "btn " + (draft.pub ? "flat" : "pri");
    pubB.setAttribute("aria-pressed", String(draft.pub)); privB.setAttribute("aria-pressed", String(!draft.pub));
  }
  paint();
  var agree = h("input", { type: "checkbox", id: "pf-ok" });
  var err = h("p", { class: "note err", role: "alert" }); err.hidden = true;
  function val(id) { return document.getElementById(id).value; }
  function submit(e) {
    e.preventDefault();
    var d = { name: clean(val("pf-name"), 60), mobile: val("pf-mobile").replace(/[^\d+]/g, "").slice(0, 16), email: clean(val("pf-mail"), 80).toLowerCase(),
      country: clean(val("pf-country"), 40), state: clean(val("pf-state"), 40), city: clean(val("pf-city"), 40), pic: draft.pic, pub: draft.pub };
    var msg = "";
    if (!d.name || !d.mobile || !d.email || !d.country || !d.state || !d.city || !agree.checked) msg = t("e_req");
    else if (!/^\+?\d{7,15}$/.test(d.mobile)) msg = t("e_mob");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) msg = t("e_mail");
    if (msg) { err.textContent = msg; err.hidden = false; return; }
    S.user.profile = d; save(); ui.editing = false; ui.view = "app"; render();
  }
  return h("form", { class: "main", novalidate: true, onsubmit: submit },
    h("div", { class: "brand" }, h("img", { src: "logo.png", alt: "" }), h("b", { text: C.appName })),
    h("h1", { class: "h1", text: ui.editing ? t("edit") : t("p_title") }),
    ui.editing ? null : h("p", { class: "sub", text: t("p_sub") }),
    h("div", { class: "card", style: "flex-direction:row;align-items:center" }, pic,
      h("div", { class: "field" }, h("span", { class: "lbl", text: t("photo") }),
        h("label", { class: "btn flat sm", for: "pf-file", text: t("upload") }), file)),
    field("pf-name", t("name"), "text", p.name, 60), field("pf-mobile", t("mobile"), "tel", p.mobile, 16), field("pf-mail", t("gmail"), "email", p.email, 80),
    field("pf-country", t("country"), "text", p.country, 40),
    h("div", { class: "row2" }, field("pf-state", t("state"), "text", p.state, 40), field("pf-city", t("city"), "text", p.city, 40)),
    h("span", { class: "lbl", text: t("vis") }), h("div", { class: "row2" }, pubB, privB),
    h("p", { class: "note warn", text: t("warn") }),
    h("label", { class: "chk", for: "pf-ok" }, agree, t("confirm")), err,
    h("button", { class: "btn pri", type: "submit", text: ui.editing ? t("save") : t("submit") }),
    ui.editing ? h("button", { class: "btn flat", type: "button", onclick: function () { ui.editing = false; ui.view = "app"; render(); }, text: t("cancel") }) : null,
    footer(true));
}
