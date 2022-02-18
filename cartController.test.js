const { carts, addItemToCart } = require("./cartController");
const { inventory } = require("./inventoryController");
const fs = require("fs");
const os = require("os");

afterEach(() => inventory.clear());
afterEach(() => carts.clear());

describe("testing carts function", () => {
  test("adding unavailable item ", () => {
    carts.set("test_user", []);
    inventory.set("cheesecake", 0);

    try {
      addItemToCart("test_user", "cheesecake");
    } catch (e) {
      const error = new Error("cheesecake is not available");
      error.code = 400;
      expect(e).toEqual(error);
    }

    expect(carts.get("test_user")).toEqual([]);
  });

  test("adding available items", () => {
    inventory.set("croissant", 1);
    const adding = addItemToCart("test_user", "croissant");

    expect(inventory.get("croissant")).toEqual(0);
    expect(carts.get("test_user")).toEqual(adding);
  });
});

describe("testing cart logging", () => {
  const finalPath = `${os.tmpdir()}\\logs.txt`;
  beforeEach(() => {
    fs.writeFileSync(`${finalPath} `, "");
  });
  test("log items added to cart", () => {
    carts.set("test_user", []);
    inventory.set("croissant", 1);
    addItemToCart("test_user", "croissant");
    const fileRes = fs.readFileSync(`${finalPath}`, "utf-8");
    expect(fileRes).toContain(`croissant was added to test_user's cart\n`);
  });
});
