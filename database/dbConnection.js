require("dotenv").config();
const environmentName = process.env.NODE_ENV || "test";
const knex = require("knex");
const knexConfig = require("./knexfile")[environmentName];

const db = knex(knexConfig);

module.exports = {
  db,
};
