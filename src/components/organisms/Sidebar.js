import { UIState } from '../../services/UIState.js';

export const Sidebar = () => {
  const state = UIState.get();
  const isAdmin = state.isAdmin;
  const user = state.user;
  const email = user?.email?.split('@')[0] || '—';
  const avatar = email[0]?.toUpperCase() || 'U';

  return `
  <aside class="w-[272px] shrink-0 bg-surface border-r border-border flex flex-col py-6 px-[18px] gap-5 sticky top-0 h-screen overflow-y-auto hidden md:flex">
    <div class="flex items-center gap-2.5">
      <div class="w-[34px] h-[34px] bg-cdim border border-cyan rounded-lg grid place-items-center text-[16px]">🖥️</div>
      <div>
        <h1 class="font-mono text-[13px] font-bold text-cyan leading-tight">DASHBOARD TI</h1>
        <p class="text-[11px] text-muted">Gestão de Chamados</p>
      </div>
    </div>

    <!-- User Badge -->
    <div class="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
      <div class="w-7 h-7 bg-cdim border border-cyan rounded-full grid place-items-center text-[12px] text-cyan font-mono font-bold shrink-0">${avatar}</div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] text-text whitespace-nowrap overflow-hidden text-ellipsis">${email}</p>
        <p class="text-[10px] ${isAdmin ? 'text-cyan' : 'text-muted'}">${isAdmin ? 'Administrador' : 'Leitor'}</p>
      </div>
      <button id="btn-logout" class="bg-transparent border-none text-muted text-[14px] p-1 hover:text-red cursor-pointer transition-colors" title="Sair">⎋</button>
      <button id="theme-btn-app" class="bg-transparent border border-border2 text-muted rounded-lg p-1.5 font-mono text-[11px] cursor-pointer transition-all hover:border-cyan hover:text-cyan" title="Alternar modo">🌙</button>
    </div>

    ${isAdmin ? `
    <div class="flex flex-col gap-2">
      <p class="font-mono text-[10px] tracking-[1.5px] uppercase text-muted pb-1.5 border-b border-border">Configurações</p>
      <button id="btn-manage-admins" class="bg-transparent border border-border2 text-muted rounded-lg px-4 py-2 font-mono text-[11px] cursor-pointer w-full transition-all hover:border-cyan hover:text-cyan text-left flex items-center gap-2">
        <span>👑</span> Gerenciar Admins
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-mono text-[10px] tracking-[1.5px] uppercase text-muted pb-1.5 border-b border-border">Banco de Dados</p>
      <div id="fbbadge" class="flex items-center gap-2 px-[11px] py-[7px] rounded-lg border border-green text-green bg-green/10 text-[11px] font-mono transition-colors">
        <div class="w-1.5 h-1.5 rounded-full bg-current fbdot"></div>
        <span id="fbstatus">Firebase Conectado</span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <p class="font-mono text-[10px] tracking-[1.5px] uppercase text-muted pb-1.5 border-b border-border">Importar Dados</p>
      
      <label id="zone-rel" class="border-[1.5px] border-dashed border-border2 rounded-[10px] p-[14px] text-center cursor-pointer transition-all bg-card hover:border-cyan hover:bg-cdim flex flex-col items-center">
        <input type="file" accept=".xlsx,.xls,.csv" id="file-rel" class="hidden" />
        <div class="text-[20px] mb-1">📋</div>
        <div class="text-[11px] font-semibold text-text uztitle">Relatório Detalhado</div>
        <div class="text-[10px] text-muted mt-0.5">.xlsx ou .csv</div>
      </label>

      <label id="zone-csat" class="border-[1.5px] border-dashed border-border2 rounded-[10px] p-[14px] text-center cursor-pointer transition-all bg-card hover:border-cyan hover:bg-cdim flex flex-col items-center">
        <input type="file" accept=".xlsx,.xls,.csv" id="file-csat" class="hidden" />
        <div class="text-[20px] mb-1">⭐</div>
        <div class="text-[11px] font-semibold text-text uztitle">Pesquisa de Satisfação</div>
        <div class="text-[10px] text-muted mt-0.5">.xlsx ou .csv</div>
      </label>

      <button id="btn-import" disabled class="bg-cyan text-[#E8E1D0] border-none rounded-lg px-4 py-2.5 font-mono text-[12px] font-bold cursor-pointer w-full transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed">☁️ Importar</button>

      <button id="btn-clear-data" class="bg-transparent border border-red text-red/70 rounded-lg px-4 py-2.5 font-mono text-[11px] font-bold cursor-pointer w-full transition-all hover:bg-red/10 hover:text-red mt-1">🗑️ Excluir Dados</button>
    </div>
    ` : ''}

    <div class="flex flex-col gap-2 relative z-20 pb-4">
      <p class="font-mono text-[10px] tracking-[1.5px] uppercase text-muted pb-1.5 border-b border-border">Filtros Opcionais</p>
      
      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] text-muted">Atendente</label>
        <select id="fat" class="bg-card border border-border rounded-md text-text font-sans text-[12px] px-2.5 py-1.5 w-full outline-none focus:border-cyan transition-colors">
          <option value="">Todos</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[10px] text-muted">Setor</label>
        <select id="fst" class="bg-card border border-border rounded-md text-text font-sans text-[12px] px-2.5 py-1.5 w-full outline-none focus:border-cyan transition-colors">
          <option value="">Todos</option>
        </select>
      </div>



      <button id="btn-reset" class="mt-1 bg-transparent border border-border2 text-muted rounded-lg px-4 py-[7px] font-mono text-[11px] cursor-pointer w-full transition-all hover:border-cyan hover:text-cyan flex items-center justify-center gap-1.5">↺ Limpar Tudo</button>
    </div>
  </aside>
  `;
};
