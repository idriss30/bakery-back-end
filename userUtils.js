const { db } = require("./database/dbConnection");
const { hashedPassword } = require("./authenticationController");

const username = "test_user";
const password = "password123";
const email = "test@email.org";
const hashPassword = hashedPassword(password);
const header = Buffer.from(`${username}:${password}`).toString("base64");
const authHeader = `Basic ${header}`;

let user = {
  username,
  email,
  password,
  authHeader,
};

const createUser = async () => {
  await db("users").insert({ username, email, password: hashPassword });
  const { id } = await db.select().from("users").where({ username }).first();

  user.id = id;
};

module.exports = {
  createUser,
  user,
};
