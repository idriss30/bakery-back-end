const { db } = require("./database/dbConnection");
const {
  removeFromInventory,
  addItemToInventory,
} = require("./inventoryController");
const logger = require("./logger");

const getUserId = async (username) => {
  const fetchUser = await db
    .select("")
    .from("users")
    .where({ username })
    .first();
  if (!fetchUser) {
    const userError = new Error("user not found");
    userError.code = 404;
    throw userError;
  }
  return fetchUser.id;
};

const addItemToCart = async (username, itemName) => {
  await removeFromInventory(itemName);
  const userId = await getUserId(username);
  const checkItem = await db("carts")
    .select("")
    .where({ userId, itemName })
    .first();
  if (checkItem === undefined) {
    await db("carts").insert({ userId, itemName, itemQty: 1 });
  } else {
    if (checkItem.itemQty + 1 < 3) {
      await db("carts").increment("itemQty").where({ userId, itemName });
    } else if (checkItem.itemQty + 1 > 3) {
      await addItemToInventory(itemName, 1);
      const limitErr = new Error("no more than 3 items");
      limitErr.code = 400;
      throw limitErr;
    }
  }

  logger.log(`${itemName} added to ${username} cart`);
  return await db("carts").select().where({ userId });
};

module.exports = {
  addItemToCart,
  getUserId,
};
