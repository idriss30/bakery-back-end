const fetch = require("isomorphic-fetch");
const { app } = require("./app");
const { carts, addItemToCart } = require("./cartController");
const { inventory } = require("./inventoryController");

const rootLink = "http://localhost:3000/";
afterAll(() => app.close());
afterEach(() => inventory.clear());
beforeEach(() => carts.clear());

describe("checking cart features", () => {
  test("adding unavailable items", async () => {
    const response = await fetch(`${rootLink}carts/idris/items/cheesecake`, {
      method: "POST",
    });
    expect(response.status).toEqual(400);
  });

  test("adding available items to the cart", async () => {
    inventory.set("cheesecake", 1);
    const addingResponse = await fetch(
      `${rootLink}carts/idris/items/cheesecake`,
      {
        method: "POST",
      }
    );

    expect(addingResponse.status).toEqual(200);
    expect(await addingResponse.json()).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toEqual(0);
  });

  test("fetch unavailable user cart", async () => {
    const noUserResponse = await fetch(`${rootLink}carts/idris/items`, {
      method: "GET",
    });

    expect(noUserResponse.status).toEqual(404);
  });

  test("fetch available user cart", async () => {
    inventory.set("cheesecake", 2);

    addItemToCart("idris", "cheesecake");
    const getCartResponse = await fetch(`${rootLink}carts/idris/items`, {
      method: "GET",
    });

    expect(getCartResponse.status).toEqual(200);
    expect(await getCartResponse.json()).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toEqual(1);
  });

  test("deleting available item in a cart", async () => {
    inventory.set("croissant", 1);
    const addItemResponse = await fetch(
      `${rootLink}carts/idris/items/croissant`,
      {
        method: "POST",
      }
    );
    const deleteItemResponse = await fetch(
      `${rootLink}carts/idris/items/croissant`,
      {
        method: "DELETE",
      }
    );
    expect(addItemResponse.status).toEqual(200);
    expect(deleteItemResponse.status).toEqual(200);
    expect(await deleteItemResponse.json()).toEqual([]);
  });

  test("delete non existant item in the cart", async () => {
    const deleteUnvailableResponse = await fetch(
      `${rootLink}carts/idris/items/cheesecake`,
      {
        method: "DELETE",
      }
    );

    expect(deleteUnvailableResponse.status).toEqual(400);
    expect(await deleteUnvailableResponse.json()).toEqual(
      "item is not in the cart"
    );
  });
});
