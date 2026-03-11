export const GC = "var(--border)";
export const TC = "var(--muted)"; 
export const FM = "'IBM Plex Mono', monospace";

export const bOpts = (ex = {}) => ({
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: TC, font: { family: FM, size: 11 } } },
    tooltip: { 
      backgroundColor: "var(--card)", 
      borderColor: "var(--border2)", 
      borderWidth: 1, 
      titleColor: "var(--text)", 
      bodyColor: "var(--muted)", 
      titleFont: { family: FM } 
    }
  },
  scales: {
    x: { ticks: { color: TC, font: { size: 11 } }, grid: { color: GC } },
    y: { ticks: { color: TC, font: { size: 11 } }, grid: { color: GC } }
  }, 
  ...ex
});

export const BC = ["#DA0D17", "#DA5513", "#4F7043", "#265D7C", "#56331B", "#F29C94", "#c20b13", "#b8450f", "#3d5834", "#1e4a61", "#8B4513"];
