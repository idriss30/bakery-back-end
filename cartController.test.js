const FakeTimers = require("@sinonjs/fake-timers");
const fs = require("fs");
const os = require("os");
const { addItemToCart, monitorStaleItems } = require("./cartController");
const { addItemToInventory } = require("./inventoryController");
const { db } = require("./database/dbConnection");
const { user: globalUser } = require("./userUtils");

beforeAll(async () => {
  await db.migrate.latest();
});

describe("testing carts function", () => {
  const finalPath = `${os.tmpdir()}\\logs.txt`;
  beforeEach(() => {
    fs.writeFileSync(`${finalPath}`, " ");
  });

  test("adding unavailable item", async () => {
    try {
      await addItemToCart(globalUser.username, "cheesecake");
    } catch (error) {
      const err = new Error("cheesecake is not available");
      expect(error).toEqual(err);
    }
  });

  test("adding available items to the cart", async () => {
    await addItemToInventory("cheesecake", 3);
    const cart = await addItemToCart(globalUser.username, "cheesecake");

    const cheesecakeinv = await db("inventory")
      .select("productQty")
      .where({ productName: "cheesecake" })
      .first();
    const cartRes = await db("carts").select().where({ userId: globalUser.id });
    expect(cart).toEqual(cartRes);
    expect(cheesecakeinv.productQty).toEqual(2);
  });

  test("adding more than 2 items", async () => {
    await addItemToInventory("cheesecake", 3);
    await db("carts").insert({ userId: 1, itemName: "cheesecake", itemQty: 2 });
    try {
      await addItemToCart(globalUser.username, "cheesecake");
    } catch (error) {
      const err = new Error("no more than 2 items");
      expect(error).toEqual(err);
    }
  });

  test("log items added to cart", async () => {
    await addItemToInventory("croissant", 1);
    await addItemToCart(globalUser.username, "croissant");

    const fileRes = fs.readFileSync(`${finalPath}`, "utf-8");
    expect(fileRes).toContain(`croissant added to test_user cart\n`);
  });
});

describe("times functionnalities", () => {
  const hoursInMs = (n) => 3600 * 1000 * n;

  let clock;

  const retryMechanismFunc = async (fn) => {
    const jestAssertionError = (() => {
      try {
        expect(false).toBe(true);
      } catch (error) {
        return error.constructor;
      }
    })();

    try {
      await fn();
    } catch (error) {
      if (error.constructor === jestAssertionError) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await retryMechanismFunc(fn);
      } else {
        throw error;
      }
    }
  };

  beforeEach(() => {
    clock = FakeTimers.install({ toFake: ["Date", "setInterval"] }); // replace real time related function and return a clock object
  });

  //restore original timer method after the test
  afterEach(() => {
    clock = clock.uninstall();
  });

  test("removing stales items", async () => {
    await addItemToInventory("cheesecake", 2);
    await addItemToCart(globalUser.username, "cheesecake");
    clock.tick(hoursInMs(4));
    timer = monitorStaleItems();
    clock.tick(hoursInMs(2)); // move the clock forward by a number of ms

    await retryMechanismFunc(async () => {
      const cartContent = await db("carts")
        .select("")
        .where({ userId: globalUser.id });
      expect(cartContent).toEqual([]);
    });

    await retryMechanismFunc(async () => {
      const cheeseInventory = await db("inventory")
        .select("")
        .where("productName", "cheesecake");

      expect(cheeseInventory).toEqual([
        { productName: "cheesecake", productQty: 2 },
      ]);
    });
  });
});
