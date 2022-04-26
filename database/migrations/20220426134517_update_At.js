// update_at field to add cart items
exports.up = async function (knex) {
  await knex.schema.alterTable("carts", (table) => {
    table.timestamp("updated_At");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("carts", (table) => {
    table.dropColumn("updated_At");
  });
};
