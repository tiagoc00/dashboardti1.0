// src/services/UIState.js
// Singleton for holding app state
let stateHandlers = [];
let state = {
  chamados: [],
  satisfacao: [],
  firebaseOk: false,
  tab: "chamados",
  fileRel: null,
  fileCsat: null,
  user: null,
  isAdmin: false,
  theme: localStorage.getItem("theme") === "light" ? "light" : "dark",
  filters: { at: "", st: "", di: "", df: "", usr: "", emp: "", dw: null, ms: "", csat: "" },
  charts: {}
};

export const UIState = {
  get: () => state,
  update: (newState) => {
    state = { ...state, ...newState };
    stateHandlers.forEach(fn => fn(state));
  },
  subscribe: (fn) => {
    stateHandlers.push(fn);
    return () => { stateHandlers = stateHandlers.filter(h => h !== fn); };
  },
  applyTheme: (light) => {
    document.body.classList.toggle("light-mode", light);
    localStorage.setItem("theme", light ? "light" : "dark");
    UIState.update({ theme: light ? "light" : "dark" });
  }
};

UIState.applyTheme(state.theme === "light");
