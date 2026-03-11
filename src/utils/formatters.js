// src/utils/formatters.js
export const escapeHTML = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
export const timeToMin = (str) => { if (!str) return null; const p = String(str).trim().split(":"); if(p.length < 2) return null; const [h, m, s] = [+p[0], +p[1], +(p[2]||0)]; return isNaN(h+m+s) ? null : h*60+m+s/60; };
export const fmtMin = (min) => { if (min == null || isNaN(min)) return "&#x2014;"; const h = Math.floor(min/60), m = Math.round(min%60); return h>0 ? `${h}h ${String(m).padStart(2,"00")}min` : `${m}min`; };
export const cleanSt = (s) => (s ? s.replace(/[^\w\s>áéíóúàâêôãõçÁÉÍÓÚÀÂÊÔÃÕÇ/()]/g, "").trim() || "Sem categoria" : "Sem categoria");
export const avg = (a) => { const v = a.filter(x=>x!=null&&!isNaN(x)); return v.length ? v.reduce((acc,b)=>acc+b,0)/v.length : 0; };
export const groupBy = (a, k) => a.reduce((acc, r) => { const kk = r[k] || "&#x2014;"; (acc[kk] = acc[kk]||[]).push(r); return acc; }, {});
export const calcCsat = (a) => { const v = a.filter(r=>r["Avaliação"]); if(!v.length) return 0; return +((v.filter(r=>["Satisfeito","Muito Satisfeito"].includes(r["Avaliação"])).length/v.length)*100).toFixed(1); };
export const csatClr = (s) => s>=80 ? "#00e676" : s>=60 ? "#ffc400" : "#ff5252";
export const parseMes = (str) => { const m = String(str||"").match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[2]}` : "&#x2014;"; };
export const parseDate = (str) => { const m = String(str||"").match(/(\d{2})\/(\d{2})\/(\d{4})/); return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`) : null; };
