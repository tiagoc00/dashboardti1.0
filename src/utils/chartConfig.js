// Resolve CSS variables at render time — Chart.js (canvas) cannot parse var(--xxx)
export const GC = () => getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#26262A';
export const TC = () => getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#B8A99A';
export const TXT = () => getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#E8E1D0';
export const CARD = () => getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#18181A';
export const BORDER2 = () => getComputedStyle(document.documentElement).getPropertyValue('--border2').trim() || '#333338';
export const FM = "'IBM Plex Mono', monospace";

export const bOpts = (ex = {}) => ({
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: TC(), font: { family: FM, size: 11 } } },
    tooltip: { 
      backgroundColor: CARD(), 
      borderColor: BORDER2(), 
      borderWidth: 1, 
      titleColor: TXT(), 
      bodyColor: TC(), 
      titleFont: { family: FM } 
    }
  },
  scales: {
    x: { ticks: { color: TC(), font: { size: 11 } }, grid: { color: GC() } },
    y: { ticks: { color: TC(), font: { size: 11 } }, grid: { color: GC() } }
  }, 
  ...ex
});

export const BC = ["#FF3B3B", "#FF9F43", "#6ECB63", "#5BA4CF", "#C4956A", "#FF6B6B", "#E63535", "#E08830", "#5AB850", "#4A8DB8", "#D4A574"];

