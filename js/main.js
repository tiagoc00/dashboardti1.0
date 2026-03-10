/**
 * main.js — Lógica principal do Dashboard de Chamados de TI
 *
 * Responsabilidades:
 *   - Autenticação (login, cadastro, logout) via Firebase Auth
 *   - Leitura e gravação de dados no Firestore
 *   - Processamento e filtragem dos dados de chamados e satisfação
 *   - Renderização de KPIs, gráficos (Chart.js) e tabelas
 *   - Gerenciamento de estado da interface (filtros, tabs, loading)
 *
 * Depende de:
 *   - window.__FB  → objeto exposto pelo firebase.js (após "firebase-ready")
 *   - Chart.js     → renderização dos gráficos
 *   - XLSX (SheetJS) → leitura de arquivos .xlsx e .csv
 */

const S={chamados:[],satisfacao:[],firebaseOk:false,charts:{},tab:"chamados",fileRel:null,fileCsat:null,user:null};

/* THEME TOGGLE */
function applyTheme(light){
  document.body.classList.toggle("light-mode", light);
  const icon = light ? "☀️ Modo" : "🌙 Modo";
  const iconSmall = light ? "☀️" : "🌙";
  const loginBtn = document.getElementById("theme-btn-login");
  const appBtn   = document.getElementById("theme-btn-app");
  if(loginBtn) loginBtn.textContent = icon;
  if(appBtn)   appBtn.textContent   = iconSmall;
  localStorage.setItem("theme", light ? "light" : "dark");
}
// Restaurar preferência salva
applyTheme(localStorage.getItem("theme") === "light");
document.addEventListener("click", e=>{
  if(e.target.id === "theme-btn-login" || e.target.id === "theme-btn-app"){
    applyTheme(!document.body.classList.contains("light-mode"));
  }
});


