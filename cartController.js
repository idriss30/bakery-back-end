const { db } = require("./database/dbConnection");
const {
  removeFromInventory,
  addItemToInventory,
} = require("./inventoryController");
const logger = require("./logger");

const getUserId = async (username) => {
  const userId = await db.select().from("users").where({ username }).first();
  if (userId.id) {
    return userId.id;
  }
  throw new Error(`${username} not found`);
};

const hoursInMS = (n) => 3600 * 1000 * n;

const removeStaleItems = async () => {
  const fourHoursAgo = new Date(Date.now() - hoursInMS(4)).toISOString();

  const staleItems = await db
    .select()
    .from("carts")
    .where("updated_At", "<", fourHoursAgo);

  if (staleItems.length === 0) return;
  const staleItemsUpdate = staleItems.map((item) => {
    return addItemToInventory(item.itemName, item.itemQty);
  });

  await Promise.all(staleItemsUpdate);

  const staleItemsTuples = staleItems.map((item) => [
    item.itemName,
    item.userId,
  ]);
  await db("carts").del().whereIn(["itemName", "userId"], staleItemsTuples);
};

const monitorStaleItems = () => setInterval(removeStaleItems, hoursInMS(2));

const addItemToCart = async (username, itemName) => {
  await removeFromInventory(itemName);
  const userId = await getUserId(username);
  const checkItem = await db("carts")
    .select("")
    .where({ userId, itemName })
    .first();
  if (checkItem === undefined) {
    await db("carts").insert({
      userId,
      itemName,
      itemQty: 1,
      updated_At: new Date().toISOString(),
    });
  } else {
    if (checkItem.itemQty + 1 < 3) {
      await db("carts")
        .increment("itemQty")
        .update({ updated_At: new Date().toISOString() })
        .where({ userId, itemName });
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
  monitorStaleItems,
};
