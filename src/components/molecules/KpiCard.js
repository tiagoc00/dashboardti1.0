export const KpiCard = ({ title, value, sub, idValue, idSub, colorClass, borderClass }) => `
<div class="bg-card border border-border rounded-xl p-[18px_20px] relative overflow-hidden transition-all duration-200 hover:border-border2 hover:-translate-y-[2px] animate-fade-up">
  <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${borderClass}"></div>
  <p class="text-[10px] uppercase tracking-[1.2px] text-text font-bold mb-2">${title}</p>
  <p id="${idValue||''}" class="font-mono text-[30px] font-bold leading-none mb-1 ${colorClass}">${value}</p>
  <p id="${idSub||''}" class="text-[11px] text-muted">${sub}</p>
</div>
`;
