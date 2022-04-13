const request = require("supertest");
const { app } = require("./app");
const { createUser } = require("./authenticationController");
const { addItemToCart, getUserId } = require("./cartController");
const { closeConnection, db } = require("./database/dbConnection");
const { addItemToInventory } = require("./inventoryController");

afterAll(() => db.destroy());
afterAll(() => app.close());
afterEach(() => db("users").truncate());

describe("testing user features", () => {
  beforeEach(() => db("users").truncate());

  test("create valid user Route ", async () => {
    const userResponse = await request(app)
      .put("/users/test")
      .send({ email: "test@email.com", password: "pass123" })
      .expect(201)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(userResponse.body).toEqual({ message: "test created successfully" });
  });

  test("create user that already exist", async () => {
    const username = "test",
      password = "123",
      email = "email@test.org";
    await createUser(username, password, email);
    const createExistingUserRequest = await request(app)
      .put(`/users/${username}`)
      .send({ email, password })
      .expect(409)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(createExistingUserRequest.body).toEqual({
      message: "test already exist",
    });
  });
});

describe("testing cart functionnalities", () => {
  const authHeader = Buffer.from("test_user:123").toString("base64"),
    finalAuth = `basic ${authHeader}`;

  beforeEach(() => db("carts").truncate());
  beforeEach(() => db("users").truncate());
  beforeEach(() => db("inventory").truncate());

  test("add items cart routes", async () => {
    await addItemToInventory("bread", 2);
    await createUser("test_user", "123", "test@email.org");
    const cartMock = [{ userId: 1, itemName: "bread", itemQty: 2 }];
    const addResponse = await request(app)
      .post("/carts/test_user/items/")
      .set("authorization", finalAuth)
      .send({ item: "bread", quantity: 2 })
      .expect(201)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(addResponse.body).toEqual(cartMock);
  });

  test("get valid user cart", async () => {
    await addItemToInventory("croissant", 1);
    await createUser("test_user", "123", "test@email.org");
    await addItemToCart("test_user", "croissant");
    const mockRes = [{ userId: 1, itemName: "croissant", itemQty: 1 }];
    const cart = await request(app)
      .get("/carts/test_user/items/")
      .set("authorization", finalAuth)
      .expect(200)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(cart.body).toEqual(mockRes);
  });

  test("delete item from cart", async () => {
    await addItemToInventory("cheesecake", 1);
    await createUser("test_user", "123", "test@email.org");
    await addItemToCart("test_user", "cheesecake");

    const deleteRes = await request(app)
      .del("/carts/test_user/items/cheesecake")
      .set("authorization", finalAuth)
      .expect(400);

    expect(deleteRes.body).toEqual([]);
  });
});
