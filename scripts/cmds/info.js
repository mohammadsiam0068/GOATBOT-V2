const fs = require("fs");
const moment = require("moment-timezone");
const BengaliDate = require("bengali-date");
const fast = require("fast-speedtest-api");

module.exports = {
  config: {
    name: "info",
    version: "3.0",
    author: "MD Abdur Rahman Siam",
    countDown: 5,
    role: 0,
    shortDescription: "বট ও মালিক সম্পর্কে তথ্য",
    longDescription: "বাংলা ও ইংরেজি তারিখ সহ বট, মালিক, সময়, স্পিড এবং ছবি সহ তথ্য",
    category: "utility",
    guide: "{pn} অথবা 'info' লিখলে বট তথ্য দেবে"
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
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm", // Demo Token
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: fast.UNITS.Mbps
      });
      speedResult = await speedTest.getSpeed();
    } catch (err) {
      console.log("⚠️ স্পিড টেস্ট ব্যর্থ:", err.message);
    }

    // ✅ বাংলাদেশ সময়
    const now = moment().tz("Asia/Dhaka");
    const engDate = now.format("MMMM Do YYYY");       // July 15th 2025
    const engTime = now.format("h:mm:ss A");           // 2:34:45 PM

    // ✅ বাংলা পঞ্জিকা তারিখ
    const bd = new BengaliDate(now.toDate());
    const banglaDate = bd.format("DD MMMM YYYY");      // ১৫ আষাঢ় ১৪৩১
    const banglaYear = bd.getYear();

    // ✅ আপটাইম ও পিং
    const uptime = process.uptime();
    const uptimeString = formatUptime(uptime);
    const ping = Date.now() - timeStart;

    // ✅ ছবি লোড
    let link;
    try {
      const urls = JSON.parse(fs.readFileSync("data/siam.json", "utf8"));
      link = urls[0]; // শুধু একটি ছবি
    } catch (err) {
      console.error("❌ siam.json লোড করতে সমস্যা:", err.message);
      link = null;
    }

    // ✅ মেসেজ তৈরি
    const replyMessage = `✨ 𝙁𝙇𝘼𝙈𝙀 𝘽𝙊𝙏 𝙄𝙉𝙁𝙊 ✨

👑 Author: ${authorName}
📛 Status: ${status}
🔗 FB: ${authorFB}
📸 Insta: ${authorInsta}
✈️ Telegram: ${authorTele}
🐦 Twitter: ${authorTwi}

🤖 Bot Name: ${botName}
🧩 Prefix: ${botPrefix}
📅 Date: ${engDate} (${banglaDate} বঙ্গাব্দ)
🕒 Time: ${engTime}
🔁 Uptime: ${uptimeString}
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

  onChat: async function ({ event, message, api }) {
    if (event.body && event.body.toLowerCase() === "info") {
      await this.onStart({ message, api, event });
    }
  }
};

// ✅ আপটাইম কনভার্টার
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