require("dotenv").config();
const environmentName = process.env.NODE_ENV || "test";
const environtmentConfig = require("./knexfile")[environmentName];
const db = require("knex")(environtmentConfig);

module.exports = async () => {
  await db.migrate.latest();
  await db.destroy();
};
