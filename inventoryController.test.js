const { db } = require("./database/dbConnection");
const {
  addItemToInventory,
  removeFromInventory,
} = require("./inventoryController");

describe("checking removeFromInventory", () => {
  test("remove available item  ", async () => {
    await addItemToInventory("cheesecake", 2);
    await removeFromInventory("cheesecake");

    const fetchCheeseInventory = await db("inventory")
      .select()
      .where({ productName: "cheesecake" })
      .first();

    expect(fetchCheeseInventory.productQty).toEqual(1);
  });

  test("remove unavailable", async () => {
    try {
      await removeFromInventory("cheesecake");
    } catch (error) {
      const err = new Error("cheesecake is not available");
      expect(err).toEqual(error);
    }
    expect.assertions(1);
  });

  test("remove when quantity = 1", async () => {
    const addCheese = await addItemToInventory("cheesecake", 1);
    const inventoryDeleteResponse = await removeFromInventory("cheesecake");
    expect(addCheese).toEqual(true);

    expect(inventoryDeleteResponse).toEqual("cheesecake has been deleted");
  });
});
describe("adding items to inventory", () => {
  test("check insert part of function", async () => {
    await addItemToInventory("cheesecake", 2);
    const checkCheeseInventory = await db("inventory")
      .select()
      .where({ productName: "cheesecake" });
    expect(checkCheeseInventory).toEqual([
      {
        productName: "cheesecake",
        productQty: 2,
      },
    ]);
  });

  test("check increment part of the function", async () => {
    await addItemToInventory("danish", 1);
    await addItemToInventory("danish", 2);
    const fetchDanish = await db("inventory")
      .select()
      .where({ productName: "danish" });
    expect(fetchDanish).toEqual([
      {
        productName: "danish",
        productQty: 3,
      },
    ]);
  });
});
