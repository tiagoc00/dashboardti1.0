import { UIState } from '../services/UIState.js';
import { DataService } from '../services/DataService.js';
import { ChartService } from '../services/ChartService.js';
import { TableService } from '../services/TableService.js';
import { fmtMin, avg, calcCsat, csatClr, groupBy } from '../utils/formatters.js';

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

export function attachDashboardEvents(fbService, showLoading, hideLoading, toast) {
  const renderKPIs = (ch, cs) => {
    document.getElementById("k-total").textContent = ch.length.toLocaleString("pt-BR");
    
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
    document.getElementById("k-users").textContent = totalUsers.toLocaleString("pt-BR");
    
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
  };

  const popFilters = () => {
    const ch = UIState.get().chamados;
    const at = [...new Set(ch.map(r => r["Atendente"]).filter(Boolean))].sort();
    const st = [...new Set(ch.map(r => r._st).filter(Boolean))].sort();
    
    document.getElementById("fat").innerHTML = '<option value="">Todos</option>' + at.map(a => `<option value="${a}">${a}</option>`).join("");
    document.getElementById("fst").innerHTML = '<option value="">Todos</option>' + st.map(s => `<option value="${s}">${s}</option>`).join("");
  };

  const renderAll = () => {
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
        UIState.update({ filters: { ...UIState.get().filters, usr: name } });
        renderAll();
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
  
  const btnTheme = document.getElementById('theme-btn-app');
  btnTheme?.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-mode');
      UIState.applyTheme(!isLight);
      btnTheme.innerHTML = !isLight ? '☀️' : '🌙';
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

  ["fat", "fst", "fdi", "fdf"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", e => {
      UIState.update({ filters: { ...UIState.get().filters, [id.replace('f', '')]: e.target.value } });
      renderAll();
    });
  });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    ["fat", "fst", "fdi", "fdf"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
    UIState.update({ filters: { at: "", st: "", di: "", df: "", usr: "", emp: "", dw: null, ms: "", csat: "" } });
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
          window.location.reload(); // Easier than manual cleanup for complex range filter
        } catch (err) {
          console.error(err);
          toast("Erro ao excluir dados.", "error");
        } finally {
          hideLoading();
        }
      }
    } else {
      // Deletar Tudo
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
    
    // If clicked on an interactive element (buttons, inputs, etc), don't reset
    if (e.target.closest('button, select, input, label, canvas, a, .user-row')) return;
    
    // Also ignore clicks inside sidebar and modals
    if (e.target.closest('aside, #admins-modal, #delete-data-modal')) return;

    // Finally, if click is within main, reset
    if (mainContent && mainContent.contains(e.target)) {
      const { filters: f } = UIState.get();
      if (f.at || f.st || f.di || f.df || f.usr || f.emp || f.dw !== null || f.ms || f.csat) {
        document.getElementById("btn-reset")?.click();
      }
    }
  });
}
