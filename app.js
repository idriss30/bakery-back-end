const express = require("express");
const { carts, addItemToCart } = require("./cartController");
const { inventory } = require("./inventoryController");

const app = express();

app.use(express.json());

app.get("/carts/:username/items/", (req, res) => {
  const cart = carts.get(req.params.username);
  cart ? res.json(cart) : res.sendStatus(404);
});

app.post("/carts/:username/items/", (req, res) => {
  const { username } = req.params;
  const { item, quantity } = req.body;

  try {
    for (let i = 0; i < quantity; i++) {
      const newItems = addItemToCart(username, item);
      res.json(newItems);
    }
  } catch (error) {
    res.status(error.code).json({ message: error.message });
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
