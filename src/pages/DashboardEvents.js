import { UIState } from '../services/UIState.js';
import { DataService } from '../services/DataService.js';
import { ChartService } from '../services/ChartService.js';
import { TableService } from '../services/TableService.js';
import { ExportService } from '../services/ExportService.js';
import { fmtMin, avg, calcCsat, csatClr, groupBy, parseISO } from '../utils/formatters.js';
import { animateKpiValue, renderTrend, renderTrendInverse } from '../utils/animations.js';

const readFile = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      res(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }));
    } catch (err) { rej(err); }
  };
  r.onerror = () => rej(new Error("Falha ao ler arquivo"));
  r.readAsArrayBuffer(file);
});

// Store previous period values for comparison
let prevPeriodData = null;

export function attachDashboardEvents(fbService, showLoading, hideLoading, toast) {
  
  // =============================================
  // MOBILE HAMBURGER MENU
  // =============================================
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobile-overlay');

  const toggleMobileMenu = (open) => {
    if (open) {
      sidebar?.classList.add('open');
      hamburgerBtn?.classList.add('active');
      mobileOverlay?.classList.add('active');
    } else {
      sidebar?.classList.remove('open');
      hamburgerBtn?.classList.remove('active');
      mobileOverlay?.classList.remove('active');
    }
  };

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = sidebar?.classList.contains('open');
    toggleMobileMenu(!isOpen);
  });

  mobileOverlay?.addEventListener('click', () => toggleMobileMenu(false));

  // =============================================
  // EXPORT FUNCTIONALITY
  // =============================================
  const exportToggle = document.getElementById('btn-export-toggle');
  const exportMenu = document.getElementById('export-menu');

  exportToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu?.classList.toggle('open');
  });

  // Close export menu on click outside
  document.addEventListener('click', () => {
    exportMenu?.classList.remove('open');
  });

  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    const { ch, cs } = DataService.getFilteredData();
    if (!ch.length && !cs.length) { toast('Nenhum dado para exportar.', 'error'); return; }
    ExportService.exportExcel(ch, cs);
    toast('Excel exportado com sucesso!', 'success');
    exportMenu?.classList.remove('open');
  });

  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    exportMenu?.classList.remove('open');
    ExportService.exportPDF(showLoading, hideLoading, toast);
  });

  document.getElementById('btn-print')?.addEventListener('click', () => {
    exportMenu?.classList.remove('open');
    window.print();
  });

  // =============================================
  // COMPUTE PREVIOUS PERIOD FOR COMPARISON
  // =============================================
  const computePreviousPeriod = () => {
    const state = UIState.get();
    const allCh = state.chamados;
    const allCs = state.satisfacao;
    const { di, df, cdi, cdf } = state.filters;

    if (!allCh.length) { prevPeriodData = null; return; }

    let prevStart, prevEnd;

    // Use custom comparison range if BOTH are provided
    if (cdi && cdf) {
      prevStart = parseISO(cdi);
      prevEnd = parseISO(cdf);
    } else {
      // Calculate automatically
      let startDate, endDate;
      if (di && df) {
        startDate = parseISO(di);
        endDate = parseISO(df);
      } else {
        const dates = allCh.filter(r => r._dt).map(r => r._dt.getTime());
        if (!dates.length) { prevPeriodData = null; return; }
        startDate = new Date(Math.min(...dates));
        endDate = new Date(Math.max(...dates));
      }

      const rangeDays = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));
      prevEnd = new Date(startDate.getTime() - (1000 * 60 * 60 * 24)); 
      prevStart = new Date(prevEnd.getTime() - (rangeDays * 1000 * 60 * 60 * 24));
    }

    const prevCh = allCh.filter(r => r._dt && r._dt >= prevStart && r._dt <= prevEnd);
    const prevCs = allCs; 

    if (!prevCh.length) { prevPeriodData = null; return; }

    const prevTm = avg(prevCh.map(r => r._tm).filter(v => v != null));
    const prevFm = avg(prevCh.map(r => r._fm).filter(v => v != null));
    const prevUsers = Object.keys(groupBy(prevCh, "Contato")).filter(k => k && k !== "Usuário não identificado").length;

    prevPeriodData = {
      total: prevCh.length,
      tm: prevTm,
      fm: prevFm,
      users: prevUsers,
      csat: calcCsat(prevCs)
    };
  };

  // =============================================
  // RENDER KPIs WITH ANIMATIONS
  // =============================================
  const renderKPIs = (ch, cs) => {
    const total = ch.length;
    animateKpiValue("k-total", total, { suffix: '' });
    
    const tm = avg(ch.map(r => r._tm).filter(v => v != null));
    const se = document.getElementById("k-sla");
    se.innerHTML = ch.length ? fmtMin(tm) : "—";
    se.className = `font-mono text-[30px] font-bold leading-none mb-1 ${tm < 60 ? "text-green" : tm < 120 ? "text-amber" : "text-red"}`;
    
    const fm = avg(ch.map(r => r._fm).filter(v => v != null));
    const fe = document.getElementById("k-fila");
    fe.innerHTML = ch.length ? fmtMin(fm) : "—";
    fe.className = `font-mono text-[30px] font-bold leading-none mb-1 ${fm < 10 ? "text-green" : fm < 30 ? "text-amber" : "text-red"}`;
    
    const sc = calcCsat(cs);
    const ce = document.getElementById("k-csat");
    ce.textContent = cs.length ? `${sc}%` : "—";
    ce.style.color = cs.length ? csatClr(sc) : "var(--muted)";
    const kcsatSub = document.getElementById("k-csat-sub");
    if(kcsatSub) kcsatSub.textContent = `${cs.length.toLocaleString("pt-BR")} avaliações`;
    
    const bu = groupBy(ch, "Contato");
    const ue = Object.entries(bu).filter(([k]) => k && k !== "Usuário não identificado" && k !== "—").sort((a,b)=>b[1].length-a[1].length);
    const be = groupBy(ch, "Empresa");
    const ee = Object.entries(be).filter(([k]) => k && k !== "—").sort((a,b)=>b[1].length-a[1].length);
    
    const totalUsers = Object.keys(bu).filter(k=>k && k!=="Usuário não identificado").length;
    animateKpiValue("k-users", totalUsers, { suffix: '' });
    
    if(ue.length) {
      document.getElementById("k-topuser").textContent = ue[0][0];
      const ktopuserSub = document.getElementById("k-topuser-sub");
      if(ktopuserSub) ktopuserSub.textContent = `${ue[0][1].length.toLocaleString("pt-BR")} chamados`;
    }
    document.getElementById("k-avguser").textContent = totalUsers ? Math.round(ch.length/totalUsers).toLocaleString("pt-BR") : "—";
    if(ee.length) {
      document.getElementById("k-topemp").textContent = ee[0][0] === "&#x2014;" || ee[0][0] === "—" ? "USER SEM EMPRESA CADASTRADA" : ee[0][0];
      const ktopempSub = document.getElementById("k-topemp-sub");
      if(ktopempSub) ktopempSub.textContent = `${ee[0][1].length.toLocaleString("pt-BR")} chamados`;
    }

    // Render trend indicators (comparison with previous period)
    if (prevPeriodData) {
      const tTotalTrend = document.getElementById("k-total-trend");
      if (tTotalTrend) tTotalTrend.innerHTML = renderTrend(total, prevPeriodData.total);

      const tSlaTrend = document.getElementById("k-sla-trend");
      if (tSlaTrend) tSlaTrend.innerHTML = renderTrendInverse(tm, prevPeriodData.tm);

      const tFilaTrend = document.getElementById("k-fila-trend");
      if (tFilaTrend) tFilaTrend.innerHTML = renderTrendInverse(fm, prevPeriodData.fm);

      const tCsatTrend = document.getElementById("k-csat-trend");
      if (tCsatTrend) tCsatTrend.innerHTML = renderTrend(sc, prevPeriodData.csat);

      const tUsersTrend = document.getElementById("k-users-trend");
      if (tUsersTrend) tUsersTrend.innerHTML = renderTrend(totalUsers, prevPeriodData.users);
    }
  };

  const popFilters = () => {
    const ch = UIState.get().chamados;
    const at = [...new Set(ch.map(r => r["Atendente"]).filter(Boolean))].sort();
    const st = [...new Set(ch.map(r => r._st).filter(Boolean))].sort();
    
    document.getElementById("fat").innerHTML = '<option value="">Todos</option>' + at.map(a => `<option value="${a}">${a}</option>`).join("");
    document.getElementById("fst").innerHTML = '<option value="">Todos</option>' + st.map(s => `<option value="${s}">${s}</option>`).join("");
  };

  const renderAll = () => {
    computePreviousPeriod();
    const { ch, cs } = DataService.getFilteredData();
    renderKPIs(ch, cs);
    ChartService.renderCharts(ch, cs, UIState.get().charts, {
      onAtendClick: (name) => {
        const fat = document.getElementById("fat");
        if (fat) fat.value = name;
        UIState.update({ filters: { ...UIState.get().filters, at: name } });
        renderAll();
      },
      onSetorClick: (name) => {
        const fst = document.getElementById("fst");
        if (fst) fst.value = name;
        UIState.update({ filters: { ...UIState.get().filters, st: name } });
        renderAll();
      },
      onUserClick: (name) => {
        const state = UIState.get();
        ChartService.renderUserProfile(name, state.chamados, state.satisfacao, state.charts);
      },
      onEmpClick: (name) => {
        UIState.update({ filters: { ...UIState.get().filters, emp: name } });
        renderAll();
      },
      onDayClick: (dw) => {
        UIState.update({ filters: { ...UIState.get().filters, dw: dw } });
        renderAll();
      },
      onMonthClick: (ms) => {
        UIState.update({ filters: { ...UIState.get().filters, ms: ms } });
        renderAll();
      },
      onCsatClick: (csat) => {
        UIState.update({ filters: { ...UIState.get().filters, csat: csat } });
        renderAll();
      }
    });
    TableService.renderTable(ch, cs, UIState.get().tab, document.getElementById("tsearch")?.value || "");
    
    document.getElementById("lupdate").textContent = `Atualizado: ${new Date().toLocaleString("pt-BR")}`;
    document.getElementById("estate").classList.add("hidden");
    document.getElementById("dash").classList.remove("hidden");
    document.getElementById("dash").classList.add("flex");
  };

  // Load Initial Data
  const loadFromFB = async () => {
    toast("Sincronizando banco de dados...", "info");
    try {
      const [rch, rcs] = await Promise.all([fbService.loadCollection("chamados"), fbService.loadCollection("satisfacao")]);
      if (rch.length || rcs.length) {
        UIState.update({ chamados: DataService.processRel(rch), satisfacao: rcs });
        popFilters();
        renderAll();
        toast(`${rch.length.toLocaleString("pt-BR")} chamados carregados`, "success");
      }
    } catch(err) {
      toast(`Erro Firebase: ${err.message}`, "error");
    } finally {
      const btnImport = document.getElementById("btn-import");
      if(btnImport) btnImport.disabled = !(UIState.get().fileRel || UIState.get().fileCsat);
    }
  };

  loadFromFB();

  // Events
  document.getElementById('btn-logout')?.addEventListener('click', async () => await fbService.signOut());
  
  const switchTheme = document.getElementById('theme-switch-app');
  switchTheme?.addEventListener('change', (e) => {
      UIState.applyTheme(!e.target.checked);
  });

  const btnImport = document.getElementById("btn-import");
  document.getElementById("file-rel")?.addEventListener("change", e => {
    const file = e.target.files[0] || null;
    UIState.update({ fileRel: file });
    if(file) {
      document.getElementById("zone-rel").classList.add("border-green", "bg-green/5");
      document.querySelector("#zone-rel .uztitle").textContent = file.name;
    }
    if(btnImport) btnImport.disabled = !(file || UIState.get().fileCsat);
  });

  document.getElementById("file-csat")?.addEventListener("change", e => {
    const file = e.target.files[0] || null;
    UIState.update({ fileCsat: file });
    if(file) {
      document.getElementById("zone-csat").classList.add("border-green", "bg-green/5");
      document.querySelector("#zone-csat .uztitle").textContent = file.name;
    }
    if(btnImport) btnImport.disabled = !(UIState.get().fileRel || file);
  });

  const ALLOWED_EXTS = ["xlsx", "xls", "csv"];
  const MAX_FILE_MB = 50;
  const validateFile = (file) => {
    if(!file) return null;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if(!ALLOWED_EXTS.includes(ext)) return `Tipo nao permitido: .${ext}. Use .xlsx/.csv`;
    if(file.size > MAX_FILE_MB * 1024 * 1024) return `Limite de ${MAX_FILE_MB}MB excedido.`;
    return null;
  };

  btnImport?.addEventListener("click", async () => {
    const errRel = validateFile(UIState.get().fileRel);
    const errCsat = validateFile(UIState.get().fileCsat);
    if(errRel) { toast(errRel, "error"); return; }
    if(errCsat) { toast(errCsat, "error"); return; }
    
    showLoading("Lendo arquivos...");
    try {
      if(UIState.get().fileRel) {
        const r = await readFile(UIState.get().fileRel);
        const processed = DataService.processRel(r);
        UIState.update({ chamados: processed });
        showLoading(`Salvando ${r.length.toLocaleString()} chamados...`);
        await fbService.saveBatch("chamados", r);
        toast(`${r.length.toLocaleString("pt-BR")} chamados salvos!`, "success");
      }
      if(UIState.get().fileCsat) {
        const r = await readFile(UIState.get().fileCsat);
        UIState.update({ satisfacao: r });
        showLoading(`Salvando ${r.length.toLocaleString()} avaliações...`);
        await fbService.saveBatch("satisfacao", r);
        toast(`${r.length.toLocaleString("pt-BR")} avaliações salvas!`, "success");
      }
      popFilters();
      renderAll();
    } catch(err) {
      console.error(err);
      toast("Erro ao importar arquivo. Verifique o formato.", "error");
    } finally {
      hideLoading();
    }
  });

  ["fat", "fst", "fdi", "fdf", "fcdi", "fcdf"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", e => {
      UIState.update({ filters: { ...UIState.get().filters, [id.replace('f', '')]: e.target.value } });
      TableService.resetPage();
      renderAll();
    });
  });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    ["fat", "fst", "fdi", "fdf", "fcdi", "fcdf"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
    UIState.update({ filters: { at: "", st: "", di: "", df: "", cdi: "", cdf: "", usr: "", emp: "", dw: null, ms: "", csat: "" } });
    TableService.resetPage();
    renderAll();
  });

  document.getElementById("btn-clear-data")?.addEventListener("click", () => {
    const modal = document.getElementById("delete-data-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.getElementById("del-err").classList.add("hidden");
    }
  });

  document.getElementById("btn-close-delete")?.addEventListener("click", () => {
    const modal = document.getElementById("delete-data-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  document.querySelectorAll('input[name="del-period"]').forEach(radio => {
    radio.addEventListener("change", e => {
      const rangeInputs = document.getElementById("del-range-inputs");
      if (e.target.value === "range") {
        rangeInputs.classList.remove("hidden");
        rangeInputs.classList.add("flex");
      } else {
        rangeInputs.classList.add("hidden");
        rangeInputs.classList.remove("flex");
      }
    });
  });

  document.getElementById("btn-del-confirm")?.addEventListener("click", async () => {
    const period = document.querySelector('input[name="del-period"]:checked').value;
    const errEl = document.getElementById("del-err");
    errEl.classList.add("hidden");

    if (period === "range") {
      const start = document.getElementById("del-start").value;
      const end = document.getElementById("del-end").value;
      if (!start || !end) {
        errEl.textContent = "Preencha as datas inicial e final.";
        errEl.classList.remove("hidden");
        return;
      }
      
      if (new Date(start) > new Date(end)) {
        errEl.textContent = "Data inicial não pode ser superior à final.";
        errEl.classList.remove("hidden");
        return;
      }

      if (confirm(`⚠️ Excluir permanentemente os dados do período ${start} até ${end}?`)) {
        try {
          showLoading("Excluindo período...");
          const [c1, c2] = await Promise.all([
            fbService.deleteByRange("chamados", start, end, "Abertura"),
            fbService.deleteByRange("satisfacao", start, end, "Data Hora")
          ]);
          
          toast(`${c1 + c2} registros removidos. Recarregando...`, "success");
          window.location.reload();
        } catch (err) {
          console.error(err);
          toast("Erro ao excluir dados.", "error");
        } finally {
          hideLoading();
        }
      }
    } else {
      if (confirm("⚠️ EXCLUIR TUDO? Esta ação apagará TODOS os dados do banco permanentemente.")) {
        try {
          showLoading("Limpando banco...");
          await Promise.all([
            fbService.deleteCollection("chamados"),
            fbService.deleteCollection("satisfacao")
          ]);
          
          UIState.update({ chamados: [], satisfacao: [] });
          popFilters();
          renderAll();
          toast("Todos os dados foram removidos!", "success");
          document.getElementById("btn-close-delete").click();
        } catch (err) {
          console.error(err);
          toast("Erro ao excluir dados.", "error");
        } finally {
          hideLoading();
        }
      }
    }
  });

  document.querySelectorAll(".tabbtn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tabbtn").forEach(b => {
        b.className = "tabbtn bg-transparent border border-border text-muted rounded-md text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all hover:border-border2";
      });
      btn.className = "tabbtn bg-cdim border border-cyan text-cyan rounded-md text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all";
      UIState.update({ tab: btn.dataset.tab });
      const ts = document.getElementById("tsearch");
      if(ts) ts.value = "";
      TableService.resetPage();
      TableService.renderTable(UIState.get().chamados, UIState.get().satisfacao, UIState.get().tab, "");
    });
  });

  document.getElementById("tsearch")?.addEventListener("input", e => {
    const state = UIState.get();
    TableService.renderTable(state.chamados, state.satisfacao, state.tab, e.target.value);
  });

  // Admin Management Events
  const modalAdmins = document.getElementById("admins-modal");
  const btnManageAdmins = document.getElementById("btn-manage-admins");
  const btnCloseAdmins = document.getElementById("btn-close-admins");
  const btnAddAdmin = document.getElementById("btn-adm-add");
  const inputAdmin = document.getElementById("adm-input");
  const listAdmins = document.getElementById("adm-list");
  const errAdmin = document.getElementById("adm-err");

  const renderAdmins = (admins) => {
    if (!admins.length) {
      listAdmins.innerHTML = '<div class="text-muted text-[11px] font-mono text-center py-8">Nenhum administrador extra.</div>';
      return;
    }
    listAdmins.innerHTML = admins.map(email => `
      <div class="flex items-center justify-between bg-surface border border-border p-2.5 rounded-lg group hover:border-cyan/50 transition-colors">
        <span class="text-[12px] font-mono text-text">${email}</span>
        <button class="btn-adm-rem text-muted hover:text-red p-1 cursor-pointer transition-colors text-[10px] font-mono" data-email="${email}">
          [ REMOVER ]
        </button>
      </div>
    `).join('');

    listAdmins.querySelectorAll(".btn-adm-rem").forEach(btn => {
      btn.addEventListener("click", async () => {
        const email = btn.dataset.email;
        if (confirm(`Remover acesso de administrador de ${email}?`)) {
          try {
            showLoading("Removendo...");
            await fbService.removeAdmin(email);
            toast(`Acesso removido para ${email}`, "success");
            const updated = await fbService.loadAdmins();
            renderAdmins(updated);
          } catch (e) {
            toast("Erro ao remover administrador", "error");
          } finally {
            hideLoading();
          }
        }
      });
    });
  };

  btnManageAdmins?.addEventListener("click", async () => {
    modalAdmins.classList.remove("hidden");
    modalAdmins.classList.add("flex");
    errAdmin.classList.add("hidden");
    inputAdmin.value = "";
    
    try {
      const admins = await fbService.loadAdmins();
      renderAdmins(admins);
    } catch (e) {
      listAdmins.innerHTML = '<div class="text-red text-[11px] font-mono text-center py-8">Erro ao carregar lista.</div>';
    }
  });

  btnCloseAdmins?.addEventListener("click", () => {
    modalAdmins.classList.add("hidden");
    modalAdmins.classList.remove("flex");
  });

  btnAddAdmin?.addEventListener("click", async () => {
    const email = inputAdmin.value.trim().toLowerCase();
    if (!email) return;

    errAdmin.classList.add("hidden");
    try {
      showLoading("Concedendo acesso...");
      await fbService.addAdmin(email);
      toast(`Acesso concedido para ${email}`, "success");
      inputAdmin.value = "";
      const updated = await fbService.loadAdmins();
      renderAdmins(updated);
    } catch (e) {
      errAdmin.textContent = "Erro ao adicionar administrador.";
      errAdmin.classList.remove("hidden");
    } finally {
      hideLoading();
    }
  });

  // Click Outside to reset filters
  window.addEventListener('mousedown', (e) => {
    const mainContent = document.getElementById('main-content');
    const sidebar = document.querySelector('aside');
    
    if (e.target.closest('button, select, input, label, canvas, a, .user-row, .pg-btn, .sortable-header, .export-dropdown, .user-click-cell')) return;
    if (e.target.closest('aside, #admins-modal, #delete-data-modal, #user-modal')) return;

    if (mainContent && mainContent.contains(e.target)) {
      const { filters: f } = UIState.get();
      if (f.at || f.st || f.di || f.df || f.usr || f.emp || f.dw !== null || f.ms || f.csat) {
        document.getElementById("btn-reset")?.click();
      }
    }
  });

  // User Modal Events
  document.getElementById("btn-close-user")?.addEventListener("click", () => {
    document.getElementById("user-modal").classList.add("hidden");
    document.getElementById("user-modal").classList.remove("flex");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("user-modal")?.classList.add("hidden");
      document.getElementById("user-modal")?.classList.remove("flex");
      document.getElementById("admins-modal")?.classList.add("hidden");
      document.getElementById("admins-modal")?.classList.remove("flex");
      document.getElementById("delete-data-modal")?.classList.add("hidden");
      document.getElementById("delete-data-modal")?.classList.remove("flex");
    }

    // Navegação do MODO TV (Setas)
    if (document.body.classList.contains("tv-mode-active")) {
      if (e.key === "ArrowRight") document.getElementById("tv-next")?.click();
      if (e.key === "ArrowLeft")  document.getElementById("tv-prev")?.click();
    }
  });

  // Table User Click (Delegated)
  document.getElementById("tblbody")?.addEventListener("click", (e) => {
    const cell = e.target.closest(".user-click-cell");
    if (cell) {
      const name = cell.dataset.user;
      const state = UIState.get();
      ChartService.renderUserProfile(name, state.chamados, state.satisfacao, state.charts);
    }
  });

  // Show Users List Button
  document.getElementById("btn-show-users")?.addEventListener("click", () => {
    const btnUsers = document.querySelector('.tabbtn[data-tab="usuarios"]');
    if (btnUsers) {
      btnUsers.click();
      btnUsers.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // =============================================
  // DRAG AND DROP LAYOUT
  // =============================================
  const mainContent = document.getElementById("main-content");
  let draggedItem = null;

  const saveLayout = () => {
    const sections = [...mainContent.querySelectorAll(".drag-section")];
    const order = sections.map(s => s.dataset.section);
    localStorage.setItem("dashboard_layout", JSON.stringify(order));
  };

  const loadLayout = () => {
    const saved = localStorage.getItem("dashboard_layout");
    if (!saved) return;
    try {
      const order = JSON.parse(saved);
      order.forEach(id => {
        const el = mainContent.querySelector(`[data-section="${id}"]`);
        if (el) mainContent.appendChild(el);
      });
    } catch(e) { console.error("Erro ao carregar layout", e); }
  };

  mainContent.addEventListener("dragstart", (e) => {
    if (!e.target.classList.contains("drag-section")) return;
    draggedItem = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  mainContent.addEventListener("dragend", (e) => {
    if (!e.target.classList.contains("drag-section")) return;
    e.target.classList.remove("dragging");
    mainContent.querySelectorAll(".drag-section").forEach(s => s.classList.remove("drag-over"));
    saveLayout();
  });

  mainContent.addEventListener("dragover", (e) => {
     e.preventDefault();
     const section = e.target.closest(".drag-section");
     if (!section || section === draggedItem) return;
     
     mainContent.querySelectorAll(".drag-section").forEach(s => s.classList.remove("drag-over"));
     section.classList.add("drag-over");
     
     const rect = section.getBoundingClientRect();
     const mid = rect.top + rect.height / 2;
     if (e.clientY < mid) {
       mainContent.insertBefore(draggedItem, section);
     } else {
       mainContent.insertBefore(draggedItem, section.nextSibling);
     }
  });

  loadLayout();

  // =============================================
  // TV MODE (PRESENTATION)
  // =============================================
  let tvInterval = null;
  let tvIndex = 0;
  const tvSections = ["kpi", "vol", "dist", "users-list", "csat", "monthly"];

  const stopTVMode = () => {
    clearInterval(tvInterval);
    tvInterval = null;
    document.body.classList.remove("tv-mode-active");
    mainContent.querySelectorAll(".drag-section").forEach(s => s.classList.remove("tv-slide-active"));
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const startTVMode = async () => {
    let controls = document.getElementById("tv-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.id = "tv-controls";
      controls.innerHTML = `
        <button id="tv-prev" class="bg-card border border-border px-3 py-1.5 rounded-lg text-muted hover:text-cyan cursor-pointer">◂</button>
        <button id="tv-pause" class="bg-card border border-border px-3 py-1.5 rounded-lg text-muted hover:text-cyan cursor-pointer">⏸</button>
        <button id="tv-next" class="bg-card border border-border px-3 py-1.5 rounded-lg text-muted hover:text-cyan cursor-pointer">▸</button>
        <button id="tv-exit" class="bg-card border border-red px-3 py-1.5 rounded-lg text-red hover:bg-red/10 cursor-pointer">SAIR ESC</button>
      `;
      document.body.appendChild(controls);

      document.getElementById("tv-exit").onclick = stopTVMode;
      document.getElementById("tv-next").onclick = () => { showSlide(tvIndex + 1); resetTimer(); };
      document.getElementById("tv-prev").onclick = () => { showSlide(tvIndex - 1); resetTimer(); };
      document.getElementById("tv-pause").onclick = (e) => {
        if (tvInterval) { clearInterval(tvInterval); tvInterval = null; e.target.textContent = "▶"; }
        else { resetTimer(); e.target.textContent = "⏸"; }
      };
    }

    const showSlide = (idx) => {
      tvIndex = (idx + tvSections.length) % tvSections.length;
      const sectId = tvSections[tvIndex];
      
      mainContent.querySelectorAll(".drag-section").forEach(s => s.classList.remove("tv-slide-active"));
      
      const target = mainContent.querySelector(`[data-section="${sectId}"]`);
      if (target) {
        target.classList.add("tv-slide-active");
        // Trigger resize for Chart.js
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 50);
      }
    };

    const resetTimer = () => {
      clearInterval(tvInterval);
      tvInterval = setInterval(() => showSlide(tvIndex + 1), 12000);
    };

    document.body.classList.add("tv-mode-active");
    try { await document.documentElement.requestFullscreen(); } catch(e) {}
    
    showSlide(0);
    resetTimer();
  };

  document.getElementById("btn-tv-mode")?.addEventListener("click", startTVMode);

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) stopTVMode();
  });
}
