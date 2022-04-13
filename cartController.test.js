const { addItemToCart, getUserId } = require("./cartController");
const { addItemToInventory } = require("./inventoryController");
const fs = require("fs");
const os = require("os");
const { db } = require("./database/dbConnection");
const { createUser } = require("./authenticationController");

afterAll(() => db.destroy());

describe("testing getUserId", () => {
  beforeEach(() => db("users").truncate());
  test("provide valid username", async () => {
    await createUser("test", "123", "hello@test.com");
    const id = await getUserId("test");
    expect(id).toEqual(1);
  });

  test("provide invalid user ", async () => {
    try {
      await getUserId("patrick");
    } catch (error) {
      const err = new Error("user not found");
      err.code = 404;
      expect(error).toEqual(err);
    }
  });
  expect.assertions(1);
});

describe("testing carts function", () => {
  beforeEach(() => db("inventory").truncate());
  beforeEach(() => db("users").truncate());
  beforeEach(() => db("carts").truncate());
  const finalPath = `${os.tmpdir()}\\logs.txt`;
  beforeEach(() => {
    fs.writeFileSync(`${finalPath}`, " ");
  });

  test("adding unavailable item", async () => {
    const username = "test",
      email = "test@email.com",
      password = "123";
    await createUser(username, password, email);
    try {
      await addItemToCart(username, "cheesecake");
    } catch (error) {
      const err = new Error("cheesecake is not available");
      expect(error).toEqual(err);
    }
  });

  test("adding available items to the cart", async () => {
    await createUser("test_user", "123", "email@test.com");
    await addItemToInventory("cheesecake", 3);
    const cart = await addItemToCart("test_user", "cheesecake");
    const cartMockup = [{ userId: 1, itemName: "cheesecake", itemQty: 1 }];
    const cheesecakeinv = await db("inventory")
      .select("productQty")
      .where({ productName: "cheesecake" })
      .first();
    expect(cart).toEqual(cartMockup);
    expect(cheesecakeinv.productQty).toEqual(2);
  });

  test("adding more than 2 items", async () => {
    await createUser("test_user", "123", "email@test.com");
    await addItemToInventory("cheesecake", 3);
    await db("carts").insert({ userId: 1, itemName: "cheesecake", itemQty: 2 });
    try {
      await addItemToCart("test_user", "cheesecake");
    } catch (error) {
      const err = new Error("no more than 2 items");
      expect(error).toEqual(err);
    }
  });

  test("log items added to cart", async () => {
    await createUser("test_user", "123", "email@test.com");
    await addItemToInventory("croissant", 1);
    await addItemToCart("test_user", "croissant");

    const fileRes = fs.readFileSync(`${finalPath}`, "utf-8");
    expect(fileRes).toContain(`croissant added to test_user cart\n`);
  });
});
