const { EmbedBuilder } = require("discord.js");
const gameManager = require("../gamemanager");
const games = gameManager.sejarah;

// ================= SOAL =================
const questions = [
  { q: "Siapa presiden pertama Indonesia?", a: ["soekarno", "ir soekarno"] },
  { q: "Indonesia merdeka tahun berapa?", a: ["1945"] },
  { q: "Tanggal proklamasi Indonesia?", a: ["17 agustus 1945"] },
  { q: "Siapa wakil presiden pertama Indonesia?", a: ["mohammad hatta", "hatta"] },
  { q: "Siapa pencipta lagu Indonesia Raya?", a: ["wr supratman"] },
  { q: "Apa nama bendera Indonesia?", a: ["merah putih"] },
  { q: "Kerajaan Hindu tertua di Indonesia?", a: ["kutai"] },
  { q: "Kerajaan Islam pertama di Indonesia?", a: ["samudera pasai"] },
  { q: "Siapa pahlawan dari Aceh?", a: ["cut nyak dien"] },
  { q: "Siapa patih Majapahit?", a: ["gajah mada"] },
];

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ================= MAIN =================
module.exports = async (message) => {
  if (!message.guild) return;

  if (games.has(message.channel.id)) {
    return message.reply("❌ Game sejarah sedang berjalan");
  }

  const game = { scores: new Map(), stop: false };
  games.set(message.channel.id, game);

  const timeLimit = 15;
  const soalList = shuffle([...questions]).slice(0, 10);

  const startEmbed = new EmbedBuilder()
    .setTitle("📜 GAME SEJARAH DIMULAI")
    .setColor("Blue")
    .setDescription("🥇 10 poin | 🥈 7 poin | 🥉 4 poin")
    .setFooter({ text: "!stop untuk menghentikan game" });

  await message.channel.send({ embeds: [startEmbed] });

  // ================= LOOP =================
  for (let round = 1; round <= 10; round++) {
    if (game.stop) break;

    const s = soalList[round - 1];
    const answered = [];
    let timeLeft = timeLimit;

    const embed = new EmbedBuilder()
      .setTitle(`📜 Babak ${round}/10`)
      .setColor("Purple")
      .setDescription(`**${s.q}**\n\n⏳ ${timeLeft}s`)
      .setFooter({ text: "🟢 Benar | 🔴 Salah" });

    const msg = await message.channel.send({ embeds: [embed] });

    const timer = setInterval(() => {
      if (game.stop) {
        clearInterval(timer);
        return;
      }

      timeLeft--;
      if (timeLeft <= 0) return;

      msg.edit({
        embeds: [
          EmbedBuilder.from(embed).setDescription(
            `**${s.q}**\n\n⏳ ${timeLeft}s`
          )
        ]
      }).catch(() => {});
    }, 1000);

    await new Promise(resolve => {
      const collector = message.channel.createMessageCollector({
        time: timeLimit * 1000
      });

      collector.on("collect", m => {
        if (m.author.bot) return;
        if (game.stop) {
          collector.stop();
          return;
        }

        const content = m.content.toLowerCase().trim();
        if (!s.a.some(ans => content === ans.toLowerCase())) {
          m.react("🔴");
          return;
        }

        if (answered.includes(m.author.id)) return;
        answered.push(m.author.id);

        const point = [10, 7, 4][answered.length - 1] || 0;
        if (point > 0) {
          game.scores.set(
            m.author.id,
            (game.scores.get(m.author.id) || 0) + point
          );
        }

        m.react("🟢");
        if (answered.length >= 3) collector.stop();
      });

      collector.on("end", () => {
        clearInterval(timer);
        resolve();
      });
    });
  }

  // ================= END =================
  games.delete(message.channel.id);

  const leaderboard = [...game.scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map((e, i) => `**${i + 1}.** <@${e[0]}> — ${e[1]} poin`)
    .join("\n");

  const endEmbed = new EmbedBuilder()
    .setTitle("🏆 GAME SELESAI")
    .setColor("Purple")
    .setDescription(leaderboard || "Tidak ada pemenang");

  message.channel.send({ embeds: [endEmbed] });
};
