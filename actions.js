/* PiSphere · actions.js
   Like, dislike, pin, unpin and delete for posts, chats, groups, channels and meetings. */
"use strict";

function findTarget(tg) {
  if (tg.kind === "post") return S.posts.filter(function (p) { return p.id === tg.id; })[0];
  if (tg.kind === "room") return S.rooms.filter(function (r) { return r.id === tg.id; })[0];
  if (tg.kind === "meet") return S.meets.filter(function (m) { return m.id === tg.id; })[0];
  if (tg.kind === "msg") { var r = S.rooms.filter(function (x) { return x.id === tg.room; })[0]; return r ? r.msgs.filter(function (m) { return m.id === tg.id; })[0] : null; }
  return null;
}
function ownerOf(tg, o) { return tg.kind === "room" || tg.kind === "meet" ? o.owner : o.by; }
function vote(tg, up) {
  var o = findTarget(tg); if (!o || !o.likes) return;
  var u = me(), li = o.likes.indexOf(u), di = o.dislikes.indexOf(u);
  if (up) { if (li >= 0) o.likes.splice(li, 1); else { o.likes.push(u); if (di >= 0) o.dislikes.splice(di, 1); } }
  else {
    if (di >= 0) o.dislikes.splice(di, 1);
    else {
      if (!isPublic()) { toast(t("priv") ); return; }
      if (S.disDay.d !== today()) S.disDay = { d: today(), n: 0 };
      if (S.disDay.n >= rules().dailyDislikeLimit) { toast(t("lim_dis")); return; }
      S.disDay.n++; o.dislikes.push(u); if (li >= 0) o.likes.splice(li, 1);
    }
  }
  if (tg.kind === "post") postReward(o);
  save(); render();
}
function setPin(tg, v) { var o = findTarget(tg); if (o) { o.pinned = v; save(); } ui.sheet = null; render(); }
function canDelete(tg, o) { return isAdmin() || ownerOf(tg, o) === me(); }
function removeTarget(tg) {
  if (tg.kind === "post") S.posts = S.posts.filter(function (p) { return p.id !== tg.id; });
  if (tg.kind === "room") { S.rooms = S.rooms.filter(function (r) { return r.id !== tg.id; }); if (ui.room === tg.id) ui.room = null; }
  if (tg.kind === "meet") S.meets = S.meets.filter(function (m) { return m.id !== tg.id; });
  if (tg.kind === "msg") { var r = S.rooms.filter(function (x) { return x.id === tg.room; })[0]; if (r) r.msgs = r.msgs.filter(function (m) { return m.id !== tg.id; }); }
  save(); ui.sheet = null; render();
}
