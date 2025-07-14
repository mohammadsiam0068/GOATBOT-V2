const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/nobg.png";

module.exports = {
  config: {
    name: "removebg",
    version: "1.0",
    permission: 0,
    credits: "Siam",
    description: "Remove background from image using HuggingFace",
    prefix: true,
    usages: "[reply image]",
    cooldowns: 10
  },

  onStart: async function ({ api, event }) {
    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0 || reply.attachments[0].type !== "photo") {
      return api.sendMessage("⚠️ দয়া করে একটি ছবির রিপ্লাই দিন!", event.threadID);
    }

    const imageURL = reply.attachments[0].url;
    const token = "Bearer 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";

    try {
      const imgData = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;

      const res = await axios.post(
        "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
        imgData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "image/jpeg"
          },
          responseType: "arraybuffer"
        }
      );

      fs.writeFileSync(path, res.data);

      api.sendMessage({
        body: "🧼 ব্যাকগ্রাউন্ড সরানো হয়েছে!",
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path));

    } catch (err) {
      console.error("RemoveBG error:", err.message);
      return api.sendMessage("❌ ব্যাকগ্রাউন্ড সরানো যায়নি!", event.threadID);
    }
  }
};