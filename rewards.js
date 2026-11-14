/* PiSphere · rewards.js
   Rewards screen: SP balance, buy, send, receive, history. */
"use strict";

function rewView() {
  var r = rules();
  var bal = hold(h("button", { class: "bal", onclick: function () { toast(t("hold")); } },
    h("span", { text: t("sp_bal") }), h("span", { class: "n", text: S.sp.toLocaleString(S.lang) + " SP" }), h("span", { text: t("hold") })),
    function () { openSheet({ type: "hold-bal" }); });
  function buy(pi) {
    if (!C.testMode) { toast(t("soon")); return; }
    credit(pi * r.spPerPi, "h_buy", pi + " Pi"); save(); render(); toast(t("test_credit"));
  }
  return [
    h("div", { class: "line", style: "justify-content:space-between;align-items:center" }, h("h1", { class: "h1", text: t("sp_title") }),
      h("button", { class: "avatar", "aria-label": t("settings"), onclick: function () { openSheet({ type: "settings" }); } }, ic("gear"))),
    bal,
    h("div", { class: "row2" },
      h("button", { class: "btn", onclick: function () { openSheet({ type: "send" }); }, text: t("send") }),
      h("button", { class: "btn", onclick: function () { openSheet({ type: "receive" }); }, text: t("receive") })),
    h("h2", { class: "h2", text: t("buy") }),
    h("div", { class: "row3" }, C.packs.map(function (pi) {
      return h("button", { class: "pack", onclick: function () { buy(pi); } }, h("b", { text: (pi * r.spPerPi).toLocaleString(S.lang) + " SP" }), h("span", { text: pi + " Pi" }));
    })),
    h("p", { class: "tiny", text: t("buy_note") }),
    h("button", { class: "btn", onclick: function () { toast(t("soon")); } }, ic("play", 18), t("watch")),
    h("h2", { class: "h2", text: t("hist") }),
    S.hist.length ? h("div", { class: "hist" }, S.hist.slice(0, 30).map(function (x) {
      return h("div", {}, h("span", {}, h("b", { style: "font-size:14px", text: t(x.k) + (x.x ? " " + x.x : "") }), h("span", { class: "tiny", style: "display:block", text: when(x.t) })),
        h("span", { class: x.a >= 0 ? "plus" : "minus", text: (x.a >= 0 ? "+ " : "− ") + Math.abs(x.a).toLocaleString(S.lang) + " SP" }));
    })) : h("p", { class: "sub", text: t("no_hist") })
  ];
}
