const { carts, addItemToCart, complyToQty } = require("./cartController");
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

  test("adding more than 3 items", () => {
    inventory.set("cheesecake", 1);
    const initialCart = ["cheesecake", "cheesecake", "croissant"];
    carts.set("idris", initialCart);
    try {
      addItemToCart("idris", "cheesecake");
    } catch (error) {
      const expectedErr = new Error("can't have more than 2 of the same item");
      expectedErr.code = 400;
      expect(error).toEqual(expectedErr);
    }

    expect(inventory.get("cheesecake")).toEqual(1);
    expect(carts.get("idris")).toEqual(initialCart);
    expect.assertions(3);
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

describe("comply to quantity test", () => {
  test("checking quantity allowed", () => {
    carts.set("idris", ["cheesecake", "cheesecake", "danish"]);

    const isQuantityComplying = complyToQty(carts.get("idris"));
    expect(isQuantityComplying).toBeTrue();
  });

  test("checking cart with more than allowed qty", () => {
    carts.set("idris", ["cheesecake", "croissant", "cheesecake", "cheesecake"]);
    const isQuantityComplying = complyToQty(carts.get("idris"));
    expect(isQuantityComplying).toBeFalse();
  });
});
