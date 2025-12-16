const { Client, GatewayIntentBits } = require("discord.js");

console.log("🔄 Bot starting...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot ONLINE sebagai ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.content === "ping") {
    message.reply("pong");
  }
});

console.log("🔑 Login...");
client.login(process.env.TOKEN)
  .catch(err => console.error("❌ Login error:", err));
