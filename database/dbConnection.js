require("dotenv").config();
const environmentName = process.env.NODE_ENV;
const knex = require("knex");
const knexConfig = require("./knexfile")[environmentName];

const db = knex(knexConfig);

module.exports = {
  db,
};
