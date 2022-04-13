const { db } = require("./database/dbConnection");

const addItemToInventory = async (productName, productQty) => {
  const product = await db("inventory").select().where({ productName }).first();
  if (!product) {
    await db("inventory").insert({ productName, productQty });
    return true;
  }
  await db("inventory")
    .where({ productName })
    .increment({ productQty: productQty });
  return true;
};

const removeFromInventory = async (item) => {
  const product = await db
    .select()
    .from("inventory")
    .where({ productName: item })
    .first();

  if (!product) {
    throw new Error(`${item} is not available`);
  }

  if (product.productQty === 1) {
    await db("inventory").where("productName", item).del();
    return `${product.productName} has been deleted`;
  }

  return await db("inventory")
    .where({ productName: item })
    .decrement({ productQty: 1 });
};

module.exports = {
  addItemToInventory,
  removeFromInventory,
};
