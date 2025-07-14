const axios = require("axios");

module.exports = {
  config: {
    name: "deletecmd",
    version: "1.0",
    author: "Siam",
    role: 2,
    shortDescription: "Delete command from GitHub repo",
    longDescription: "Delete a file from your GitHub repo via GitHub API",
    category: "admin",
    guide: "{pn} [filename.js]"
  },

  onStart: async function ({ api, event, args }) {
    const filename = args[0];
    if (!filename) return api.sendMessage("❗ ফাইলের নাম দিন: /deletecmd setwarn.js", event.threadID);

    const { token, owner, repo, branch } = require('./pushcmd-config'); // config.js বা constant ব্যবহার করুন

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/modules/commands/${filename}`;

    try {
      // SHA আনতে হবে
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sha = res.data.sha;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          message: `Delete command: ${filename}`,
          sha,
          branch
        }
      });

      api.sendMessage(`🗑️ ${filename} সফলভাবে GitHub থেকে মুছে ফেলা হয়েছে।`, event.threadID);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      api.sendMessage(`❌ ডিলিট ব্যর্থ:\n${msg}`, event.threadID);
    }
  }
};
