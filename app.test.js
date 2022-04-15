const request = require("supertest");
const { app } = require("./app");
const { user: globalUser } = require("./userUtils");
const { addItemToCart } = require("./cartController");
const { db } = require("./database/dbConnection");
const { addItemToInventory } = require("./inventoryController");
const fetch = require("isomorphic-fetch");
require("dotenv").config();

jest.mock("isomorphic-fetch"); // mock isonmorphic fetch to avoid sending request to the api

afterAll(() => app.close());

describe("testing user features", () => {
  //
  test("create valid user Route ", async () => {
    const userResponse = await request(app)
      .put("/users/test")
      .send({ email: "test@email.com", password: "pass123" })
      .expect(201)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(userResponse.body).toEqual({ message: "test created successfully" });
  });

  test("create user that already exist", async () => {
    try {
      await request(app)
        .put(`/users/${globalUser.username}`)
        .send({ email: globalUser.email, password: globalUser.password })
        .expect(409)
        .expect("Content-type", "application/json; charset=utf-8");
    } catch (error) {
      expect.assertions(1);
      expect(error.message).toContain("SQLITE_CONSTRAINT");
    }
  });
});

describe("testing cart functionnalities", () => {
  test("add items cart routes", async () => {
    await addItemToInventory("bread", 2);

    const cartMock = [{ userId: globalUser.id, itemName: "bread", itemQty: 2 }];
    const addResponse = await request(app)
      .post(`/carts/${globalUser.username}/items/`)
      .set("authorization", globalUser.authHeader)
      .send({ item: "bread", quantity: 2 })
      .expect(201)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(addResponse.body).toEqual(cartMock);
  });

  test("get valid user cart", async () => {
    await addItemToInventory("croissant", 1);

    await addItemToCart(globalUser.username, "croissant");
    const mockRes = [{ userId: 1, itemName: "croissant", itemQty: 1 }];
    const cart = await request(app)
      .get("/carts/test_user/items/")
      .set("authorization", globalUser.authHeader)
      .expect(200)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(cart.body).toEqual(mockRes);
  });

  test("delete item from cart", async () => {
    await addItemToInventory("cheesecake", 1);
    await addItemToCart(globalUser.username, "cheesecake");

    const deleteRes = await request(app)
      .del(`/carts/${globalUser.username}/items/cheesecake`)
      .set("authorization", globalUser.authHeader)
      .expect(400);

    expect(deleteRes.body).toEqual([]);
  });
});

describe("fetch inventory items", () => {
  const cheese = { productName: "cheese", productQty: 2 };
  const chocolate = { productName: "chocolate", productQty: 1 };

  beforeEach(async () => {
    await db("inventory").insert([cheese, chocolate]);
  });

  test("can fetch an item from inventory", async () => {
    const fakeApiResponse = {
      title: "parmesan wafers",
      missedIngredientCount: 1,
      usedIngredients: [
        {
          aisle: "Cheese",
          name: "parmesan",
          original: "80g freshly grated parmesan (or vegetarian alternative)",
          originalName: "freshly grated parmesan (or vegetarian alternative)",
          meta: ["freshly grated", "(or vegetarian alternative)"],
        },
      ],
    };

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${cheese.productName}&number=10&${process.env.API_KEY}`;
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(fakeApiResponse),
    });

    const fetchInventoryItem = await request(app)
      .get(`/inventory/${cheese.productName}/`)
      .expect(200)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(fetchInventoryItem.body).toEqual({
      ...cheese,
      info: `info recipe ${fakeApiResponse.title}, ${fakeApiResponse.missedIngredientCount}`,
      recipes: fakeApiResponse.usedIngredients,
    });
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(url, { method: "GET" });
  });
});
