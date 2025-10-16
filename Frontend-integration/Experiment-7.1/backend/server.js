// Import required modules
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS for cross-origin requests (React <-> Express)
app.use(cors());

// Enable JSON parsing (for handling POST requests)
app.use(express.json());

// Sample product data
const products = [
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Mouse", price: 25 },
  { id: 3, name: "Keyboard", price: 45 },
];

// GET API endpoint - returns list of products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// POST API endpoint - handle "Buy Now" requests
app.post("/api/buy", (req, res) => {
  const { productId } = req.body;
  const id = Number(productId); // ✅ convert to number (important)
  const product = products.find((p) => p.id === id);

  if (product) {
    console.log(`✅ Product purchased: ${product.name} ($${product.price})`);
    res.json({
      success: true,
      message: `You bought ${product.name} for $${product.price}!`,
    });
  } else {
    console.log("❌ Product not found:", productId);
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
