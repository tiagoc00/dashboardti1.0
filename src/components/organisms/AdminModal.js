export const AdminModal = () => `
  <div id="admins-modal" class="fixed inset-0 bg-black/80 hidden items-center justify-center z-[300] p-4 backdrop-blur-sm">
    <div class="bg-card border border-border rounded-xl w-full max-w-[440px] shadow-2xl overflow-hidden animate-[scale_0.2s_ease-out]">
      <div class="p-6 border-b border-border">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">👑</span>
          <h3 class="font-mono text-[16px] font-bold text-cyan uppercase tracking-wider">Gerenciar Administradores</h3>
        </div>
        <p class="text-[12px] text-muted leading-relaxed">Admins podem importar bancos de dados e conceder privilégios a outros usuários.</p>
      </div>
      
      <div class="p-6 flex flex-col gap-6">
        <!-- Add Admin Form -->
        <div class="flex flex-col gap-2">
          <label class="text-[10px] text-muted uppercase tracking-[1px] font-mono">Nome do Usuário (ex: joao.silva)</label>
          <div class="flex gap-2">
            <input type="text" id="adm-input" placeholder="Digite o usuário..." 
              class="flex-1 bg-surface border border-border2 rounded-lg text-text font-sans text-[13px] px-3.5 py-2.5 outline-none focus:border-cyan transition-colors" />
            <button id="btn-adm-add" class="bg-cyan text-surface border-none rounded-lg px-5 py-2.5 font-mono text-[11px] font-bold cursor-pointer hover:opacity-85 transition-all">
              Conceder
            </button>
          </div>
          <p id="adm-err" class="text-red text-[11px] font-mono hidden"></p>
        </div>
        
        <!-- Admins List Section -->
        <div>
          <p class="font-mono text-[10px] tracking-[1.5px] uppercase text-muted pb-1.5 border-b border-border mb-3">Admins Cadastrados</p>
          <div id="adm-list" class="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            <div class="text-muted text-[11px] font-mono text-center py-8 bg-surface/50 rounded-lg border border-dashed border-border2">
              Buscando lista...
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-surface/30 border-t border-border flex justify-end">
        <button id="btn-close-admins" class="text-muted font-mono text-[11px] hover:text-cyan transition-colors py-2 px-4 cursor-pointer">
          [ FECHAR ]
        </button>
      </div>
    </div>
  </div>
`;
