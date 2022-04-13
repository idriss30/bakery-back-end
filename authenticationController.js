// testing middleware
const crypto = require("crypto");
const { db } = require("./database/dbConnection");

const hashedPassword = (password) => {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
};

const createUser = async (username, password, email) => {
  const isUserExist = await db("users").select().where({ username }).first();
  if (!isUserExist) {
    await db("users").insert({
      username,
      email,
      password: hashedPassword(password),
    });
    return true;
  }
  throw new Error(`${username} already exist`);
};

const credentialsAreValid = async (username, password) => {
  const user = await db("users").select("").where({ username }).first();
  if (!user) return false;
  return hashedPassword(password) === user.password;
};

const authenticationMiddleware = async (req, res, next) => {
  // can be refactored to pass the userId to next()
  try {
    const authHeader = req.headers.authorization;

    const credentials = Buffer.from(
      authHeader.slice("basic".length + 1),
      "base64"
    ).toString();

    const [username, password] = credentials.split(":");
    const checkCredentials = await credentialsAreValid(username, password);
    if (!checkCredentials) {
      throw new Error("credentials are not valid");
    }
  } catch (error) {
    return res.status(401).json({ message: "provide valid credentials" });
  }
  await next();
};

module.exports = {
  hashedPassword,
  credentialsAreValid,
  authenticationMiddleware,
  createUser,
};
