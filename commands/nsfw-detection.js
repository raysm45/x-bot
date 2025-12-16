module.exports = async (message) => {
  if (message.author.bot) return;

  const bannedWords = ["porn", "sex", "nude", "xxx", "bokep", "tolol", "memek", "kontol", "nigger", "niggers", "nigga", "ngentot", "ngentod", "asu", "bajingan", "jembot", "jembut", "coli", "bangsat"];

  if (bannedWords.some(w => message.content.toLowerCase().includes(w))) {
    await message.delete();
    console.log(`[NSFW] Dihapus: ${message.author.tag}`);
    message.channel.send("🚫 kata tidak pantas");
    console.log(`[NSFW] Pesan dihapus dari ${message.author.tag}`);

  }
};