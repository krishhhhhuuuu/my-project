import React, { useEffect, useState } from "react";
import ChartPanel from "./components/ChartPanel";
import { createWS } from "./wsClient";
import "./styles.css";

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const ws = createWS("dummy-jwt", "global", (msg) => {
      if (msg.type === "delta") {
        setData((prev) => [...prev.slice(-30), msg.payload]); // keep last 30 points
      }
    });
    return () => ws.close();
  }, []);

  return (
    <div className="container">
      <h2>📊 Real-Time Analytics Dashboard</h2>
      <ChartPanel data={data} />
    </div>
  );
}
