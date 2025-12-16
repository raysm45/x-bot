const gameManager = require("../gamemanager");

module.exports = async (message) => {
  const channelId = message.channel.id;

  const game =
    gameManager.mat.get(channelId) ||
    gameManager.sejarah.get(channelId);

  if (!game) {
    return message.reply("❌ Tidak ada game yang sedang berjalan di channel ini");
  }

  if (game.stop === true) {
    return message.reply("⚠️ Game sudah dalam proses dihentikan");
  }

  game.stop = true;

  message.channel.send("🛑 Game dihentikan oleh pengguna");
};
