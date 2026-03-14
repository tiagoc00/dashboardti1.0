export const DeleteDataModal = () => `
  <div id="delete-data-modal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-surface border border-border w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
      <!-- Header -->
      <div class="p-6 border-b border-border bg-card/50">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-mono text-[14px] font-bold text-red flex items-center gap-2">
            <span class="text-[18px]">⚠️</span> EXCLUIR DADOS
          </h3>
          <button id="btn-close-delete" class="text-muted hover:text-text transition-colors p-1">✕</button>
        </div>
        <p class="text-[11px] text-muted">Selecione o período dos dados que deseja remover permanentemente.</p>
      </div>

      <!-- Body -->
      <div class="p-6 flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-red/50 transition-all group has-[:checked]:border-red has-[:checked]:bg-red/5">
            <input type="radio" name="del-period" value="all" checked class="w-4 h-4 accent-red cursor-pointer" />
            <div class="flex-1">
              <span class="block text-[12px] font-bold text-text group-hover:text-red transition-all">Excluir Tudo</span>
              <span class="block text-[10px] text-muted mt-0.5">Remove todos os registros (Chamados e Satisfação).</span>
            </div>
          </label>

          <label class="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-cyan/50 transition-all group has-[:checked]:border-cyan has-[:checked]:bg-cyan/5">
            <input type="radio" name="del-period" value="range" class="w-4 h-4 accent-cyan cursor-pointer" />
            <div class="flex-1">
              <span class="block text-[12px] font-bold text-text group-hover:text-cyan transition-all">Excluir por Período</span>
              <span class="block text-[10px] text-muted mt-0.5">Selecione um intervalo de datas específico.</span>
            </div>
          </label>
        </div>

        <!-- Range Inputs (Hidden by default or managed by JS) -->
        <div id="del-range-inputs" class="hidden flex-col gap-4 animate-fade-up">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-mono uppercase tracking-[1px] text-muted ml-1">De</label>
              <input type="date" id="del-start" class="bg-card border border-border rounded-lg text-text font-sans text-[12px] px-3 py-2 w-full outline-none focus:border-cyan transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-mono uppercase tracking-[1px] text-muted ml-1">Até</label>
              <input type="date" id="del-end" class="bg-card border border-border rounded-lg text-text font-sans text-[12px] px-3 py-2 w-full outline-none focus:border-cyan transition-colors" />
            </div>
          </div>
        </div>

        <div id="del-err" class="hidden text-red text-[11px] font-mono bg-red/10 border border-red/20 p-3 rounded-lg text-center animate-shake">
          Preencha as datas corretamente.
        </div>

        <button id="btn-del-confirm" class="w-full bg-red text-white border-none rounded-xl py-3 font-mono text-[13px] font-bold cursor-pointer transition-all hover:opacity-90 shadow-lg shadow-red/20 flex items-center justify-center gap-2">
          🗑️ Confirmar Exclusão
        </button>
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-4 bg-red/5 border-t border-red/10">
        <p class="text-[10px] text-red/80 leading-relaxed text-center">
          <strong>Atenção:</strong> Esta ação é irreversível e os dados serão removidos permanentemente do banco de dados Firebase.
        </p>
      </div>
    </div>
  </div>
`;
