import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // ✅ Added this line

  // Fetch products from backend when component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching products");
        setLoading(false);
      });
  }, []);

  const handleBuy = (id) => {
    axios
      .post("http://localhost:5000/api/buy", { productId: id })
      .then((response) => setMessage(response.data.message))
      .catch((error) => {
        setMessage(error.response?.data?.message || "Error buying product");
      });
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2>Product List</h2>

      {/* ✅ Show success/error message */}
      {message && <p className="message">{message}</p>}

      <div className="product-grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            {/* ✅ Now use handleBuy */}
            <button onClick={() => handleBuy(product.id)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
