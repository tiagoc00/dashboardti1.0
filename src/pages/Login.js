import { Button, Input } from '../components/atoms/index.js';

export const LoginTemplate = () => `
<div id="login-container" class="fixed inset-0 z-[100] flex items-center justify-center bg-bg animate-fade-up">
  <button class="absolute top-[18px] right-[18px] bg-transparent border border-border2 text-muted rounded-lg px-2.5 py-1.5 font-mono text-[11px] cursor-pointer transition-all hover:border-cyan hover:text-cyan flex items-center gap-1.5" id="theme-btn-login" title="Alternar modo">
    🌙 Modo
  </button>
  
  <div class="bg-card w-full max-w-[400px] border border-border2 rounded-2xl p-12 relative overflow-hidden shadow-2xl">
    <!-- Top Gradient Bar -->
    <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan to-purple"></div>
    
    <div class="flex items-center gap-3 mb-8">
      <div class="w-11 h-11 bg-cdim border border-cyan rounded-xl grid place-items-center text-[22px]">🖥️</div>
      <div>
        <h1 class="font-mono text-[16px] font-bold text-cyan leading-tight">DASHBOARD TI</h1>
        <p class="text-[12px] text-muted">Gestão de Chamados</p>
      </div>
    </div>
    
    <h2 class="font-mono text-[18px] font-bold mb-1.5">Entrar na plataforma</h2>
    <p class="text-[13px] text-muted mb-7">Acesse com seu usuário e senha cadastrados.</p>
    
    ${Input({ id: "lin-email", label: "USUÁRIO", placeholder: "Seu nome de usuário", attrs: 'autocomplete="username"' })}
    ${Input({ id: "lin-senha", label: "SENHA", type: "password", placeholder: "••••••••", attrs: 'autocomplete="current-password"' })}
    
    ${Button({ id: "btn-login", text: "Entrar &rarr;", variant: "primary" })}
    
    <div id="lerr" class="bg-red/10 border border-red rounded-lg text-red text-[12px] px-3.5 py-2.5 mt-3 hidden"></div>
    
    <p class="text-center mt-6 text-[11px] text-muted">
      Não tem conta? <a href="#" id="go-register" class="text-cyan font-bold no-underline hover:underline">Cadastrar</a>
    </p>
  </div>
  
  <p class="absolute bottom-5 left-0 right-0 text-center font-mono text-[10px] tracking-widest uppercase text-muted">
    Desenvolvido por: <strong class="text-cyan">Tiago Cabral</strong>
  </p>
</div>
`;
