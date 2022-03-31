const request = require("supertest");
const { app } = require("./app");
const { carts } = require("./cartController");
const { inventory } = require("./inventoryController");
const {
  users,
  hashedPassword,
  createUserMock,
  finalAuth,
} = require("./authenticationController");

afterAll(() => app.close());
afterEach(() => users.clear());
afterEach(() => inventory.clear());
beforeEach(() => carts.clear());

describe("checking cart features", () => {
  beforeEach(() => createUserMock());
  test("adding unavailable items", async () => {
    carts.set("test_user", []);
    const requestResponse = await request(app)
      .post("/carts/test_user/items/")
      .set("authorization", finalAuth)
      .send({ item: "cheesecake", quantity: 2 })
      .expect(400)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(await requestResponse.body).toEqual({
      message: "cheesecake is not available",
    });
    expect(carts.get("test_user")).toEqual([]);
  });

  test("adding available items to the cart", async () => {
    inventory.set("cheesecake", 1);
    const addingResponse = await request(app)
      .post("/carts/test_user/items/")
      .set("authorization", finalAuth)
      .send({ item: "cheesecake", quantity: 1 })
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8"); // can check if header match your expectation

    expect(await addingResponse.body).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toEqual(0);
  });

  test("removing available item in a cart", async () => {
    inventory.set("croissant", 1);
    carts.set("test_user", ["croissant"]);

    const deleteItemResponse = await request(app)
      .delete("/carts/test_user/items/croissant")
      .set("authorization", finalAuth)
      .expect(200);
    expect(await deleteItemResponse.body).toEqual([]);
  });

  test("delete non existant item in the cart", async () => {
    const deleteUnvailableResponse = await request(app)
      .delete("/carts/test_user/items/cheesecake")
      .set("authorization", finalAuth)
      .expect(400);
    expect(await deleteUnvailableResponse.body).toEqual(
      "cheesecake is not in the cart"
    );
  });
});

describe("creating users account", () => {
  test("create a user", async () => {
    const createResponse = await request(app)
      .put("/users/user_test")
      .send({ email: "test_user@email.org", password: "pass123" })
      .expect(201)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(createResponse.body).toEqual({
      message: "user_test created successfully",
    });
    expect(users.get("user_test")).toEqual({
      email: "test_user@email.org",
      password: hashedPassword("pass123"),
    });
  });

  test("user who already exist", async () => {
    users.set("test_user", {
      email: "test@email.com",
      password: hashedPassword("pass123"),
    });
    const rejectUserResponse = await request(app)
      .put("/users/test_user")
      .send({ email: "test@email.com", password: "pass123" })
      .expect(409)
      .expect("Content-type", "application/json; charset=utf-8");

    expect(rejectUserResponse.body).toEqual({
      message: "test_user already exist",
    });
  });
});
