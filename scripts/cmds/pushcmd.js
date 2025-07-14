const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "pushcmd",
    version: "1.0",
    author: "Siam",
    role: 2, // admin only
    shortDescription: "Upload local command to GitHub repo",
    longDescription: "Push a file from local modules/commands to your GitHub repo using token",
    category: "admin",
    guide: "{pn} [filename.js]\n\nউদাহরণ: /pushcmd setwarn.js"
  },

  onStart: async function ({ api, event, args }) {
    const filename = args[0];
    if (!filename) {
      return api.sendMessage("📁 ফাইলের নাম দিন! যেমন:\n/pushcmd setwarn.js", event.threadID);
    }

    const filePath = `modules/commands/${filename}`;

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ ফাইল খুঁজে পাওয়া যায়নি:\n${filePath}`, event.threadID);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const base64Content = Buffer.from(fileContent).toString("base64");

    const githubToken = "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";
    const repoOwner = "mohammadsiam0068";
    const repoName = "GOATBOT-V2";
    const branch = "main";

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/modules/commands/${filename}`;

    try {
      // Check if file exists to get SHA
      let sha = null;
      try {
        const checkRes = await axios.get(url, {
          headers: { Authorization: `Bearer ${githubToken}` }
        });
        sha = checkRes.data.sha;
      } catch (_) {
        // File doesn't exist
      }

      const response = await axios.put(
        url,
        {
          message: `Upload command: ${filename}`,
          content: base64Content,
          branch,
          ...(sha && { sha })
        },
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      return api.sendMessage(`✅ সফলভাবে GitHub-এ আপলোড হয়েছে:\n📂 ${filename}`, event.threadID);
    } catch (err) {
      const error = err.response?.data?.message || err.message;
      return api.sendMessage(`❌ আপলোড ব্যর্থ:\n${error}`, event.threadID);
    }
  }
};
