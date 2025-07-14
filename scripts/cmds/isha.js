const axios = require("axios");

module.exports = {
  config: {
    name: "isha",
    version: "1.3",
    author: "Siam",
    role: 0,
    shortDescription: "Simsimi AI Chat with Multiple API Support",
    longDescription: "Chat with Simsimi using multiple fallback APIs",
    category: "chat",
    guide: "{pn} [আপনার বার্তা]"
  },

  onStart: async function ({ api, event, args }) {
    const userMessage = args.join(" ");
    if (!userMessage) {
      return api.sendMessage("🟡 অনুগ্রহ করে একটি বার্তা লিখুন, যেমন: simi tumi kemon acho", event.threadID);
    }

    // 🔁 যত খুশি API এখানে যোগ করুন
    const apiList = [
      {
        name: "API 1",
        url: "https://wsapi.simsimi.com/190410/talk",
        key: "qLgGvYtiTZzDrZsa7hRUQu1KNgytykDDSUY1ljt4"
      },
      {
        name: "API 2",
        url: "https://wsapi.simsimi.com/190410/talk",
        key: "MFG6haCvsB8fp9~qPYq8QiIrjhZHbe3fd8tvoHnn"
      },
      {
        name: "API 3",
        url: "https://your-third-api-url.com/talk", // 👈 এখানে নতুন API URL দিন
        key: "your-third-api-key"
      },
      // আরও চাইলে এখানে কপি করে যুক্ত করতে থাকুন
    ];

    let lastError = null;

    for (const currentApi of apiList) {
      try {
        const res = await axios.post(currentApi.url,
          {
            utext: userMessage,
            lang: "bn"
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": currentApi.key
            }
          }
        );

        const reply = res.data.atext || "❓ কোনো উত্তর পাওয়া যায়নি।";
        return api.sendMessage(`🤖 ${currentApi.name}:\n${reply}`, event.threadID);
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ ${currentApi.name} ব্যর্থ হয়েছে:`, err.response?.data || err.message);
        // পরবর্তী API চেষ্টা করব
      }
    }

    // সবগুলো API ব্যর্থ হলে
    return api.sendMessage("❌ সব API ব্যর্থ হয়েছে:\n" + (lastError?.response?.data?.msg || "অজানা ত্রুটি"), event.threadID);
  }
};