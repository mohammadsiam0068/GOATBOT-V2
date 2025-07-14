module.exports = {
	config: {
		name: "profileq",
		version: "1.5",
		author: "SiAM ",
		countDown: 5,
		role: 0,
		shortDescription: "Get profile picture",
		longDescription: "This command retrieves the profile picture of a user.",
		category: "I",
		guide: {
			en: "only: {pn} (default -own pic)\nor\n{pn} [@tag|uid|fbLink]"
		}
	},

	langs: {
		en: {
			error: "Oops! Something went wrong. Please try again later.",
			success: "Here's the profile picture of "
		}
	},

	onStart: async function ({ api, event, args, getLang, message }) {

const fs = require("fs-extra");
    const { getPrefix } = global.utils;
       const p = getPrefix(event.threadID);
      
		try {
			const { getStreamFromURL, findUid } = global.utils;

			let uid = null;
			const input = args.join(' ');

			if (event.mentions && Object.keys(event.mentions).length > 0) {
				uid = Object.keys(event.mentions)[0];
			} else if (/^\d+$/.test(input)) {
				uid = input;
			} else if (input.includes('facebook.com')) {
				let linkUid;
				try {
					linkUid = await findUid(input);
				} catch (error) {
					console.log(error);
					return api.sendMessage("Sorry, I couldn't find the ID from the Facebook link you provided.", event.threadID);
				}
				if (linkUid) {
					uid = linkUid;
				}
			}

      else {
				uid = event.senderID;
      }


			const user = await api.getUserInfo(uid);
			const name = user[uid].name;
			const picUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

			const stream = await getStreamFromURL(picUrl);
			api.sendMessage({
				body: `${getLang("success")} ${name} (${uid})`,
				attachment: stream
			}, event.threadID);
		} catch (e) {
			console.log(e);
			api.sendMessage(getLang("error"), event.threadID);
		}
	}
};
