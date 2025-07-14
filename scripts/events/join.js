module.exports = {
  config: {
    name: "join",
    eventType: ["log:subscribe"], // গ্রুপে কেউ join করলে
    version: "1.0.0",
    credits: "Siam",
  },

  onStart: async function ({ api, event }) {
    const { threadName, threadID, logMessageData } = event;

    const addedUser = logMessageData.addedParticipants[0];
    const name = addedUser.fullName;
    const uid = addedUser.userFbId;

    const msg = {
      body: `🌟 স্বাগতম ${name} 🌟\n\nআপনাকে ${threadName} গ্রুপে পেয়ে আমরা আনন্দিত!\nআশা করি আপনি নিয়ম মেনে আমাদের সঙ্গে থাকবেন 🥰`,
      mentions: [{
        tag: name,
        id: uid
      }]
    };

    api.sendMessage(msg, threadID);
  }
};