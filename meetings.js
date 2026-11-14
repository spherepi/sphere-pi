/* PiSphere · meetings.js
   Cloud meetings screen. */
"use strict";

function meetView() {
  var idIn = h("input", { type: "text", id: "mt-id", placeholder: t("m_id"), maxlength: "12", inputmode: "numeric", autocomplete: "off" });
  var r = rules();
  return [
    h("h1", { class: "h1", text: t("m_title") }),
    h("div", { class: "row2" },
      h("button", { class: "btn pri big", onclick: function () { openSheet({ type: "new", kind: "meet" }); } }, ic("plus", 24), t("m_create")),
      h("button", { class: "btn big", onclick: function () { idIn.focus(); } }, ic("meet", 24), t("m_join"))),
    h("form", { class: "line", onsubmit: function (e) { e.preventDefault(); toast(t("soon")); } }, h("label", { class: "sr", for: "mt-id", text: t("m_id") }), idIn, h("button", { class: "btn flat", type: "submit", text: t("join") })),
    activeAds("meet").map(adCard),
    h("h2", { class: "h2", text: t("m_yours") }),
    S.meets.length ? S.meets.slice().sort(byPin).map(function (m) {
      var tg = { kind: "meet", id: m.id };
      return hold(h("div", { class: "card" },
        h("div", { class: "line", style: "align-items:center;justify-content:space-between" },
          h("div", { style: "min-width:0" }, h("b", { text: m.name }), h("div", { class: "sub", text: t("m_id_lbl") + ": " + m.id + " · " + r.meetingMinutes + " min · " + r.meetingPeople })),
          m.pinned ? h("span", { role: "img", "aria-label": t("pinned"), style: "color:var(--mute);display:flex" }, ic("pin", 18)) : null),
        h("div", { class: "row2" },
          h("button", { class: "btn pri sm", onclick: function () { toast(t("soon")); }, text: t("start") }),
          h("button", { class: "btn flat sm", onclick: function () { openSheet({ type: "menu", target: tg }); }, text: "•••", "aria-label": t("pin") + ", " + t("del") }))),
        function () { openSheet({ type: "menu", target: tg }); });
    }) : h("p", { class: "sub", text: t("empty") }),
    h("p", { class: "note info", text: t("m_rule") })
  ];
}
