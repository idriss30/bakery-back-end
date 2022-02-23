const { app } = require("./app");
const { carts, addItemToCart } = require("./cartController");
const { inventory } = require("./inventoryController");
const request = require("supertest");

afterAll(() => app.close());
afterEach(() => inventory.clear());
beforeEach(() => carts.clear());

describe("checking cart features", () => {
  test("adding unavailable items", async () => {
    await request(app).post("/carts/idris/items/cheesecake").expect(400);
  });

  test("adding available items to the cart", async () => {
    inventory.set("cheesecake", 1);
    const addingResponse = await request(app)
      .post("/carts/idris/items/cheesecake")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8"); // can check if header match your expectation

    expect(await addingResponse.body).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toEqual(0);
  });

  test("fetch unavailable user cart", async () => {
    await request(app).get("/carts/idris/items").expect(404);
  });

  test("fetch available user cart", async () => {
    inventory.set("cheesecake", 2);

    addItemToCart("idris", "cheesecake");
    const getCartResponse = await request(app)
      .get("/carts/idris/items")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8");
    expect(await getCartResponse.body).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toEqual(1);
  });

  test("deleting available item in a cart", async () => {
    inventory.set("croissant", 1);
    addItemToCart("idris", "croissant");

    const deleteItemResponse = await request(app)
      .delete("/carts/idris/items/croissant")
      .expect(200);
    expect(await deleteItemResponse.body).toEqual([]);
  });

  test("delete non existant item in the cart", async () => {
    const deleteUnvailableResponse = await request(app)
      .delete("/carts/idris/items/cheesecake")
      .expect(400);
    expect(await deleteUnvailableResponse.body).toEqual(
      "item is not in the cart"
    );
  });
});
