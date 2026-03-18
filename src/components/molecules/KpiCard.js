export const KpiCard = ({ title, value, sub, idValue, idSub, colorClass, borderClass, idTrend }) => `
<div class="bg-card border border-border rounded-xl p-[18px_20px] relative overflow-hidden transition-all duration-200 hover:border-border2 hover:-translate-y-[2px] animate-fade-up">
  <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${borderClass}"></div>
  <p class="text-[12px] uppercase tracking-[1.2px] text-text font-bold mb-2">${title}</p>
  <div class="flex items-end gap-1 flex-wrap">
    <p id="${idValue||''}" class="font-mono text-[30px] font-bold leading-none mb-1 ${colorClass}">${value}</p>
    ${idTrend ? `<span id="${idTrend}" class="mb-1.5"></span>` : ''}
  </div>
  <p id="${idSub||''}" class="text-[11px] text-muted">${sub}</p>
</div>
`;

export const KpiCardSkeleton = () => `
<div class="bg-card border border-border rounded-xl p-[18px_20px] relative overflow-hidden animate-fade-up skeleton-kpi">
  <div class="absolute top-0 left-0 right-0 h-[2px] bg-border"></div>
  <div class="skeleton skeleton-title"></div>
  <div class="skeleton skeleton-value"></div>
  <div class="skeleton skeleton-sub"></div>
</div>
`;
