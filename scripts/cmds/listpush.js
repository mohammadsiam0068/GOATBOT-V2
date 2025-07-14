const axios = require("axios");

module.exports = {
  config: {
    name: "listpush",
    version: "1.0",
    author: "Siam",
    role: 2,
    shortDescription: "List uploaded commands from GitHub",
    longDescription: "Lists all .js files in modules/commands from your GitHub repo",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const { token, owner, repo } = require('./pushcmd-config'); // config.js হলে সেভাবে নিন

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/modules/commands`;

    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jsFiles = res.data
        .filter(file => file.name.endsWith(".js"))
        .map(file => `📄 ${file.name}`)
        .join("\n");

      api.sendMessage(`✅ আপলোডকৃত কমান্ড ফাইল:\n\n${jsFiles}`, event.threadID);
    } catch (err) {
      api.sendMessage("❌ তালিকা আনতে সমস্যা হয়েছে!", event.threadID);
    }
  }
};
