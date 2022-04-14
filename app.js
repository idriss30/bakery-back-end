const express = require("express");
const { addItemToCart, getUserId } = require("./cartController");
const { addItemToInventory } = require("./inventoryController");
const { authenticationMiddleware } = require("./authenticationController");

const { db } = require("./database/dbConnection");

const app = express();

app.use(express.json());

app.use(async (req, res, next) => {
  if (req.originalUrl.startsWith("/carts")) {
    return await authenticationMiddleware(req, res, next);
  }
  next();
});

app.put("/users/:username", async (req, res) => {
  const username = req.params.username;
  const { email, password } = req.body;
  try {
    const userResponse = await db("users").insert({
      username,
      password,
      email,
    });
    if (userResponse) {
      res.status(201).json({ message: `${username} created successfully` });
    }
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

app.get("/carts/:username/items/", async (req, res) => {
  const username = req.params.username;
  const userId = await getUserId(username);
  const userCart = await db.select().from("carts").where({ userId });
  userCart.length > 0 ? res.status(200).json(userCart) : res.sendStatus(404);
});

app.post("/carts/:username/items/", async (req, res) => {
  const username = req.params.username;
  let { item, quantity } = req.body;
  let items;
  try {
    do {
      quantity -= 1;
      items = await addItemToCart(username, item);
    } while (quantity > 0);

    res.status(201).json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/carts/:username/items/:item", async (req, res) => {
  let { username, item } = req.params;
  const userId = await getUserId(username);
  const cart = await db
    .select()
    .from("carts")
    .where({ userId, itemName: item });

  if (cart.length > 0) {
    if (cart.itemQty > 1) {
      await db("carts").decrement("itemQty").where({ userId, itemName: item });
    } else {
      await db("carts").del().where({ userId, itemName: item });
    }

    const items = await db("carts").select().where({ userId });
    await addItemToInventory(item, 1);
    res.status(400).json(items);
  } else {
    res.status(404).json({ message: `${item} not in cart` });
  }
});

module.exports = {
  app: app.listen(3000),
};
