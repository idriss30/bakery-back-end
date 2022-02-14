const express = require("express");

const app = express();

// setting up cart and inventory to manage local state
const carts = new Map();
const inventory = new Map();

app.get("/carts/:username/items/", (req, res) => {
  const cart = carts.get(req.params.username);
  cart ? res.json(cart) : res.sendStatus(404);
});

app.post("/carts/:username/items/:item", (req, res) => {
  const { username, item } = req.params;

  const isAvailable = inventory.has(item) && inventory.get(item) > 0;

  if (!isAvailable) {
    return res.status(400).json({ message: "item was not found" });
  }
  const newItems = (carts.get(username) || []).concat(item);
  carts.set(username, newItems);
  inventory.set(item, inventory.get(item) - 1);

  res.json(newItems);
});

app.delete("/carts/:username/items/:item", (req, res) => {
  const { username, item } = req.params;
  if (!carts.has(username) || !carts.get(username).includes(item)) {
    res.status(400).json("item is not in the cart");
  }
  const newItems = (carts.get(username) || []).filter((item) => item !== item);
  carts.set(username, newItems);
  inventory.set(item, inventory.get(item) ? inventory.get(item) - 1 : 0);
  res.json(newItems);
});

module.exports = {
  inventory,
  app: app.listen(3000),
  carts,
};
