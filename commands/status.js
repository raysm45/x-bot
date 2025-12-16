const { EmbedBuilder } = require("discord.js");
const os = require("os");

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor(seconds / 60) % 60;
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = async (message, client) => {
  const sent = await message.channel.send("tunggu sebentar");

  const latency = sent.createdTimestamp - message.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);
  const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
  const uptime = formatUptime(process.uptime());

  const embed = new EmbedBuilder()
    .setTitle("HAYYYY💘")
    .setColor("Purple")
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      { name: "📡 Message Latency", value: `${latency} ms`, inline: true },
      { name: "⚙️ API Latency", value: `${apiLatency} ms`, inline: true },
      { name: "⏱️ Uptime", value: uptime, inline: false },
      { name: "🖥️ RAM Usage", value: `${memory} MB`, inline: true },
      { name: "🌐 Servers", value: `${client.guilds.cache.size}`, inline: true },
      { name: "👥 Users", value: `${client.users.cache.size}`, inline: true }
    )
    .setFooter({
      text: "Pesan ini akan terhapus otomatis dalam 60 detik"
    })
    .setTimestamp();

  await sent.edit({ content: null, embeds: [embed] });

  // AUTO DELETE 10 DETIK
  setTimeout(() => {
    sent.delete().catch(() => {});
  }, 60000);
};
