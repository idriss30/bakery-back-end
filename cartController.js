const { removeFromInventory } = require("./inventoryController");
const logger = require("./logger");

const carts = new Map();

const addItemToCart = (username, item) => {
  const newItems = (carts.get(username) || []).concat(item);
  if (!complyToQty(newItems)) {
    const limitError = new Error(`can't have more than 2 of the same item`);
    limitError.code = 400;
    throw limitError;
  }
  removeFromInventory(item);
  carts.set(username, newItems);
  logger.log(`${item} was added to ${username}'s cart`);
  return newItems;
};

//addingMax items of 3
const complyToQty = (cart) => {
  const unitPerItem = cart.reduce((itemMap, itemName) => {
    const quantity = (itemMap[itemName] || 0) + 1;
    return { ...itemMap, [itemName]: quantity };
  }, {}); // initialize with empty object
  return Object.values(unitPerItem).every((itemQty) => itemQty < 3);
};

module.exports = {
  carts,
  addItemToCart,
  complyToQty,
};
