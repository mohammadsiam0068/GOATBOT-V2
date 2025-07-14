const fs = require("fs");
const path = require("path");

// ✅ ফাইল পাথ নির্ধারণ
const dataDir = path.join(__dirname, "..", "data");
const badwordsPath = path.join(dataDir, "badwords.json");
const warnPath = path.join(dataDir, "warnData.json");
const banPath = path.join(dataDir, "bannedUsers.json");

// ✅ সীমা নির্ধারণ
const WARN_LIMIT = 3;

// ✅ ফাইল থেকে ডেটা লোড
let badWords = JSON.parse(fs.readFileSync(badwordsPath, "utf-8"));
let warnData = fs.existsSync(warnPath) ? JSON.parse(fs.readFileSync(warnPath)) : {};
let bannedUsers = fs.existsSync(banPath) ? new Set(JSON.parse(fs.readFileSync(banPath))) : new Set();

// ✅ সেভ ফাংশন
function saveWarnData() {
  fs.writeFileSync(warnPath, JSON.stringify(warnData, null, 2));
}

function saveBannedUsers() {
  fs.writeFileSync(banPath, JSON.stringify([...bannedUsers], null, 2));
}

// ✅ মেসেজ ক্লিন করার ফাংশন
function cleanMessage(msg) {
  return msg
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_@!$#%^&*().=+<>?~`'"|\\/]/g, "");
}

module.exports = {
  config: {
    name: "antighal",
    version: "2.5",
    author: "Siam",
    role: 0,
    shortDescription: "Prefix ছাড়া গালি দিলে ওয়ার্ন ও ব্যান",
    longDescription: "গালির জন্য ওয়ার্ন এবং ৩ বার পরে ব্যান, সব ডেটা JSON ফাইলে সেভ হয়",
    category: "system",
    guide: "No command needed"
  },

  onChat: async function ({ event, api }) {
    const { senderID, body, threadID } = event;
    if (!body) return;

    // ✅ ইউজার ব্যান কিনা চেক
    if (bannedUsers.has(senderID)) {
      return api.sendMessage("🚫 আপনি ব্যান আছেন। আর গালি দিলে আর কোনো সুযোগ পাবেন না।", threadID);
    }

    // ✅ ইনপুট ক্লিন করো
    const cleanMsg = cleanMessage(body);

    // ✅ গালি মেসেজে আছে কিনা চেক
    const hasBadWord = badWords.some(word => cleanMsg.includes(word));
    if (!hasBadWord) return;

    // ✅ ওয়ার্ন কাউন্ট বাড়াও
    if (!warnData[senderID]) {
      warnData[senderID] = 1;
    } else {
      warnData[senderID]++;
    }

    saveWarnData();

    // ✅ ব্যান সীমা পেরিয়ে গেছে?
    if (warnData[senderID] >= WARN_LIMIT) {
      bannedUsers.add(senderID);
      saveBannedUsers();
      return api.sendMessage(`⛔ আপনি ${WARN_LIMIT} বার গালি দিয়েছেন। এখন আপনি ব্যান করা হলেন।`, threadID);
    } else {
      const remaining = WARN_LIMIT - warnData[senderID];
      return api.sendMessage(`⚠️ দয়া করে গালি দিবেন না। আর ${remaining} বার দিলে ব্যান হয়ে যাবেন।`, threadID);
    }
  }
};