const fs = require('fs');
const moment = require('moment-timezone');
const NepaliDate = require('nepali-date');
const fast = require('fast-speedtest-api');

module.exports = {
  config: {
    name: "info",
    version: "2.0",
    author: "MD Abdur Rahman Siam",
    countDown: 5,
    role: 0,
    shortDescription: "বট ও মালিকের তথ্য দেখায়",
    longDescription: "বট ও মালিক সম্পর্কে তথ্য এবং একটি ছবি পাঠায়",
    category: "utility",
    guide: "{pn} অথবা মেসেজে 'info' লিখলেই চলবে"
  },

  onStart: async function ({ message, api, event }) {
    const botName = "FLAME-BOT";
    const botPrefix = "(.)";
    const authorName = "MD Abdur Rahman Siam";
    const authorFB = "FB.Me/100044530383890";
    const authorInsta = "Ssiyam69";
    const authorTele = "SIAM_039";
    const authorTwi = "Ssiyam69";
    const status = "Single";

    const timeStart = Date.now();

    // ✅ স্পিড টেস্ট
    let speedResult = "N/A";
    try {
      const speedTest = new fast({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // demo token
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: fast.UNITS.Mbps
      });
      speedResult = await speedTest.getSpeed();
    } catch (err) {
      console.log("⛔ স্পিড টেস্টে সমস্যা:", err.message);
    }

    // ✅ বাংলাদেশ সময় ও তারিখ
    const now = moment().tz('Asia/Dhaka');
    const date = now.format('MMMM Do YYYY');
    const time = now.format('h:mm:ss A');

    // ✅ নেপালি তারিখ (optional)
    const nepaliDate = new NepaliDate(now.toDate());
    const bsDateStr = nepaliDate.format("dddd, DD MMMM");

    // ✅ আপটাইম
    const uptime = process.uptime();
    const uptimeString = formatUptime(uptime);

    // ✅ ping
    const ping = Date.now() - timeStart;

    // ✅ ছবি লোড (siam.json থেকে)
    let link = null;
    try {
      const urls = JSON.parse(fs.readFileSync("data/siam.json")); // ঠিক path চেক করো
      link = urls[0]; // শুধু ১টা থাকলে index 0
    } catch (err) {
      console.error("❌ siam.json ফাইল লোড করতে সমস্যা:", err.message);
    }

    // ✅ রিপ্লাই তৈরি
    const replyMessage = `✨ 𝙁𝙇𝘼𝙈𝙀 𝘽𝙊𝙏 𝙄𝙉𝙁𝙊 ✨

👑 Author: ${authorName}
📛 Status: ${status}
🔗 FB: ${authorFB}
📸 Insta: ${authorInsta}
✈️ Telegram: ${authorTele}
🐦 Twitter: ${authorTwi}

🤖 Bot Name: ${botName}
🧩 Prefix: ${botPrefix}
🕒 Time: ${time}
📅 Date: ${date}
📆 BS Date: ${bsDateStr}
🔄 Uptime: ${uptimeString}
📶 Speed: ${speedResult} Mbps
📡 Ping: ${ping} ms
`;

    try {
      const attachment = link ? await global.utils.getStreamFromURL(link) : null;
      message.reply({
        body: replyMessage,
        attachment: attachment || undefined
      });
    } catch (err) {
      console.error("❌ ছবি পাঠাতে সমস্যা:", err.message);
      message.reply(replyMessage); // fallback without image
    }
  },

  // ✅ মেসেজে 'info' বললেও কাজ করবে
  onChat: async function ({ event, message, api }) {
    if (event.body && event.body.toLowerCase() === "info") {
      await this.onStart({ message, api, event });
    }
  }
};

// 🕐 আপটাইম ফরম্যাট
function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / (60 * 60)) % 24);
  const days = Math.floor(uptime / (60 * 60 * 24));
  const str = [];
  if (days > 0) str.push(`${days}d`);
  if (hours > 0) str.push(`${hours}h`);
  if (minutes > 0) str.push(`${minutes}m`);
  if (seconds > 0) str.push(`${seconds}s`);
  return str.join(" ");
}