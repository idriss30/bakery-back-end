const { db } = require("./dbConnection");
const tables = ["users", "inventory", "carts"];

beforeEach(() => {
  return Promise.all(
    tables.map((table) => {
      return db.truncate(table);
    })
  );
});
