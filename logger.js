const fs = require("fs");
const os = require("os");

const path = `${os.tmpdir()}\\logs.txt`;

const logger = {
  log: (msg) => fs.appendFileSync(`${path}`, msg + "\n"),
};

module.exports = logger;
