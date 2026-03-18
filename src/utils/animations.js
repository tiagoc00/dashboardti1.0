// src/utils/animations.js

/**
 * Animate a number counting up from 0 to target value
 * @param {HTMLElement} el - The element to animate
 * @param {number} target - The target number
 * @param {object} options - Animation options
 */
export function countUp(el, target, options = {}) {
  const {
    duration = 1200,
    prefix = '',
    suffix = '',
    decimals = 0,
    locale = 'pt-BR',
    useLocale = true
  } = options;

  if (!el || target == null || isNaN(target)) return;

  const startTime = performance.now();
  const startValue = 0;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentValue = startValue + (target - startValue) * easedProgress;

    const formatted = useLocale
      ? currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : currentValue.toFixed(decimals);

    el.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Final value — use locale formatting for accuracy
      const finalFormatted = useLocale
        ? Number(target.toFixed(decimals)).toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : target.toFixed(decimals);
      el.textContent = `${prefix}${finalFormatted}${suffix}`;
    }
  };

  requestAnimationFrame(step);
}

/**
 * Animate KPI value with count-up effect, parsing existing format
 */
export function animateKpiValue(elementId, value, options = {}) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Add a subtle scale animation
  el.style.transition = 'transform 0.3s ease';
  el.style.transform = 'scale(1.05)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);

  countUp(el, value, options);
}

/**
 * Renders a trend indicator (arrow up/down with percentage)
 */
export function renderTrend(current, previous) {
  if (previous == null || previous === 0 || current == null) return '';
  
  const pctChange = ((current - previous) / previous) * 100;
  const absChange = Math.abs(pctChange).toFixed(1);
  
  if (Math.abs(pctChange) < 0.5) {
    return `<span class="inline-flex items-center gap-0.5 text-[10px] font-mono text-muted ml-1.5 bg-border/30 px-1.5 py-0.5 rounded-full">= 0%</span>`;
  }
  
  const isUp = pctChange > 0;
  const arrow = isUp ? '↑' : '↓';
  // For time metrics: up is bad (red), down is good (green)
  // For volume/csat: up is good (green), down is bad (red)
  const color = isUp ? 'text-green bg-green/10' : 'text-red bg-red/10';
  
  return `<span class="inline-flex items-center gap-0.5 text-[10px] font-mono ${color} ml-1.5 px-1.5 py-0.5 rounded-full">${arrow} ${absChange}%</span>`;
}

/**
 * Renders a trend indicator where DOWN is positive (for time-based metrics)
 */
export function renderTrendInverse(current, previous) {
  if (previous == null || previous === 0 || current == null) return '';
  
  const pctChange = ((current - previous) / previous) * 100;
  const absChange = Math.abs(pctChange).toFixed(1);
  
  if (Math.abs(pctChange) < 0.5) {
    return `<span class="inline-flex items-center gap-0.5 text-[10px] font-mono text-muted ml-1.5 bg-border/30 px-1.5 py-0.5 rounded-full">= 0%</span>`;
  }
  
  const isUp = pctChange > 0;
  const arrow = isUp ? '↑' : '↓';
  // Inverse: up is bad, down is good
  const color = isUp ? 'text-red bg-red/10' : 'text-green bg-green/10';
  
  return `<span class="inline-flex items-center gap-0.5 text-[10px] font-mono ${color} ml-1.5 px-1.5 py-0.5 rounded-full">${arrow} ${absChange}%</span>`;
}
