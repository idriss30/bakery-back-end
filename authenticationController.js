// testing middleware
const crypto = require("crypto");

const users = new Map();

const hashedPassword = (password) => {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
};

module.exports = { users, hashedPassword };
