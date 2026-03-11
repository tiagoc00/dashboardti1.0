import { UIState } from '../services/UIState.js';

export function attachLoginEvents(fbService, showLoading, hideLoading, toast) {
  const btnLogin = document.getElementById('btn-login');
  const btnTheme = document.getElementById('theme-btn-login');

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-mode');
      UIState.applyTheme(!isLight);
      btnTheme.innerHTML = !isLight ? '☀️ Modo' : '🌙 Modo';
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const val = document.getElementById('lin-email').value.trim();
      const senha = document.getElementById('lin-senha').value;
      const errEl = document.getElementById('lerr');
      
      errEl.classList.add('hidden');
      
      if (!val || !senha) {
        errEl.textContent = "Preencha usuário e senha.";
        errEl.classList.remove('hidden');
        return;
      }

      const email = val.includes("@") ? val : val + "@dash.local";
      
      btnLogin.disabled = true;
      btnLogin.textContent = "Autenticando...";
      showLoading("Verificando credenciais...");
      
      try {
        await fbService.signIn(email, senha);
        // auth event will trigger renderDashboard from main.js automatically
      } catch (err) {
        hideLoading();
        btnLogin.disabled = false;
        btnLogin.innerHTML = "Entrar &rarr;";
        
        const msgs = {
          "auth/invalid-credential": "Usuário ou senha incorretos.",
          "auth/user-not-found": "Usuário não encontrado.",
          "auth/wrong-password": "Senha incorreta.",
          "auth/invalid-email": "Usuário inválido.",
          "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
          "auth/network-request-failed": "Erro de conexão. Verifique a internet."
        };
        errEl.textContent = msgs[err.code] || "Erro ao autenticar. Verifique suas credenciais.";
        errEl.classList.remove('hidden');
      }
    });

    // Enter key support
    document.getElementById('lin-senha')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnLogin.click();
    });
  }
}
