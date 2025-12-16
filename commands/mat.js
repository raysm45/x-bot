const { EmbedBuilder } = require("discord.js");
const gameManager = require("../gamemanager");
const games = gameManager.mat;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ================= GENERATE SOAL =================
function generate(level) {
  let q, ans;

  if (level === "gampang") {
    const a = rand(10, 30), b = rand(5, 20);
    q = `${a} + ${b}`;
    ans = a + b;
  }

  if (level === "sedang") {
    const a = rand(30, 70), b = rand(20, 60);
    q = `${a} × ${b}`;
    ans = a * b;
  }

  if (level === "susah") {
    const a = rand(30, 80), b = rand(20, 80);
    q = `${a} ÷ ${b}`;
    ans = Math.floor(a / b);
  }

  if (level === "mustahil") {
    const type = rand(1, 5);

    if (type === 1) {
      const a = rand(2, 10);
      const b = rand(2, 10);
      q = `√(${a * a} × ${b * b}) = ?`;
      ans = a * b;
    }

    if (type === 2) {
      const a = rand(2, 4);
      const b = rand(2, 3);
      const c = rand(2, 5);
      q = `(${a}^${b} × ${c}) − ${a} = ?`;
      ans = Math.pow(a, b) * c - a;
    }

    if (type === 3) {
      const x = rand(3, 15);
      const a = rand(2, 4);
      const b = rand(2, 10);
      q = `${a}x + ${b} = ${a * x + b} → x = ?`;
      ans = x;
    }

    if (type === 4) {
      const x = rand(3, 12);
      const a = rand(2, 5);
      const b = rand(5, 15);
      q = `${a}x − ${b} = ${a * x - b} → x = ?`;
      ans = x;
    }

    if (type === 5) {
      const a = rand(8, 20);
      const b = rand(2, 5);
      const c = rand(3, 7);
      q = `(${a} ÷ ${b} + ${c}) × 2 = ?`;
      ans = (Math.floor(a / b) + c) * 2;
    }
  }

  return { q, ans };
}

// ================= MAIN =================
module.exports = async (message, args) => {
  if (!message.guild) return;

  const level = args[0];
  if (!["gampang", "sedang", "susah", "mustahil"].includes(level)) {
    return message.reply("Gunakan: `!mat gampang | sedang | susah | mustahil`");
  }

  if (games.has(message.channel.id)) {
    return message.reply("❌ Game sedang berjalan");
  }

  const game = { scores: new Map(), stop: false };
  games.set(message.channel.id, game);

  const timeLimit = level === "mustahil" ? 30 : 15;

  // ================= START EMBED =================
  const startEmbed = new EmbedBuilder()
    .setTitle("🧮 GAME MATEMATIKA")
    .setColor("Purple")
    .setDescription(
      `📊 Level: **${level.toUpperCase()}**\n` +
      `⏱️ Waktu: **${timeLimit} detik**\n\n` +
      "🥇 10 poin | 🥈 7 poin | 🥉 4 poin"
    )
    .setFooter({ text: "!stop untuk menghentikan game" });

  await message.channel.send({ embeds: [startEmbed] });

  for (let round = 1; round <= 10; round++) {
    if (game.stop) break;

    const s = generate(level);
    const answered = [];
    let timeLeft = timeLimit;

    const embed = new EmbedBuilder()
      .setTitle(`🔢 Babak ${round}/10`)
      .setColor("Purple")
      .setDescription(`**${s.q}**\n\n⏳ Sisa waktu: **${timeLeft}s**`)
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
            `**${s.q}**\n\n⏳ Sisa waktu: **${timeLeft}s**`
          )
        ]
      }).catch(() => {});
    }, 1000);

    await new Promise(resolve => {
      const collector = message.channel.createMessageCollector({
        time: timeLimit * 1000
      });

      collector.on("collect", m => {
        if (m.author.bot || game.stop) return;

        const answer = parseInt(m.content);
        if (answer !== s.ans) {
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
