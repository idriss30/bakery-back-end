exports.up = async function (knex) {
  // migrate to next state by creating table
  await knex.schema.createTable("users", (table) => {
    table.increments("id");
    table.string("username");
    table.unique("username");
    table.string("email");
    table.string("password");
  });

  await knex.schema.createTable("carts", (table) => {
    table.integer("userId").references("users.id");
    table.string("itemName");
    table.unique("itemName");
    table.integer("itemQty");
  });

  await knex.schema.createTable("inventory", (table) => {
    table.string("productName");
    table.unique("productName");
    table.integer("productQty");
  });
};

exports.down = async function (knex) {
  // migrate to previous state by dropping table
  await knex.schema.dropTable("inventory");
  await knex.schema.dropTable("carts");
  await knex.schema.dropTable("users");
};
