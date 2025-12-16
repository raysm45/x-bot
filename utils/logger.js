const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function time() {
  return new Date().toLocaleTimeString("id-ID");
}

function log(type, color, message) {
  console.log(
    `${color}[${time()}] [${type}]${colors.reset} ${message}`
  );
}

module.exports = {
  info: (msg) => log("INFO", colors.cyan, msg),
  success: (msg) => log("SUCCESS", colors.green, msg),
  command: (msg) => log("COMMAND", colors.blue, msg),
  mod: (msg) => log("MOD", colors.magenta, msg),
  nsfw: (msg) => log("NSFW", colors.yellow, msg),
  error: (msg) => log("ERROR", colors.red, msg),
};
