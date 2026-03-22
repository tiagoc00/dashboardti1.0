// src/services/DataService.js
import { timeToMin, cleanSt, parseDate, parseMes, parseISO } from '../utils/formatters.js';
import { UIState } from './UIState.js';

export const DataService = {
  processRel: (raw) => {
    return raw.filter(r => r["Atendente"] && r["Atendente"] !== "Sistema").map(r => {
      const dt = parseDate(r["Abertura"]);
      return {
        ...r,
        _tm: timeToMin(r["Tempo"]),
        _fm: timeToMin(r["Tempo na Fila"]),
        _st: cleanSt(r["Setor"]),
        _dt: dt,
        _ms: parseMes(r["Abertura"]),
        _dw: dt ? dt.getDay() : null,
        "Empresa": r["Empresa"] ? r["Empresa"].trim() : "",
        "Contato": r["Contato"] ? r["Contato"].trim() : "Usuário não identificado"
      };
    });
  },
  
  getFilteredData: () => {
    const state = UIState.get();
    const { at, st, di, df, usr, emp, dw, ms, csat } = state.filters;
    let ch = [...state.chamados];
    let cs = [...state.satisfacao];
    
    if(at) { ch = ch.filter(r => r["Atendente"] === at); cs = cs.filter(r => r["Atendente"] === at); }
    if(st) ch = ch.filter(r => r._st === st);
    if(di) { const d = parseISO(di); ch = ch.filter(r => r._dt && r._dt >= d); }
    if(df) { const d = parseISO(df); ch = ch.filter(r => r._dt && r._dt <= d); }
    if(usr) ch = ch.filter(r => r["Contato"] === usr);
    if(emp) ch = ch.filter(r => r["Empresa"] === emp);
    if(dw !== null && dw !== "") ch = ch.filter(r => r._dw === Number(dw));
    if(ms) ch = ch.filter(r => r._ms === ms);
    if(csat) cs = cs.filter(r => r["Avaliação"] === csat);
    
    return { ch, cs };
  }
};
