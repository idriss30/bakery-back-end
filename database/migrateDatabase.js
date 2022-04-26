const { db } = require("./dbConnection");

module.exports = async () => {
  await db.migrate.latest();
  await db.destroy();
};
