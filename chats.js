/* PiSphere · chats.js
   Chats, groups, channels and the chat room screen. */
"use strict";

function chatsView() {
  var subs = [["dm", "t_chats"], ["group", "t_groups"], ["channel", "t_channels"]];
  var list = S.rooms.filter(function (r) { return r.type === ui.sub; }).sort(byPin);
  var newKey = { dm: "new_chat", group: "new_group", channel: "new_channel" }[ui.sub];
  return [
    h("div", { class: "seg" }, subs.map(function (x) { return h("button", { "aria-pressed": String(ui.sub === x[0]), onclick: function () { ui.sub = x[0]; render(); }, text: t(x[1]) }); })),
    activeAds("chats").map(adCard),
    list.length ? list.map(function (r) {
      var tg = { kind: "room", id: r.id };
      return hold(h("button", { class: "item", onclick: function () { ui.room = r.id; render(); } },
        avatar(r.name.replace(/^@/, "")),
        h("span", { class: "grow" }, h("b", { text: r.name }), h("span", { class: "sub", text: r.type === "dm" ? t("t_chats") : r.members + " " + t("members") })),
        r.pinned ? h("span", { role: "img", "aria-label": t("pinned"), style: "color:var(--mute);display:flex" }, ic("pin", 18)) : null),
        function () { openSheet({ type: "menu", target: tg }); });
    }) : h("p", { class: "sub", text: t("empty") }),
    h("p", { class: "tiny", text: t("hold_tip") }),
    h("button", { class: "btn pri", onclick: function () { openSheet({ type: "new", kind: ui.sub }); } }, ic("plus", 18), t(newKey)),
    h("button", { class: "btn", onclick: function () { toast(t("soon")); } }, ic("list", 18), t("summary"))
  ];
}
function roomView(r) {
  var canPost = r.type !== "channel" || r.owner === me();
  var inp = h("input", { type: "text", id: "rm-msg", placeholder: t("msg_ph"), maxlength: "1000", autocomplete: "off" });
  function send(e) {
    e.preventDefault(); var v = clean(inp.value, 1000); if (!v) return;
    r.msgs.push({ id: uid("m"), by: me(), text: v, ts: Date.now(), likes: [], dislikes: [] });
    if (r.type === "dm") { S.msgCount++; chatReward(); } else roomReward(r);
    save(); render();
    var box = document.querySelector(".main"); if (box) box.scrollTop = box.scrollHeight;
    var again = document.getElementById("rm-msg"); if (again) again.focus();
  }
  return [
    h("div", { class: "line", style: "align-items:center" },
      h("button", { class: "btn flat sm", "aria-label": t("back"), onclick: function () { ui.room = null; render(); } }, ic("back", 18)),
      h("div", { class: "grow", style: "flex:1;min-width:0" }, h("b", { text: r.name }), h("div", { class: "tiny", text: r.type === "dm" ? t("t_chats") : r.members + " " + t("members") })),
      r.type === "dm" ? h("button", { class: "btn pri sm", onclick: function () { openSheet({ type: "tip", to: r.peer }); }, text: t("tip") })
        : h("button", { class: "btn pri sm", disabled: r.owner === me(), onclick: function () { openSheet({ type: "tip", to: r.owner }); }, text: t("tip") })),
    h("div", { class: "msgs" }, r.msgs.length ? r.msgs.map(function (m) {
      var tg = { kind: "msg", room: r.id, id: m.id }, b = h("button", { class: "msg" + (m.by === me() ? " me" : ""), onclick: function () { openSheet({ type: "card", username: m.by }); } },
        h("small", { text: "@" + m.by + " · " + when(m.ts) + (r.type !== "dm" && (m.likes.length || m.dislikes.length) ? "  +" + m.likes.length + " / -" + m.dislikes.length : "") }), m.text);
      return hold(b, function () { openSheet({ type: "menu", target: tg }); });
    }) : h("p", { class: "sub", text: t("empty") })),
    canPost ? h("form", { class: "line", onsubmit: send }, h("label", { class: "sr", for: "rm-msg", text: t("msg_ph") }), inp, h("button", { class: "btn pri", type: "submit", text: t("send") }))
      : h("p", { class: "note info", text: t("ch_only") })
  ];
}
