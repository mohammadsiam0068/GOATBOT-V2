const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/cartoon.png";

module.exports = {
  config: {
    name: "cartoon",
    version: "1.0",
    permission: 0,
    credits: "Siam",
    description: "Cartoonify image using HuggingFace",
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
        "https://api-inference.huggingface.co/models/ogkalu/cartoonify",
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
        body: "🖼️ ছবিকে কার্টুনে রূপান্তর করা হয়েছে!",
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path));

    } catch (err) {
      console.error("Cartoonify error:", err.message);
      return api.sendMessage("❌ কার্টুন করা যায়নি!", event.threadID);
    }
  }
};