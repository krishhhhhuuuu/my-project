import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ChartPanel({ data }) {
  const chartData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Events per Interval",
        data: data.map((d) => d.count),
        borderColor: "#007bff",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Unique Users",
        data: data.map((d) => d.uniques),
        borderColor: "#28a745",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Errors",
        data: data.map((d) => d.errors),
        borderColor: "#dc3545",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="chart-panel">
      <Line data={chartData} options={options} />
    </div>
  );
}
