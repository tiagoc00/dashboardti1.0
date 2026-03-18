import { KpiCard, KpiCardSkeleton } from '../molecules/KpiCard.js';

export const MainDashboardLayout = () => {
  return `
  <main class="flex-1 p-4 md:p-8 flex flex-col gap-7 min-w-0" id="main-content">
    
    <!-- EMPTY STATE / SKELETON LOADING -->
    <div id="estate" class="flex-1 flex flex-col gap-7">
      <!-- Skeleton KPIs -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ KPIs Principais</p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${KpiCardSkeleton()}${KpiCardSkeleton()}${KpiCardSkeleton()}${KpiCardSkeleton()}
        </div>
      </section>
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Usuários em Destaque</p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${KpiCardSkeleton()}${KpiCardSkeleton()}${KpiCardSkeleton()}${KpiCardSkeleton()}
        </div>
      </section>
      <section>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <div class="skeleton" style="height:14px;width:40%;margin-bottom:16px"></div>
            <div class="skeleton skeleton-chart"></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <div class="skeleton" style="height:14px;width:40%;margin-bottom:16px"></div>
            <div class="skeleton skeleton-chart"></div>
          </div>
        </div>
      </section>
    </div>

    <!-- DASHBOARD RENDER -->
    <div id="dash" class="hidden flex-col gap-7">
      
      <!-- HEADER FILTERS -->
      <div class="flex items-end justify-between pb-4 border-b border-border flex-wrap gap-3">
        <div class="flex-1 min-w-[200px]">
           <h2 class="font-mono text-[20px] font-bold text-cyan">CHAMADOS DE TI</h2>
           <p class="text-[14px] text-text font-bold mt-1">SLA · Produtividade · Satisfação · Usuários</p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-4 bg-card border border-border2 rounded-lg px-3 py-1.5 shadow-sm">
            <div class="flex items-center gap-2">
              <label class="text-[10px] text-muted font-mono uppercase tracking-[1px]">De</label>
              <input type="date" id="fdi" class="bg-transparent border-none text-text font-sans text-[11px] outline-none cursor-pointer" />
            </div>
            <div class="w-px h-4 bg-border2"></div>
            <div class="flex items-center gap-2">
              <label class="text-[10px] text-muted font-mono uppercase tracking-[1px]">Ate</label>
              <input type="date" id="fdf" class="bg-transparent border-none text-text font-sans text-[11px] outline-none cursor-pointer" />
            </div>
          </div>

          <!-- EXPORT DROPDOWN -->
          <div class="export-dropdown">
            <button id="btn-export-toggle" class="bg-card border border-border2 text-text rounded-lg px-3 py-1.5 font-mono text-[11px] cursor-pointer transition-all hover:border-cyan hover:text-cyan flex items-center gap-1.5 shadow-sm">
              📥 Exportar
            </button>
            <div id="export-menu" class="export-menu">
              <button id="btn-export-excel" class="export-item">
                <span>📊</span> Exportar Excel (.xlsx)
              </button>
              <button id="btn-export-pdf" class="export-item">
                <span>📄</span> Exportar PDF (Visual)
              </button>
              <button id="btn-print" class="export-item">
                <span>🖨️</span> Imprimir Dashboard
              </button>
            </div>
          </div>
        </div>

        <div id="lupdate" class="font-mono text-[11px] text-muted text-right min-w-[140px]">Atualizado: ---</div>
      </div>

      <!-- KPIS PRINCIPAIS -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ KPIs Principais</p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${KpiCard({ title: 'Total de Chamados', value: '—', sub: 'chamados resolvidos', idValue: 'k-total', idTrend: 'k-total-trend', colorClass: 'text-cyan', borderClass: 'from-cyan to-transparent' })}
          ${KpiCard({ title: 'Tempo Médio Resolução', value: '—', sub: 'por chamado', idValue: 'k-sla', idTrend: 'k-sla-trend', colorClass: 'text-green', borderClass: 'from-green to-transparent' })}
          ${KpiCard({ title: 'Tempo Médio na Fila', value: '—', sub: 'aguardando atendimento', idValue: 'k-fila', idTrend: 'k-fila-trend', colorClass: 'text-amber', borderClass: 'from-amber to-transparent' })}
          ${KpiCard({ title: 'CSAT Score', value: '—', sub: 'avaliações', idValue: 'k-csat', idSub: 'k-csat-sub', idTrend: 'k-csat-trend', colorClass: 'text-blue', borderClass: 'from-blue to-transparent' })}
        </div>
      </section>

      <!-- KPIS USUARIOS -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Usuários em Destaque</p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${KpiCard({ title: 'Total de Usuários', value: '—', sub: 'usuários únicos', idValue: 'k-users', idTrend: 'k-users-trend', colorClass: 'text-purple', borderClass: 'from-purple to-transparent' })}
          ${KpiCard({ title: 'Usuário Mais Ativo', value: '—', sub: 'chamados', idValue: 'k-topuser', idSub: 'k-topuser-sub', colorClass: 'text-amber !text-[16px] mt-1.5', borderClass: 'from-amber to-transparent' })}
          ${KpiCard({ title: 'Média por Usuário', value: '—', sub: 'chamados/usuário', idValue: 'k-avguser', colorClass: 'text-cyan', borderClass: 'from-cyan to-transparent' })}
          ${KpiCard({ title: 'Empresa Mais Ativa', value: '—', sub: 'chamados', idValue: 'k-topemp', idSub: 'k-topemp-sub', colorClass: 'text-green !text-[16px] mt-1.5', borderClass: 'from-green to-transparent' })}
        </div>
      </section>

      <!-- VOLUME CHART -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Volume de Chamados</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 tracking-wide">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📊 Chamados por Atendente</p>
            <div class="h-[280px] w-full"><canvas id="ch-atend"></canvas></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📂 Top 10 Categorias</p>
            <div class="h-[280px] w-full"><canvas id="ch-setor"></canvas></div>
          </div>
        </div>
      </section>

      <!-- DIA DA SEMANA + HEATMAP -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Distribuição Semanal</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
             <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📅 Chamados por Dia da Semana</p>
             <div class="h-[260px] w-full"><canvas id="ch-dow"></canvas></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
             <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">🔥 Heatmap — Horários de Pico</p>
             <div id="heatmap-container" class="w-full overflow-x-auto"></div>
          </div>
        </div>
      </section>

      <!-- USERS LIST -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Chamados por Usuário</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
             <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">🏆 Top 20 Usuários <span id="ulabel" class="text-muted font-normal text-[11px]"></span></p>
             <div id="rlist" class="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1"></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
             <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📊 Top 10 Usuários <span class="text-muted font-normal text-[11px]">(volume)</span></p>
             <div class="h-[320px] w-full"><canvas id="ch-users"></canvas></div>
          </div>
        </div>
        <div class="bg-card border border-border rounded-xl p-5 animate-fade-up mt-3.5">
           <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">🏢 Top 15 Empresas <span class="text-muted font-normal text-[11px]">(volume)</span></p>
           <div class="h-[260px] w-full"><canvas id="ch-emp"></canvas></div>
        </div>
      </section>

      <!-- SATISFACAO E SLA -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Satisfação & SLA</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">🍩 Distribuição CSAT <span id="csatlabel" class="text-muted font-normal text-[11px]"></span></p>
            <div class="h-[280px] w-full"><canvas id="ch-csat"></canvas></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">⏱️ Tempo Médio por Atendente</p>
            <div class="h-[280px] w-full"><canvas id="ch-sla"></canvas></div>
          </div>
        </div>
      </section>

      <!-- EVOLUÇÃO MENSAL -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Evolução Mensal</p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📈 Volume Mensal</p>
            <div class="h-[220px] w-full"><canvas id="ch-vmes"></canvas></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <p class="font-mono text-[14px] font-bold text-text mb-4 flex items-center gap-2">📉 Tempo Médio Mensal (min)</p>
            <div class="h-[220px] w-full"><canvas id="ch-smes"></canvas></div>
          </div>
        </div>
      </section>

      <!-- TABELA BRUTA -->
      <section>
        <p class="font-mono text-[13px] tracking-[2px] uppercase text-text font-bold mb-3.5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:bg-border">◈ Dados Brutos</p>
        <div class="bg-card border border-border rounded-xl overflow-hidden animate-fade-up">
          <div class="flex items-center justify-between p-[16px_20px] border-b border-border gap-3 flex-wrap bg-card">
            <div class="flex gap-2">
              <button class="tabbtn bg-cdim border border-cyan text-cyan rounded-md text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all" data-tab="chamados">📋 Chamados</button>
              <button class="tabbtn bg-transparent border border-border text-muted rounded-md text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all hover:border-border2" data-tab="satisfacao">⭐ Satisfação</button>
              <button class="tabbtn bg-transparent border border-border text-muted rounded-md text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all hover:border-border2" data-tab="usuarios">👤 Usuários</button>
            </div>
            <input type="text" id="tsearch" placeholder="Pesquisar..." class="bg-surface border border-border rounded-md text-text text-[12px] px-3 py-2 w-[220px] outline-none transition-colors font-sans focus:border-cyan" />
          </div>
          <div class="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table class="w-full text-[12px] text-left border-collapse">
              <thead id="tblhead" class="bg-surface sticky top-0"></thead>
              <tbody id="tblbody"></tbody>
            </table>
          </div>
          <div id="tblfooter" class="p-[10px_20px] border-t border-border text-[11px] text-muted font-mono bg-card flex items-center justify-between gap-4 flex-wrap"></div>
        </div>
      </section>

    </div>
  </main>
  `;
};
