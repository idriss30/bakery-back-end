const path = require("path");

module.exports = {
  development: {
    client: "sqlite3",
    connection: { filename: path.join(__dirname, "./dev.sqlite") },
    useNullAsDefault: true,
    migrations: { directory: path.join(__dirname, "/migrations") },
  },

  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: { directory: path.join(__dirname, "/migrations") },
  },
};
