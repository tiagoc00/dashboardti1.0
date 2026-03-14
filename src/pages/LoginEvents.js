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

    document.getElementById('lin-senha')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnLogin.click();
    });

    document.getElementById('go-register')?.addEventListener('click', e => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('render-register'));
    });
  }
}

export function attachRegisterEvents(fbService, showLoading, hideLoading, toast) {
  const btnRegister = document.getElementById('btn-register');
  
  document.getElementById('go-login')?.addEventListener('click', e => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('render-login'));
  });

  if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
      const val = document.getElementById('reg-email').value.trim();
      const senha = document.getElementById('reg-senha').value;
      const senha2 = document.getElementById('reg-senha2').value;
      const errEl = document.getElementById('rerr');
      
      errEl.classList.add('hidden');
      
      if (!val || !senha || !senha2) {
        errEl.textContent = "Preencha todos os campos.";
        errEl.classList.remove('hidden');
        return;
      }

      if (senha !== senha2) {
        errEl.textContent = "As senhas não coincidem.";
        errEl.classList.remove('hidden');
        return;
      }

      if (senha.length < 6) {
        errEl.textContent = "A senha deve ter pelo menos 6 caracteres.";
        errEl.classList.remove('hidden');
        return;
      }

      const email = val.includes("@") ? val : val + "@dash.local";
      
      btnRegister.disabled = true;
      btnRegister.textContent = "Cadastrando...";
      showLoading("Criando sua conta...");
      
      try {
        await fbService.createUser(email, senha);
        toast("Conta criada com sucesso!", "success");
      } catch (err) {
        hideLoading();
        btnRegister.disabled = false;
        btnRegister.textContent = "Cadastrar &rarr;";
        
        const msgs = {
          "auth/email-already-in-use": "Este usuário já está em uso.",
          "auth/invalid-email": "Usuário inválido.",
          "auth/operation-not-allowed": "O cadastro de novos usuários está desativado.",
          "auth/weak-password": "A senha é muito fraca."
        };
        errEl.textContent = msgs[err.code] || "Erro ao criar conta. Tente novamente.";
        errEl.classList.remove('hidden');
      }
    });

    document.getElementById('reg-senha2')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnRegister.click();
    });
  }
}
