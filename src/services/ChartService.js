import { bOpts, BC, TC, FM, GC, TXT, CARD, BORDER2 } from '../utils/chartConfig.js';
import { groupBy, avg, calcCsat } from '../utils/formatters.js';

const killC = (id, chartsObj) => { 
  if (chartsObj[id]) { chartsObj[id].destroy(); delete chartsObj[id]; } 
};

export const ChartService = {
  renderUsers: (ch, chartsState) => {
    const by = groupBy(ch, "Contato");
    const sorted = Object.entries(by).sort((a,b)=>b[1].length-a[1].length);
    const top20 = sorted.slice(0,20);
    const mx = top20[0]?.[1].length || 1;
    
    document.getElementById("ulabel").textContent = `— ${sorted.length.toLocaleString("pt-BR")} usuários`;
    document.getElementById("rlist").innerHTML = top20.map(([n,a], i) => {
      const emp = a[0]?.["Empresa"] || "";
      const pct = (a.length/mx*100).toFixed(1);
      const pc = i===0 ? "text-amber" : i===1 ? "text-[#b0bec5]" : i===2 ? "text-[#a1887f]" : "text-muted";
      
      return `
      <div class="user-row flex items-center gap-2.5 p-2 bg-surface border border-border rounded-lg transition-colors hover:border-border2 cursor-pointer" data-user="${n}">
        <span class="font-mono text-[11px] font-bold w-5 text-center shrink-0 ${pc}">${i+1}</span>
        <div class="flex-1 min-w-0">
          <p class="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis text-text" title="${n}">${n}</p>
          <p class="text-[10px] text-muted">${emp}</p>
        </div>
        <div class="w-20 shrink-0">
          <div class="h-1 bg-border rounded-full">
            <div class="h-1 rounded-full bg-cyan transition-all duration-300" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="font-mono text-[12px] font-bold text-cyan w-8 text-right shrink-0">${a.length}</span>
      </div>`;
    }).join("");

    document.querySelectorAll(".user-row").forEach(el => {
      el.addEventListener("click", () => chartsState.onUserClick?.(el.dataset.user));
    });

    killC("users", chartsState);
    const top10 = sorted.slice(0,10);
    const ctxUsers = document.getElementById("ch-users")?.getContext("2d");
    if(ctxUsers) {
      chartsState.users = new Chart(ctxUsers, {
        type: "bar",
        data: { labels: top10.map(([n])=>n), datasets: [{ data: top10.map(([,a])=>a.length), backgroundColor: top10.map((_,i)=>BC[i%BC.length]+"cc"), borderWidth: 0, borderRadius: 4 }] },
        options: { 
          ...bOpts(), 
          indexAxis: "y", 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => { if (el.length) chartsState.onUserClick?.(top10[el[0].index][0]); },
          onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; }
        }
      });
    }

    killC("emp", chartsState);
    const byE = groupBy(ch,"Empresa");
    const t15 = Object.entries(byE).filter(([k]) => k && k !== "—").sort((a,b)=>b[1].length-a[1].length).slice(0,15);
    const ctxEmp = document.getElementById("ch-emp")?.getContext("2d");
    if(ctxEmp) {
      chartsState.emp = new Chart(ctxEmp, {
        type: "bar",
        data: { labels: t15.map(([n])=>n), datasets: [{ data: t15.map(([,a])=>a.length), backgroundColor: "rgba(124, 77, 255, 0.8)", borderWidth: 0, borderRadius: 4 }] },
        options: { 
          ...bOpts(), 
          indexAxis: "y", 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => { if (el.length) chartsState.onEmpClick?.(t15[el[0].index][0]); },
          onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; }
        }
      });
    }
  },

  renderCharts: (ch, cs, chartsState, cb) => {
    Object.assign(chartsState, cb);
    killC("atend", chartsState);
    const byAtend = groupBy(ch, "Atendente");
    const tat = Object.entries(byAtend).filter(([k]) => k && k !== "—" && k !== "Usuário não identificado").sort((a,b)=>b[1].length-a[1].length);
    const ctxAtend = document.getElementById("ch-atend")?.getContext("2d");
    if(ctxAtend) {
      chartsState.atend = new Chart(ctxAtend, {
        type: "bar",
        data: { labels: tat.map(([n])=>n), datasets: [{ data: tat.map(([,a])=>a.length), backgroundColor: tat.map((_,i)=>BC[i%BC.length]+"cc"), borderWidth: 0, borderRadius: 4 }] },
        options: { 
          ...bOpts(), 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => {
            if (el.length && chartsState.onAtendClick) {
              const idx = el[0].index;
              chartsState.onAtendClick(tat[idx][0]);
            }
          },
          onHover: (e, el) => {
            e.native.target.style.cursor = el.length ? 'pointer' : 'default';
          }
        }
      });
    }

    killC("setor", chartsState);
    const bySetor = groupBy(ch, "_st");
    const tst = Object.entries(bySetor).filter(([k]) => k && k !== "—").sort((a,b)=>b[1].length-a[1].length).slice(0, 10);
    const ctxSetor = document.getElementById("ch-setor")?.getContext("2d");
    if(ctxSetor) {
      chartsState.setor = new Chart(ctxSetor, {
        type: "bar",
        data: { labels: tst.map(([n])=>n), datasets: [{ data: tst.map(([,a])=>a.length), backgroundColor: tst.map((_,i)=>BC[(i+2)%BC.length]+"cc"), borderWidth: 0, borderRadius: 4 }] },
        options: { 
          ...bOpts(), 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => {
            if (el.length && chartsState.onSetorClick) {
              const idx = el[0].index;
              chartsState.onSetorClick(tst[idx][0]);
            }
          },
          onHover: (e, el) => {
            e.native.target.style.cursor = el.length ? 'pointer' : 'default';
          }
        }
      });
    }

    killC("csat", chartsState);
    if(cs.length) {
      const ord = ["Muito Satisfeito", "Satisfeito", "Indiferente", "Insatisfeito"];
      const cores = { "Muito Satisfeito":"#00e676", "Satisfeito":"#00e5ff", "Indiferente":"#ffc400", "Insatisfeito":"#ff5252" };
      const bav = groupBy(cs, "Avaliação");
      const sc = calcCsat(cs);
      const elLabel = document.getElementById("csatlabel");
      if(elLabel) elLabel.innerHTML = `— CSAT ${sc}%`;

      const lb = ord.filter(o=>bav[o]);
      const ctxCsat = document.getElementById("ch-csat")?.getContext("2d");
      if(ctxCsat) {
         chartsState.csat = new Chart(ctxCsat, {
          type: "doughnut",
          data: { labels: lb, datasets: [{ data: lb.map(l=>bav[l].length), backgroundColor: lb.map(l=>cores[l]+"cc"), borderColor: "rgba(0,0,0,0.2)", borderWidth: 2 }] },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: "56%", 
            plugins: { legend: { position: "bottom", labels: { color: TC(), font: { family: FM, size: 11 }, padding: 14 } }, tooltip: { backgroundColor: CARD(), borderColor: BORDER2(), borderWidth: 1, titleColor: TXT(), bodyColor: TC() } },
            onClick: (e, el) => { if (el.length) chartsState.onCsatClick?.(lb[el[0].index]); },
            onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; }
          }
        });
      }
    }

    killC("sla", chartsState);
    const byA = groupBy(ch, "Atendente");
    const ta = Object.entries(byA).filter(([k]) => k && k !== "—" && k !== "Usuário não identificado").map(([k,v])=>({ n:k, m:avg(v.map(r=>r._tm).filter(x=>x!=null)) })).sort((a,b)=>a.m-b.m);
    const ctxSla = document.getElementById("ch-sla")?.getContext("2d");
    if(ctxSla) {
      chartsState.sla = new Chart(ctxSla, {
        type: "bar",
        data: { labels: ta.map(e=>e.n), datasets: [{ data: ta.map(e=>+e.m.toFixed(1)), backgroundColor: ta.map(e=>e.m<60?"rgba(0,230,118,0.5)":e.m<120?"rgba(255,196,0,0.5)":"rgba(255,82,82,0.5)"), borderWidth: 0, borderRadius: 4 }] },
        options: { 
          ...bOpts(), 
          indexAxis: "y", 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => {
            if (el.length && chartsState.onAtendClick) {
              const idx = el[0].index;
              chartsState.onAtendClick(ta[idx].n);
            }
          },
          onHover: (e, el) => {
            e.native.target.style.cursor = el.length ? 'pointer' : 'default';
          }
        }
      });
    }

    killC("vmes", chartsState); killC("smes", chartsState);
    const bm = groupBy(ch, "_ms");
    const ms = Object.keys(bm).filter(m=>m!=="—").sort();
    const lo = () => ({ 
      responsive: true, 
      maintainAspectRatio: false, 
      plugins: { legend: { display: false }, tooltip: { backgroundColor: CARD(), borderColor: BORDER2(), borderWidth: 1, titleColor: TXT(), bodyColor: TC() } }, 
      scales: { x: { ticks: { color: TC(), font: { size: 10 } }, grid: { color: GC() } }, y: { ticks: { color: TC(), font: { size: 10 } }, grid: { color: GC() } } },
      onClick: (e, el) => { if (el.length) chartsState.onMonthClick?.(ms[el[0].index]); },
      onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; }
    });
    
    const ctxVmes = document.getElementById("ch-vmes")?.getContext("2d");
    if(ctxVmes) {
      chartsState.vmes = new Chart(ctxVmes, { type: "line", data: { labels: ms, datasets: [{ data: ms.map(m=>bm[m].length), borderColor: "#00e5ff", backgroundColor: "rgba(0,229,255,.06)", fill: true, tension: .3, pointBackgroundColor: "#00e5ff", pointRadius: 4 }] }, options: lo() });
    }
    const ctxSmes = document.getElementById("ch-smes")?.getContext("2d");
    if(ctxSmes) {
      chartsState.smes = new Chart(ctxSmes, { type: "line", data: { labels: ms, datasets: [{ data: ms.map(m=>+avg(bm[m].map(r=>r._tm).filter(x=>x!=null)).toFixed(1)), borderColor: "#448aff", backgroundColor: "rgba(68,138,255,.06)", fill: true, tension: .3, pointBackgroundColor: "#448aff", pointRadius: 4 }] }, options: lo() });
    }

    ChartService.renderDayOfWeek(ch, chartsState);
    ChartService.renderHeatmap(ch);
    ChartService.renderUsers(ch, chartsState);
  },

  renderDayOfWeek: (ch, chartsState) => {
    killC("dow", chartsState);
    const labels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    const data = new Array(7).fill(0);
    ch.forEach(r => { 
      if(r._dw != null) {
        const idx = (r._dw + 6) % 7;
        data[idx]++; 
      }
    });

    const ctx = document.getElementById("ch-dow")?.getContext("2d");
    if(ctx) {
      chartsState.dow = new Chart(ctx, {
        type: "bar",
        data: { 
          labels, 
          datasets: [{ 
            data, 
            backgroundColor: "rgba(255, 59, 59, 0.7)", 
            borderWidth: 0, 
            borderRadius: 4 
          }] 
        },
        options: { 
          ...bOpts(), 
          plugins: { ...bOpts().plugins, legend: { display: false } },
          onClick: (e, el) => { 
            if (el.length) {
              const chartIdx = el[0].index;
              const dwVal = (chartIdx + 1) % 7;
              chartsState.onDayClick?.(dwVal); 
            }
          },
          onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; }
        }
      });
    }
  },

  /**
   * Render Heatmap: Days of Week × Hours of Day — table-based with scroll
   */
  renderHeatmap: (ch) => {
    const container = document.getElementById("heatmap-container");
    if (!container) return;

    const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const hourStart = 7;
    const hourEnd = 18;
    const hours = [];
    for (let h = hourStart; h <= hourEnd; h++) hours.push(h);

    // Build data matrix: [dayIndex][hourIndex] = count
    const matrix = Array.from({ length: 7 }, () => new Array(hours.length).fill(0));
    let maxVal = 0;

    ch.forEach(r => {
      if (r._dt && r._dw != null) {
        const dayIdx = (r._dw + 6) % 7;
        const timeMatch = String(r["Abertura"] || "").match(/(\d{2}):(\d{2})/);
        if (timeMatch) {
          const hour = parseInt(timeMatch[1], 10);
          const hIdx = hours.indexOf(hour);
          if (hIdx >= 0) {
            matrix[dayIdx][hIdx]++;
            if (matrix[dayIdx][hIdx] > maxVal) maxVal = matrix[dayIdx][hIdx];
          }
        }
      }
    });

    if (maxVal === 0) {
      container.innerHTML = `<div class="text-center text-muted text-[11px] font-mono py-12">Dados de horário não disponíveis nos registros.</div>`;
      return;
    }

    const getColor = (val) => {
      if (val === 0) return 'var(--surface)';
      const intensity = val / maxVal;
      if (intensity < 0.25) return 'rgba(110, 203, 99, 0.4)';
      if (intensity < 0.5) return 'rgba(110, 203, 99, 0.7)';
      if (intensity < 0.75) return 'rgba(255, 159, 67, 0.7)';
      return 'rgba(255, 59, 59, 0.8)';
    };

    // Build as HTML table inside scrollable container
    let html = `<div style="overflow-x:auto;overflow-y:auto;max-height:280px;border:1px solid var(--border);border-radius:8px;">`;
    html += `<table style="border-collapse:separate;border-spacing:3px;width:100%;min-width:480px;">`;

    // Header row: empty corner + hour labels
    html += `<thead><tr>`;
    html += `<th style="position:sticky;left:0;z-index:2;background:var(--card);padding:4px 8px;font-size:10px;color:var(--muted);font-weight:600;font-family:'IBM Plex Mono',monospace;min-width:48px;"></th>`;
    hours.forEach(h => {
      html += `<th style="padding:4px 2px;font-size:10px;color:var(--muted);font-weight:600;font-family:'IBM Plex Mono',monospace;text-align:center;white-space:nowrap;">${h}h</th>`;
    });
    html += `</tr></thead>`;

    // Data rows
    html += `<tbody>`;
    dayLabels.forEach((day, dIdx) => {
      html += `<tr>`;
      // Day label (sticky first column)
      html += `<td style="position:sticky;left:0;z-index:1;background:var(--card);padding:4px 8px;font-size:10px;color:var(--muted);font-weight:500;font-family:'IBM Plex Mono',monospace;text-align:right;white-space:nowrap;">${day}</td>`;
      // Cells
      hours.forEach((_, hIdx) => {
        const val = matrix[dIdx][hIdx];
        const bg = getColor(val);
        const tooltip = `${day} ${hours[hIdx]}h: ${val} chamado${val !== 1 ? 's' : ''}`;
        html += `<td style="background:${bg};border-radius:4px;text-align:center;font-size:10px;font-weight:600;font-family:'IBM Plex Mono',monospace;color:var(--text);padding:6px 4px;min-width:36px;cursor:default;transition:transform 0.15s ease;" title="${tooltip}" onmouseenter="this.style.transform='scale(1.1)';this.style.zIndex='5'" onmouseleave="this.style.transform='scale(1)';this.style.zIndex='0'">${val || ''}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;

    // Legend
    html += `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px;font-size:9px;font-family:'IBM Plex Mono',monospace;color:var(--muted);">
        <span>Menos</span>
        <div style="display:flex;gap:3px;">
          <div style="width:14px;height:14px;border-radius:3px;background:var(--surface);border:1px solid var(--border)"></div>
          <div style="width:14px;height:14px;border-radius:3px;background:rgba(110,203,99,0.4)"></div>
          <div style="width:14px;height:14px;border-radius:3px;background:rgba(110,203,99,0.7)"></div>
          <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,159,67,0.7)"></div>
          <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,59,59,0.8)"></div>
        </div>
        <span>Mais</span>
      </div>
    `;

    container.innerHTML = html;
  }
};
