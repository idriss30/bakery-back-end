const express = require("express");
const { carts, addItemToCart } = require("./cartController");
const { inventory } = require("./inventoryController");

const app = express();

app.get("/carts/:username/items/", (req, res) => {
  const cart = carts.get(req.params.username);
  cart ? res.json(cart) : res.sendStatus(404);
});

app.post("/carts/:username/items/:item", (req, res) => {
  try {
    const { username, item } = req.params;
    const newElement = addItemToCart(username, item);
    res.json(newElement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
  app: app.listen(3000),
};
