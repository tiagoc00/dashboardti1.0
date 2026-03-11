import { FirebaseService } from './services/FirebaseService.js';
import { UIState } from './services/UIState.js';
import { LoginTemplate } from './pages/Login.js';
import { attachLoginEvents } from './pages/LoginEvents.js';
import { DashboardTemplate } from './pages/Dashboard.js';
import { attachDashboardEvents } from './pages/DashboardEvents.js';

let fbService;

function showLoading(msg = 'Processando...') {
  document.getElementById('lmsg').textContent = msg;
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('loading').classList.add('flex');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('loading').classList.remove('flex');
}

let _tt;
export function toast(msg, type = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const toastEl = document.getElementById("toast");
  document.getElementById("ticon").innerHTML = icons[type] || "i";
  document.getElementById("tmsg").textContent = msg;
  
  toastEl.className = `fixed bottom-[22px] right-[22px] bg-card border rounded-[10px] p-3 text-[12px] flex items-center gap-[10px] z-[999] min-w-[260px] shadow-2xl transition-all duration-300 transform ${
    type === 'success' ? 'border-green' : type === 'error' ? 'border-red' : 'border-cyan'
  }`;
  
  void toastEl.offsetWidth;
  toastEl.classList.remove('translate-y-[80px]', 'opacity-0');
  toastEl.classList.add('translate-y-0', 'opacity-100');
  
  clearTimeout(_tt);
  _tt = setTimeout(() => {
    toastEl.classList.remove('translate-y-0', 'opacity-100');
    toastEl.classList.add('translate-y-[80px]', 'opacity-0');
  }, 4500);
}

function renderLogin() {
  document.getElementById('root').innerHTML = LoginTemplate();
  attachLoginEvents(fbService, showLoading, hideLoading, toast);
}

function renderDashboard() {
  document.getElementById('root').innerHTML = DashboardTemplate();
  attachDashboardEvents(fbService, showLoading, hideLoading, toast);
}

// Init App flow
const initApp = () => {
    fbService = new FirebaseService();
    // Auth Listener
    fbService.onAuth(async (user) => {
      if (user) {
        UIState.update({ user });
        const emailHost = user.email.split('@')[0];
        const isAdmin = await fbService.isAdmin(emailHost);
        UIState.update({ isAdmin });
        
        hideLoading();
        renderDashboard();
      } else {
        UIState.update({ user: null, isAdmin: false });
        hideLoading();
        renderLogin();
      }
    });
};

if (window.__FB) {
  initApp();
} else {
  window.addEventListener('firebase-ready', initApp);
}

setTimeout(() => {
  if (!window.__FB) {
    hideLoading();
    document.getElementById('root').innerHTML = '<div class="text-red p-10 text-center font-mono text-sm">Erro: Firebase SDK demorou muito para carregar. Verifique a internet e desative bloqueadores de anúncios.</div>';
  }
}, 15000);
