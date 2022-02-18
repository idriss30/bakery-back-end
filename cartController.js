const { removeFromInventory } = require("./inventoryController");
const logger = require("./logger");

const carts = new Map();

const addItemToCart = (username, item) => {
  removeFromInventory(item);
  const newItems = (carts.get(username) || []).concat(item);
  carts.set(username, newItems);
  logger.log(`${item} was added to ${username}'s cart`);
  return newItems;
};

module.exports = {
  carts,
  addItemToCart,
};