const timeToMin=str=>{if(!str)return null;const p=String(str).trim().split(":");if(p.length<2)return null;const[h,m,s]=[+p[0],+p[1],+(p[2]||0)];return isNaN(h+m+s)?null:h*60+m+s/60};
const fmtMin=min=>{if(min==null||isNaN(min))return"&#x2014;";const h=Math.floor(min/60),m=Math.round(min%60);return h>0?`${h}h ${String(m).padStart(2,"0")}min`:`${m}min`};
const cleanSt=s=>{if(!s)return"Sem categoria";return s.replace(/[^\w\s>áéíóúàâêôãõçÁÉÍÓÚÀÂÊÔÃÕÇ/()]/g,"").trim()||"Sem categoria"};
const avg=a=>{const v=a.filter(x=>x!=null&&!isNaN(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:0};
const groupBy=(a,k)=>a.reduce((acc,r)=>{const kk=r[k]||"&#x2014;";(acc[kk]=acc[kk]||[]).push(r);return acc},{});
const calcCsat=a=>{const v=a.filter(r=>r["Avaliação"]);if(!v.length)return 0;return+((v.filter(r=>["Satisfeito","Muito Satisfeito"].includes(r["Avaliação"])).length/v.length)*100).toFixed(1)};
const csatClr=s=>s>=80?"#00e676":s>=60?"#ffc400":"#ff5252";
const parseMes=str=>{const m=String(str||"").match(/(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[2]}`:"&#x2014;"};
const parseDate=str=>{const m=String(str||"").match(/(\d{2})\/(\d{2})\/(\d{4})/);return m?new Date(`${m[3]}-${m[2]}-${m[1]}`):null};

let _tt;
const toast=(msg,type="info")=>{
  const icons={success:"&#x2705;",error:"&#x274C;",info:"&#x2139;&#xFE0F;"};
  document.getElementById("ticon").innerHTML=icons[type]||"i";
  document.getElementById("tmsg").textContent=msg;
  const el=document.getElementById("toast");
  el.className=`show ${type}`;clearTimeout(_tt);_tt=setTimeout(()=>el.className="",4500)
};
const showL=msg=>{document.getElementById("lmsg").textContent=msg||"Processando...";document.getElementById("loading").classList.add("show")};
const hideL=()=>document.getElementById("loading").classList.remove("show");
const killC=id=>{if(S.charts[id]){S.charts[id].destroy();delete S.charts[id]}};

/* AUTH */
function setupAuth(){
  window.__FB.onAuth(async user=>{
    if(user){
      S.user=user;
      document.getElementById("login-screen").style.display="none";
      document.getElementById("app").classList.add("visible");
      const em=(user.email||"").split("@")[0].trim(); // garante pega apenas o username limpo
      document.getElementById("uemail").textContent=em;
      document.getElementById("uavatar").textContent=em[0]?.toUpperCase()||"U";
      
      // Access Control (Check Firestore)
      let isAdmin = em.toLowerCase() === "admin" || em.toLowerCase() === "tiago.cabral";
      if(!isAdmin) {
        try {
          const doc = await window.__FB.getDoc(window.__FB.doc(window.__FB.db, "admins", em.toLowerCase()));
          isAdmin = doc.exists();
        } catch(e) { console.error("Erro ao checar admin:", e); }
      }
      
      document.body.classList.toggle("is-admin", isAdmin);
      const roleEl = document.querySelector(".urole");
      if(roleEl) {
        roleEl.textContent = isAdmin ? "Administrador" : "Leitor";
        roleEl.style.color = isAdmin ? "var(--cyan)" : "var(--muted)";
      }
      
      const btn = document.getElementById("btn-login");
      if(btn) { btn.disabled=false; btn.innerHTML="Entrar &#x2192;"; }
      
      hideL(); // Esconde a tela escura de loading para liberar a interface
      
      loadFromFB();
    }else{
      S.user=null;
      document.getElementById("login-screen").style.display="flex";
      document.getElementById("app").classList.remove("visible");
      hideL();
    }
  });
}

document.getElementById("btn-login").addEventListener("click",async()=>{
  const val=document.getElementById("lin-email").value.trim();
  const senha=document.getElementById("lin-senha").value;
  const errEl=document.getElementById("lerr");
  errEl.classList.remove("show");
  if(!val||!senha){errEl.textContent="Preencha usuário e senha.";errEl.classList.add("show");return}
  const email = val.includes("@") ? val : val + "@dash.local";
  const btn = document.getElementById("btn-login");
  btn.disabled=true; btn.textContent="Autenticando...";
  showL("Verificando credenciais...");
  try{
    await window.__FB.signIn(email,senha);
    hideL();
  }
  catch(err){
    hideL();btn.disabled=false;btn.innerHTML="Entrar &#x2192;";
    const msgs={"auth/invalid-credential":"Usuário ou senha incorretos.","auth/user-not-found":"Usuario nao encontrado.","auth/wrong-password":"Senha incorreta.","auth/invalid-email":"Usuário invalido.","auth/too-many-requests":"Muitas tentativas. Aguarde."};
    console.error("Login error:",err.code,err.message);
    errEl.textContent=msgs[err.code]||`Erro: ${err.message}`;errEl.classList.add("show");
  }
});
document.getElementById("lin-senha").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("btn-login").click()});
document.getElementById("btn-logout").addEventListener("click",async()=>await window.__FB.signOut());

/* REGISTER MODAL */
function openRegister(){
  document.getElementById("reg-email").value="";
  document.getElementById("reg-senha").value="";
  document.getElementById("reg-senha2").value="";
  document.getElementById("reg-err").classList.remove("show");
  document.getElementById("btn-register").disabled=false;
  document.getElementById("register-modal").classList.add("show");
}
function closeRegister(){
  document.getElementById("register-modal").classList.remove("show");
}

// --- ADMINS MODAL ---
let _adminsList = [];
async function loadAdmins() {
  const el = document.getElementById("adm-list");
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:10px">Carregando...</div>';
  try {
    const snap = await window.__FB.getDocs(window.__FB.collection(window.__FB.db, "admins"));
    _adminsList = snap.docs.map(d => d.id);
    renderAdmins();
  } catch(e) { console.error(e); el.innerHTML = '<div style="color:var(--red);font-size:12px;padding:8px">Erro ao carregar admins.</div>'; }
}
function renderAdmins() {
  const el = document.getElementById("adm-list");
  if(!_adminsList.length) { el.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:10px">Nenhum admin adiconal cadastrado.</div>'; return; }
  el.innerHTML = _adminsList.map(em => `
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);padding:8px 12px;border-radius:4px;border:1px solid var(--border2)">
      <span style="font-size:13px;font-family:var(--mono)">${em}</span>
      <button class="btn-sec" onclick="removeAdmin('${em}')" style="padding:4px 8px;font-size:11px;color:var(--red);border-color:transparent">Remover</button>
    </div>
  `).join("");
}
async function removeAdmin(em) {
  if(!confirm(`Remover permissoes de admin de ${em}?`)) return;
  try {
    showL("Removendo admin...");
    // Apenas apaga o documento
    await window.__FB.writeBatch(window.__FB.db).delete(window.__FB.doc(window.__FB.db, "admins", em)).commit();
    _adminsList = _adminsList.filter(a => a !== em);
    renderAdmins();
    toast(`Admin ${em} removido.`, "success");
  } catch(e) { console.error(e); toast("Erro ao remover.", "error"); }
  finally { hideL(); }
}
document.addEventListener("click", e => {
  const btn = e.target.closest("#btn-manage-admins");
  if(btn) {
    document.getElementById("admins-modal").classList.add("show");
    document.getElementById("adm-err").classList.remove("show");
    document.getElementById("adm-input").value = "";
    loadAdmins();
  }
});
document.getElementById("btn-close-admins")?.addEventListener("click", () => {
  document.getElementById("admins-modal").classList.remove("show");
});
document.getElementById("btn-adm-add")?.addEventListener("click", async () => {
  const val = document.getElementById("adm-input").value.trim().toLowerCase();
  const err = document.getElementById("adm-err");
  err.classList.remove("show");
  if(!val) { err.textContent = "Digite o usuario."; err.classList.add("show"); return; }
  if(val === "admin") { err.textContent = "Este usuario ja é o Admin mestre."; err.classList.add("show"); return; }
  try {
    document.getElementById("btn-adm-add").disabled = true;
    await window.__FB.setDoc(window.__FB.doc(window.__FB.db, "admins", val), { active: true, grantedAt: new Date().toISOString() });
    document.getElementById("adm-input").value = "";
    toast(`Usuario ${val} promovido a Admin!`, "success");
    await loadAdmins();
  } catch(e) { console.error(e); err.textContent = "Erro ao adicionar."; err.classList.add("show"); }
  finally { document.getElementById("btn-adm-add").disabled = false; }
});


document.getElementById("go-register").addEventListener("click",e=>{e.preventDefault();openRegister()});
document.getElementById("btn-cancel-reg").addEventListener("click",closeRegister);
document.getElementById("register-modal").addEventListener("click",e=>{
  if(e.target.id==="register-modal")closeRegister();
});

document.getElementById("btn-register").addEventListener("click",async()=>{
  const val  = document.getElementById("reg-email").value.trim();
  const senha  = document.getElementById("reg-senha").value;
  const senha2 = document.getElementById("reg-senha2").value;
  const errEl  = document.getElementById("reg-err");
  errEl.classList.remove("show");

  if(!val){errEl.textContent="Informe um usuário.";errEl.classList.add("show");return}
  if(senha.length<6){errEl.textContent="Senha deve ter ao menos 6 caracteres.";errEl.classList.add("show");return}
  if(senha!==senha2){errEl.textContent="As senhas nao coincidem.";errEl.classList.add("show");return}

  const email = val.includes("@") ? val : val + "@dash.local";

  const btn=document.getElementById("btn-register");
  btn.disabled=true;btn.textContent="Criando...";
  showL("Criando conta...");
  try{
    await window.__FB.createUser(email,senha);
    hideL();
    closeRegister();
    toast("Conta criada! Voce ja esta logado.","success");
  }catch(err){
    hideL();btn.disabled=false;btn.innerHTML="Criar conta &#x2192;";
    const msgs={
      "auth/email-already-in-use":"Este usuário ja esta cadastrado.",
      "auth/invalid-email":"Usuário invalido.",
      "auth/weak-password":"Senha muito fraca. Use ao menos 6 caracteres.",
      "auth/network-request-failed":"Erro de conexao. Verifique a internet.",
    };
    console.error("Register error:",err.code,err.message);
    errEl.textContent=msgs[err.code]||`Erro (${err.code}): ${err.message}`;
    errEl.classList.add("show");
  }
});

/* FIRESTORE */
const readFile=file=>new Promise((res,rej)=>{
  const r=new FileReader();
  r.onload=e=>{try{const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});res(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""}))}catch(err){rej(err)}};
  r.onerror=()=>rej(new Error("Falha ao ler arquivo"));r.readAsArrayBuffer(file)
});

async function clearColl(name){
  const snap=await window.__FB.getDocs(window.__FB.collection(window.__FB.db,name));
  for(let i=0;i<snap.docs.length;i+=400){const b=window.__FB.writeBatch(window.__FB.db);snap.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit()}
}

async function saveFB(name,data){
  await clearColl(name);
  for(let i=0;i<data.length;i+=400){
    const b=window.__FB.writeBatch(window.__FB.db);
    data.slice(i,i+400).forEach(row=>{
      const c={};Object.keys(row).forEach(k=>{const v=row[k];c[k]=(v===null||v===undefined||v!==v)?"":String(v)});c._at=new Date().toISOString();
      b.set(window.__FB.doc(window.__FB.collection(window.__FB.db,name)),c);
    });await b.commit();
  }
}

async function loadFBColl(name){
  const snap=await window.__FB.getDocs(window.__FB.collection(window.__FB.db,name));
  return snap.docs.map(d=>{const x=d.data();delete x._at;return x});
}

async function loadFromFB(){
  toast("Sincronizando banco de dados...", "info");
  
  try{
    const[rch,rcs]=await Promise.all([loadFBColl("chamados"),loadFBColl("satisfacao")]);
    if(rch.length||rcs.length){S.chamados=processRel(rch);S.satisfacao=rcs;popFilters();renderAll();toast(`${rch.length.toLocaleString("pt-BR")} chamados carregados`,"success")}
  }catch(err){toast(`Erro Firebase: ${err.message}`,"error")}
  finally{document.getElementById("btn-import").disabled=!(S.fileRel||S.fileCsat)}
}

/* PROCESSING */
function processRel(raw){
  return raw.filter(r=>r["Atendente"]&&r["Atendente"]!=="Sistema").map(r=>({...r,_tm:timeToMin(r["Tempo"]),_fm:timeToMin(r["Tempo na Fila"]),_st:cleanSt(r["Setor"]),_dt:parseDate(r["Abertura"]),_ms:parseMes(r["Abertura"]),
    "Empresa": r["Empresa"] ? r["Empresa"].trim() : "Usuário sem empresa cadastrada",
    "Contato": r["Contato"] ? r["Contato"].trim() : "Usuário não identificado"
  }));
}

/* FILTERS */
function getF(){
  const at=document.getElementById("fat").value,st=document.getElementById("fst").value,di=document.getElementById("fdi").value,df=document.getElementById("fdf").value;
  let ch=[...S.chamados],cs=[...S.satisfacao];
  if(at){ch=ch.filter(r=>r["Atendente"]===at);cs=cs.filter(r=>r["Atendente"]===at)}
  if(st)ch=ch.filter(r=>r._st===st);
  if(di)ch=ch.filter(r=>r._dt&&r._dt>=new Date(di));
  if(df)ch=ch.filter(r=>r._dt&&r._dt<=new Date(df));
  return{ch,cs};
}

function popFilters(){
  const at=[...new Set(S.chamados.map(r=>r["Atendente"]).filter(Boolean))].sort();
  const st=[...new Set(S.chamados.map(r=>r._st).filter(Boolean))].sort();
  document.getElementById("fat").innerHTML='<option value="">Todos</option>'+at.map(a=>`<option value="${a}">${a}</option>`).join("");
  document.getElementById("fst").innerHTML='<option value="">Todos</option>'+st.map(s=>`<option value="${s}">${s}</option>`).join("");
}

/* CHART BASE */
const GC="#2a1e18",TC="#8a776a",FM="'IBM Plex Mono',monospace";
const bOpts=(ex={})=>({responsive:true,maintainAspectRatio:false,
  plugins:{legend:{labels:{color:TC,font:{family:FM,size:11}}},tooltip:{backgroundColor:"#1a1210",borderColor:"#3d2a20",borderWidth:1,titleColor:"#E8E1D0",bodyColor:"#8a776a",titleFont:{family:FM}}},
  scales:{x:{ticks:{color:TC,font:{size:11}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:11}},grid:{color:GC}}},...ex});
const BC=["#DA0D17","#DA5513","#4F7043","#265D7C","#56331B","#F29C94","#c20b13","#b8450f","#3d5834","#1e4a61","#8B4513"];

/* KPIS */
function renderKPIs(ch,cs){
  document.getElementById("k-total").textContent=ch.length.toLocaleString("pt-BR");
  const tm=avg(ch.map(r=>r._tm).filter(v=>v!=null));
  const se=document.getElementById("k-sla");se.innerHTML=ch.length?fmtMin(tm):"&#x2014;";se.style.color=tm<60?"#00e676":tm<120?"#ffc400":"#ff5252";
  const fm=avg(ch.map(r=>r._fm).filter(v=>v!=null));
  const fe=document.getElementById("k-fila");fe.innerHTML=ch.length?fmtMin(fm):"&#x2014;";fe.style.color=fm<10?"#00e676":fm<30?"#ffc400":"#ff5252";
  const sc=calcCsat(cs);
  const ce=document.getElementById("k-csat");ce.textContent=cs.length?`${sc}%`:"&#x2014;";ce.style.color=cs.length?csatClr(sc):"var(--muted)";
  document.getElementById("k-csat-sub").textContent=`${cs.length.toLocaleString("pt-BR")} avaliacoes`;
  const bu=groupBy(ch,"Contato"),ue=Object.entries(bu).filter(([k])=>k&&k!=="Usuário não identificado").sort((a,b)=>b[1].length-a[1].length);
  const be=groupBy(ch,"Empresa"),ee=Object.entries(be).filter(([k])=>k&&k!=="Usuário sem empresa cadastrada").sort((a,b)=>b[1].length-a[1].length);
  const totalUsers=Object.keys(bu).filter(k=>k&&k!=="Usuário não identificado").length;
  document.getElementById("k-users").textContent=totalUsers.toLocaleString("pt-BR");
  if(ue.length){document.getElementById("k-topuser").textContent=ue[0][0];document.getElementById("k-topuser-sub").textContent=`${ue[0][1].length.toLocaleString("pt-BR")} chamados`}
  document.getElementById("k-avguser").textContent=totalUsers?Math.round(ch.length/totalUsers).toLocaleString("pt-BR"):"&#x2014;";
  if(ee.length){document.getElementById("k-topemp").textContent=ee[0][0];document.getElementById("k-topemp-sub").textContent=`${ee[0][1].length.toLocaleString("pt-BR")} chamados`}
}

/* USUARIOS SECTION */
function renderUsers(ch){
  const by=groupBy(ch,"Contato"),sorted=Object.entries(by).sort((a,b)=>b[1].length-a[1].length),top20=sorted.slice(0,20),mx=top20[0]?.[1].length||1;
  document.getElementById("ulabel").textContent=`— ${sorted.length.toLocaleString("pt-BR")} usuarios`;
  document.getElementById("rlist").innerHTML=top20.map(([n,a],i)=>{
    const emp=a[0]?.["Empresa"]||"",pct=(a.length/mx*100).toFixed(1),pc=i===0?"t1":i===1?"t2":i===2?"t3":"";
    return`<div class="ritem"><span class="rpos ${pc}">${i+1}</span><div style="flex:1;min-width:0"><p class="rname" title="${n}">${n}</p><p class="remp">${emp}</p></div><div class="rbw"><div class="rbb"><div class="rbf" style="width:${pct}%"></div></div></div><span class="rcnt">${a.length}</span></div>`;
  }).join("");
  killC("users");
  const top10=sorted.slice(0,10);
  S.charts.users=new Chart(document.getElementById("ch-users").getContext("2d"),{type:"bar",data:{labels:top10.map(([n])=>n),datasets:[{data:top10.map(([,a])=>a.length),backgroundColor:top10.map((_,i)=>BC[i%BC.length]+"cc"),borderWidth:0,borderRadius:4}]},options:{...bOpts(),indexAxis:"y",plugins:{...bOpts().plugins,legend:{display:false}}}});
  killC("emp");
  const byE=groupBy(ch,"Empresa"),t15=Object.entries(byE).sort((a,b)=>b[1].length-a[1].length).slice(0,15);
  S.charts.emp=new Chart(document.getElementById("ch-emp").getContext("2d"),{type:"bar",data:{labels:t15.map(([n])=>n),datasets:[{data:t15.map(([,a])=>a.length),backgroundColor:"#7c4dffcc",borderWidth:0,borderRadius:4}]},options:{...bOpts(),indexAxis:"y",plugins:{...bOpts().plugins,legend:{display:false}}}});
}

/* CHARTS */
function renderCharts(ch,cs){
  killC("atend");
  const ba=groupBy(ch,"Atendente"),as=Object.entries(ba).sort((a,b)=>b[1].length-a[1].length);
  S.charts.atend=new Chart(document.getElementById("ch-atend").getContext("2d"),{type:"bar",data:{labels:as.map(([k])=>k),datasets:[{data:as.map(([,v])=>v.length),backgroundColor:as.map((_,i)=>BC[i%BC.length]+"cc"),borderWidth:0,borderRadius:4}]},options:{...bOpts(),indexAxis:"y",plugins:{...bOpts().plugins,legend:{display:false}}}});
  killC("setor");
  const bs=groupBy(ch,"_st"),ss=Object.entries(bs).sort((a,b)=>b[1].length-a[1].length).slice(0,10);
  S.charts.setor=new Chart(document.getElementById("ch-setor").getContext("2d"),{type:"bar",data:{labels:ss.map(([k])=>k),datasets:[{data:ss.map(([,v])=>v.length),backgroundColor:ss.map((_,i)=>`hsl(${200+i*12},75%,55%)cc`),borderWidth:0,borderRadius:4}]},options:{...bOpts(),indexAxis:"y",plugins:{...bOpts().plugins,legend:{display:false}}}});
  killC("csat");
  if(cs.length){
    const ord=["Muito Satisfeito","Satisfeito","Indiferente","Insatisfeito"],cores={"Muito Satisfeito":"#00e676","Satisfeito":"#00e5ff","Indiferente":"#ffc400","Insatisfeito":"#ff5252"},bav=groupBy(cs,"Avaliação"),sc=calcCsat(cs);
    document.getElementById("csatlabel").textContent=`&#x2014; CSAT ${sc}%`;
    const lb=ord.filter(o=>bav[o]);
    S.charts.csat=new Chart(document.getElementById("ch-csat").getContext("2d"),{type:"doughnut",data:{labels:lb,datasets:[{data:lb.map(l=>bav[l].length),backgroundColor:lb.map(l=>cores[l]+"cc"),borderColor:"#07090f",borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,cutout:"56%",plugins:{legend:{position:"bottom",labels:{color:TC,font:{family:FM,size:11},padding:14}},tooltip:{backgroundColor:"#131720",borderColor:"#2a3148",borderWidth:1,titleColor:"#dde3f0",bodyColor:"#9ca3b8"}}}});
  }
  killC("sla");
  const ta=Object.entries(groupBy(ch,"Atendente")).map(([k,v])=>({n:k,m:avg(v.map(r=>r._tm).filter(x=>x!=null))})).sort((a,b)=>a.m-b.m);
  S.charts.sla=new Chart(document.getElementById("ch-sla").getContext("2d"),{type:"bar",data:{labels:ta.map(e=>e.n),datasets:[{data:ta.map(e=>+e.m.toFixed(1)),backgroundColor:ta.map(e=>e.m<60?"#00e67688":e.m<120?"#ffc40088":"#ff525288"),borderWidth:0,borderRadius:4}]},options:{...bOpts(),indexAxis:"y",plugins:{...bOpts().plugins,legend:{display:false}}}});
  killC("vmes");killC("smes");
  const bm=groupBy(ch,"_ms"),ms=Object.keys(bm).filter(m=>m!=="&#x2014;").sort();
  const lo=()=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#131720",borderColor:"#2a3148",borderWidth:1,titleColor:"#dde3f0",bodyColor:"#9ca3b8"}},scales:{x:{ticks:{color:TC,font:{size:10}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:10}},grid:{color:GC}}}});
  S.charts.vmes=new Chart(document.getElementById("ch-vmes").getContext("2d"),{type:"line",data:{labels:ms,datasets:[{data:ms.map(m=>bm[m].length),borderColor:"#00e5ff",backgroundColor:"rgba(0,229,255,.06)",fill:true,tension:.3,pointBackgroundColor:"#00e5ff",pointRadius:4}]},options:lo()});
  S.charts.smes=new Chart(document.getElementById("ch-smes").getContext("2d"),{type:"line",data:{labels:ms,datasets:[{data:ms.map(m=>+avg(bm[m].map(r=>r._tm).filter(x=>x!=null)).toFixed(1)),borderColor:"#448aff",backgroundColor:"rgba(68,138,255,.06)",fill:true,tension:.3,pointBackgroundColor:"#448aff",pointRadius:4}]},options:lo()});
  renderUsers(ch);
}

/* TABLE */
function renderTable(q=""){
  const{ch,cs}=getF(),qq=q.toLowerCase().trim();
  if(S.tab==="usuarios"){
    const by=groupBy(ch,"Contato");
    let rows=Object.entries(by).map(([n,a])=>({
      "Usuario":n,"Empresa":a[0]?.["Empresa"]||"&#x2014;","Chamados":a.length,
      "Atendente Freq.":Object.entries(groupBy(a,"Atendente")).sort((x,y)=>y[1].length-x[1].length)[0]?.[0]||"&#x2014;",
      "Ultima Abertura":a.map(r=>r["Abertura"]).filter(Boolean).sort().reverse()[0]||"&#x2014;"
    })).sort((a,b)=>b["Chamados"]-a["Chamados"]);
    if(qq)rows=rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(qq)));
    const cols=["Usuario","Empresa","Chamados","Atendente Freq.","Ultima Abertura"];
    document.getElementById("tblhead").innerHTML=`<tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr>`;
    document.getElementById("tblbody").innerHTML=rows.slice(0,500).map(r=>`<tr>${cols.map(c=>`<td title="${r[c]}">${r[c]}</td>`).join("")}</tr>`).join("");
    document.getElementById("tblfooter").textContent=`${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} usuarios`;return;
  }
  if(S.tab==="satisfacao"){
    const cols=["#","Data Hora","Atendente","Empresa","Contato","Avaliação","Comentário"];
    let rows=cs;if(qq)rows=rows.filter(r=>cols.some(c=>String(r[c]||"").toLowerCase().includes(qq)));
    document.getElementById("tblhead").innerHTML=`<tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr>`;
    document.getElementById("tblbody").innerHTML=rows.slice(0,500).map(r=>`<tr>${cols.map(c=>{const v=r[c]||"";if(c==="Avaliação"){const cl=v.toLowerCase().replace(/\s+/g,"-");return`<td><span class="badge ${cl}">${v}</span></td>`}return`<td title="${v}">${v}</td>`}).join("")}</tr>`).join("");
    document.getElementById("tblfooter").textContent=`${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} avaliacoes`;return;
  }
  const cols=["id","Atendente","Contato","Empresa","Setor","Abertura","Tempo","Tempo na Fila"];
  let rows=ch;if(qq)rows=rows.filter(r=>cols.some(c=>String(r[c]||"").toLowerCase().includes(qq)));
  document.getElementById("tblhead").innerHTML=`<tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr>`;
  document.getElementById("tblbody").innerHTML=rows.slice(0,500).map(r=>`<tr>${cols.map(c=>`<td title="${r[c]||""}">${r[c]||""}</td>`).join("")}</tr>`).join("");
  document.getElementById("tblfooter").textContent=`${Math.min(rows.length,500).toLocaleString("pt-BR")} de ${rows.length.toLocaleString("pt-BR")} chamados`;
}

/* RENDER ALL */
function renderAll(){
  const{ch,cs}=getF();
  renderKPIs(ch,cs);renderCharts(ch,cs);renderTable();
  document.getElementById("lupdate").textContent=`Atualizado: ${new Date().toLocaleString("pt-BR")}`;
  document.getElementById("estate").style.display="none";
  document.getElementById("dash").style.display="flex";
}

/* EVENTS */
document.getElementById("file-rel").addEventListener("change",e=>{
  S.fileRel=e.target.files[0]||null;
  if(S.fileRel){document.getElementById("zone-rel").classList.add("hasfile");document.getElementById("zone-rel").querySelector(".uztitle").textContent=S.fileRel.name}
  document.getElementById("btn-import").disabled=!(S.fileRel||S.fileCsat);
});
document.getElementById("file-csat").addEventListener("change",e=>{
  S.fileCsat=e.target.files[0]||null;
  if(S.fileCsat){document.getElementById("zone-csat").classList.add("hasfile");document.getElementById("zone-csat").querySelector(".uztitle").textContent=S.fileCsat.name}
  document.getElementById("btn-import").disabled=!(S.fileRel||S.fileCsat);
});
document.getElementById("btn-import").addEventListener("click",async()=>{
  showL("Lendo arquivos...");
  try{
    if(S.fileRel){const r=await readFile(S.fileRel);S.chamados=processRel(r);showL(`Salvando ${r.length.toLocaleString()} chamados...`);await saveFB("chamados",r);toast(`${r.length.toLocaleString("pt-BR")} chamados salvos!`,"success")}
    if(S.fileCsat){const r=await readFile(S.fileCsat);S.satisfacao=r;showL(`Salvando ${r.length.toLocaleString()} avaliacoes...`);await saveFB("satisfacao",r);toast(`${r.length.toLocaleString("pt-BR")} avaliacoes salvas!`,"success")}
    popFilters();renderAll();
  }catch(err){toast(`Erro: ${err.message}`,"error")}
  finally{hideL()}
});
["fat","fst","fdi","fdf"].forEach(id=>document.getElementById(id).addEventListener("change",renderAll));
document.getElementById("btn-reset").addEventListener("click",()=>{["fat","fst","fdi","fdf"].forEach(id=>document.getElementById(id).value="");renderAll()});
document.querySelectorAll(".tabbtn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tabbtn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");S.tab=btn.dataset.tab;document.getElementById("tsearch").value="";renderTable()}));
document.getElementById("tsearch").addEventListener("input",e=>renderTable(e.target.value));

/* INIT — usa polling para evitar race condition com firebase.js */
const _initPoll = setInterval(()=>{
  if(!window.__FB) return;
  clearInterval(_initPoll);
  const b=document.getElementById("fbbadge");
  b.className="fbbadge connected";
  b.querySelector(".fbdot").classList.remove("pulse");
  document.getElementById("fbstatus").textContent="Firebase Conectado";
  S.firebaseOk=true;
  setupAuth();
}, 50);
setTimeout(()=>{
  if(!S.firebaseOk){
    clearInterval(_initPoll);
    document.getElementById("fbbadge").className="fbbadge disconnected";
    document.getElementById("fbstatus").textContent="Desconectado";
    hideL();
  }
}, 10000);