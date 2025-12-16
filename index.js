console.log("BOT FILE JALAN");
console.log("TOKEN ADA:", !!process.env.TOKEN);

require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");

console.log("🔄 Memulai bot...");
const logger = require("./utils/logger");

logger.info("Memulai bot...");
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

console.log("📦 Memuat commands...");
client.commands.set("mod", require("./commands/moderation"));
client.commands.set("nsfw", require("./commands/nsfw-detection"));

console.log("📡 Memuat event...");
client.on("messageCreate", require("./events/messageCreate"));

client.once("ready", () => {
  console.log(`✅ Bot ONLINE sebagai ${client.user.tag}`);
  console.log(`📊 Masuk ke ${client.guilds.cache.size} server`);
});

console.log("🔑 Login ke Discord...");
client.login(process.env.TOKEN)
  .catch(err => console.error("❌ Gagal login:", err));

  process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
