
const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

let fuse = null;

function loadData() {
  const jsonPath = path.join(__dirname, "..", "data", "isha.json");
  if (!fs.existsSync(jsonPath)) return null;
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const items = Object.entries(raw).map(([question, answer]) => ({ question, answer }));
  fuse = new Fuse(items, {
    keys: ["question"],
    includeScore: true,
    threshold: 0.4,
  });
  return true;
}

module.exports = {
  config: {
    name: "isha",
    version: "1.1",
    author: "Siam",
    role: 0,
    shortDescription: "লোকাল ফাজি বাংলা চ্যাট",
    longDescription: "প্রশ্নের কাছাকাছি মিলেও উত্তর দেয় এমন ফাজি লোকাল চ্যাট বট",
    category: "chat",
    guide: "{pn} [আপনার প্রশ্ন]"
  },

  onStart: async function ({ message, args }) {
    const userInput = args.join(" ").trim().toLowerCase();
    if (!userInput)
      return message.reply("🟡 অনুগ্রহ করে একটি প্রশ্ন লিখুন।");

    if (!fuse && !loadData())
      return message.reply("❌ isha.json ফাইল পাওয়া যায়নি।");

    const results = fuse.search(userInput);
    if (results.length > 0 && results[0].score < 0.4) {
      return message.reply(results[0].item.answer);
    } else {
      return message.reply("❓ আমি বুঝতে পারিনি, আরেকবার স্পষ্ট করে বলো প্লিজ।");
    }
  }
};
