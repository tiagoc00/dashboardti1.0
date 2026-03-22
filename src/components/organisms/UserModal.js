export const UserModal = () => `
  <div id="user-modal" class="fixed inset-0 bg-black/85 hidden items-center justify-center z-[400] p-4 backdrop-blur-md">
    <div class="bg-bg border border-border2 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-[scale_0.25s_ease-out]">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-border2 bg-card/50 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center text-xl">👤</div>
          <div>
            <h3 id="u-modal-name" class="font-mono text-[18px] font-bold text-cyan tracking-tight">---</h3>
            <p id="u-modal-emp" class="text-[12px] text-muted font-mono tracking-wide">---</p>
          </div>
        </div>
        <button id="btn-close-user" class="text-muted hover:text-red transition-colors font-mono text-[11px] p-2 cursor-pointer bg-surface/50 border border-border rounded-lg">
          [ FECHAR ESC ]
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
        
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-card border border-border rounded-xl p-4">
            <p class="text-[10px] text-muted font-mono uppercase tracking-[1px] mb-1">Total Chamados</p>
            <p id="u-k-total" class="font-mono text-[24px] font-bold text-text">---</p>
          </div>
          <div class="bg-card border border-border rounded-xl p-4">
            <p class="text-[10px] text-muted font-mono uppercase tracking-[1px] mb-1">Resolução Média</p>
            <p id="u-k-sla" class="font-mono text-[24px] font-bold text-green">---</p>
          </div>
          <div class="bg-card border border-border rounded-xl p-4">
            <p class="text-[10px] text-muted font-mono uppercase tracking-[1px] mb-1">Fila Média</p>
            <p id="u-k-fila" class="font-mono text-[24px] font-bold text-amber">---</p>
          </div>
          <div class="bg-card border border-border rounded-xl p-4">
            <p class="text-[10px] text-muted font-mono uppercase tracking-[1px] mb-1">Satisfação Média</p>
            <p id="u-k-csat" class="font-mono text-[24px] font-bold text-cyan">---</p>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-card border border-border rounded-xl p-5">
            <p class="font-mono text-[13px] font-bold text-text mb-4 border-b border-border pb-2 flex items-center gap-2">📂 Áreas Mais Abridas</p>
            <div class="h-[240px] w-full"><canvas id="u-ch-setor"></canvas></div>
          </div>
          <div class="bg-card border border-border rounded-xl p-5">
            <p class="font-mono text-[13px] font-bold text-text mb-4 border-b border-border pb-2 flex items-center gap-2">📈 Histórico de Volume</p>
            <div class="h-[240px] w-full"><canvas id="u-ch-trend"></canvas></div>
          </div>
        </div>

        <!-- Recent Calls Table -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <p class="font-mono text-[13px] font-bold text-text p-4 border-b border-border bg-surface/30">📋 Últimos Chamados Identificados</p>
          <div class="overflow-x-auto">
            <table class="w-full text-[11px] text-left border-collapse">
              <thead class="bg-surface/50 font-mono text-muted uppercase">
                <tr>
                  <th class="p-3">Data</th>
                  <th class="p-3">Assunto / Setor</th>
                  <th class="p-3">Atendente</th>
                  <th class="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody id="u-tbl-calls"></tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  </div>
`;
