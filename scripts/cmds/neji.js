const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/neji-img.jpg";

const tokens = [
  "Bearer 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",
  "Bearer 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"
];

module.exports = {
  config: {
    name: "neji",
    version: "2.3",
    permission: 0,
    credits: "Siam",
    description: "Text to image with HuggingFace API",
    prefix: true,
    usages: "[prompt]",
    cooldowns: 10
  },

  onStart: async function({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠️ উদাহরণ:
.neji cat flying in sky", event.threadID);
    }

    const endpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";

    for (const token of tokens) {
      try {
        const response = await axios.post(
          endpoint,
          { inputs: prompt },
          {
            headers: { Authorization: token },
            responseType: "arraybuffer",
            timeout: 120000
          }
        );

        fs.writeFileSync(path, response.data);

        return api.sendMessage({
          body: `🖼️ তৈরি হলো:
"${prompt}"`,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path));

      } catch (err) {
        console.error("⛔ Token:", token.slice(0, 15), "-", err.response?.status, err.response?.data?.error || err.message);
      }
    }

    return api.sendMessage("❌ ছবি তৈরি করতে ব্যর্থ! Token বা Model সমস্যা হতে পারে।", event.threadID);
  }
};