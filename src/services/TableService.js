import { escapeHTML, groupBy } from '../utils/formatters.js';

// Pagination state
let currentPage = 1;
let currentSort = { col: null, dir: 'asc' };
const PAGE_SIZE = 50;

const resetTableState = () => {
  currentPage = 1;
  currentSort = { col: null, dir: 'asc' };
};

const renderPagination = (totalRows, footEl) => {
  const totalPages = Math.ceil(totalRows / PAGE_SIZE);
  if (totalPages <= 1) return '';

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalRows);

  let paginationHtml = `<div class="pagination">`;
  
  // Prev
  paginationHtml += `<button class="pg-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>◂ Anterior</button>`;

  // Page numbers (show max 5)
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) startPage = Math.max(1, endPage - maxButtons + 1);

  if (startPage > 1) {
    paginationHtml += `<button class="pg-btn" data-page="1">1</button>`;
    if (startPage > 2) paginationHtml += `<span class="text-muted text-[10px] px-1">...</span>`;
  }

  for (let p = startPage; p <= endPage; p++) {
    paginationHtml += `<button class="pg-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) paginationHtml += `<span class="text-muted text-[10px] px-1">...</span>`;
    paginationHtml += `<button class="pg-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  // Next
  paginationHtml += `<button class="pg-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Próximo ▸</button>`;
  paginationHtml += `</div>`;
  paginationHtml += `<span class="pagination-info">${start}-${end} de ${totalRows.toLocaleString("pt-BR")}</span>`;

  return paginationHtml;
};

const sortRows = (rows, col) => {
  if (!currentSort.col) return rows;
  
  return [...rows].sort((a, b) => {
    let va = a[col] ?? '';
    let vb = b[col] ?? '';
    
    // Try numeric comparison
    const na = Number(va);
    const nb = Number(vb);
    if (!isNaN(na) && !isNaN(nb)) {
      return currentSort.dir === 'asc' ? na - nb : nb - na;
    }
    
    // String comparison
    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    const cmp = va.localeCompare(vb, 'pt-BR');
    return currentSort.dir === 'asc' ? cmp : -cmp;
  });
};

const renderSortableHeader = (cols) => {
  return `<tr>${cols.map(c => {
    const isActive = currentSort.col === c;
    const arrow = isActive ? (currentSort.dir === 'asc' ? '▲' : '▼') : '⇅';
    const activeClass = isActive ? 'active' : '';
    return `<th class="sortable-header bg-surface p-[9px_13px] text-left font-mono text-[10px] tracking-[1px] uppercase text-muted border-b border-border sticky top-0 whitespace-nowrap" data-col="${escapeHTML(c)}">${escapeHTML(c)} <span class="sort-indicator ${activeClass}">${arrow}</span></th>`;
  }).join("")}</tr>`;
};

export const TableService = {
  resetPage: () => { resetTableState(); },

  renderTable: (ch, cs, tab, searchStr = "", pageOverride = null) => {
    if (pageOverride !== null) currentPage = pageOverride;
    
    const qq = searchStr.toLowerCase().trim();
    
    const headEl = document.getElementById("tblhead");
    const bodyEl = document.getElementById("tblbody");
    const footEl = document.getElementById("tblfooter");
    
    if(!headEl || !bodyEl || !footEl) return;

    // Reset page on search
    if (qq && pageOverride === null) currentPage = 1;

    let rows, cols;

    if (tab === "usuarios") {
      const by = groupBy(ch, "Contato");
      rows = Object.entries(by).map(([n,a]) => ({
        "Usuário": n,
        "Empresa": a[0]?.["Empresa"] || "—",
        "Chamados": a.length,
        "Atendente Freq.": Object.entries(groupBy(a, "Atendente")).sort((x,y)=>y[1].length-x[1].length)[0]?.[0] || "—",
        "Última Abertura": a.map(r=>r["Abertura"]).filter(Boolean).sort().reverse()[0] || "—"
      })).sort((a,b) => b["Chamados"] - a["Chamados"]);

      if(qq) rows = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(qq)));
      cols = ["Usuário", "Empresa", "Chamados", "Atendente Freq.", "Última Abertura"];
    } else if (tab === "satisfacao") {
      cols = ["#", "Data Hora", "Atendente", "Empresa", "Contato", "Avaliação", "Comentário"];
      rows = [...cs];
      if(qq) rows = rows.filter(r => cols.some(c => String(r[c]||"").toLowerCase().includes(qq)));
    } else {
      // Default: chamados
      cols = ["id", "Atendente", "Contato", "Empresa", "Setor", "Abertura", "Tempo", "Tempo na Fila"];
      rows = [...ch];
      if(qq) rows = rows.filter(r => cols.some(c => String(r[c]||"").toLowerCase().includes(qq)));
    }

    // Sort
    if (currentSort.col && cols.includes(currentSort.col)) {
      rows = sortRows(rows, currentSort.col);
    }

    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    // Paginate
    const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Render header
    headEl.innerHTML = renderSortableHeader(cols);

    // Attach sort listeners
    headEl.querySelectorAll(".sortable-header").forEach(th => {
      th.addEventListener("click", () => {
        const col = th.dataset.col;
        if (currentSort.col === col) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort = { col, dir: 'asc' };
        }
        currentPage = 1;
        TableService.renderTable(ch, cs, tab, searchStr);
      });
    });

    // Render body
    if (tab === "usuarios") {
      bodyEl.innerHTML = pageRows.map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c => {
        const v = r[c]||"";
        if (c === "Usuário") {
          return `<td class="p-[8px_13px] text-cyan font-bold cursor-pointer hover:underline user-click-cell" data-user="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
        }
        return `<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
      }).join("")}</tr>`).join("");
    } else if (tab === "satisfacao") {
      bodyEl.innerHTML = pageRows.map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c => {
        const v = r[c]||"";
        if (c === "Avaliação") {
          const val = v.toLowerCase().replace(/\s+/g,"-");
          const bg = val === "muito-satisfeito" ? "bg-green/15 text-green" : val === "satisfeito" ? "bg-cyan/15 text-cyan" : val === "indiferente" ? "bg-amber/15 text-amber" : "bg-red/15 text-red";
          return `<td class="p-[8px_13px] whitespace-nowrap"><span class="inline-block p-[2px_8px] rounded-full text-[10px] font-bold font-mono ${bg}">${escapeHTML(v)}</span></td>`;
        }
        if (c === "Contato") {
            return `<td class="p-[8px_13px] text-cyan cursor-pointer hover:underline user-click-cell" data-user="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
        }
        return `<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
      }).join("")}</tr>`).join("");
    } else {
      bodyEl.innerHTML = pageRows.map(r => `<tr class="border-b border-border transition-colors hover:bg-white/5">${cols.map(c => {
          const v = String(r[c]??'');
          if (c === "Contato") {
              return `<td class="p-[8px_13px] text-cyan cursor-pointer hover:underline user-click-cell" data-user="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
          }
          return `<td class="p-[8px_13px] text-text whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="${escapeHTML(v)}">${escapeHTML(v)}</td>`;
      }).join("")}</tr>`).join("");
    }

    // Render footer with pagination
    footEl.innerHTML = renderPagination(totalRows, footEl);

    // Attach pagination listeners
    footEl.querySelectorAll(".pg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const page = parseInt(btn.dataset.page, 10);
        if (page >= 1 && page <= totalPages) {
          TableService.renderTable(ch, cs, tab, searchStr, page);
        }
      });
    });
  }
};
