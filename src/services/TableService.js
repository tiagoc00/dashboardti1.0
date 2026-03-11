import { escapeHTML, groupBy } from '../utils/formatters.js';

export const TableService = {
  renderTable: (ch, cs, tab, searchStr = "") => {
    const qq = searchStr.toLowerCase().trim();
    
    const headEl = document.getElementById("tblhead");
    const bodyEl = document.getElementById("tblbody");
    const footEl = document.getElementById("tblfooter");
    
    if(!headEl || !bodyEl || !footEl) return;

    if (tab === "usuarios") {
      const by = groupBy(ch, "Contato");
      let rows = Object.entries(by).map(([n,a]) => ({
        "Usuário": n,
        "Empresa": a[0]?.["Empresa"] || "—",
        "Chamados": a.length,
        "Atendente Freq.": Object.entries(groupBy(a, "Atendente")).sort((x,y)=>y[1].length-x[1].length)[0]?.[0] || "—",
        "Última Abertura": a.map(r=>r["Abertura"]).filter(Boolean).sort().reverse()[0] || "—"
      })).sort((a,b) => b["Chamados"] - a["Chamados"]);

      if(qq) rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(qq)));
      
      const cols = ["Usuário", "Empresa", "Chamados", "Atendente Freq.", "Última Abertura"];
      headEl.innerHTML = `<tr>${cols.map(c=>`<th class="bg-surface p-[9px_13px] text-left font-mono text-[10px] tracking-[1px] uppercase text-muted border-b border-border sticky top-0 whitespace-nowrap">${escapeHTML(c)}</th>`).join("")}</tr>`;
      bodyEl.innerHTML = rows.slice(0,500).map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c=>`<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(String(r[c]??''))}">${escapeHTML(String(r[c]??''))}</td>`).join("")}</tr>`).join("");
      footEl.textContent = `${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} usuários`;
      return;
    }

    if (tab === "satisfacao") {
      const cols = ["#", "Data Hora", "Atendente", "Empresa", "Contato", "Avaliação", "Comentário"];
      let rows = cs;
      if(qq) rows = rows.filter(r => cols.some(c => String(r[c]||"").toLowerCase().includes(qq)));

      headEl.innerHTML = `<tr>${cols.map(c=>`<th class="bg-surface p-[9px_13px] text-left font-mono text-[10px] tracking-[1px] uppercase text-muted border-b border-border sticky top-0 whitespace-nowrap">${escapeHTML(c)}</th>`).join("")}</tr>`;
      bodyEl.innerHTML = rows.slice(0,500).map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c=>{
        const v = r[c]||"";
        if (c === "Avaliação") {
          const val = v.toLowerCase().replace(/\s+/g,"-");
          const bg = val === "muito-satisfeito" ? "bg-green/15 text-green" : val === "satisfeito" ? "bg-cyan/15 text-cyan" : val === "indiferente" ? "bg-amber/15 text-amber" : "bg-red/15 text-red";
          return `<td class="p-[8px_13px] whitespace-nowrap"><span class="inline-block p-[2px_8px] rounded-full text-[10px] font-bold font-mono ${bg}">${escapeHTML(v)}</span></td>`;
        }
        return `<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
      }).join("")}</tr>`).join("");
      footEl.textContent = `${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} avaliações`;
      return;
    }

    // Default: chamados
    const cols = ["id", "Atendente", "Contato", "Empresa", "Setor", "Abertura", "Tempo", "Tempo na Fila"];
    let rows = ch;
    if(qq) rows = rows.filter(r => cols.some(c => String(r[c]||"").toLowerCase().includes(qq)));

    headEl.innerHTML = `<tr>${cols.map(c=>`<th class="bg-surface p-[9px_13px] text-left font-mono text-[10px] tracking-[1px] uppercase text-muted border-b border-border sticky top-0 whitespace-nowrap">${escapeHTML(c)}</th>`).join("")}</tr>`;
    bodyEl.innerHTML = rows.slice(0,500).map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c=>`<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(String(r[c]??''))}">${escapeHTML(String(r[c]??''))}</td>`).join("")}</tr>`).join("");
    footEl.textContent = `${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} chamados`;
  }
};
