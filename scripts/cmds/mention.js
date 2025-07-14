const axios = require("axios");

module.exports = {
  config: {
    name: "mention",
    version: "2.1",
    author: "Siam",
    role: 0,
    shortDescription: "প্রোফাইল লিংক দিয়ে মেনশন করুন (অটো-ডিলিট সহ)",
    longDescription: "Facebook লিংক থেকে UID বের করে মেনশন করবে এবং ৫ সেকেন্ড পর অটো ডিলিট হবে",
    category: "utility",
    guide: "{pn} [Facebook প্রোফাইল লিংক]"
  },

  onStart: async function ({ api, event, args }) {
    const link = args.join(" ");
    if (!link.includes("facebook.com")) {
      return api.sendMessage("❌ একটি সঠিক Facebook প্রোফাইল লিংক দিন।", event.threadID);
    }

    let uid;

    // ✅ ID extraction
    const idMatch = link.match(/id=(\d+)/);
    if (idMatch) {
      uid = idMatch[1];
    } else {
      // 🔍 Username extraction
      const usernameMatch = link.match(/facebook\.com\/([^/?#]+)/);
      const username = usernameMatch ? usernameMatch[1] : null;

      if (!username) {
        return api.sendMessage("⚠️ লিংক থেকে ইউজারনেম পাওয়া যায়নি।", event.threadID);
      }

      try {
        // Graph API দিয়ে username → UID
        const res = await axios.get(`https://graph.facebook.com/${username}?fields=id&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`);
        uid = res.data.id;
      } catch (e) {
        console.error("❌ UID বের করা যায়নি:", e.response?.data || e.message);
        return api.sendMessage("❌ ইউজারনেম থেকে UID বের করা যায়নি।", event.threadID);
      }
    }

    // ✅ এবার UID থেকে info এবং মেনশন পাঠানো
    try {
      const userInfo = await api.getUserInfo(uid);
      const name = userInfo[uid]?.name || "ব্যবহারকারী";

      const msg = {
        body: `📌 মেনশন: @${name}`,
        mentions: [{ tag: name, id: uid }]
      };

      // 🟢 মেসেজ পাঠানো
      const sent = await api.sendMessage(msg, event.threadID);

      // 🔥 ৫ সেকেন্ড পরে অটো-ডিলিট
      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 5000); // ৫০০০ মিলিসেকেন্ড = ৫ সেকেন্ড

    } catch (err) {
      console.error("❌ ইউজার ইনফো পাওয়া যায়নি:", err);
      return api.sendMessage("❌ ইউজার ইনফো পাওয়া যায়নি। হয়তো সে গ্রুপে নেই বা অ্যাক্সেস নাই।", event.threadID);
    }
  }
};