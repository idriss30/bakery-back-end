const request = require("supertest");
const { app } = require("./app");
const { user: globalUser } = require("./userUtils");
const { addItemToCart } = require("./cartController");

const { addItemToInventory } = require("./inventoryController");

afterAll(() => app.close());

describe("testing user features", () => {
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
