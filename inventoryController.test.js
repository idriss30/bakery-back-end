const { inventory, removeFromInventory } = require("./inventoryController");

afterEach(() => inventory.clear());

describe("checking inventory features", () => {
  test("remove available  ", () => {
    inventory.set("cheesecake", 1);
    removeFromInventory("cheesecake");

    expect(inventory.get("cheesecake")).toEqual(0);
  });

  test("remove unavailable", async () => {
    expect(() => removeFromInventory("cheesecake")).toThrow(
      "cheesecake is not available"
    );
  });
});
