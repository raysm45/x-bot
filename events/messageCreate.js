const config = require("../config.json");

module.exports = async (message) => {

    // ================= BASIC CHECK =================
    if (!message || !message.content) return;
    if (message.author.bot) return;
    try {
    // ================= LOG KE TERMINAL =================
    if (message.content.startsWith(config.prefix)) {
      console.log(
        `[COMMAND] ${message.author.tag} : ${message.content}`
      );
    }

    // ================= NSFW (AUTO) =================
    const nsfw = require("../commands/nsfw-detection");
    nsfw(message);

    // ================= BUKAN COMMAND =================
    if (!message.content.startsWith(config.prefix)) return;

    // ================= PARSE COMMAND =================
    const args = message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/);

    const command = args.shift().toLowerCase();

    // ================= MODERATION =================
    if (command === "mod") {
      const mod = require("../commands/moderation");
      return mod(message, args);
    }

    // ================= GAME SEJARAH =================
    if (command === "sejarah") {
      const sejarah = require("../commands/sejarah");
      return sejarah(message, args);
    }

    // ================= GAME MATEMATIKA =================
    if (command === "mat") {
      const mat = require("../commands/mat");
      return mat(message, args);
    }

         //============== STOP GAME =======================
  if (command === "stop") {
  const stop = require("../commands/stop");
  return stop(message);
}
    // ================= STATUS =================
    if (command === "status") {
     const ping = require("../commands/status");
     return ping(message, message.client);

}

  } catch (err) {
    console.log("[MESSAGE EVENT ERROR]", err);
  }
};
