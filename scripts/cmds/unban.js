const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const banPath = path.join(dataDir, "bannedUsers.json");
const warnPath = path.join(dataDir, "warnData.json");

// 🔁 ডেটা লোড
let bannedUsers = fs.existsSync(banPath) ? new Set(JSON.parse(fs.readFileSync(banPath))) : new Set();
let warnData = fs.existsSync(warnPath) ? JSON.parse(fs.readFileSync(warnPath)) : {};

// 🔃 সেভ ফাংশন
function save() {
  fs.writeFileSync(banPath, JSON.stringify([...bannedUsers], null, 2));
  fs.writeFileSync(warnPath, JSON.stringify(warnData, null, 2));
}

module.exports = {
  config: {
    name: "unban",
    version: "1.0",
    author: "Siam",
    role: 0, // সবার জন্য, চেক নিচে হবে
    shortDescription: "ব্যবহারকারীকে ব্যান থেকে মুক্ত করুন",
    longDescription: "বট মালিক ও গ্রুপ এডমিন ব্যান আনলক করতে পারবেন",
    category: "admin",
    guide: "{pn} [uid]"
  },

  onStart: async function ({ args, api, event }) {
    const { senderID, threadID, messageID } = event;
    const uid = args[0];

    if (!uid || isNaN(uid)) {
      return api.sendMessage("⚠️ সঠিক UID দিন।\nউদাহরণ: /unban 1000123456789", threadID, messageID);
    }

    // ✅ বট অ্যাডমিন UID
    const botAdmins = ["100044530383890"]; // ← ← তোমার UID বসানো হয়েছে

    // ✅ গ্রুপ এডমিন চেক
    let isGroupAdmin = false;
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      isGroupAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
    } catch (e) {
      console.log("ℹ️ গ্রুপ এডমিন চেক করতে সমস্যা:", e.message);
    }

    const isBotAdmin = botAdmins.includes(senderID);

    if (!isBotAdmin && !isGroupAdmin) {
      return api.sendMessage("⛔ শুধু বট অ্যাডমিন অথবা গ্রুপ এডমিন আনব্যান করতে পারবেন।", threadID, messageID);
    }

    if (!bannedUsers.has(uid)) {
      return api.sendMessage("ℹ️ এই UID ব্যান তালিকায় নেই।", threadID, messageID);
    }

    // ✅ আনব্যান এবং warn ডিলিট
    bannedUsers.delete(uid);
    delete warnData[uid];
    save();

    return api.sendMessage(`✅ UID ${uid} সফলভাবে আনব্যান করা হয়েছে এবং ওয়ার্ন ডেটা মুছে ফেলা হয়েছে।`, threadID, messageID);
  }
};