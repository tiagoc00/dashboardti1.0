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

export const BC = ["#FF3B3B", "#FF9F43", "#6ECB63", "#5BA4CF", "#C4956A", "#FF6B6B", "#E63535", "#E08830", "#5AB850", "#4A8DB8", "#D4A574"];
