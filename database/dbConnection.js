const knex = require("knex");
const knexConfig = require("./knexfile").development;

const db = knex(knexConfig);

module.exports = {
  db,
};
