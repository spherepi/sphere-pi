/* PiSphere · points.js
   Sphere Points: adding and removing SP, and every reward rule. */
"use strict";

function credit(amount, key, extra) { S.sp += amount; S.hist.unshift({ t: Date.now(), k: key, x: extra || "", a: amount }); S.hist = S.hist.slice(0, 200); }
function rewardCredit(amount, extra) {
  if (!isPublic() || amount <= 0) return 0;
  if (S.rewardDay.d !== today()) S.rewardDay = { d: today(), n: 0 };
  var grant = Math.min(amount, rules().dailyRewardCap - S.rewardDay.n);
  if (grant <= 0) return 0;
  S.rewardDay.n += grant; credit(grant, "h_reward", extra); return grant;
}
function postReward(p) {
  if (p.by !== me()) return;
  var earned = R.feed(p.likes.length, Math.max(0, p.dislikes.length - (p.voided || 0)), rules());
  var delta = earned - (p.paid || 0);
  if (delta > 0) p.paid = (p.paid || 0) + rewardCredit(delta, "· " + rules().likesPerSp + " likes");
}
function chatReward() {
  var earned = R.chat(S.msgCount, rules()), delta = earned - (S.chatPaid || 0);
  if (delta > 0) S.chatPaid = (S.chatPaid || 0) + rewardCredit(delta, "· chat");
}
function roomReward(room) {
  if (room.owner !== me() || room.type === "dm") return;
  var day = Date.now() - 864e5, n = room.msgs.filter(function (m) { return m.ts > day; }).length;
  var amount = room.type === "group" ? R.group(room.members, n, rules(), C.groupTable) : R.channel(room.members, n, rules());
  var k = room.id + ":" + today();
  if (amount > 0 && !S.once[k]) { S.once[k] = 1; rewardCredit(amount, "· " + room.name); }
}
