// testing middleware
const crypto = require("crypto");

const users = new Map();

const hashedPassword = (password) => {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
};

const credentialsAreValid = (username, password) => {
  if (!users.has(username)) {
    return false;
  }
  const expectedPassword = hashedPassword(password);
  const savedPassword = users.get(username).password;
  return expectedPassword === savedPassword;
};

const authenticationMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const credentials = Buffer.from(
      authHeader.slice("basic".length + 1),
      "base64"
    ).toString();

    const [username, password] = credentials.split(":");
    if (!credentialsAreValid(username, password)) {
      throw new Error("credentials are not valid");
    }
  } catch (error) {
    return res.status(401).json({ message: "provide valid credentials" });
  }
  await next();
};

module.exports = {
  users,
  hashedPassword,
  credentialsAreValid,
  authenticationMiddleware,
};
