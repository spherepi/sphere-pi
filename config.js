/* PiSphere settings. Every number here can also be changed from the Admin panel. */
window.PS_CONFIG = {
  appName: "PiSphere",
  adminUsername: "RK33",
  copyright: "© 2026 PiSphere. All Rights Reserved.",
  testMode: true,          /* true while on Pi Testnet: SP packs are added without a real payment */
  testLogin: true,         /* true: a username box on the sign-in screen lets you enter from any browser. Set to false before public launch. */

  /* Stage 2: fill these in after the accounts are ready. Never put a secret key here. */
  backend: { supabaseUrl: "", supabaseAnonKey: "", livekitUrl: "", apiBase: "" },

  /* Pi App Studio login: the app sends the Pi access token here and trusts only the username it answers with. */
  piLogin: "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login",

  rules: {
    spPerPi: 1000,          /* 1 Pi buys this many SP */
    likesPerSp: 100,        /* net likes (likes minus dislikes) for 1 SP */
    chatMsgsPerSp: 1000,    /* personal chat messages for 1 SP */
    meetingPeoplePerSp: 5,  /* people in a meeting for 1 SP */
    channelSpPer100: 10,    /* SP for every 100 channel members */
    minPosts24h: 5,         /* posts needed in 24 hours before a group or channel earns */
    groupLimit: 100,        /* members allowed in a group during testing */
    meetingMinutes: 30,
    meetingPeople: 15,
    chatDeleteDays: 60,
    dailyRewardCap: 50,     /* most reward SP one user can earn in a day */
    dailyDislikeLimit: 10,
    weeklyClaimLimit: 3,
    userCap: 1000,          /* users allowed before the waiting list starts */
    adEveryMinutes: 10,
    adRewardSp: 1,
    adRewardPerDay: 5
  },
  packs: [1, 5, 10],        /* Pi packs shown on the Rewards screen */
  /* group size -> SP, largest first */
  groupTable: [[200, 120], [150, 70], [120, 30], [90, 12], [60, 5], [30, 1]],
  ticker: { bg: "#16161d", fg: "#f1f1f5", speed: 45 },   /* speed: 15 slow to 200 fast */
  languages: [
    ["en", "English"], ["hi", "हिंदी"], ["gu", "ગુજરાતી"],
    ["mr", "मराठी"], ["kn", "ಕನ್ನಡ"], ["ta", "தமிழ்"],
    ["te", "తెలుగు"], ["as", "অসমীয়া"], ["zh", "中文"],
    ["ja", "日本語"], ["id", "Bahasa Indonesia"]
  ]
};

/* Reward maths. In stage 2 the same functions run on the server, so the app cannot be tricked. */
window.PS_RULES = {
  feed: function (likes, dislikes, r) { return Math.max(0, Math.floor((likes - dislikes) / r.likesPerSp)); },
  chat: function (messages, r) { return Math.floor(messages / r.chatMsgsPerSp); },
  meeting: function (people, r) { return Math.floor(people / r.meetingPeoplePerSp); },
  group: function (members, posts24h, r, table) {
    if (posts24h < r.minPosts24h) return 0;
    for (var i = 0; i < table.length; i++) { if (members >= table[i][0]) return table[i][1]; }
    return 0;
  },
  channel: function (members, posts24h, r) {
    if (posts24h < r.minPosts24h) return 0;
    return Math.floor(members / 100) * r.channelSpPer100;
  }
};
