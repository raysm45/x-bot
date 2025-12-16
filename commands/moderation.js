const db = require("../database");

// ================= HELPER =================
async function sendDM(user, text) {
  try {
    await user.send(text);
  } catch {
    console.log("[DM FAILED] User menutup DM");
  }
}

function getReason(args, startIndex) {
  const reason = args.slice(startIndex).join(" ");
  return reason || "Tidak ada alasan";
}

// ================= MAIN =================
module.exports = async (message, args) => {
  try {
    if (!message.guild) return;
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const sub = args[0];

    // ================= HELP =================
    if (sub === "help") {
      return message.channel.send(`
**MODERATION COMMANDS**
!mod warn @user <reason>
!mod warns @user
!mod clearwarn @user
!mod ban @user <reason>
!mod unban USER_ID
!mod tempban @user <detik> <reason>
!mod timeout @user <menit>
!mod lock
!mod unlock
!mod slowmode <detik>
`);
    }

    // ================= LOCK =================
    if (sub === "lock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );
      return message.reply("🔒 Channel dikunci");
    }

    // ================= UNLOCK =================
    if (sub === "unlock") {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );
      return message.reply("🔓 Channel dibuka");
    }

    // ================= SLOWMODE =================
    if (sub === "slowmode") {
      const time = parseInt(args[1]);
      if (isNaN(time)) return message.reply("Masukkan angka (detik)");
      await message.channel.setRateLimitPerUser(time);
      return message.reply(`🐌 Slowmode ${time} detik`);
    }

    // ================= UNBAN =================
    if (sub === "unban") {
      const userId = args[1];
      if (!userId) return message.reply("❌ Masukkan USER ID!");

      try {
        await message.guild.bans.fetch(userId);
        await message.guild.bans.remove(userId);
        return message.reply("✅ User berhasil di-unban");
      } catch {
        return message.reply("❌ Gagal unban");
      }
    }

    // ======= COMMAND DI BAWAH INI WAJIB MENTION =======
    const target = message.mentions.members.first();
    if (!target) return message.reply("❌ Mention user!");

    // ================= WARN =================
    if (sub === "warn") {
      const reason = getReason(args, 2);

      db.run(
        `INSERT INTO warns (user_id, guild_id, count)
         VALUES (?, ?, 1)
         ON CONFLICT(user_id, guild_id)
         DO UPDATE SET count = count + 1`,
        [target.id, message.guild.id]
      );

      await sendDM(
        target.user,
        `⚠️ **WARN** di server **${message.guild.name}**\n` +
        `Alasan: ${reason}\nModerator: ${message.author.tag}`
      );

      return message.reply(
        `⚠️ Warn diberikan ke **${target.user.tag}**\n📝 Alasan: ${reason}`
      );
    }

    // ================= LIHAT WARN =================
    if (sub === "warns") {
      db.get(
        `SELECT count FROM warns WHERE user_id = ? AND guild_id = ?`,
        [target.id, message.guild.id],
        (err, row) => {
          const count = row ? row.count : 0;
          message.reply(`⚠️ ${target.user.tag} memiliki ${count} warn`);
        }
      );
      return;
    }

    // ================= CLEAR WARN =================
    if (sub === "clearwarn") {
      db.run(
        `DELETE FROM warns WHERE user_id = ? AND guild_id = ?`,
        [target.id, message.guild.id]
      );
      return message.reply("🗑️ Warn dihapus");
    }

    // ================= BAN =================
    if (sub === "ban") {
      const reason = getReason(args, 2);

      await sendDM(
        target.user,
        `⛔ Kamu telah di-**BAN** dari **${message.guild.name}**\n` +
        `Alasan: ${reason}`
      );

      await target.ban({ reason });

      return message.reply(
        `⛔ **${target.user.tag}** diban\n📝 Alasan: ${reason}`
      );
    }

    // ================= TEMP BAN =================
    if (sub === "tempban") {
      const time = parseInt(args[2]);
      if (isNaN(time)) return message.reply("Masukkan waktu (detik)");

      const reason = getReason(args, 3);

      await sendDM(
        target.user,
        `⏱️ Kamu di-**TEMPBAN** ${time} detik dari **${message.guild.name}**\n` +
        `Alasan: ${reason}`
      );

      await target.ban({ reason });

      setTimeout(async () => {
        try {
          await message.guild.bans.remove(target.id);
        } catch {}
      }, time * 1000);

      return message.reply(
        `⏱️ **${target.user.tag}** di-tempban ${time} detik\n📝 Alasan: ${reason}`
      );
    }

  } catch (err) {
    console.log("[ERROR MODERATION]", err.message);
    return message.reply("❌ Terjadi error");
  }
};
