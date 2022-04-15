const { path } = require("express/lib/application");

require("dotenv").config();
const environmentName = process.env.NODE_ENV || "test";
const environtmentConfig = require("./knexfile")[environmentName];
const db = require("knex")(environtmentConfig);

const migrationConfig = {
  directory: "./database/migrations",
};

module.exports = async () => {
  await db.migrate.latest(migrationConfig);
  await db.destroy();
};
