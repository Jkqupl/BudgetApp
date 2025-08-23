export const getChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Income vs Expenses Over Time" }
  },
  scales: {
    y: { ticks: { callback: v => `£${v.toLocaleString()}` } }
  }
});


export const getChartData = (chartData) => ({
  labels: chartData.map(d => d.period),
  datasets: [
    { label: "Income", data: chartData.map(d => d.income), backgroundColor: "rgba(34,197,94,0.8)" },
    { label: "Expenses", data: chartData.map(d => d.expenses), backgroundColor: "rgba(237,19,19,0.8)" }
  ]
});
