// React, useState, useMemo, useRef, useEffect, useCallback — globals from CDN

// 
// USERS — all roles see same Admin view (Req 16, 17, 18)
// 
const USERS = [
  { id:"korakoj.s",     email:"korakoj.s@wavebcg.com",      name:"Korakoj Sanguanpiyapan",     role:"sales",     password:"Krj@Wave26!" },
  { id:"chawapol.ta",   email:"chawapol.ta@wavebcg.com",    name:"Chawapol Tangsirichoochuay", role:"admin",     password:"Cwp@Wave26!" },
  { id:"songyot.kr",    email:"songyot.kr@wavebcg.com",     name:"Songyot Kraprom",            role:"sales",     password:"Sgt@Wave26!" },
  { id:"theerayut.c",   email:"theerayut.c@wavebcg.com",    name:"Theerayut Chimpitak",        role:"sales",     password:"Trt@Wave26!" },
  { id:"nattapon.yi",   email:"nattapon.yi@wavebcg.com",    name:"Nattapon Yingsakda",         role:"operation", password:"Ntp@Wave26!" },
  { id:"panita.s",      email:"panita.s@wavebcg.com",       name:"Panita Sutaket",             role:"operation", password:"Pnt@Wave26!" },
  { id:"waruntara.t",   email:"waruntara.t@wavebcg.com",    name:"Waruntara Tankam",           role:"operation", password:"Wrt@Wave26!" },
  { id:"nattaya.s",     email:"nattaya.s@wavebcg.com",      name:"Nattaya Sonsiri",            role:"operation", password:"Nty@Wave26!" },
  { id:"ausanee.s",     email:"ausanee.s@wavebcg.com",      name:"Ausanee Suttiwong",          role:"operation", password:"Asn@Wave26!" },
  { id:"nattharika.p",  email:"nattharika.p@wavebcg.com",   name:"Nattharika Phongmanee",      role:"operation", password:"Ntk@Wave26!" },
  { id:"krispira.ru",   email:"krispira.ru@wavebcg.com",    name:"Krispira Rutanatumsri",      role:"sales",     password:"Ksp@Wave26!" },
  { id:"piyabut.ma",   email:"piyabut.ma@wavebcg.com",     name:"Piyabut Mahasabsombut",       role:"operation", password:"Pbt@Wave26!" },
  { id:"taraphong.sr", email:"taraphong.sr@wavebcg.com",   name:"Taraphong Sriaram",            role:"operation", password:"Trp@Wave26!" },
];
const SALES_USERS = USERS.filter(u => u.role === "sales");
const OP_USERS    = USERS.filter(u => u.role === "operation");

// 
// CONSTANTS
// 
const CRM_STATUSES = ["Lead","Qualified","Email Profile","Meeting","Proposal","Negotiation","Won","Lost"];
const OPP_STATUSES = ["Proposal","Negotiation","Won","Lost"];
const DLV_STATUSES = ["In Progress","Pending Client","Under Review","Delivered","Completed","On Hold"];
// Req 8: Add "Verification" before "Final Delivery"
const DLV_STEPS = ["Contract Signed","Kick-off Meeting","Data Collection","Analysis","Report Draft",
                   "Client Review","Revision","Verification","Final Delivery","Invoice Sent","Completed"];
const INS_STATUSES = ["Pending","Invoiced","Received","Overdue"];
const LOST_REASONS = ["Price Too High","Budget Frozen","Selected Competitor","Scope Mismatch",
                      "Project Postponed","No Response","Internal Policy","Other"];
// In-House levels with standard day rates (THB/day)
const IH_LEVELS = {Manager:1440, Senior:950, Junior:600};
const IH_LEVEL_NAMES = Object.keys(IH_LEVELS);
// Sales agent mobile numbers
const SALES_MOBILE = {"songyot.kr":"062-197-4449","theerayut.c":"080-441-2295"};

const STATUS_CLR = {
  Lead:"#94a3b8",Qualified:"#60a5fa","Email Profile":"#818cf8",Meeting:"#f472b6",
  Proposal:"#a78bfa",Negotiation:"#f59e0b",Won:"#22c55e",Lost:"#ef4444",
  "In Progress":"#3b82f6","Pending Client":"#f59e0b","Under Review":"#8b5cf6",
  Delivered:"#06b6d4",Completed:"#16a34a","On Hold":"#ef4444",
};
const RANK_CLR = { High:{c:"#16a34a",bg:"#dcfce7"}, Medium:{c:"#d97706",bg:"#fef3c7"}, Low:{c:"#dc2626",bg:"#fee2e2"} };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STAGE_COLORS = ["#818cf8","#f59e0b","#22c55e","#ef4444"];
const SVC_PALETTE = ["#3b82f6","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#f472b6","#84cc16",
                     "#a78bfa","#fb923c","#14b8a6","#e879f9","#fbbf24","#34d399","#60a5fa","#f87171","#c084fc","#4ade80"];

// stdCost = OPEX (man-days × rate/day) + COGS (external/materials)
// stdPrice: margin = (price-cost)/price > 30%  →  price > cost/0.70
// Man-day rates: Manager=1,440  Senior=950  Junior=600 THB/day
const SERVICES = [
  // CFO: 6M+14S+14J days + COGS
  {code:"CFO",    name:"Carbon Footprint for Organization",  stdCost:0,  stdPrice:0},
  // CFP: 5M+12S+10J + COGS
  {code:"CFP",    name:"Carbon Footprint of Product",       stdCost:0,  stdPrice:0},
  // ISO14064: 7M+16S+16J + COGS
  {code:"ISO14064",name:"ISO 14064-1 Verification",          stdCost:0,  stdPrice:0},
  // ISO14067: 6M+14S+14J + COGS
  {code:"ISO14067",name:"ISO 14067 Verification",            stdCost:0,  stdPrice:0},
  // CFO&ISO bundle: CFO+ISO14064 bundled,
  {code:"CFO&ISO", name:"CFO + ISO 14064-1 Bundle",           stdCost:0,  stdPrice:0},
  // CNE: 3M+8S+6J + COGS
  {code:"CNE",    name:"Carbon Neutral Event",               stdCost:0,  stdPrice:0},
  // DR: 8M+18S+12J + COGS
  {code:"DR",     name:"Decarbonization Roadmap",            stdCost:0,  stdPrice:0},
  // TRN: 2M+5S+4J + COGS
  {code:"TRN",    name:"Training / Workshop",                stdCost:0,  stdPrice:0},
  // GSTC: 10M+22S+20J + COGS
  {code:"GSTC",   name:"Global Sustainable Tourism Council",         stdCost:0,  stdPrice:0},
  // GH: 6M+14S+12J + COGS
  {code:"GH", name:"Green Hotel",                        stdCost:0,  stdPrice:0},
  // GHP: 8M+18S+16J + COGS
  {code:"GHP",name:"Green Hotel Plus",                   stdCost:0,  stdPrice:0},
  // GC: 7M+16S+14J + COGS
  {code:"GC", name:"Green Certificate",                            stdCost:0,  stdPrice:0},
  // CSRDIW: 7M+16S+14J + COGS
  {code:"CSRDIW", name:"CSR-DIW",                            stdCost:0,  stdPrice:0},
  // CCAWD: 8M+20S+20J + COGS
  {code:"CCAWD",    name:"Alternate Wetting & Drying",         stdCost:0,  stdPrice:0},
  // REF: 10M+24S+20J + COGS
  {code:"CCREF",    name:"Reforestation",              stdCost:0,  stdPrice:0},
  // CSRAWD: 7M+16S+14J + COGS
  {code:"CSRAWD", name:"CSR-AWD",                            stdCost:0,  stdPrice:0},
  // LCR: 6M+14S+12J + COGS
  {code:"LCR",    name:"Low-Carbon Rice",                    stdCost:0,  stdPrice:0},
  // FS: 5M+12S+8J + COGS
  {code:"FS",     name:"Feasibility Study",                  stdCost:0,  stdPrice:0},
  // CC: 10M+24S+20J + COGS
  {code:"CC",     name:"Carbon Credit",          stdCost:0,  stdPrice:0},
  // REC: 3M+6S+5J + COGS
  {code:"REC",    name:"Renewable Energy Certificate",       stdCost:0,  stdPrice:0},
  // OTH: 3M+6S+5J + COGS
  {code:"OTH",    name:"Other Service",                      stdCost:0,  stdPrice:0},
  
];

const ANNUAL_KPI    = 38000000;
const DEFAULT_SPLIT = [0,0,0,0,0,0,0,0,0,0,0,0]; // Adjust & Save in Dashboard KPI tab

// 
// UTILS
// 
const fmt   = n => new Intl.NumberFormat("en-US").format(Math.round(n||0));
const fmtM  = n => `${((n||0)/1e6).toFixed(2)}M`;
const fmtK  = n => (n||0)>=1e6?`฿${((n||0)/1e6).toFixed(1)}M`:(n||0)>=1000?`฿${Math.round((n||0)/1000)}K`:`฿${fmt(n)}`;
const fmtDate = d => { if(!d) return "—"; const [y,m,day]=String(d).split("-"); if(!y||!m||!day) return d; return `${day}-${MONTHS[+m-1]||m}-${y}`; };
const uid   = () => `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
const today = () => new Date().toISOString().slice(0,10);
const nowTS = () => { const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const pad2  = n => String(n).padStart(2,"0");

const calcIC   = rows => (rows||[]).reduce((s,r)=>s+(r.qty||0)*(r.rate||0),0);
const calcEC   = (rows,coOnly) => (rows||[]).filter(r=>coOnly?!r.clientBorne:true).reduce((s,r)=>s+(r.qty||0)*(r.rate||0),0);
const calcTask = tasks => (tasks||[]).reduce((s,t)=>s+(t.manager||0)*IH_LEVELS.Manager+(t.senior||0)*IH_LEVELS.Senior+(t.junior||0)*IH_LEVELS.Junior,0);
const calcTotalCS = cs => calcIC(cs.internalCosts||[]) + calcEC(cs.externalCosts||[],true) + calcTask(cs.tasks||[]);
// Legacy helpers kept for per-quotation overrides
const calcIH  = rows => (rows||[]).reduce((s,r)=>s+(r.days||0)*(r.rate||IH_LEVELS[r.level]||0),0);
const calcOS  = rows => (rows||[]).reduce((s,r)=>s+(r.amount||0),0);
const calcTrv = (rows,co) => (rows||[]).filter(r=>co?!r.clientBorne:r.clientBorne).reduce((s,r)=>s+(r.amount||0),0);
const calcQCost = q => {
  const ic=calcIC(q.internalCosts||[]),ec=calcEC(q.externalCosts||[],true),opex=calcTask(q.tasks||[]);
  return ic+ec+opex;
};
const margin     = (p,c) => p>0?((p-c)/p*100).toFixed(1):"0.0";
const marginAmt  = (p,c) => Math.round((p||0)-(c||0));

const YEAR   = new Date().getFullYear();
const padNum = n => String(n).padStart(3,"0");
const nextNum = (items,field) => { const ns=items.map(x=>{const m=String(x[field]||"").match(/-(\d{3,})$/);return m?parseInt(m[1]):0;}); return Math.max(0,...ns)+1; };
const genOppCode = opps => `OPP-${YEAR}-${padNum(nextNum(opps,"oppCode"))}`;
const genQuoteNo = opps => `QT-${YEAR}-${padNum(nextNum(opps,"quoteNo"))}`;
const genJobCode = opp  => (opp||"").replace(/^OPP-/,"JOB-");
const genCSCode  = qtNo => (qtNo||"").replace(/^QT-/,"CS-");

const toCSV = (h,rows) => { const e=v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`;return[h.map(e).join(","),...rows.map(r=>r.map(e).join(","))].join("\n"); };
const dlCSV = (fn,h,rows) => { const b=new Blob([toCSV(h,rows)],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fn;a.click(); };

const addDays = (dateStr, days) => {
  const d = new Date(dateStr); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10);
};

// COGS = Internal + External costs
// OPEX = Man-day based labor by task
const buildDefaultCS = s => ({
  serviceCode: s.code, serviceType: s.name,
  stdCost: s.stdCost, stdPrice: s.stdPrice,
  minPrice: Math.round(s.stdPrice*.85), maxPrice: Math.round(s.stdPrice*1.3),
  internalCosts: [],  // add via + Internal
  externalCosts: [],  // add via + External
  tasks: [],          // add via + Task
  projectMonths: 3,
  quoteOverrides: [],
  saveLog: [],        // [{ts, author, note}] — recorded on Save
});

//  Seed data — empty by default, add via UI 
const SEED_CUSTOMERS  = [];
const SEED_OPPS       = [];
const SEED_DELIVERIES = [];
const SEED_COST_SHEETS = SERVICES.map(buildDefaultCS);

// 
// GOOGLE SHEETS BACKEND — Wave BCG Live Database
// 
const GS_URL = "https://script.google.com/macros/s/AKfycbywD_YAL8cVKFRxUqZjlGKlJhlI7JdmrCv9wKmNBFADKaoxl4Q9n_g9lWqYxvtEhW7_xw/exec";

// Read a full collection from Google Sheets
const gsGet = async (collection) => {
  try {
    const r = await fetch(`${GS_URL}?collection=${collection}`, {cache:"no-store",redirect:"follow"});
    const j = await r.json();
    return j.ok ? j.data : [];
  } catch(e) { return []; }
};

// Save (upsert) a single record — fire-and-forget, non-blocking
const gsSave = (collection, record, userId="", summary="") => {
  fetch(GS_URL, {
    method:"POST",
    redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"save", collection, record, userId, summary}),
  }).catch(()=>{});
};

// Save entire collection (used for costsheets which have no simple id upsert)
const gsSaveAll = (collection, records) => {
  fetch(GS_URL, {
    method:"POST",
    redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"saveAll", collection, records}),
  }).catch(()=>{});
};


// Delete a single record from Google Sheets
const gsDelete = (collection, id) => {
  fetch(GS_URL, {
    method:"POST",
    redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"delete", collection, id}),
  }).catch(()=>{});
};
// 
// UI PRIMITIVES
// 
const SI = {width:"100%",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 11px",fontSize:14,color:"#1e293b",background:"#fafafa",outline:"none",boxSizing:"border-box"};
const Inp  = ({style,...p}) => <input {...p} style={{...SI,...style}}/>;
// Numeric input that shows commas and allows empty/partial editing
const NumInp = ({value,onChange,style,...p}) => {
  const [focused,setFocused] = React.useState(false);
  const ref = React.useRef();
  const [raw,setRaw] = React.useState(value===0?"":String(value));
  React.useEffect(()=>{ if(!focused) setRaw(value===0?"":String(value)); },[value,focused]);
  const display = focused ? raw : (value===0?"":Number(value).toLocaleString("en-US"));
  return <input ref={ref} {...p} type="text" inputMode="numeric"
    value={display}
    onFocus={()=>{setFocused(true);setRaw(value===0?"":String(value));}}
    onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,"");setRaw(v);const n=parseFloat(v);if(!isNaN(n))onChange(n);else if(v===""||v===".")onChange(0);}}
    onBlur={()=>{setFocused(false);}}
    style={{...SI,...style,textAlign:"right"}}/>;
};
const Sel  = ({style,children,...p}) => <select {...p} style={{...SI,...style}}>{children}</select>;
const Txta = ({style,...p}) => <textarea {...p} style={{...SI,resize:"vertical",...style}}/>;

const BV = {
  primary:{background:"#0f172a",color:"#fff",border:"none"},
  ghost:{background:"transparent",color:"#64748b",border:"1px solid #e2e8f0"},
  danger:{background:"#fff",color:"#ef4444",border:"1px solid #fecaca"},
  success:{background:"#dcfce7",color:"#16a34a",border:"1px solid #86efac"},
  export:{background:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"},
};
const Btn = ({variant="primary",style,children,...p}) => (
  <button {...p} style={{padding:"8px 16px",borderRadius:5,fontSize:14,cursor:"pointer",fontWeight:600,...BV[variant],...style}}>{children}</button>
);

const Card  = ({children,style}) => <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,...style}}>{children}</div>;
const Span  = ({s=14,w=400,c="#374151",style,children}) => <span style={{fontSize:s,fontWeight:w,color:c,...style}}>{children}</span>;
const FRow  = ({label,children,tip}) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:5,display:"flex",gap:5,alignItems:"center"}}>
      {label}{tip&&<span title={tip} style={{cursor:"help",fontSize:10,color:"#cbd5e1"}}>ⓘ</span>}
    </div>
    {children}
  </div>
);
const Divider = () => <div style={{height:1,background:"#f1f5f9",margin:"16px 0"}}/>;
const Badge   = ({value,colorMap}) => { const cfg=colorMap[value]||{c:"#64748b"}; return <span style={{background:cfg.bg||cfg.c+"22",color:cfg.c,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{value}</span>; };
const SvcBadge = ({code}) => <span style={{background:"#f1f5f9",color:"#1e40af",fontWeight:800,fontSize:11,padding:"2px 8px",borderRadius:4,whiteSpace:"nowrap"}}>{code}</span>;
const G2 = ({children,gap=16}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>;

const TH = ({cols}) => <thead><tr style={{background:"#f8fafc"}}>{cols.map((c,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>;
const TR = ({children,onClick,hi}) => { const[h,sH]=useState(false); return <tr onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{borderBottom:"1px solid #f1f5f9",background:hi?"#fffbeb":h?"#f8fafc":"#fff",cursor:onClick?"pointer":"default"}}>{children}</tr>; };
const TD = ({children,right,w,style}) => <td style={{padding:"10px 12px",fontSize:14,color:"#374151",maxWidth:w,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:right?"right":"left",...style}}>{children}</td>;

const Modal = ({title,width=740,onClose,children}) => {
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:10,width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.22)"}}>
      <div style={{padding:"17px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:1}}>
        <Span s={17} w={800} c="#0f172a">{title}</Span>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#94a3b8",lineHeight:1}}>×</button>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>
  );
};

//  Toast (Req 15) 
const Toast = ({toasts}) => (
  <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:340}}>
    {toasts.map(t => (
      <div key={t.id} style={{background:t.type==="success"?"#16a34a":t.type==="error"?"#dc2626":"#0f172a",color:"#fff",padding:"12px 18px",borderRadius:8,fontSize:13,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.2)",display:"flex",gap:10,alignItems:"center",animation:"slideIn .25s ease"}}>
        <span style={{fontSize:16}}>{t.type==="success"?"":"ℹ"}</span>
        <div><div style={{fontWeight:700}}>{t.title}</div>{t.msg&&<div style={{fontSize:11,opacity:.85,marginTop:2}}>{t.msg}</div>}</div>
      </div>
    ))}
  </div>
);
const useToast = () => {
  const [toasts,sT] = useState([]);
  const show = useCallback((title,msg,type="success") => {
    const id = uid();
    sT(p => [...p,{id,title,msg,type}]);
    setTimeout(() => sT(p => p.filter(x=>x.id!==id)), 3000);
  },[]);
  return {toasts,show};
};

//  Multi-select (Req 11) 
const MultiSelect = ({label,options,selected,onChange,width=180}) => {
  const [open,sO] = useState(false);
  const ref = useRef();
  useEffect(() => { const h=e=>{if(ref.current&&!ref.current.contains(e.target))sO(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const toggle = v => onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]);
  const allSel = selected.length===0;
  const display = allSel?`All ${label}`:`${selected.length} selected`;
  return (
    <div ref={ref} style={{position:"relative",userSelect:"none"}}>
      <button onClick={()=>sO(!open)} style={{padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:5,background:"#fafafa",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,width,justifyContent:"space-between",color:"#1e293b"}}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,textAlign:"left"}}>{display}</span>
        <span style={{fontSize:10,color:"#94a3b8",flexShrink:0}}></span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"110%",left:0,zIndex:600,background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,boxShadow:"0 8px 32px rgba(0,0,0,.12)",minWidth:width,padding:8,maxHeight:260,overflow:"auto"}}>
          <div onClick={()=>onChange([])} style={{padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:allSel?700:400,color:allSel?"#0f172a":"#64748b",borderRadius:4,background:allSel?"#f1f5f9":"transparent",marginBottom:4}}> All {label}</div>
          {options.map(o => { const s=selected.includes(o.value); return (
            <div key={o.value} onClick={()=>toggle(o.value)} style={{padding:"6px 10px",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:8,borderRadius:4,background:s?"#eff6ff":"transparent",color:s?"#1e40af":"#374151",marginBottom:2}}>
              <div style={{width:14,height:14,border:`2px solid ${s?"#1e40af":"#cbd5e1"}`,borderRadius:3,background:s?"#1e40af":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{s&&<span style={{color:"#fff",fontSize:9,fontWeight:900,lineHeight:1}}></span>}</div>
              <span>{o.label}</span>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

//  Activity log 
const ActivityLog = ({logs,currentUser,onAdd,placeholder="Add a note…"}) => {
  const [note,sN] = useState("");
  return (
    <div>
      <div style={{maxHeight:260,overflow:"auto",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
        {(!logs||!logs.length) && <div style={{padding:20,textAlign:"center",color:"#94a3b8",fontSize:13}}>No activity logged yet.</div>}
        {[...(logs||[])].reverse().map(l => { const u=USERS.find(x=>x.id===l.author); return (
          <div key={l.id} style={{padding:"10px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,display:"flex",gap:10}}>
            <div style={{width:32,height:32,background:"#0f172a",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{(u?.name||"?")[0]}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                <Span s={12} w={700} c="#0f172a">{u?.name||l.author}</Span>
                <span style={{background:"#f1f5f9",color:"#64748b",fontSize:10,padding:"1px 6px",borderRadius:3,fontFamily:"monospace"}}>{l.ts}</span>
              </div>
              <Span s={13}>{l.note}</Span>
            </div>
          </div>
        );})}
      </div>

      <Txta value={note} onChange={e=>sN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&note.trim()){onAdd({id:uid(),ts:nowTS(),author:currentUser.id,note:note.trim()});sN("");e.preventDefault();}}} placeholder={placeholder} style={{minHeight:44,fontSize:13,marginBottom:4}}/>
    </div>
  );
};

//  Step progress 
const StepProgress = ({steps,current,onStep}) => {
  const idx = steps.indexOf(current);
  return (
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {steps.map((s,i) => { const past=i<idx,cur=i===idx; return (
          <button key={s} onClick={()=>onStep&&onStep(s)} style={{
            padding:"7px 14px",borderRadius:6,fontSize:12,cursor:onStep?"pointer":"default",
            fontWeight:cur?700:400,border:"1.5px solid",
            background:cur?"#0f172a":past?"#f0fdf4":"#f8fafc",
            color:cur?"#fff":past?"#16a34a":"#94a3b8",
            borderColor:cur?"#0f172a":past?"#86efac":"#e2e8f0",
            transition:"all .15s",
          }}>
            {past?"✓ ":cur?"▶ ":""}{s}
          </button>
        );})}
      </div>

    </div>
  );
};

const ExportBar = ({onCSV,onGS}) => <div style={{display:"flex",gap:6}}><Btn variant="export" onClick={onCSV}>↓ CSV</Btn><Btn variant="export" onClick={onGS}> GS</Btn></div>;
const GSGuideModal = ({module,headers,onClose}) => (
  <Modal title={`Google Sheets Guide — ${module}`} width={600} onClose={onClose}>
    <FRow label="Tab Name"><div style={{fontFamily:"monospace",padding:"6px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:5,fontWeight:700}}>{module}</div></FRow>
    <FRow label="Headers"><div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 10px",lineHeight:2}}>{headers.map((h,i)=><span key={i} style={{display:"inline-block",background:"#dbeafe",color:"#1e40af",margin:"2px",padding:"1px 7px",borderRadius:3,fontSize:11}}>{h}</span>)}</div></FRow>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><Btn onClick={onClose}>Close</Btn></div>
  </Modal>
);

// 
// LOGIN (Req 17, 18, 19)
// 
const LoginPage = ({onLogin}) => {
  const [email,sEmail] = useState("");
  const [pwd,sPwd]     = useState("");
  const [err,sErr]     = useState("");
  const go = () => {
    const u = USERS.find(x => x.email.toLowerCase()===email.toLowerCase().trim() && x.password===pwd);
    u ? onLogin(u) : sErr("Email or password is incorrect.");
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{width:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {/* Req 19: no version number, no year */}
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Climate Solutions</div>
          <div style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.05em",lineHeight:1}}>CRM</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginTop:6}}>Sales & Marketing System</div>
        </div>
        <Card style={{padding:28}}>
          {/* Req 17: email as username, text input not dropdown */}
          <FRow label="Email"><Inp type="email" value={email} onChange={e=>sEmail(e.target.value)} placeholder="your.email@wavebcg.com" onKeyDown={e=>e.key==="Enter"&&go()}/></FRow>
          <FRow label="Password"><Inp type="password" value={pwd} onChange={e=>sPwd(e.target.value)} placeholder="Enter your password" onKeyDown={e=>e.key==="Enter"&&go()}/></FRow>
          {err && <div style={{background:"#fee2e2",color:"#dc2626",padding:"8px 12px",borderRadius:5,fontSize:13,marginBottom:12}}>{err}</div>}
          <Btn style={{width:"100%",padding:11,fontSize:14}} onClick={go}>Sign In</Btn>
          {/* Req 18: no credential hints shown */}
        </Card>
      </div>
    </div>
  );
};

// 
// DASHBOARD (Req 12, 13, 14)
// 
const DashboardKPI = ({user,customers,opps,deliveries,kpiSplits,setKpiSplits,toast}) => {
  const [tab,sTab]   = useState("dash");
  const [year,sYear] = useState(2026);
  const [annual,sAnn] = useState(ANNUAL_KPI);
  // Req 14: multi-select dashboard filters
  const [fSt,setFSt]   = useState([]);
  const [fSvc,setFSvc] = useState([]);
  const [fAg,setFAg]   = useState([]);
  const [tt,sTT]       = useState({vis:false,x:0,y:0,data:null});
  // Req 13: pipeline sort
  const [pSort,setPSort] = useState("desc");
  const [pMonth,setPMonth] = useState("All");

  const filteredOpps = useMemo(()=>opps.filter(o=>
    (fSt.length===0||fSt.includes(o.status))&&
    (fSvc.length===0||fSvc.includes(o.serviceCode))&&
    (fAg.length===0||fAg.includes(o.assignedTo))
  ),[opps,fSt,fSvc,fAg]);

  const wonOpps     = filteredOpps.filter(o=>o.status==="Won");
  const totalWon    = wonOpps.reduce((s,o)=>s+o.salesPrice,0);
  const pipeline    = filteredOpps.filter(o=>o.status!=="Lost").reduce((s,o)=>s+o.salesPrice,0);
  const kpiPct      = Math.min((totalWon/annual)*100,100);
  const splits      = kpiSplits[year]||DEFAULT_SPLIT.slice();
  const totalSplit  = splits.reduce((s,v)=>s+v,0);

  const monthData = MONTHS.map((m,i) => {
    const ms=`${year}-${String(i+1).padStart(2,"0")}`;
    const fc=Math.round(annual*splits[i]/100);
    // Backlog = Won opps by createdDate month (auto-synced from Opportunities Won status)
    const blItems=filteredOpps.filter(o=>o.status==="Won"&&o.createdDate?.startsWith(ms)).map(o=>({company:customers.find(c=>c.id===o.custId)?.companyEN||o.custId,amount:o.salesPrice||0}));
    // Received = Delivery installments status=Received by receiptDate month (auto-synced from Delivery)
    const recItems=deliveries.flatMap(d=>(d.installments||[]).filter(ins=>ins.receiptDate?.startsWith(ms)&&ins.status==="Received").map(ins=>({company:customers.find(c=>c.id===d.custId)?.companyEN||d.custId,amount:ins.amount||0})));
    const bl=blItems.reduce((s,it)=>s+it.amount,0);
    const rec=recItems.reduce((s,it)=>s+it.amount,0);
    return{m,ms,fc,bl,rec,ach:fc>0?((bl/fc)*100).toFixed(0):"0",blItems,recItems};
  });

  const upSplit=(i,v)=>setKpiSplits(p=>({...p,[year]:splits.map((x,j)=>j===i?+v:x)}));
  const saveKpi=()=>{
    const entry={id:uid(),ts:nowTS(),author:user.id,note:`KPI saved — ${year} · Annual ฿${fmtM(annual)} · Split total ${totalSplit.toFixed(1)}%`};
    setKpiSplits(p=>({...p,[year+"_log"]:[...(p[year+"_log"]||[]),entry]}));
    toast("KPI & Forecast saved",`${year} splits saved by ${user.name}`);
  };
  const BAR_H=90;
  const maxV=Math.max(...monthData.map(d=>Math.max(d.fc,d.bl,d.rec)),1);
  const hBar=(e,data)=>sTT({vis:true,x:e.clientX,y:e.clientY,data});
  const leaveBar=()=>sTT(p=>({...p,vis:false}));
  const moveBar=e=>sTT(p=>({...p,x:e.clientX,y:e.clientY}));

  let ytdFc=0,ytdBl=0,ytdRec=0;
  const rows=monthData.map(d=>{ytdFc+=d.fc;ytdBl+=d.bl;ytdRec+=d.rec;return{...d,ytdFc,ytdBl,ytdRec,ytdRem:ytdFc-ytdBl};});

  const SC = ({label,val,sub,c="#0f172a"}) => (
    <Card style={{padding:"14px 18px"}}>
      <Span s={10} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4}}>{label}</Span>
      <div style={{fontSize:22,fontWeight:900,color:c,letterSpacing:"-0.02em",lineHeight:1.1}}>{val}</div>
      {sub&&<Span s={11} c="#94a3b8" style={{marginTop:3,display:"block"}}>{sub}</Span>}
    </Card>
  );

  // Req 13: Pipeline analysis with monthly breakdown + sort + service count
  const PipelineAnalysis = () => {
    const monthOpps = pMonth==="All"?filteredOpps:filteredOpps.filter(o=>{
      const ms=`${year}-${String(MONTHS.indexOf(pMonth)+1).padStart(2,"0")}`;
      return o.createdDate?.startsWith(ms);
    });
    const byStage = OPP_STATUSES.map(st => {
      const items=monthOpps.filter(o=>o.status===st);
      const total=items.reduce((s,o)=>s+o.salesPrice,0);
      const bySvc={};
      items.forEach(o=>{if(!bySvc[o.serviceCode])bySvc[o.serviceCode]=0;bySvc[o.serviceCode]+=o.salesPrice;});
      return{stage:st,count:items.length,total,bySvc};
    });
    const sorted=[...byStage].sort((a,b)=>pSort==="desc"?b.total-a.total:a.total-b.total);
    const maxTotal=Math.max(...sorted.map(s=>s.total),1);
    // service type count per stage
    const allSvcs=[...new Set(monthOpps.map(o=>o.serviceCode))];

    return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <Span s={13} w={700}>Pipeline by Stage</Span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Sel value={pMonth} onChange={e=>setPMonth(e.target.value)} style={{width:90,padding:"4px 6px",fontSize:12}}>
                <option>All</option>{MONTHS.map(m=><option key={m}>{m}</option>)}
              </Sel>
              <button onClick={()=>setPSort(s=>s==="desc"?"asc":"desc")} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:5,background:"#fff",cursor:"pointer",fontSize:11,color:"#64748b"}}>
                {pSort==="desc"?"↓ High→Low":"↑ Low→High"}
              </button>
            </div>
          </div>
          {sorted.map((s,i) => (
            <div key={s.stage} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:4}}>
                <Badge value={s.stage} colorMap={Object.fromEntries(OPP_STATUSES.map((x,j)=>[x,{c:STAGE_COLORS[j]}]))}/>
                <div style={{textAlign:"right"}}>
                  <Span s={13} w={700} c="#0f172a">฿{fmtM(s.total)}</Span>
                  <Span s={11} c="#94a3b8" style={{marginLeft:6}}>{s.count} deals</Span>
                </div>
              </div>
              <div style={{background:"#f1f5f9",borderRadius:4,height:10,overflow:"hidden"}}>
                <div style={{background:STAGE_COLORS[OPP_STATUSES.indexOf(s.stage)],height:"100%",width:`${(s.total/maxTotal)*100}%`,borderRadius:4,transition:"width .3s"}}/>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                {Object.entries(s.bySvc).sort((a,b)=>b[1]-a[1]).map(([code,val],ci) => (
                  <span key={code} style={{background:SVC_PALETTE[ci%SVC_PALETTE.length]+"22",color:SVC_PALETTE[ci%SVC_PALETTE.length],border:`1px solid ${SVC_PALETTE[ci%SVC_PALETTE.length]}44`,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:3}}>
                    {code}: {fmtK(val)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <Card style={{padding:20,overflow:"hidden"}}>
          <Span s={13} w={700} style={{display:"block",marginBottom:8}}>Service × Stage (Count + Value)</Span>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  <th style={{padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:700,borderBottom:"1px solid #e2e8f0"}}>Service</th>
                  {OPP_STATUSES.map((st,j)=><th key={st} style={{padding:"6px 8px",textAlign:"right",color:STAGE_COLORS[j],fontWeight:700,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{st}</th>)}
                  <th style={{padding:"6px 8px",textAlign:"right",fontWeight:700,borderBottom:"1px solid #e2e8f0"}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {allSvcs.length===0&&<tr><td colSpan={6} style={{padding:20,textAlign:"center",color:"#94a3b8"}}>No data</td></tr>}
                {allSvcs.map(code => {
                  const rowOpps=monthOpps.filter(o=>o.serviceCode===code);
                  const rowTotal=rowOpps.reduce((s,o)=>s+o.salesPrice,0);
                  return (
                    <tr key={code} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"6px 8px",fontWeight:700,color:"#1e40af"}}>{code}</td>
                      {OPP_STATUSES.map((st,j) => { const items=rowOpps.filter(o=>o.status===st); const v=items.reduce((s,o)=>s+o.salesPrice,0); return (
                        <td key={st} style={{padding:"6px 8px",textAlign:"right",color:v>0?"#0f172a":"#e2e8f0",fontWeight:v>0?700:400}}>
                          {v>0?<><span style={{color:STAGE_COLORS[j]}}>{items.length}×</span> {fmtK(v)}</>:"—"}
                        </td>
                      );
                      })}
                      <td style={{padding:"6px 8px",textAlign:"right",fontWeight:900}}>฿{fmt(rowTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:"#f8fafc"}}>
                  <td style={{padding:"6px 8px",fontWeight:800}}>TOTAL</td>
                  {OPP_STATUSES.map((st,j)=>{const v=monthOpps.filter(o=>o.status===st).reduce((s,o)=>s+o.salesPrice,0);return<td key={st} style={{padding:"6px 8px",textAlign:"right",fontWeight:800,color:STAGE_COLORS[j]}}>฿{fmt(v)}</td>;})}
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:900}}>฿{fmt(pipeline)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:0,borderBottom:"2px solid #e2e8f0"}}>
          {[["dash","Dashboard"],["kpi","KPI & Forecast"]].map(([k,l])=>(
            <button key={k} onClick={()=>sTab(k)} style={{padding:"9px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===k?800:500,color:tab===k?"#0f172a":"#94a3b8",borderBottom:tab===k?"2.5px solid #0f172a":"2.5px solid transparent",marginBottom:-2}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {/* Req 14 */}
          <MultiSelect label="Status"  options={OPP_STATUSES.map(s=>({value:s,label:s}))}       selected={fSt}  onChange={setFSt}  width={150}/>
          <MultiSelect label="Service" options={SERVICES.map(s=>({value:s.code,label:s.code}))} selected={fSvc} onChange={setFSvc} width={150}/>
          <MultiSelect label="Agents"  options={SALES_USERS.map(u=>({value:u.id,label:u.name.split(" ")[0]}))} selected={fAg} onChange={setFAg} width={150}/>
          {tab==="kpi"&&<><Sel value={year} onChange={e=>sYear(+e.target.value)} style={{width:88}}>{[2026,2027,2028].map(y=><option key={y}>{y}</option>)}</Sel><NumInp value={annual} onChange={v=>sAnn(v)} style={{width:160}}/></>}
        </div>
      </div>

      {tab==="dash"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
            <SC label="Customers"      val={customers.length}       sub={`${customers.filter(c=>c.ranking==="High").length} High Priority`}/>
            <SC label="Won YTD"        val={`฿${fmtM(totalWon)}`}  sub={`${wonOpps.length} deals closed`}   c="#16a34a"/>
            <SC label="Pipeline"       val={`฿${fmtM(pipeline)}`}  sub={`${filteredOpps.filter(o=>!["Won","Lost"].includes(o.status)).length} active`}/>
            <SC label="KPI Achievement" val={`${kpiPct.toFixed(1)}%`} sub={`Target ฿${fmtM(annual)}`} c={kpiPct>=75?"#16a34a":kpiPct>=50?"#d97706":"#dc2626"}/>
          </div>

          <Card style={{padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <Span s={13} w={700}>Annual KPI Progress</Span>
              <Span s={12} c="#64748b">฿{fmtM(totalWon)} / ฿{fmtM(annual)}</Span>
            </div>
            <div style={{background:"#f1f5f9",borderRadius:5,height:10}}><div style={{background:kpiPct>=75?"#16a34a":kpiPct>=50?"#f59e0b":"#0f172a",height:"100%",width:`${kpiPct}%`,borderRadius:5,transition:"width .5s"}}/></div>
          </Card>

          {/* Req 12: Monthly bar chart with value labels on top */}
          <Card style={{padding:20,marginBottom:14}}>
            <Span s={13} w={700} style={{display:"block",marginBottom:8}}>Monthly Forecast / Backlog / Received</Span>
            <div style={{display:"flex",gap:12,marginBottom:10,flexWrap:"wrap"}}>
              {[{c:"#cbd5e1",l:"Forecast"},{c:"#1e40af",l:"Backlog"},{c:"#22c55e",l:"Received"}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:x.c,borderRadius:2}}/><Span s={11} c="#94a3b8">{x.l}</Span></div>
              ))}
            </div>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:BAR_H+52,paddingTop:32}}>
              {monthData.map((d,i) => {
                const fcH=Math.round((d.fc/maxV)*BAR_H);
                const blH=Math.round((d.bl/maxV)*BAR_H);
                const recH=Math.round((d.rec/maxV)*BAR_H);
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:BAR_H,position:"relative"}}>
                      {/* Forecast */}
                      <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
                        {d.fc>0&&<span style={{position:"absolute",top:-18,fontSize:8,color:"#94a3b8",fontWeight:700,whiteSpace:"nowrap"}}>{fmtK(d.fc)}</span>}
                        <div style={{width:"100%",background:"#cbd5e1",borderRadius:"2px 2px 0 0",height:`${fcH}px`,minHeight:d.fc>0?2:0}}/>
                      </div>
                      {/* Backlog */}
                      <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
                        {d.bl>0&&<span style={{position:"absolute",top:-18,fontSize:8,color:"#1e40af",fontWeight:700,whiteSpace:"nowrap"}}>{fmtK(d.bl)}</span>}
                        <div style={{width:"100%",background:"#1e40af",borderRadius:"2px 2px 0 0",height:`${blH}px`,minHeight:d.bl>0?2:0,cursor:"pointer"}} onMouseEnter={e=>hBar(e,{label:`${d.m} Backlog`,items:d.blItems,total:d.bl})} onMouseMove={moveBar} onMouseLeave={leaveBar}/>
                      </div>
                      {/* Received */}
                      <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
                        {d.rec>0&&<span style={{position:"absolute",top:-18,fontSize:8,color:"#16a34a",fontWeight:700,whiteSpace:"nowrap"}}>{fmtK(d.rec)}</span>}
                        <div style={{width:"100%",background:"#22c55e",borderRadius:"2px 2px 0 0",height:`${recH}px`,minHeight:d.rec>0?2:0,cursor:"pointer"}} onMouseEnter={e=>hBar(e,{label:`${d.m} Received`,items:d.recItems,total:d.rec})} onMouseMove={moveBar} onMouseLeave={leaveBar}/>
                      </div>
                    </div>
                    <span style={{fontSize:9,color:"#94a3b8",marginTop:4}}>{d.m}</span>
                    {d.bl>0&&<span style={{fontSize:8,color:+d.ach>=100?"#16a34a":+d.ach>=80?"#d97706":"#ef4444",fontWeight:700}}>{d.ach}%</span>}
                  </div>
                );
              })}
            </div>
          </Card>

          <PipelineAnalysis/>

          <Card style={{padding:20,marginTop:14}}>
            <Span s={13} w={700} style={{display:"block",marginBottom:10}}>Agent Performance</Span>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {SALES_USERS.map(a => {
                const aw=opps.filter(o=>o.assignedTo===a.id&&o.status==="Won").reduce((s,o)=>s+o.salesPrice,0);
                const ac=opps.filter(o=>o.assignedTo===a.id&&!["Won","Lost"].includes(o.status)).length;
                const closed=opps.filter(o=>o.assignedTo===a.id&&["Won","Lost"].includes(o.status)).length;
                const wr=closed>0?((opps.filter(o=>o.assignedTo===a.id&&o.status==="Won").length/closed)*100).toFixed(0):0;
                return (
                  <div key={a.id} style={{flex:1,minWidth:160,padding:16,background:"#f8fafc",borderRadius:7,border:"1px solid #e2e8f0"}}>
                    <Span s={13} w={800} c="#0f172a" style={{display:"block"}}>{a.name.split(" ")[0]}</Span>
                    <div style={{fontSize:20,fontWeight:900,color:"#16a34a",margin:"6px 0 2px"}}>฿{fmtM(aw)}</div>
                    <Span s={11} c="#64748b">{ac} active · Win {wr}%</Span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {tab==="kpi"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
            <SC label="Annual KPI"  val={`฿${fmtM(annual)}`}/>
            <SC label="YTD Backlog" val={`฿${fmtM(rows[rows.length-1]?.ytdBl||0)}`}  c="#1e40af"/>
            <SC label="YTD Received" val={`฿${fmtM(rows[rows.length-1]?.ytdRec||0)}`} c="#16a34a"/>
            <SC label="YTD Remaining" val={`฿${fmtM(Math.max(0,rows[rows.length-1]?.ytdRem||annual))}`} c="#dc2626"/>
          </div>
          <Card style={{padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Span s={13} w={700}>Monthly Split %</Span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <Span s={12} w={700} c={Math.abs(totalSplit-100)<0.1?"#16a34a":"#dc2626"}>Total: {totalSplit.toFixed(1)}%</Span>
                <Btn onClick={saveKpi} style={{fontSize:11,padding:"4px 12px"}}> Save KPI</Btn>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {MONTHS.map((m,i)=>(
                <div key={m} style={{textAlign:"center",minWidth:62}}>
                  <Span s={10} c="#64748b" style={{display:"block",marginBottom:3}}>{m}</Span>
                  <NumInp value={splits[i]} onChange={v=>upSplit(i,v)} style={{textAlign:"center",padding:"4px",fontSize:12}}/>
                  <Span s={9} c="#94a3b8" style={{display:"block",marginTop:2}}>฿{fmtM(Math.round(annual*splits[i]/100))}</Span>
                </div>
              ))}
            </div>
          </Card>
          <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
            <TH cols={["Month","Forecast","Split%","Backlog","Achv%","Received","YTD BL","YTD Rec","YTD Rem"]}/>
            <tbody>{rows.map((r,i)=>(
              <TR key={r.m}>
                <TD style={{fontWeight:700}}>{r.m}</TD>
                <TD right>฿{fmt(r.fc)}</TD>
                <TD right>{splits[i]}%</TD>
                <TD right style={{color:"#1e40af",fontWeight:700,cursor:"pointer"}} onMouseEnter={e=>hBar(e,{label:`${r.m} Backlog`,items:r.blItems,total:r.bl})} onMouseMove={moveBar} onMouseLeave={leaveBar}>฿{fmt(r.bl)}</TD>
                <TD><span style={{background:+r.ach>=100?"#dcfce7":+r.ach>=80?"#fef3c7":r.bl>0?"#fee2e2":"#f8fafc",color:+r.ach>=100?"#16a34a":+r.ach>=80?"#d97706":r.bl>0?"#dc2626":"#94a3b8",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700}}>{r.bl>0?`${r.ach}%`:"–"}</span></TD>
                <TD right style={{color:"#16a34a",fontWeight:700}}>{r.rec>0?`฿${fmt(r.rec)}`:"–"}</TD>
                <TD right>฿{fmt(r.ytdBl)}</TD>
                <TD right>฿{fmt(r.ytdRec)}</TD>
                <TD right><Span s={12} w={700} c={r.ytdRem>0?"#d97706":"#16a34a"}>฿{fmt(r.ytdRem)}</Span></TD>
              </TR>
            ))}</tbody>
          </table></div></Card>
          {(kpiSplits[year+"_log"]||[]).length>0&&(
            <Card style={{padding:14,marginTop:12}}>
              <Span s={12} w={700} style={{display:"block",marginBottom:8}}>Save Log</Span>
              <div style={{maxHeight:120,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                {[...(kpiSplits[year+"_log"]||[])].reverse().map(l=>(
                  <div key={l.id} style={{fontSize:10,padding:"4px 8px",background:"#f8fafc",borderRadius:4,border:"1px solid #e2e8f0",display:"flex",gap:10}}>
                    <span style={{color:"#64748b",whiteSpace:"nowrap"}}>{l.ts}</span>
                    <span style={{color:"#1e40af",fontWeight:700}}>{USERS.find(u=>u.id===l.author)?.name.split(" ")[0]||l.author}</span>
                    <span style={{color:"#374151",flex:1}}>{l.note}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {tt.vis&&tt.data&&(
        <div style={{position:"fixed",left:tt.x+14,top:tt.y-8,background:"#0f172a",color:"#fff",borderRadius:7,padding:"10px 14px",fontSize:12,zIndex:9999,pointerEvents:"none",maxWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,.28)"}}>
          <div style={{fontWeight:700,marginBottom:6}}>{tt.data.label}</div>
          {(tt.data.items||[]).slice(0,3).map((it,i)=>(
            <div key={i} style={{marginBottom:4,paddingBottom:4,borderBottom:"1px solid #1e293b"}}>
              <div style={{color:"#94a3b8",fontSize:10}}>{it.company}</div>
              <div style={{color:"#22c55e",fontWeight:700}}>฿{fmt(it.amount)}</div>
            </div>
          ))}
          {(tt.data.items||[]).length>3&&<div style={{color:"#64748b",fontSize:10}}>+{tt.data.items.length-3} more</div>}
          <div style={{fontWeight:700,marginTop:4}}>Total: ฿{fmt(tt.data.total)}</div>
        </div>
      )}
    </div>
  );
};

// 
// CUSTOMERS
// 
const INDUSTRY_SECTORS = {
  "Agro Food":           ["Agribusiness","Food & Beverage"],
  "Consumer Products":   ["Fashion","Home & Office Products","Personal Products & Pharmaceuticals"],
  "Financials":          ["Banking","Finance & Securities","Insurance"],
  "Industrials":         ["Automotive","Industrial Materials & Machinery","Paper & Printing Materials","Petrochemicals & Chemicals","Packaging","Steel & Metal Products","Textile"],
  "Property Construction":["Construction Material","Construction Services","Property Fund & REITs","Property Development"],
  "Resources":           ["Mining","Energy & Utilities"],
  "Services":            ["Commerce","Health Care Services","Media & Publishing","Professional Services","Tourism & Leisure","Transportation & Logistics"],
  "Technology":          ["Electronic Components","Information & Communication Technology"],
};

const CustForm = ({initial,user,onSave,onClose,onDelete}) => {
  const blankContact = () => ({id:uid(),name:"",title:"",email:"",phone:"",active:true});
  const blank={id:"",companyEN:"",industry:"",sector:"",businessType:"",companySize:"",address:"",province:"",contacts:[blankContact()],assignedTo:"",remark:"",lastContact:today()};
  const [f,sF] = useState(initial?{...initial,contacts:initial.contacts||[{id:uid(),name:initial.contactName||"",title:initial.titlePosition||"",email:initial.email||"",phone:initial.phone||"",active:true}]}:blank);
  const set = (k,v) => sF(p=>({...p,[k]:v}));
  const setCt=(id,k,v)=>sF(p=>({...p,contacts:p.contacts.map(c=>c.id===id?{...c,[k]:v}:c)}));
  const addCt=()=>sF(p=>({...p,contacts:[...p.contacts,blankContact()]}));
  const delCt=id=>sF(p=>({...p,contacts:p.contacts.filter(c=>c.id!==id)}));
  return (
    <Modal title={initial?"Edit Customer":"Add Customer"} width={860} onClose={onClose}>
      <G2>
        <FRow label="Customer ID"><Inp value={f.id} onChange={e=>set("id",e.target.value)} placeholder="TAX ID (e.g. 0105536088510)"/></FRow>
        <FRow label="Company (EN)"><Inp value={f.companyEN} onChange={e=>set("companyEN",e.target.value.toUpperCase())}/></FRow>
        <FRow label="Industry">
          <Sel value={f.industry} onChange={e=>sF(p=>({...p,industry:e.target.value,sector:""}))}>
            <option value="">— Select Industry —</option>
            {Object.keys(INDUSTRY_SECTORS).map(ind=><option key={ind} value={ind}>{ind}</option>)}
          </Sel>
        </FRow>
        <FRow label="Sector">
          <Sel value={f.sector} onChange={e=>set("sector",e.target.value)} disabled={!f.industry}>
            <option value="">{f.industry?"— Select Sector —":"— Select Industry first —"}</option>
            {(INDUSTRY_SECTORS[f.industry]||[]).map(s=><option key={s} value={s}>{s}</option>)}
          </Sel>
        </FRow>
        <FRow label="Business Type"><Inp value={f.businessType} onChange={e=>set("businessType",e.target.value)}/></FRow>
        <FRow label="Company Size"><Sel value={f.companySize} onChange={e=>set("companySize",e.target.value)}>{["Small","Medium","Large"].map(v=><option key={v}>{v}</option>)}</Sel></FRow>
        <FRow label="Province"><Inp value={f.province} onChange={e=>set("province",e.target.value)}/></FRow>
        <div style={{gridColumn:"1/-1"}}><FRow label="Address"><Inp value={f.address} onChange={e=>set("address",e.target.value)}/></FRow></div>
        <FRow label="Assigned Agent"><Sel value={f.assignedTo} onChange={e=>set("assignedTo",e.target.value)}>
          <option value="">— Any —</option>
          {SALES_USERS.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
        </Sel></FRow>
        <div style={{gridColumn:"1/-1"}}><FRow label="Remark"><Inp value={f.remark} onChange={e=>set("remark",e.target.value)}/></FRow></div>
      </G2>
      <Divider/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <Span s={13} w={700}>Contact Persons</Span>
        <Btn variant="ghost" style={{fontSize:12,padding:"4px 10px"}} onClick={addCt}>+ Add Contact</Btn>
      </div>
      {(f.contacts||[]).map((ct,idx)=>(
        <div key={ct.id} style={{padding:"12px 14px",border:"1px solid #e2e8f0",borderRadius:7,marginBottom:8,background:ct.active?"#fff":"#f8fafc",opacity:ct.active?1:0.65}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Span s={12} w={700} c="#64748b">Contact #{idx+1}</Span>
              <button onClick={()=>setCt(ct.id,"active",!ct.active)} style={{padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:"1px solid",borderColor:ct.active?"#86efac":"#fca5a5",background:ct.active?"#dcfce7":"#fee2e2",color:ct.active?"#16a34a":"#dc2626",cursor:"pointer"}}>{ct.active?"Active":"Inactive"}</button>
            </div>
            {(f.contacts||[]).length>1&&<Btn variant="danger" style={{fontSize:11,padding:"2px 8px"}} onClick={()=>delCt(ct.id)}>Remove</Btn>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FRow label="Name"><Inp value={ct.name} onChange={e=>setCt(ct.id,"name",e.target.value)} placeholder="Full name"/></FRow>
            <FRow label="Title / Position"><Inp value={ct.title} onChange={e=>setCt(ct.id,"title",e.target.value)}/></FRow>
            <FRow label="Email"><Inp value={ct.email} onChange={e=>setCt(ct.id,"email",e.target.value)}/></FRow>
            <FRow label="Phone"><Inp value={ct.phone} onChange={e=>setCt(ct.id,"phone",e.target.value)}/></FRow>
          </div>
        </div>
      ))}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        {onDelete&&<Btn variant="danger" style={{marginRight:"auto"}} onClick={()=>onDelete(f)}>Delete</Btn>}
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={()=>onSave({...f,lastContact:today()})}>Save</Btn>
      </div>
    </Modal>
  );
};

const CUST_HDR = ["ID","Company EN","Industry","Province","Contacts","Agent","Ranking","Status","Last Contact","Remark"];
const CustomersPage = ({user,customers,opps,onSave,onDelete,toast,deliveries,initCustId,onCustReady}) => {
  const [search,sS]=useState(""); const [fR,setFR]=useState([]); const [fSt,setFSt]=useState([]); const [fAg,setFAg]=useState([]);
  const [form,sF]=useState(false); const [edit,sE]=useState(null); const [gs,sGS]=useState(false);
  const [logCust,sLog]=useState(null);
  const [delConfirm,sDelConfirm]=useState(null);
  const [sort,setSort]=useState({col:"companyEN",dir:"asc"});
  const toggleSort=col=>setSort(p=>({col,dir:p.col===col&&p.dir==="asc"?"desc":"asc"}));
  const SortIcon=({col})=>sort.col===col?<span style={{marginLeft:3,fontSize:9,color:"#0f172a"}}>{sort.dir==="asc"?"":""}</span>:<span style={{marginLeft:3,fontSize:9,color:"#cbd5e1"}}>⇅</span>;
  useEffect(()=>{if(initCustId){const c=customers.find(x=>x.id===initCustId);if(c){sE(c);sF(true);}if(onCustReady)onCustReady();}},[initCustId]);
  // Last contact: most recent of stored lastContact or delivery workLog timestamp
  // Auto-derive CRM status from latest OPP for this customer
  const getOppStatus = (custId) => {
    const custOpps = (opps||[]).filter(o=>o.custId===custId);
    if(custOpps.length===0) return null;
    // Priority order: if any Won → Won; if any active (not Lost) → latest non-lost status; else Lost
    const sorted = [...custOpps].sort((a,b)=>b.createdDate?.localeCompare(a.createdDate||"")||0);
    const hasWon = sorted.some(o=>o.status==="Won");
    if(hasWon) return "Won";
    const active = sorted.find(o=>o.status!=="Lost");
    if(active) return active.status;
    return "Lost";
  };
  const getLastContact = (custId) => {
    const dlvLogs = (deliveries||[]).filter(d=>d.custId===custId).flatMap(d=>(d.workLog||[]).map(w=>w.ts));
    const latest = dlvLogs.sort().slice(-1)[0];
    const cust = customers.find(c=>c.id===custId);
    if(!latest) return cust?.lastContact||"";
    return latest.slice(0,10) > (cust?.lastContact||"") ? latest.slice(0,10) : (cust?.lastContact||"");
  };
  const list=useMemo(()=>{
    const RANK_ORDER=["High","Medium","Low"];
    const filtered=customers.filter(c=>{const q=search.toLowerCase();return(!search||c.companyEN.toLowerCase().includes(q)||c.id.includes(q)||(c.contacts||[]).some(ct=>(ct.name||"").toLowerCase().includes(q)))&&(fR.length===0||fR.includes(c.ranking))&&(fSt.length===0||fSt.includes(c.status))&&(fAg.length===0||fAg.includes(c.assignedTo));});
    const {col,dir}=sort;
    const getV=c=>{
      if(col==="id") return c.id||"";
      if(col==="companyEN") return (c.companyEN||"").toLowerCase();
      if(col==="industry") return (c.industry||"").toLowerCase();
      if(col==="province") return (c.province||"").toLowerCase();
      if(col==="agent") return (USERS.find(u=>u.id===c.assignedTo)?.name||"").toLowerCase();
      if(col==="lastContact") return getLastContact(c.id)||"";
      if(col==="remark") return (c.remark||"").toLowerCase();
      return "";
    };
    return [...filtered].sort((a,b)=>{
      const va=getV(a),vb=getV(b);
      const cmp=(typeof va==="number"&&typeof vb==="number")?va-vb:String(va).localeCompare(String(vb),"th");
      return dir==="asc"?cmp:-cmp;
    });
  },[customers,opps,deliveries,search,fR,fSt,fAg,sort]);
  const activeContacts = c => (c.contacts||[]).filter(ct=>ct.active);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Customers</Span><Span s={13} c="#94a3b8" style={{marginLeft:8}}>{list.length} records</Span></div>
        <div style={{display:"flex",gap:8}}><Btn variant="export" onClick={()=>dlCSV("customers.csv",CUST_HDR,list.map(c=>[c.id,c.companyEN,c.industry,c.province,(c.contacts||[]).map(ct=>ct.name).join("; "),USERS.find(u=>u.id===c.assignedTo)?.name||c.assignedTo,c.ranking,c.status,getLastContact(c.id),c.remark||""]))}>↓ CSV</Btn><Btn onClick={()=>{sE(null);sF(true);}}>+ Add Customer</Btn></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search…" style={{maxWidth:220}}/>
      </div>
      <Card><div style={{overflowX:"auto"}}>
      {(()=>{
        const COLS = [
          {l:"Reg. No.",  c:"id",          w:130},
          {l:"Company",   c:"companyEN",   w:220},
          {l:"Sector",    c:"industry",    w:200},
          {l:"Province",  c:"province",    w:110},
          {l:"Contacts",  c:null,          w:180},
          {l:"Agent",     c:"agent",       w:90},
          {l:"Last Contact",c:"lastContact",w:120},
          {l:"Remark",    c:"remark",      w:140},
          {l:"Log",       c:null,          w:60},
          {l:"",          c:null,          w:60},
        ];
        const [colWidths,setColWidths] = React.useState(COLS.map(c=>c.w));
        const startResize = (i,e) => {
          e.preventDefault();
          e.stopPropagation();
          const startX=e.clientX, startW=colWidths[i];
          const onMove=ev=>{const diff=ev.clientX-startX;setColWidths(p=>{const n=[...p];n[i]=Math.max(50,startW+diff);return n;});};
          const onUp=()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);};
          document.addEventListener("mousemove",onMove);
          document.addEventListener("mouseup",onUp);
        };
        // Double-click handle → auto-fit to content width (like Excel)
        const autoFitCol = (i,e) => {
          e.preventDefault(); e.stopPropagation();
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          // header text
          ctx.font = "700 11px 'DM Sans',system-ui,sans-serif";
          let maxW = ctx.measureText(COLS[i].l).width + 40; // padding
          // cell text per column
          ctx.font = "13px 'DM Sans',system-ui,sans-serif";
          const getCellText = (c) => {
            if(i===0) return c.id||"";
            if(i===1) return c.companyEN||"";
            if(i===2) return c.sector||c.industry||"";
            if(i===3) return c.province||"";
            if(i===4) return activeContacts(c).slice(0,2).map(ct=>ct.name+(ct.title?" "+ct.title:"")).join(" / ");
            if(i===5) return USERS.find(u=>u.id===c.assignedTo)?.name.split(" ")[0]||"";
            if(i===6) return getLastContact(c.id)||"";
            if(i===7) return c.remark||"";
            if(i===8) return " 0";
            if(i===9) return "Edit  Delete";
            return "";
          };
          list.forEach(c=>{ const w=ctx.measureText(getCellText(c)).width+24; if(w>maxW) maxW=w; });
          setColWidths(p=>{const n=[...p];n[i]=Math.min(Math.max(50,Math.ceil(maxW)),500);return n;});
        };
        return (
        <table style={{borderCollapse:"collapse",tableLayout:"fixed",width:colWidths.reduce((s,w)=>s+w,0)}}>
          <colgroup>{colWidths.map((w,i)=><col key={i} style={{width:w}}/>)}</colgroup>
          <thead><tr style={{background:"#f8fafc"}}>
            {COLS.map(({l,c},i)=>(
              <th key={i} onClick={c?()=>toggleSort(c):undefined}
                style={{padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:c?"pointer":"default",userSelect:"none",color:sort.col===c?"#0f172a":"#64748b",background:sort.col===c?"#f1f5f9":"#f8fafc",position:"relative",overflow:"hidden"}}>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{l}{c&&<SortIcon col={c}/>}</span>
                <span onMouseDown={e=>startResize(i,e)} onDoubleClick={e=>autoFitCol(i,e)} onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:0,bottom:0,width:6,cursor:"col-resize",background:"transparent",zIndex:2}}/>
              </th>
            ))}
          </tr></thead>
          <tbody>{list.map(c=>(
            <TR key={c.id}>
              <TD style={{fontFamily:"monospace",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.id}</TD>
              <TD style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.companyEN}</TD>
              <TD style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.sector||c.industry||"—"}</TD>
              <TD style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.province}</TD>
              <TD style={{overflow:"hidden"}}>
                {activeContacts(c).slice(0,2).map((ct,i)=>(
                  <div key={ct.id} style={{fontSize:11,color:"#374151",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ct.name}{i===0&&ct.title&&<span style={{color:"#94a3b8",marginLeft:4,fontSize:10}}>{ct.title}</span>}</div>
                ))}
                {(c.contacts||[]).length>2&&<Span s={10} c="#94a3b8">+{(c.contacts||[]).length-2} more</Span>}
              </TD>
              <TD style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{USERS.find(u=>u.id===c.assignedTo)?.name.split(" ")[0]||"-"}</TD>
              <TD style={{color:getLastContact(c.id)?"#374151":"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getLastContact(c.id)||"—"}</TD>
              <TD style={{color:"#64748b",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.remark||"—"}</TD>
              <TD><button onClick={e=>{e.stopPropagation();sLog(c);}} style={{border:"1px solid #e2e8f0",borderRadius:5,background:"#f8fafc",cursor:"pointer",padding:"3px 9px",fontSize:11}}> {(c.workLog||[]).length}</button></TD>
              <TD style={{overflow:"visible",whiteSpace:"nowrap"}}>
                <Btn variant="ghost" style={{fontSize:11,padding:"3px 8px"}} onClick={e=>{e.stopPropagation();sE(c);sF(true);}}>Edit</Btn>
              </TD>
            </TR>
          ))}</tbody>
        </table>
        );
      })()}
      {list.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No records.</div>}</div></Card>
      {form&&<CustForm initial={edit} user={user} onSave={c=>{if(edit&&edit.id&&edit.id!==c.id)onDelete(edit.id);onSave(c);sF(false);toast("Customer saved",c.companyEN);}} onClose={()=>sF(false)} onDelete={edit?c=>{sF(false);sDelConfirm(c);}:null}/>}
      {delConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.2)",overflow:"hidden"}}>
            {/* Red header strip */}
            <div style={{background:"#fef2f2",borderBottom:"1px solid #fecaca",padding:"24px 28px 20px",textAlign:"center"}}>
              <div style={{width:48,height:48,background:"#fee2e2",border:"1.5px solid #fecaca",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4h4M3 6h14M5 6l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:"#0f172a",letterSpacing:"-0.01em"}}>Delete Customer</div>
              <div style={{fontSize:12,color:"#ef4444",marginTop:4}}>This action cannot be undone</div>
            </div>
            {/* Body */}
            <div style={{padding:"20px 28px 24px"}}>
              <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px 16px",marginBottom:20}}>
                <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:3}}>{delConfirm.companyEN}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:"#94a3b8",letterSpacing:"0.02em"}}>{delConfirm.id}</div>
              </div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.6,marginBottom:20}}>
                The customer record and all associated data will be permanently removed from Google Sheets. Linked opportunities and deliveries will not be deleted.
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" style={{flex:1,justifyContent:"center"}} onClick={()=>sDelConfirm(null)}>Cancel</Btn>
                <button style={{flex:1,padding:"9px 16px",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer",background:"#dc2626",color:"#fff",border:"none",letterSpacing:"-0.01em"}} onClick={()=>{
                  onDelete(delConfirm.id);
                  toast("Customer deleted",delConfirm.companyEN,"error");
                  sDelConfirm(null);
                }}>Delete Customer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {logCust&&(
        <Modal title={`Work Log — ${logCust.companyEN}`} width={700} onClose={()=>sLog(null)}>
          {/* Summary header */}
          <div style={{marginBottom:14,padding:"12px 16px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 12px"}}>
              <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>Last Contact</span>
              <span style={{fontSize:14,fontWeight:800,color:getLastContact(logCust.id)?"#0f172a":"#94a3b8"}}>
                {getLastContact(logCust.id)||"—"}
              </span>
            </div>
            <Span s={11} c="#94a3b8">Customer Work Log: {(logCust.workLog||[]).length} entries</Span>
          </div>
          {/* Delivery-linked logs (read-only) */}
          {(()=>{
            const dlvLogs=(deliveries||[]).filter(d=>d.custId===logCust.id).flatMap(d=>(d.workLog||[]).map(w=>({...w,_dlvJob:d.jobCode||d.oppCode||d.id,_dlvSvc:d.serviceType||d.serviceCode})));
            if(dlvLogs.length===0) return null;
            return (
              <div style={{marginBottom:12}}>
                <Span s={11} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Delivery Work Logs (linked)</Span>
                <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                  {[...dlvLogs].sort((a,b)=>b.ts.localeCompare(a.ts)).map(w=>(
                    <div key={w.id} style={{padding:"7px 12px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:6,fontSize:12}}>
                      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"monospace",fontSize:10,color:"#1e40af",fontWeight:700,background:"#dbeafe",padding:"1px 6px",borderRadius:3}}>{w._dlvJob}</span>
                        <Span s={10} c="#94a3b8">{w.ts}</Span>
                        <Span s={10} c="#64748b">{USERS.find(u=>u.id===w.author)?.name.split(" ")[0]||w.author}</Span>
                      </div>
                      <div style={{color:"#1e293b"}}>{w.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Customer Work Log (editable) */}
          <Span s={11} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Customer Activity Log</Span>
          <ActivityLog logs={logCust.workLog||[]} currentUser={user}
            onAdd={entry=>{const up={...logCust,workLog:[...(logCust.workLog||[]),entry],lastContact:today()};onSave(up);sLog(up);toast("Log added",logCust.companyEN);}}
            placeholder="Log a call, meeting, site visit…"/>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><Btn onClick={()=>sLog(null)}>Done</Btn></div>
        </Modal>
      )}
    </div>
  );
};

// 
// OPPORTUNITIES
// 
// 
// QUOTATION PREVIEW & EXPORT — Wave Exponential Public Company Limited
// 
// 
// QUOTATION PREVIEW & EXPORT — Wave Exponential Public Company Limited
// 

// Logo removed — using company name text only

const WAVE_CO = {
  name:       "Wave Exponential Public Company Limited",
  taxId:      "0107570002026",
  address:    "2445/19,21 Tararom Business Tower, 14th Floor, New Petchburi Road, Bangkapi Sub-district, Huaykhwang District Bangkok 10310",
  tel:        "02-665-6705 #1008",
  email:      "service@wave-groups.com",
  signer:     "Korakoj Sanguanpiyapan",
  signerTitle:"Managing Director Climate Business",
};

const QuotationPreview = ({opp, customer, costSheets, onClose, onSaveQuotation}) => {
  const cs = (costSheets||[]).find(c=>c.serviceCode===opp?.serviceCode);
  // Try live quoteOverride first, then quoteSnapshot from saveLog
  const qo = cs ? (cs.quoteOverrides||[]).find(q=>q.quoteNo===opp?.quoteNo) : null;
  const qSnap = qo || (()=>{
    const logEntry=(cs?.saveLog||[]).slice().reverse().find(l=>l.quoteSnapshot?.quoteNo===opp?.quoteNo);
    return logEntry?.quoteSnapshot||null;
  })();
  const qPrice = qSnap?.salesPrice || opp?.salesPrice || 0;

  const buildInstallments = () => {
    if(qSnap?.installments?.length) return qSnap.installments.map(i=>({...i,id:i.id||uid()}));
    return [
      {id:uid(),seq:1,label:"งวดที่ 1 — ลงนามสัญญา",        pct:40, detail:"Upon contract signing"},
      {id:uid(),seq:2,label:"งวดที่ 2 — ก่อนการตรวจสอบ",     pct:40, detail:"Prior to verification"},
      {id:uid(),seq:3,label:"งวดที่ 3 — เมื่อได้รับใบรับรอง",  pct:20, detail:"Upon receiving certificate"},
    ];
  };

  const buildLineItems = () => {
    const desc = qSnap?.projectTitle || opp?.serviceType || "";
    if(qSnap?.lineItems?.length) return qSnap.lineItems.map(li=>({
      ...li, id:li.id||uid(),
      description: li.description || desc,
      unitPrice: qPrice,  // always override with current salesPrice
    }));
    return [{id:uid(), description:desc, qty:1, unit:"Job", unitPrice:qPrice}];
  };

  const buildDeliverables = () => {
    if(qSnap?.deliverables?.length) return qSnap.deliverables.map(d=>({...d,id:d.id||uid()}));
    return [{id:uid(),item:""}];
  };

  const initIssue = today();
  const savedQD = opp?.quotationData; // persisted from previous save

  const defaultNotes = qSnap?.notes || "";



  const qIssueDate = qSnap?.issueDate || initIssue;
  const qDueDate   = qSnap?.dueDate   || addDays(qIssueDate, 30);
  const qQuoteNo   = qSnap?.quoteNo   || opp?.quoteNo || "";

  const [f, sF] = useState(savedQD ? {
    ...savedQD,
    // Always re-sync arrays from CS if savedQD's copy is missing/empty
    deliverables:  Array.isArray(savedQD.deliverables) && savedQD.deliverables.length  ? savedQD.deliverables  : buildDeliverables(),
    installments:  Array.isArray(savedQD.installments) && savedQD.installments.length  ? savedQD.installments  : buildInstallments(),
    lineItems:     (()=>{
      const base = Array.isArray(savedQD.lineItems) && savedQD.lineItems.length ? savedQD.lineItems : buildLineItems();
      return base.map(li=>({...li, unitPrice: qPrice}));  // always sync unitPrice = salesPrice
    })(),
    // Sync text fields from CS if savedQD has blanks
    quoteNo:       savedQD.quoteNo       || qQuoteNo,
    issueDate:     savedQD.issueDate     || qIssueDate,
    dueDate:       savedQD.dueDate       || qDueDate,
    projectScope:  savedQD.projectScope  || qSnap?.projectScope  || "",
    notes:         savedQD.notes         || defaultNotes,
    salesPrice:    savedQD.salesPrice    || qPrice,
    projectTitle:  savedQD.projectTitle  || qSnap?.projectTitle  || qSnap?.serviceType   || opp?.serviceType || cs?.serviceType || "",
    projectDuration: savedQD.projectDuration || qSnap?.projectMonths || cs?.projectMonths || 3,
    salesAgentId:  savedQD.salesAgentId  || qSnap?.salesAgent    || opp?.assignedTo   || SALES_USERS[0]?.id || "",
  } : {
    quoteNo:         qQuoteNo,
    issueDate:       qIssueDate,
    dueDate:         qDueDate,
    salesAgentId:    qSnap?.salesAgent   || opp?.assignedTo || SALES_USERS[0]?.id||"",
    projectTitle:    qSnap?.projectTitle || qSnap?.serviceType  || opp?.serviceType||cs?.serviceType||"",
    projectScope:    qSnap?.projectScope || "",
    projectDuration: qSnap?.projectMonths|| cs?.projectMonths||3,
    projectStartDate:"",
    deliverables: buildDeliverables(),
    salesPrice:   qPrice,
    lineItems: buildLineItems(),
    installments: buildInstallments(),
    notes: defaultNotes,
  });

  const set    = (k,v) => sF(p=>({...p,[k]:v}));
  const setIssue = v  => sF(p=>({...p,issueDate:v,dueDate:addDays(v,30)}));

  // Logo: fetch from Google Drive as base64 on mount
  const LOGO_GDRIVE = "https://lh3.googleusercontent.com/d/1XGaqgtoVNS2BZshMNDYQuQl8AbfW1z56";
  const [logoB64, setLogoB64] = useState("");
  useEffect(()=>{
    const URLS=[
      "https://lh3.googleusercontent.com/d/1XGaqgtoVNS2BZshMNDYQuQl8AbfW1z56",
      "https://drive.google.com/uc?export=view&id=1XGaqgtoVNS2BZshMNDYQuQl8AbfW1z56",
      "https://drive.google.com/thumbnail?id=1XGaqgtoVNS2BZshMNDYQuQl8AbfW1z56&sz=w400",
    ];
    const tryNext=async(idx)=>{
      if(idx>=URLS.length) return;
      try{
        const r=await fetch(URLS[idx],{mode:"cors",cache:"no-store"});
        if(r.ok){const blob=await r.blob();const fr=new FileReader();fr.onload=()=>setLogoB64(fr.result);fr.readAsDataURL(blob);return;}
      }catch(e){}
      tryNext(idx+1);
    };
    tryNext(0);
  },[]);

  const agent    = USERS.find(u=>u.id===f.salesAgentId);
  const agentMob = SALES_MOBILE[f.salesAgentId]||"";
  const subTotal = f.salesPrice||0;
  const vat      = Math.round(subTotal*0.07);
  const total    = subTotal + vat;
  const instSum  = (f.installments||[]).reduce((s,i)=>s+(i.pct||0),0);
  const instOk   = Math.abs(instSum-100)<0.1;

  const setInst = (id,k,v) => sF(p=>({...p,installments:p.installments.map(i=>i.id===id?{...i,[k]:v}:i)}));
  const addInst = () => sF(p=>({...p,installments:[...p.installments,{id:uid(),seq:p.installments.length+1,label:`งวดที่ ${p.installments.length+1}`,pct:0,detail:""}]}));
  const delInst = id => sF(p=>({...p,installments:p.installments.filter(i=>i.id!==id)}));
  const addDlv  = () => sF(p=>({...p,deliverables:[...p.deliverables,{id:uid(),item:""}]}));
  const setDlv  = (id,v) => sF(p=>({...p,deliverables:p.deliverables.map(d=>d.id===id?{...d,item:v}:d)}));
  const delDlv  = id => sF(p=>({...p,deliverables:p.deliverables.filter(d=>d.id!==id)}));
  const setLI   = (id,k,v) => sF(p=>({...p,lineItems:(p.lineItems||[]).map(li=>li.id===id?{...li,[k]:v}:li)}));
  const addLI   = () => sF(p=>({...p,lineItems:[...(p.lineItems||[]),{id:uid(),description:"",qty:1,unit:"Job",unitPrice:0}]}));
  const delLI   = id => sF(p=>({...p,lineItems:(p.lineItems||[]).filter(li=>li.id!==id)}));

  const SH = ({n,label,warn}) => (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:5,borderBottom:"2px solid #0c1a2e"}}>
      <div style={{width:20,height:20,background:"#00b3a4",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,flexShrink:0}}>{n}</div>
      <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",color:"#0c1a2e"}}>{label}</span>
      {warn&&<span style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:instOk?"#16a34a":"#dc2626"}}>{instSum}% {instOk?"":" must = 100%"}</span>}
    </div>
  );

  const exportPDF = () => {
    const subT=f.salesPrice||0, vatT=Math.round(subT*0.07), totT=subT+vatT;
    const agentName=USERS.find(u=>u.id===f.salesAgentId)?.name||"—";
    const agentMobP=SALES_MOBILE[f.salesAgentId]||"—";
    const instRowsHtml=(f.installments||[]).map((ins,i)=>`
      <tr>
        <td style="width:22px;text-align:center;color:#94a3b8;font-weight:700">${i+1}</td>
        <td>${ins.label||""}</td>
        <td style="text-align:right;width:44px">${ins.pct||0}%</td>
        <td style="text-align:right;font-weight:700;font-variant-numeric:tabular-nums;width:90px">THB&nbsp;${fmt(Math.round(subT*(ins.pct||0)/100))}</td>
      </tr>`).join("");
    const dlvHtml=(f.deliverables||[]).map(d=>`<div style="display:flex;gap:5px;margin-bottom:3px"><span style="color:#00b3a4;font-weight:900;flex-shrink:0"></span><span>${d.item||""}</span></div>`).join("");
    const custName=customer?.companyEN||"—";
    const custTax=customer?.id||"—";
    const custAddr=[customer?.address,customer?.province].filter(Boolean).join(", ");
    const custContacts=(customer?.contacts||[]).filter(c=>c.active).slice(0,2)
      .map(ct=>`<div style="margin-bottom:2px"><strong>${ct.name}</strong>${ct.title?` <span style="color:#94a3b8">· ${ct.title}</span>`:""}<br/>${[ct.email,ct.phone].filter(Boolean).join(" &nbsp;·&nbsp; ")}</div>`).join("");
    const notesHtml=(f.notes||"").split("\n").join("<br/>");
    const scopeHtml=f.projectScope?`<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:3px;padding:5px 8px;font-size:8px;color:#374151;white-space:pre-wrap;margin-top:5px">${f.projectScope}</div>`:"";
    const lineItemsHtml=(f.lineItems||[]).map((li,i)=>{
      const sub=(li.qty||0)*(li.unitPrice||0);
      return `<tr>
        <td>${li.description||""}</td>
        <td style="text-align:right;width:36px">${li.qty||0}</td>
        <td style="width:44px">${li.unit||""}</td>
        <td style="text-align:right;width:90px;font-variant-numeric:tabular-nums">${fmt(li.unitPrice||0)}</td>
        <td style="text-align:right;width:90px;font-weight:700;font-variant-numeric:tabular-nums">THB ${fmt(sub)}</td>
      </tr>`;
    }).join("");
    // PDF logo: use cached base64 from state, or empty
    const pdfLogoHtml = logoB64 ? `<img src="${logoB64}" style="height:40px;width:auto;object-fit:contain" alt="Wave Exponential"/>` : "";

    const w = window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation ${f.quoteNo}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Inter+Tight:wght@700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4 portrait;margin:8mm 10mm}
html{width:794px;height:1123px;overflow:hidden;background:#fff}
body{width:794px;max-height:1123px;overflow:hidden;background:#fff;page-break-after:avoid}
#page{
  width:794px;
  min-height:1123px;
  max-height:1123px;
  padding:32px 40px;
  font-family:'Inter','Helvetica Neue',Arial,'Noto Sans Thai',sans-serif;
  font-size:8px;color:#1a1a1a;line-height:1.38;
  display:flex;flex-direction:column;
  overflow:hidden;
  page-break-after:avoid;
  page-break-inside:avoid;
  -webkit-font-smoothing:antialiased;
}
table{width:100%;border-collapse:collapse}
th,td{padding:3px 6px;text-align:left;border-bottom:1px solid #e8ecf0;font-size:8px}
th{background:#f1f5f9;font-weight:700;font-size:7.5px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
/* Header */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:9px;padding-bottom:8px;border-bottom:2px solid #0c1a2e;flex-shrink:0}
.co-name{font-size:12px;font-weight:900;color:#0c1a2e;letter-spacing:-0.02em;line-height:1.1;font-family:'Inter Tight','Inter',sans-serif}
.co-sub{font-size:8.5px;font-weight:700;color:#00b3a4;letter-spacing:.02em;margin-bottom:3px}
.co-addr{color:#64748b;font-size:7.5px;line-height:1.6}
.quo-title{font-size:20px;font-weight:900;color:#0c1a2e;letter-spacing:-0.04em;line-height:1;margin-bottom:5px;font-family:'Inter Tight','Inter',sans-serif}
.meta td{padding:1.5px 8px 1.5px 0;font-size:8px;border:none}
.meta-key{color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.04em;text-align:right}
.meta-val{font-weight:700;color:#0c1a2e}
/* Quote For */
.qfor{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;padding:7px 10px;background:#f8fafc;border-radius:4px;border:1px solid #e2e8f0;flex-shrink:0}
.qlbl{font-size:7px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:3px}
/* Sections */
.body{flex:1;overflow:hidden;display:flex;flex-direction:column;gap:7px}
.sec-hdr{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#0c1a2e;border-bottom:1.5px solid #0c1a2e;padding-bottom:3px;margin-bottom:5px}
.badge{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;background:#00b3a4;color:#fff;border-radius:50%;font-weight:900;font-size:8px;flex-shrink:0}
.sec-proj{display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-bottom:5px}
.proj-lbl{font-size:7px;color:#94a3b8;font-weight:700;text-transform:uppercase;display:block;margin-bottom:1px}
.proj-val{font-weight:700;font-size:9.5px;color:#0c1a2e;font-family:'Inter Tight','Inter',sans-serif}
/* Payment */
.totals-wrap{display:flex;justify-content:flex-end;margin-top:5px}
.totals{min-width:200px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:6px 10px}
.tot-row{display:flex;justify-content:space-between;padding:2.5px 0;border-bottom:1px solid #e8ecf0;font-size:8.5px}
.tot-final{border-bottom:1.5px solid #0c1a2e;font-weight:900;font-size:9.5px}
/* Signature */
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;border-top:1px solid #e2e8f0;padding-top:10px;margin-top:auto;flex-shrink:0}
.sig-lbl{font-size:7.5px;color:#64748b;margin-bottom:14px;font-style:italic}
.sig-line{border-bottom:1px solid #374151;height:22px;margin-bottom:4px}
.sig-detail{font-size:8px;color:#374151;line-height:1.8}
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  html,body{width:794px;height:1123px;max-height:1123px;overflow:hidden}
  #page{page-break-after:avoid;page-break-inside:avoid}
}
</style></head><body>
<div id="page">
<!-- HEADER -->
<div class="hdr">
  <div style="display:flex;gap:10px;align-items:flex-start">
    ${pdfLogoHtml}
    <div>
      <div class="co-name">Wave Exponential</div>
      <div class="co-sub">Public Company Limited</div>
      <div class="co-addr">Tax ID: ${WAVE_CO.taxId}<br/>${WAVE_CO.address}<br/>Tel: ${WAVE_CO.tel} · ${WAVE_CO.email}</div>
    </div>
  </div>
  <div style="text-align:right">
    <div class="quo-title">QUOTATION</div>
    <table class="meta" style="margin-left:auto;width:auto">
      <tr><td class="meta-key">QUOTE #</td><td class="meta-val" style="font-family:'Inter',monospace;font-weight:700;letter-spacing:0.02em">${f.quoteNo}</td></tr>
      <tr><td class="meta-key">ISSUED</td><td class="meta-val">${fmtDate(f.issueDate)}</td></tr>
      <tr><td class="meta-key">VALID UNTIL</td><td class="meta-val">${fmtDate(f.dueDate)}</td></tr>
      <tr><td class="meta-key">SALES</td><td class="meta-val">${agentName}</td></tr>
      <tr><td class="meta-key">MOBILE</td><td class="meta-val">${agentMobP}</td></tr>
    </table>
  </div>
</div>
<!-- QUOTE FOR -->
<div class="qfor">
  <div>
    <span class="qlbl">Quote For</span>
    <div style="font-weight:800;font-size:11px;color:#0c1a2e;margin-bottom:2px">${custName}</div>
    <div style="color:#64748b;font-size:8px;line-height:1.6">Tax ID: ${custTax}<br/>${custAddr}</div>
  </div>
  <div>
    <span class="qlbl">Contact Person</span>
    <div style="font-size:8px;color:#374151">${custContacts||"—"}</div>
  </div>
</div>
<!-- BODY SECTIONS -->
<div class="body">
  <!-- SEC 1: PROJECT -->
  <div>
    <div class="sec-hdr"><span class="badge">1</span>Project</div>
    <table>
      <thead><tr>
        <th style="text-align:center">Description</th>
        <th style="text-align:center;width:36px">Qty</th>
        <th style="text-align:center;width:44px">Unit</th>
        <th style="text-align:center;width:90px">Unit Price (THB)</th>
        <th style="text-align:center;width:90px">Subtotal (THB)</th>
      </tr></thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>
    ${scopeHtml}
  </div>
  <!-- SEC 2: DELIVERABLES -->
  <div>
    <div class="sec-hdr"><span class="badge">2</span>Deliverables</div>
    <div style="font-size:8.5px">${dlvHtml}</div>
  </div>
  <!-- SEC 3: PAYMENT SCHEDULE -->
  <div>
    <div class="sec-hdr"><span class="badge">3</span>Payment Schedule</div>
    <table>
      <thead><tr><th style="text-align:center;width:22px">#</th><th style="text-align:center">Description</th><th style="text-align:center;width:44px">%</th><th style="text-align:center;width:90px">Amount (THB)</th></tr></thead>
      <tbody>${instRowsHtml}</tbody>
    </table>
    <div class="totals-wrap">
      <div class="totals">
        <div class="tot-row"><span style="color:#64748b">Subtotal (excl. VAT)</span><span style="font-variant-numeric:tabular-nums;font-weight:500">THB ${fmt(subT)}</span></div>
        <div class="tot-row"><span style="color:#64748b">VAT 7%</span><span style="font-variant-numeric:tabular-nums;font-weight:500">THB ${fmt(vatT)}</span></div>
        <div class="tot-row tot-final"><span>TOTAL</span><span style="font-variant-numeric:tabular-nums;font-weight:700">THB ${fmt(totT)}</span></div>
      </div>
    </div>
  </div>
  <!-- SEC 4: NOTES -->
  <div>
    <div class="sec-hdr"><span class="badge">4</span>Notes &amp; Conditions</div>
    <div style="font-size:8px;color:#374151;line-height:1.6">${notesHtml}</div>
  </div>
</div>
<!-- SIGNATURES -->
<div class="sig-grid">
  <div>
    <div class="sig-lbl">On behalf of ${WAVE_CO.name}</div>
    <div class="sig-line"></div>
    <div class="sig-detail">Name: <strong>${WAVE_CO.signer}</strong><br/>Title: ${WAVE_CO.signerTitle}<br/>Date: ${fmtDate(f.issueDate)}</div>
  </div>
  <div>
    <div class="sig-lbl">Accepted by: ${custName}</div>
    <div class="sig-line"></div>
    <div class="sig-detail">Name: .....................................<br/>Title: .....................................<br/>Date: .....................................</div>
  </div>
</div>
</div>
</body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),600);
  };

  return (
    <Modal title={`Quotation — ${f.quoteNo||"Draft"}`} width={1020} onClose={onClose}>

      {/* TOP INFO BAR — read-only */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14,padding:"14px 16px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
        {[
          ["Quote No.",   f.quoteNo,           true],
          ["Issue Date",  fmtDate(f.issueDate), false],
          ["Valid Until", fmtDate(f.dueDate),   false],
          ["Sales Agent", agent?.name||"—",     false],
          ["Mobile",      agentMob||"—",        false],
          ["Sales Price (THB)", `฿${fmt(f.salesPrice)}`, false],
          ["Duration (months)", `${f.projectDuration} months`, false],
          ["Est. Start Date", f.projectStartDate||"—", false],
        ].map(([label,val,mono])=>(
          <div key={label}>
            <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
            <div style={{fontSize:12,fontWeight:700,color:"#0f172a",fontFamily:mono?"monospace":"inherit"}}>{val}</div>
          </div>
        ))}
      </div>

      {/* PRINT AREA */}
      <div id="quo-print" style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"16px 20px",background:"#fff",fontSize:10,lineHeight:1.4,fontFamily:"'Inter','DM Sans',system-ui,sans-serif",WebkitFontSmoothing:"antialiased"}}>

        {/* HEADER — Logo + Company + Quote Meta */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,paddingBottom:12,borderBottom:"2.5px solid #0c1a2e"}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            {logoB64&&<img src={logoB64} style={{height:44,width:"auto",objectFit:"contain",flexShrink:0}} alt="Wave Exponential"/>}
            <div>
              <div style={{fontSize:13,fontWeight:900,color:"#0c1a2e",letterSpacing:"-0.02em",lineHeight:1.15,fontFamily:"'Inter Tight','Inter',system-ui,sans-serif"}}>Wave Exponential</div>
              <div style={{fontSize:10,fontWeight:700,color:"#00b3a4",letterSpacing:"0.03em",marginBottom:4}}>Public Company Limited</div>
              <div style={{color:"#64748b",fontSize:9,lineHeight:1.7}}>
                Tax ID: {WAVE_CO.taxId}<br/>
                {WAVE_CO.address}<br/>
                Tel: {WAVE_CO.tel} · {WAVE_CO.email}
              </div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#0c1a2e",letterSpacing:"-0.04em",marginBottom:6,lineHeight:1,fontFamily:"'Inter Tight','Inter',system-ui,sans-serif"}}>QUOTATION</div>
            <table style={{marginLeft:"auto",borderCollapse:"collapse",fontSize:10.5}}>
              <tbody>
                {[["QUOTE #",f.quoteNo,true],["ISSUED",fmtDate(f.issueDate),false],["VALID UNTIL",fmtDate(f.dueDate),false],["SALES",agent?.name||"—",false],["MOBILE",agentMob||"—",false]].map(([k,v,mono])=>(
                  <tr key={k}>
                    <td style={{color:"#94a3b8",paddingRight:12,paddingBottom:3,fontWeight:600,fontSize:8.5,textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"right"}}>{k}</td>
                    <td style={{fontWeight:700,fontFamily:mono?"'Inter',monospace":"inherit",letterSpacing:mono?"0.02em":"inherit",color:"#0c1a2e"}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUOTE FOR */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12,padding:"12px 16px",background:"#f8fafc",borderRadius:7,border:"1px solid #e2e8f0"}}>
          <div>
            <span style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:5}}>Quote For</span>
            <div style={{fontWeight:800,fontSize:12,color:"#0c1a2e",marginBottom:3}}>{customer?.companyEN||"—"}</div>
            <div style={{color:"#64748b",fontSize:11,lineHeight:1.9}}>
              Tax ID: {customer?.id||"—"}<br/>
              {[customer?.address,customer?.province].filter(Boolean).join(", ")}
            </div>
          </div>
          <div>
            <span style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:5}}>Contact Person</span>
            {(customer?.contacts||[]).filter(c=>c.active).slice(0,2).map(ct=>(
              <div key={ct.id} style={{fontSize:11,lineHeight:1.9,color:"#374151"}}>
                <strong>{ct.name}</strong>{ct.title&&<span style={{color:"#94a3b8"}}> · {ct.title}</span>}<br/>
                {ct.email&&<span style={{marginRight:10}}>{ct.email}</span>}{ct.phone&&<span>{ct.phone}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 1: PROJECT */}
        <div style={{marginBottom:12}}>
          <SH n="1" label="Project"/>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8,fontSize:11}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["Description","Qty","Unit","Unit Price (THB)","Subtotal (THB)"].map((h,i)=>(
                  <th key={i} style={{padding:"6px 8px",textAlign:i>=1?"center":"left",fontWeight:700,color:"#64748b",fontSize:10,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(f.lineItems||[]).map((li)=>{
                const sub=(li.qty||0)*(li.unitPrice||0);
                return(
                  <tr key={li.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={{padding:"6px 8px",fontSize:11}}>{li.description||"—"}</td>
                    <td style={{padding:"6px 8px",textAlign:"center",fontSize:11}}>{li.qty||0}</td>
                    <td style={{padding:"6px 8px",textAlign:"center",fontSize:11}}>{li.unit||""}</td>
                    <td style={{padding:"6px 8px",textAlign:"right",fontSize:11,fontVariantNumeric:"tabular-nums"}}>{fmt(li.unitPrice||0)}</td>
                    <td style={{padding:"6px 8px",textAlign:"right",fontWeight:700,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",fontSize:11}}>฿{fmt(sub)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {f.projectScope&&<div style={{fontSize:10.5,color:"#374151",background:"#fafafa",border:"1px solid #e2e8f0",borderRadius:5,padding:"7px 10px",whiteSpace:"pre-wrap",lineHeight:1.6}}>{f.projectScope}</div>}
        </div>

        {/* SECTION 2: DELIVERABLES */}
        <div style={{marginBottom:12}}>
          <SH n="2" label="Deliverables"/>
          {(f.deliverables||[]).map((d)=>(
            <div key={d.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
              <span style={{color:"#00b3a4",fontWeight:900,fontSize:14,flexShrink:0,marginTop:1}}></span>
              <span style={{fontSize:11,color:"#374151",lineHeight:1.5}}>{d.item}</span>
            </div>
          ))}
        </div>

        {/* SECTION 3: PAYMENT SCHEDULE */}
        <div style={{marginBottom:12}}>
          <SH n="3" label="Payment Schedule" warn={true}/>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8,fontSize:11}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["#","Description","% Share","Amount (THB)"].map((h,i)=>(
                  <th key={i} style={{padding:"6px 8px",textAlign:i>=2?"right":"left",fontWeight:700,color:"#64748b",fontSize:10,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(f.installments||[]).map((ins,idx)=>(
                <tr key={ins.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <td style={{padding:"6px 8px",color:"#94a3b8",fontWeight:700}}>{idx+1}</td>
                  <td style={{padding:"6px 8px",fontSize:11}}>{ins.label}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:11}}>{ins.pct||0}%</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontWeight:700,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",fontSize:11}}>฿{fmt(Math.round(subTotal*(ins.pct||0)/100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
            <div style={{minWidth:280,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:7,padding:"12px 16px"}}>
              {[{l:"Subtotal (excl. VAT)",v:subTotal,b:false},{l:"VAT 7%",v:vat,b:false},{l:"TOTAL",v:total,b:true}].map(x=>(
                <div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:x.b?"2px solid #0c1a2e":"1px solid #e2e8f0"}}>
                  <span style={{fontWeight:x.b?900:500,color:x.b?"#0c1a2e":"#64748b",fontSize:12}}>{x.l}</span>
                  <span style={{fontWeight:x.b?900:700,color:x.b?"#0c1a2e":"#374151",fontSize:12,fontVariantNumeric:"tabular-nums"}}>THB {fmt(x.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: NOTES */}
        <div style={{marginBottom:12}}>
          <SH n="4" label="Notes &amp; Conditions"/>
          <div style={{fontSize:10.5,color:"#374151",background:"#fafafa",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 12px",whiteSpace:"pre-wrap",lineHeight:1.7}}>{f.notes||""}</div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,borderTop:"1px solid #e2e8f0",paddingTop:22}}>
          {[
            {label:`On behalf of ${WAVE_CO.name}`,name:WAVE_CO.signer,title:WAVE_CO.signerTitle,date:fmtDate(f.issueDate)},
            {label:`Accepted by: ${customer?.companyEN||"Client"}`,name:"",title:"",date:""},
          ].map((s,i)=>(
            <div key={i}>
              <div style={{fontSize:10,color:"#64748b",marginBottom:22,fontStyle:"italic"}}>{s.label}</div>
              <div style={{borderBottom:"1px solid #374151",height:36,marginBottom:6}}/>
              <div style={{fontSize:11,color:"#374151",lineHeight:2}}>
                <div>Name: <strong>{s.name}</strong></div>
                <div>Title: {s.title}</div>
                <div>Date: {s.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14,alignItems:"center"}}>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
        <Btn variant="export" onClick={exportPDF}> Print / Export PDF</Btn>
      </div>
    </Modal>
  );
};

const OppForm = ({initial,customers,opps,user,onSave,onClose,costSheets,onGoToCS,onDelete,initTab="detail"}) => {
  const newOppCode=genOppCode(opps); const newQtNo=genQuoteNo(opps);
  const blank={id:newOppCode,custId:customers[0]?.id||"",oppCode:newOppCode,quoteNo:newQtNo,jobCode:"",serviceCode:SERVICES[0].code,serviceType:SERVICES[0].name,salesPrice:SERVICES[0].stdPrice,totalCost:SERVICES[0].stdCost,status:"Proposal",assignedTo:SALES_USERS[0]?.id||"",createdDate:today(),lostReason:"",activityLog:[],remark:"",ranking:"Medium"};
  const [f,sF] = useState(initial?{...initial,activityLog:initial.activityLog||[]}:blank);
  const [tab,sTab] = useState(initTab);
  const [noteInput,sNoteInput] = useState("");
  const set=(k,v)=>sF(p=>({...p,[k]:v}));
  const isWon=f.status==="Won", isLost=f.status==="Lost";
  const mg=margin(f.salesPrice,f.totalCost||0);
  const jobCode=isWon?genJobCode(f.oppCode):"";
  const [delConfirm,setDelConfirm] = useState(false);
  return (
    <Modal title={initial?"Edit Opportunity":"New Opportunity"} width={820} onClose={onClose}>
      <div style={{display:"flex",gap:0,borderBottom:"2px solid #e2e8f0",marginBottom:16}}>
        {[["detail","Details"],["log",`Activity Log (${f.activityLog?.length||0})`],["quotation","Quotation"]].map(([k,l])=>(
          <button key={k} onClick={()=>sTab(k)} style={{padding:"8px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===k?800:500,color:tab===k?"#0f172a":"#94a3b8",borderBottom:tab===k?"2.5px solid #0f172a":"2.5px solid transparent",marginBottom:-2}}>{l}</button>
        ))}
      </div>
      {tab==="detail"&&(
        <>
          <G2>
<FRow label="OPP Code"><Inp value={f.oppCode} readOnly style={{border:"none",background:"transparent",fontFamily:"monospace",fontWeight:600,color:"#1e40af",cursor:"default"}}/></FRow>
<FRow label="Quote No."><button onClick={()=>f.quoteNo&&sTab("quotation")} style={{fontFamily:"monospace",fontWeight:600,fontSize:14,background:"none",color:f.quoteNo?"#1e40af":"#94a3b8",border:"none",padding:"8px 0",cursor:f.quoteNo?"pointer":"default",textDecoration:f.quoteNo?"underline":"none"}}>{f.quoteNo||"—"}</button></FRow>
            {f.csCode&&<div style={{gridColumn:"1/-1",marginTop:4}}><FRow label="Cost Sheet & Pricing Code (CS Code)"><div style={{display:"flex",alignItems:"center",gap:8}}><button onClick={()=>{onSave({...f,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""});if(onGoToCS)onGoToCS(f.serviceCode);}} style={{fontFamily:"monospace",fontWeight:700,fontSize:13,background:"none",color:"#1e40af",padding:"4px 0",border:"none",cursor:"pointer",textDecoration:"underline"}}>{f.csCode}</button><Span s={11} c="#64748b">Click to open Cost Sheet (saves first)</Span></div></FRow></div>}
            <div style={{gridColumn:"1/-1"}}><FRow label="Customer"><Inp value={customers.find(c=>c.id===f.custId)?.companyEN||f.custId} readOnly style={{border:"none",background:"transparent",fontWeight:400,cursor:"default"}}/></FRow></div>
            <div style={{gridColumn:"1/-1"}}><FRow label="Service"><Inp value={`[${f.serviceCode}] ${f.serviceType}`} readOnly style={{border:"none",background:"transparent",cursor:"default"}}/></FRow></div>
            <FRow label="Sales Price (THB)"><Inp value={`฿${fmt(f.salesPrice)}`} readOnly style={{border:"none",background:"transparent",fontWeight:400,cursor:"default"}}/></FRow>
            <FRow label="Total Cost (THB)"><Inp value={`฿${fmt(f.totalCost||0)}`} readOnly style={{border:"none",background:"transparent",cursor:"default"}}/></FRow>
            <FRow label="Status"><Sel value={f.status} onChange={e=>set("status",e.target.value)}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel></FRow>
            <FRow label="Sales Agent"><Inp value={SALES_USERS.find(u=>u.id===f.assignedTo)?.name||f.assignedTo} readOnly style={{border:"none",background:"transparent",cursor:"default"}}/></FRow>
            <FRow label="Ranking" tip="ระดับความสำคัญของ Opportunity นี้">
              <div style={{display:"flex",gap:6}}>
                {["High","Medium","Low"].map(r=>{
                  const active=(f.ranking||"Medium")===r;
                  return <button key={r} onClick={()=>set("ranking",r)} style={{flex:1,padding:"6px 0",borderRadius:5,border:`1.5px solid ${active?RANK_CLR[r]?.c||"#64748b":"#e2e8f0"}`,background:active?(RANK_CLR[r]?.bg||"#f1f5f9"):"#fff",color:active?(RANK_CLR[r]?.c||"#64748b"):"#94a3b8",fontWeight:active?800:500,fontSize:12,cursor:"pointer"}}>{r}</button>;
                })}
              </div>
            </FRow>
            <FRow label="Created Date"><Inp value={fmtDate(f.createdDate)} readOnly style={{border:"none",background:"transparent",cursor:"default"}}/></FRow>
            <div/>
            {isLost&&<div style={{gridColumn:"1/-1"}}><FRow label=" Lost Reason"><Sel value={f.lostReason} onChange={e=>set("lostReason",e.target.value)}><option value="">— Select Reason —</option>{LOST_REASONS.map(r=><option key={r}>{r}</option>)}</Sel></FRow></div>}
            <div style={{gridColumn:"1/-1"}}>
              <FRow label="Note Log">
                <div style={{border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
                  {f.remark&&[...f.remark.split("\n").filter(Boolean)].reverse().map((line,i)=>(
                    <div key={i} style={{padding:"6px 10px",fontSize:12,color:"#374151",borderBottom:"1px solid #f1f5f9",background:"#fafafa"}}>{line}</div>
                  ))}
                  <div style={{display:"flex",gap:0}}>
                    <Inp value={noteInput} onChange={e=>sNoteInput(e.target.value)} placeholder={`Add note… (${today()})`}
                      onKeyDown={e=>{if(e.key==="Enter"&&noteInput.trim()){set("remark",(f.remark?f.remark+"\n":"")+`[${today()}] ${noteInput.trim()}`);sNoteInput("");}}}
                      style={{borderRadius:0,background:"#fff",flex:1,border:"none",borderTop:"1px solid #f1f5f9"}}/>
                  </div>
                </div>
              </FRow>
            </div>
          </G2>
          <div style={{padding:12,borderRadius:6,background:+mg>=30?"#f0fdf4":"#fef2f2",border:`1px solid ${+mg>=30?"#86efac":"#fca5a5"}`,marginTop:4,display:"flex",gap:24,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {[{l:"Total Cost",v:f.totalCost||0},{l:"Sales Price",v:f.salesPrice},{l:"Margin %",v:`${mg}%`,c:+mg>=30?"#16a34a":"#dc2626"},{l:"Margin ฿",v:marginAmt(f.salesPrice,f.totalCost||0),c:+mg>=30?"#16a34a":"#dc2626"}].map(x=>(
              <div key={x.l}><Span s={11} c="#64748b" style={{display:"block",marginBottom:1}}>{x.l}</Span><div style={{fontWeight:700,fontSize:14,color:x.c||"#0f172a"}}>{typeof x.v==="number"?`฿${fmt(x.v)}`:x.v}</div></div>
            ))}
          </div>
          
        </>
      )}
      {tab==="log"&&<ActivityLog logs={f.activityLog||[]} currentUser={user} onAdd={entry=>sF(p=>({...p,activityLog:[...(p.activityLog||[]),entry]}))} placeholder="Log a call, meeting, email…"/>}
      {tab==="quotation"&&<QuotationPreview opp={f} customer={customers.find(c=>c.id===f.custId)} costSheets={costSheets||[]} onClose={onClose} onSaveQuotation={qd=>{const updated={...f,quotationData:qd,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""};onSave(updated);}}/>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        {initial&&onDelete&&<Btn variant="danger" style={{marginRight:"auto"}} onClick={()=>setDelConfirm(true)}>Delete</Btn>}
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={()=>onSave({...f,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""})}>Save</Btn>
      </div>

      {delConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:12,width:"100%",maxWidth:440,boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden"}}>
            <div style={{background:"#fef2f2",borderBottom:"1px solid #fecaca",padding:"22px 28px 18px",textAlign:"center"}}>
              <div style={{width:44,height:44,background:"#fee2e2",border:"1.5px solid #fecaca",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8 4h4M3 6h14M5 6l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>Delete Opportunity?</div>
              <div style={{fontSize:12,color:"#ef4444",marginTop:3}}>This cannot be undone</div>
            </div>
            <div style={{padding:"18px 28px 22px"}}>
              <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:"#1e40af"}}>{f.oppCode}</div>
                {f.quoteNo&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>Quote: {f.quoteNo}</div>}
                {f.csCode&&<div style={{fontSize:11,color:"#64748b"}}>CS Code: {f.csCode}</div>}
              </div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.7,marginBottom:16}}>
                การลบจะ:<br/>
                • ลบ Opportunity นี้ออกจาก Google Sheets<br/>
                {f.csCode&&<span>• ลบ CS Code <strong>{f.csCode}</strong> ออกจาก Cost Sheet<br/></span>}
                • ลบ Quotation snapshot ที่บันทึกไว้ใน Cost Sheet
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" style={{flex:1}} onClick={()=>setDelConfirm(false)}>Cancel</Btn>
                <button style={{flex:1,padding:"9px 16px",borderRadius:6,fontSize:13,fontWeight:700,cursor:"pointer",background:"#dc2626",color:"#fff",border:"none"}} onClick={()=>{setDelConfirm(false);onDelete(f);}}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const OPP_HDR = ["OPP Code","Quote No.","CS Code","Job Code","Company","Service Code","Service Type","Sales Price","Total Cost","Margin%","Margin ฿","Status","Agent","Created","Lost Reason"];
const OppsPage = ({user,customers,opps,onSave,onDelete,onSaveCS,deliveries,onSaveDelivery,onDeleteDelivery,toast,costSheets,onGoToCS,initOppCode,onOppReady}) => {
  const [search,sS]=useState(""); const [fSt,setFSt]=useState([]); const [fAg,setFAg]=useState([]); const [fSvc,setFSvc]=useState([]);
  const [view,sView]=useState("kanban"); const [form,sF]=useState(false); const [edit,sE]=useState(null);
  const [logOpp,sLog]=useState(null); const [gs,sGS]=useState(false); const [quotationOpp,sQT]=useState(null);
  const [dragId,setDragId]=useState(null); const [dragOver,setDragOver]=useState(null);
  const [sort,setSort]=useState({col:"oppCode",dir:"asc"});
  const toggleSort=col=>setSort(p=>({col,dir:p.col===col&&p.dir==="asc"?"desc":"asc"}));
  const SortIcon=({col})=>sort.col===col?<span style={{marginLeft:3,fontSize:9,color:"#0f172a"}}>{sort.dir==="asc"?"":""}</span>:<span style={{marginLeft:3,fontSize:9,color:"#cbd5e1"}}>⇅</span>;
  useEffect(()=>{if(initOppCode){const o=opps.find(x=>x.oppCode===initOppCode);if(o){sE(o);sF(true);}if(onOppReady)onOppReady();}},[initOppCode]);
  const list=useMemo(()=>{
    const filtered=opps.filter(o=>{const c=customers.find(x=>x.id===o.custId);const q=search.toLowerCase();return(!search||o.oppCode.toLowerCase().includes(q)||(c?.companyEN||"").toLowerCase().includes(q)||o.quoteNo.toLowerCase().includes(q)||o.serviceCode.toLowerCase().includes(q))&&(fSt.length===0||fSt.includes(o.status))&&(fAg.length===0||fAg.includes(o.assignedTo))&&(fSvc.length===0||fSvc.includes(o.serviceCode));});
    const {col,dir}=sort;
    const getV=o=>{
      const c=customers.find(x=>x.id===o.custId);
      if(col==="oppCode")    return o.oppCode||"";
      if(col==="quoteNo")    return o.quoteNo||"";
      if(col==="csCode")     return o.csCode||"";
      if(col==="company")    return (c?.companyEN||"").toLowerCase();
      if(col==="ranking")    return ["High","Medium","Low"].indexOf(o.ranking||"Medium");
      if(col==="crmStatus")  return CRM_STATUSES.indexOf(c?.status||"");
      if(col==="serviceCode")return o.serviceCode||"";
      if(col==="salesPrice") return o.salesPrice||0;
      if(col==="totalCost")  return o.totalCost||0;
      if(col==="margin")     return o.salesPrice>0?(o.salesPrice-(o.totalCost||0))/o.salesPrice:0;
      if(col==="status")     return OPP_STATUSES.indexOf(o.status);
      if(col==="agent")      return (USERS.find(u=>u.id===o.assignedTo)?.name||"").toLowerCase();
      if(col==="log")        return o.activityLog?.length||0;
      return "";
    };
    return [...filtered].sort((a,b)=>{
      const va=getV(a),vb=getV(b);
      const cmp=(typeof va==="number"&&typeof vb==="number")?va-vb:String(va).localeCompare(String(vb),"th");
      return dir==="asc"?cmp:-cmp;
    });
  },[opps,customers,search,fSt,fAg,fSvc,sort]);
  const totalPipeline=list.filter(o=>o.status!=="Lost").reduce((s,o)=>s+o.salesPrice,0);
  const totalWon=list.filter(o=>o.status==="Won").reduce((s,o)=>s+o.salesPrice,0);

  const handleSave=o=>{
    if(o.status==="Won"&&o.jobCode){
      const exists=deliveries.find(d=>d.oppCode===o.oppCode);
      if(!exists){
        const buildInstFromSrc=(srcInst,cv)=>srcInst.map((ins,i)=>({id:uid(),seq:i+1,label:ins.label||`Installment ${i+1}`,pct:ins.pct||0,amount:Math.round((cv||0)*(ins.pct||0)/100),invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending",recvMonth:ins.recvMonth||i+1}));
        const autoInst=(()=>{const cs2=(costSheets||[]).find(c2=>(c2.quoteOverrides||[]).some(q=>q.quoteNo===o.quoteNo));const qo2=cs2?(cs2.quoteOverrides||[]).find(q=>q.quoteNo===o.quoteNo):null;if(qo2?.installments?.length>0)return buildInstFromSrc(qo2.installments,o.salesPrice);const qdInst=o?.quotationData?.installments||[];if(qdInst.length>0)return buildInstFromSrc(qdInst,o.salesPrice);return[];})();
        const dlv={id:`DLV-${o.oppCode.replace("OPP-","")}`,custId:o.custId,oppCode:o.oppCode,quoteNo:o.quoteNo,jobCode:o.jobCode,contractNo:"",contractDate:"",serviceCode:o.serviceCode,serviceType:o.serviceType,totalContractValue:o.salesPrice,deliveryStatus:"In Progress",currentStep:DLV_STEPS[0],deliveryDate:"",assignedTo:o.assignedTo,workLog:[{id:uid(),ts:nowTS(),author:user.id,note:`Auto-created from ${o.oppCode} — Won.`}],installments:autoInst,paymentTerm:"30 days",remark:""};
        onSaveDelivery(dlv);
        toast("Delivery auto-created",`${o.jobCode} added to Delivery tab`);
      }
    }
    onSave(o); sF(false); sE(null);
    toast("Opportunity saved",`${o.oppCode} · ${o.status}`);
  };

  //  Drag and Drop state 

  const kanbanView = (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {OPP_STATUSES.map(status => {
        const col=list.filter(o=>o.status===status);
        const cv=col.reduce((s,o)=>s+o.salesPrice,0);
        const isDragTarget = dragOver===status;
        return (
          <div key={status}
            onDragOver={e=>{e.preventDefault();setDragOver(status);}}
            onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDragOver(null);}}
            onDrop={e=>{
              e.preventDefault();
              if(dragId&&dragId!==status){
                const opp=opps.find(o=>o.id===dragId||o.oppCode===dragId);
                if(opp&&opp.status!==status){
                  const wasWon=opp.status==="Won";
                  const nowWon=status==="Won";
                  const updated={...opp,status,
                    lostReason:status==="Lost"?opp.lostReason:"",
                    jobCode:nowWon?genJobCode(opp.oppCode):"",
                    activityLog:[...(opp.activityLog||[]),{id:uid(),ts:nowTS(),author:user.id,note:`Status changed from ${opp.status} to ${status} (drag & drop)`}]
                  };
                  // ถ้าเคย Won แล้วเปลี่ยนกลับ → ลบ Delivery ทิ้ง
                  if(wasWon&&!nowWon){
                    const dlv=deliveries.find(d=>d.oppCode===opp.oppCode);
                    if(dlv&&onDeleteDelivery) onDeleteDelivery(dlv.id);
                  }

                  handleSave(updated);
                }
              }
              setDragId(null);setDragOver(null);
            }}
          >
            <div style={{padding:"10px 13px",borderRadius:"7px 7px 0 0",background:STATUS_CLR[status],transition:"filter .15s",filter:isDragTarget?"brightness(1.15)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#fff",fontWeight:800,fontSize:13}}>{status}</span><span style={{background:"rgba(255,255,255,.25)",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{col.length}</span></div>
              <div style={{color:"rgba(255,255,255,.8)",fontSize:11,marginTop:3}}>฿{fmtM(cv)}</div>
            </div>
            <div style={{background:isDragTarget?"#f0f9ff":"#f8fafc",border:`1.5px ${isDragTarget?"dashed #3b82f6":"solid #e2e8f0"}`,borderTop:"none",borderRadius:"0 0 7px 7px",padding:10,minHeight:120,transition:"background .15s, border .15s"}}>
              {col.map(o=>{
                const c=customers.find(x=>x.id===o.custId);
                const mg=margin(o.salesPrice,o.totalCost||0);
                const isDragging=dragId===o.id||dragId===o.oppCode;
                return(
                  <div key={o.id}
                    draggable
                    onDragStart={e=>{
                      e.dataTransfer.effectAllowed="move";
                      setDragId(o.id);
                    }}
                    onDragEnd={()=>{setDragId(null);setDragOver(null);}}
                    onClick={()=>{sE(o);sF(true);}}
                    style={{
                      background:"#fff",
                      border:`1px solid ${isDragging?"#3b82f6":"#e2e8f0"}`,
                      borderRadius:7,padding:"10px 12px",marginBottom:8,
                      cursor:"grab",
                      opacity:isDragging?.45:1,
                      boxShadow:isDragging?"0 8px 24px rgba(59,130,246,.25)":"0 1px 3px rgba(0,0,0,.05)",
                      transform:isDragging?"scale(1.02)":"none",
                      transition:"opacity .15s, box-shadow .15s, transform .1s",
                      userSelect:"none",
                    }}
                  >
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#1e40af",fontFamily:"monospace"}}>{o.oppCode}</div>
                      <span style={{color:"#cbd5e1",fontSize:14,cursor:"grab",lineHeight:1}}></span>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:"#0f172a",marginBottom:4,lineHeight:1.3}}>{c?.companyEN||"-"}</div>
                    {o.csCode&&<div style={{marginBottom:5}}><span style={{fontFamily:"monospace",fontWeight:700,fontSize:10,background:"#fef3c7",color:"#92400e",padding:"2px 7px",borderRadius:4,border:"1px solid #fde68a"}}>{o.csCode}</span></div>}
                    <div style={{display:"flex",gap:5,marginBottom:6,flexWrap:"wrap"}}><SvcBadge code={o.serviceCode}/><span style={{background:+mg>=30?"#dcfce7":"#fee2e2",color:+mg>=30?"#16a34a":"#dc2626",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4}}>{mg}%</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:900,fontSize:13}}>฿{fmt(o.salesPrice)}</span>
                      <span style={{fontSize:10,color:"#94a3b8"}}>{USERS.find(u=>u.id===o.assignedTo)?.name.split(" ")[0]||"-"}</span>
                    </div>
                    {o.status==="Lost"&&o.lostReason&&<div style={{marginTop:4,fontSize:10,color:"#dc2626",background:"#fee2e2",padding:"2px 6px",borderRadius:3}}>{o.lostReason}</div>}
                    {o.status==="Won"&&o.jobCode&&<div style={{marginTop:4,fontSize:10,color:"#16a34a",fontFamily:"monospace"}}>{o.jobCode}</div>}
                    <div style={{display:"flex",gap:4,marginTop:6,alignItems:"center",flexWrap:"wrap"}}>
                      <button onClick={e=>{e.stopPropagation();sLog(o);}} style={{border:"1px solid #e2e8f0",borderRadius:4,background:"#f8fafc",cursor:"pointer",padding:"2px 6px",fontSize:10,color:"#64748b"}}> {o.activityLog?.length||0}</button>
                      <Sel value={o.status} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();const updated={...o,status:e.target.value,lostReason:e.target.value==="Lost"?o.lostReason:"",jobCode:e.target.value==="Won"?genJobCode(o.oppCode):o.jobCode,activityLog:[...(o.activityLog||[]),{id:uid(),ts:nowTS(),author:user.id,note:`Status → ${e.target.value}`}]};handleSave(updated);}} style={{fontSize:10,padding:"2px 5px",flex:1,minWidth:85,background:STATUS_CLR[o.status]+"22",color:STATUS_CLR[o.status],fontWeight:700,border:`1px solid ${STATUS_CLR[o.status]}66`}}>
                        {OPP_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                      </Sel>
                    </div>
                  </div>
                );
              })}
              {isDragTarget&&dragId&&<div style={{border:"2px dashed #3b82f6",borderRadius:7,padding:"16px",textAlign:"center",color:"#3b82f6",fontSize:12,fontWeight:600,background:"#eff6ff",marginBottom:8}}>Drop here → {status}</div>}
              <button onClick={()=>{sE(null);sF(true);}} style={{width:"100%",padding:6,border:"1.5px dashed #cbd5e1",borderRadius:6,background:"none",color:"#94a3b8",cursor:"pointer",fontSize:11}}>+ Add</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Opportunities</Span><Span s={13} c="#94a3b8" style={{marginLeft:8}}>{list.length} · Pipeline ฿{fmtM(totalPipeline)} · Won ฿{fmtM(totalWon)}</Span></div>
        <div style={{display:"flex",gap:8}}><Btn variant="export" onClick={()=>dlCSV("opps.csv",OPP_HDR,list.map(o=>{const c=customers.find(x=>x.id===o.custId);const mg=margin(o.salesPrice,o.totalCost||0);return[o.oppCode,o.quoteNo,o.csCode||"",o.jobCode||"",c?.companyEN||"",o.serviceCode,o.serviceType,o.salesPrice,o.totalCost||0,mg,marginAmt(o.salesPrice,o.totalCost||0),o.status,USERS.find(u=>u.id===o.assignedTo)?.name||"",o.createdDate,o.lostReason||""];}))}>↓ CSV</Btn></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search…" style={{maxWidth:220}}/>
        <MultiSelect label="Status"  options={OPP_STATUSES.map(s=>({value:s,label:s}))}       selected={fSt}  onChange={setFSt}  width={150}/>
        <MultiSelect label="Service" options={SERVICES.map(s=>({value:s.code,label:s.code}))} selected={fSvc} onChange={setFSvc} width={150}/>
        <MultiSelect label="Agents"  options={SALES_USERS.map(u=>({value:u.id,label:u.name.split(" ")[0]}))} selected={fAg} onChange={setFAg} width={175}/>
        <div style={{flex:1}}/>
        <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
          {[["table"," Table"],["kanban","⊞ Kanban"]].map(([k,l])=>(
            <button key={k} onClick={()=>sView(k)} style={{padding:"7px 14px",border:"none",background:view===k?"#0f172a":"#fff",color:view===k?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:view===k?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      {view==="table"&&(
        <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#f8fafc"}}>
            {[
              {label:"OPP Code",     col:"oppCode"},
              {label:"QT No.",       col:"quoteNo"},
              {label:"CS Code",      col:"csCode"},
              {label:"Company",      col:"company"},
              {label:"Code",         col:"serviceCode"},
              {label:"Price",        col:"salesPrice"},
              {label:"Cost",         col:"totalCost"},
              {label:"Margin % / ฿", col:"margin"},
              {label:"Status",       col:"status"},
              {label:"Agent",        col:"agent"},
              {label:"Ranking",      col:"ranking"},
              {label:"Log",          col:"log"},
            ].map(({label,col})=>(
              <th key={col} onClick={()=>toggleSort(col)}
                style={{padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:"pointer",userSelect:"none",color:sort.col===col?"#0f172a":"#64748b",background:sort.col===col?"#f1f5f9":"#f8fafc"}}>
                {label}<SortIcon col={col}/>
              </th>
            ))}
          </tr></thead>
          <tbody>{list.map(o=>{const c=customers.find(x=>x.id===o.custId);const mg=margin(o.salesPrice,o.totalCost||0);const mAmt=marginAmt(o.salesPrice,o.totalCost||0);const oRank=o.ranking||"Medium";return(
            <TR key={o.id}>
              <TD style={{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:12}}>{o.oppCode}</TD>
              <TD>
                {o.quoteNo
                  ? <button onClick={e=>{e.stopPropagation();sE(o);sQT(o);}} style={{fontFamily:"monospace",fontSize:11,background:"none",border:"none",color:"#1e40af",cursor:"pointer",padding:0,textDecoration:"underline",fontWeight:600}}>{o.quoteNo}</button>
                  : "—"}
              </TD>
              <TD>
                {o.csCode
                  ? <button onClick={e=>{e.stopPropagation();if(onGoToCS)onGoToCS(o.serviceCode);}} style={{fontFamily:"monospace",fontWeight:700,fontSize:11,background:"none",color:"#1e40af",padding:"2px 0",border:"none",cursor:"pointer",textDecoration:"underline"}}>{o.csCode}</button>
                  : "—"}
              </TD>
              <TD w={180}>{c?.companyEN||"-"}</TD>
              <TD><SvcBadge code={o.serviceCode}/></TD>
              <TD right style={{fontWeight:700}}>฿{fmt(o.salesPrice)}</TD>
              <TD right style={{color:"#64748b"}}>฿{fmt(o.totalCost||0)}</TD>
              <TD>
                <Span s={12} w={700} c={+mg>=30?"#16a34a":"#dc2626"}>{mg}%</Span>
                <div style={{fontSize:10,fontWeight:600,color:+mg>=30?"#16a34a":"#dc2626"}}>฿{fmt(mAmt)}</div>
              </TD>
              <TD>
                <Badge value={o.status} colorMap={Object.fromEntries(OPP_STATUSES.map((s,i)=>[s,{c:STAGE_COLORS[i]}]))}/>
                {o.status==="Lost"&&o.lostReason&&<div style={{fontSize:10,color:"#dc2626",marginTop:2}}>{o.lostReason}</div>}
                {o.status==="Won"&&o.jobCode&&<div style={{fontSize:10,color:"#16a34a",fontFamily:"monospace",fontWeight:700,marginTop:2}}>{o.jobCode}</div>}
              </TD>
              <TD>{USERS.find(u=>u.id===o.assignedTo)?.name.split(" ")[0]||"-"}</TD>
              <TD>{oRank?<span style={{background:RANK_CLR[oRank]?.bg||"#f1f5f9",color:RANK_CLR[oRank]?.c||"#64748b",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{oRank}</span>:"—"}</TD>
              <TD><button onClick={e=>{e.stopPropagation();sLog(o);}} style={{border:"1px solid #e2e8f0",borderRadius:5,background:"#f8fafc",cursor:"pointer",padding:"3px 9px",fontSize:11}}> {o.activityLog?.length||0}</button></TD>
              <TD><Btn variant="ghost" style={{fontSize:11,padding:"3px 10px"}} onClick={e=>{e.stopPropagation();sE(o);sF(true);}}>Edit</Btn></TD>
            </TR>
          );})}
          </tbody>
        </table>{list.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No records.</div>}</div></Card>
      )}
      {view==="kanban"&&kanbanView}

      {form&&<OppForm initial={edit} customers={customers} opps={opps} user={user} onSave={handleSave} onClose={()=>{sF(false);sE(null);sQT(null);}} costSheets={costSheets} onGoToCS={onGoToCS} onDelete={o=>{
        onDelete(o.id);
        // Clean CS: remove saveLog entries + quoteOverrides matching this quoteNo/oppCode
        if(onSaveCS&&(o.quoteNo||o.oppCode)){
          const cs=(costSheets||[]).find(c=>(c.quoteOverrides||[]).some(q=>q.quoteNo===o.quoteNo||q.oppCode===o.oppCode)||(c.saveLog||[]).some(l=>l.quoteSnapshot?.quoteNo===o.quoteNo));
          if(cs){
            onSaveCS({...cs,
              quoteOverrides:(cs.quoteOverrides||[]).filter(q=>q.quoteNo!==o.quoteNo&&q.oppCode!==o.oppCode),
              saveLog:(cs.saveLog||[]).filter(l=>!l.quoteSnapshot||(l.quoteSnapshot.quoteNo!==o.quoteNo&&l.quoteSnapshot.oppCode!==o.oppCode)),
            });
          }
        }
        sF(false);sE(null);sQT(null);
        toast("Opportunity deleted",o.oppCode,"error");
      }}/>}
      {quotationOpp&&!form&&<QuotationPreview opp={quotationOpp} customer={customers.find(c=>c.id===quotationOpp.custId)} costSheets={costSheets||[]} onClose={()=>sQT(null)} onSaveQuotation={qd=>{onSave({...quotationOpp,quotationData:qd});sQT(null);}}/>}
      {logOpp&&(
        <Modal title={`Activity Log — ${logOpp.oppCode}`} width={680} onClose={()=>sLog(null)}>
          <div style={{marginBottom:12,padding:"8px 14px",background:"#f8fafc",borderRadius:6,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <Span s={12} c="#64748b">{customers.find(c=>c.id===logOpp.custId)?.companyEN}</Span>
            <Badge value={logOpp.status} colorMap={Object.fromEntries(OPP_STATUSES.map((s,i)=>[s,{c:STAGE_COLORS[i]}]))}/>
            <SvcBadge code={logOpp.serviceCode}/>
            <Span s={12} w={700} c="#0f172a">฿{fmt(logOpp.salesPrice)}</Span>
          </div>
          <ActivityLog logs={logOpp.activityLog||[]} currentUser={user} onAdd={entry=>{const up={...logOpp,activityLog:[...(logOpp.activityLog||[]),entry]};onSave(up);sLog(up);toast("Log added",logOpp.oppCode);}} placeholder="Log a call, meeting, or follow-up…"/>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><Btn onClick={()=>sLog(null)}>Done</Btn></div>
        </Modal>
      )}
    </div>
  );
};

// 
// DELIVERY
// 
// Req 10: Cost breakdown panel from cost sheet
const CostBreakdown = ({quoteNo,costSheets}) => {
  const q = useMemo(()=>{
    for(const cs of costSheets){
      const found=(cs.quoteOverrides||[]).find(qo=>qo.quoteNo===quoteNo);
      if(found)return{cs,q:found};
    }
    return null;
  },[quoteNo,costSheets]);
  if(!q)return<div style={{padding:12,color:"#94a3b8",fontSize:13}}>No per-quotation cost sheet found for {quoteNo}.</div>;
  const {cs,q:qo}=q;
  const qIH=calcIH(qo.inHouseCosts||[]);
  const qOS=calcOS(qo.outsourceCosts||[]);
  const qTV=calcTrv(qo.travelCosts||[],true);
  const qTC=qIH+qOS+qTV;
  const mg=margin(qo.salesPrice,qTC);
  const csCode=qo.csCode||genCSCode(qo.quoteNo||"");
  const salesAgentUser=USERS.find(u=>u.id===qo.salesAgent);
  return (
    <div style={{padding:16}}>
      {/* CS Code link header */}
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,padding:"10px 14px",background:"#fef3c7",border:"1px solid #fde68a",borderRadius:7,flexWrap:"wrap"}}>
        <span style={{fontSize:15}}></span>
        <div><Span s={10} c="#92400e" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block"}}>Cost Sheet & Pricing Code</Span><span style={{fontFamily:"monospace",fontWeight:900,fontSize:15,color:"#92400e"}}>{csCode}</span></div>
        <div style={{marginLeft:8}}><Span s={10} c="#64748b" style={{textTransform:"uppercase",display:"block"}}>Linked to</Span><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#1e40af"}}>{qo.quoteNo}</span></div>
        <div style={{marginLeft:8}}><Span s={10} c="#64748b" style={{textTransform:"uppercase",display:"block"}}>OPP Code</Span><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#1e40af"}}>{qo.oppCode||"—"}</span></div>
        <div style={{marginLeft:8}}><Span s={10} c="#64748b" style={{textTransform:"uppercase",display:"block"}}>Sales Agent</Span><span style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>{salesAgentUser?.name||qo.salesAgent||"—"}</span></div>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:14}}>
        {[{l:"Sales Price",v:qo.salesPrice,c:"#0f172a"},{l:"In-House",v:qIH},{l:"Outsource",v:qOS},{l:"Travel (Co.)",v:qTV},{l:"Total Cost",v:qTC,bold:true},{l:"Margin",v:`${mg}%`,c:+mg>=30?"#16a34a":"#dc2626"}].map(x=>(
          <div key={x.l} style={{textAlign:"center",padding:"9px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6}}>
            <Span s={10} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>{x.l}</Span>
            <div style={{fontWeight:x.bold?900:700,fontSize:15,color:x.c||"#374151"}}>{typeof x.v==="number"?`฿${fmt(x.v)}`:x.v}</div>
          </div>
        ))}
      </div>
      {/* IH breakdown */}
      {(qo.inHouseCosts||[]).length>0&&(
        <div style={{marginBottom:10}}>
          <Span s={11} w={700} c="#64748b" style={{display:"block",marginBottom:5,textTransform:"uppercase"}}>In-House (Man-hours)</Span>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <TH cols={["Label","Level","Hours","Rate/hr","Total","Assigned To"]}/>
            <tbody>{(qo.inHouseCosts||[]).map(r=>(
              <TR key={r.id}>
                <TD>{r.label}</TD><TD>{r.level}</TD><TD right>{r.hours}</TD><TD right>฿{fmt(r.ratePerHour)}</TD>
                <TD right style={{fontWeight:700}}>฿{fmt(r.hours*r.ratePerHour)}</TD>
                <TD>{USERS.find(u=>u.id===r.assignedAgent)?.name||r.assignedAgent||"—"}</TD>
              </TR>
            ))}</tbody>
          </table>
        </div>
      )}
      {/* OS breakdown */}
      {(qo.outsourceCosts||[]).length>0&&(
        <div>
          <Span s={11} w={700} c="#64748b" style={{display:"block",marginBottom:5,textTransform:"uppercase"}}>Outsource Costs</Span>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <TH cols={["Label","Vendor / Person","Amount"]}/>
            <tbody>{(qo.outsourceCosts||[]).map(r=>(
              <TR key={r.id}><TD>{r.label}</TD><TD>{r.vendorName||"—"}</TD><TD right style={{fontWeight:700}}>฿{fmt(r.amount)}</TD></TR>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DeliveryForm = ({initial,customers,opps,user,onSave,onClose,costSheets,initTab="detail"}) => {
  const wonOpps=opps.filter(o=>o.status==="Won");
  const blank={id:`DLV-${uid()}`,custId:"",oppCode:"",quoteNo:"",jobCode:"",contractNo:"",contractDate:"",serviceCode:"",serviceType:"",totalContractValue:0,deliveryStatus:"In Progress",currentStep:DLV_STEPS[0],deliveryDate:"",assignedTo:SALES_USERS[0]?.id||"",workLog:[],installments:[],paymentTerm:"30 days",remark:""};
  const [f,sF] = useState(initial?{...initial,workLog:initial.workLog||[]}:blank);
  // Auto-sync installments on mount when editing existing delivery
  useEffect(()=>{
    if(initial?.quoteNo&&(!initial.installments||initial.installments.length===0)){
      syncInstByQuote(initial.quoteNo,initial.totalContractValue||0);
    }
  // eslint-disable-next-line
  },[]);
  const [tab,sTab] = useState(initTab);
  const [noteInput,sNoteInput] = useState("");
  const set=(k,v)=>sF(p=>({...p,[k]:v}));
  // Build installments from a source array + contract value
  const buildInstFromSource=(srcInst,cv)=>srcInst.map((ins,i)=>({
    id:uid(),seq:i+1,
    label:ins.label||ins.description||`Installment ${i+1}`,
    pct:ins.pct||0,
    amount:Math.round((cv||0)*(ins.pct||0)/100),
    invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending",
    recvMonth:ins.recvMonth||i+1,
  }));

  // Resolve installments for a given OPP + quoteNo:
  //   1. Per-Q Cost Sheet quoteOverrides[quoteNo].installments  (primary — per-Q CS installments)
  //   2. opp.quotationData.installments  (Payment Schedule saved in Quotation tab)
  //   returns [] if neither source has data — NO fallback single-payment row
  const resolveInstallments=(o,cv)=>{
    // 1. Per-Q CS installments — search ALL costSheets for matching quoteNo
    const cs=(costSheets||[]).find(c=>(c.quoteOverrides||[]).some(q=>q.quoteNo===o?.quoteNo));
    const qo=cs?(cs.quoteOverrides||[]).find(q=>q.quoteNo===o?.quoteNo):null;
    if(qo?.installments?.length>0) return buildInstFromSource(qo.installments,cv);
    // 2. Quotation tab payment schedule (secondary)
    const qdInst=o?.quotationData?.installments||[];
    if(qdInst.length>0) return buildInstFromSource(qdInst,cv);
    // Nothing found — no fallback row, user fills manually
    return [];
  };

  // Fill all fields when OPP Code is selected
  const fillOpp=oppCode=>{
    const o=[...wonOpps,...opps].find(x=>x.oppCode===oppCode);
    if(!o) return;
    const cv=o.salesPrice||0;
    const inst=resolveInstallments(o,cv);
    sF(p=>({...p,
      oppCode:o.oppCode,custId:o.custId,quoteNo:o.quoteNo,
      serviceCode:o.serviceCode,serviceType:o.serviceType,
      totalContractValue:cv,
      jobCode:o.jobCode||genJobCode(o.oppCode),
      ...(inst.length>0?{installments:inst}:{}),
    }));
  };

  // Re-sync installments when Quote No. field changes manually OR on demand
  const syncInstByQuote=(quoteNo,cv)=>{
    const o=opps.find(x=>x.quoteNo===quoteNo);
    if(o){
      const inst=resolveInstallments(o,cv!=null?cv:f.totalContractValue||0);
      if(inst.length>0){sF(p=>({...p,installments:inst}));}
      return;
    }
    const cs=(costSheets||[]).find(c=>(c.quoteOverrides||[]).some(q=>q.quoteNo===quoteNo));
    const qo=cs?(cs.quoteOverrides||[]).find(q=>q.quoteNo===quoteNo):null;
    if(qo?.installments?.length>0)
      sF(p=>({...p,installments:buildInstFromSource(qo.installments,cv!=null?cv:f.totalContractValue||0)}));
  };
  const cust=customers.find(c=>c.id===f.custId);
  const totalPct=(f.installments||[]).reduce((s,i)=>s+i.pct,0);
  const totalRec=(f.installments||[]).filter(i=>i.status==="Received").reduce((s,i)=>s+i.amount,0);
  const changeIns=(idx,k,v)=>sF(p=>{const ins=p.installments.map((ins2,i)=>{if(i!==idx)return ins2;const upd={...ins2,[k]:k==="pct"?+v:v};if(k==="pct")upd.amount=Math.round(p.totalContractValue*(+v||0)/100);return upd;});return{...p,installments:ins};});
  const setCv=v=>sF(p=>({...p,totalContractValue:+v,installments:p.installments.map(ins=>({...ins,amount:Math.round((+v)*(ins.pct||0)/100)}))}));
  const addIns=()=>sF(p=>({...p,installments:[...p.installments,{id:uid(),seq:p.installments.length+1,label:`Installment ${p.installments.length+1}`,pct:0,amount:0,invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending"}]}));
  const delIns=idx=>sF(p=>({...p,installments:p.installments.filter((_,i)=>i!==idx)}));
  return (
    <Modal title={initial?`Edit — ${f.jobCode||f.id}`:"Add Delivery"} width={1000} onClose={onClose}>
      <div style={{display:"flex",gap:0,borderBottom:"2px solid #e2e8f0",marginBottom:16}}>
        {[["detail","Contract & Billing"],["steps","Progress Steps"],["log",`Work Log (${f.workLog?.length||0})`],["cost","Pricing Breakdown"]].map(([k,l])=>(
          <button key={k} onClick={()=>sTab(k)} style={{padding:"8px 16px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:tab===k?800:500,color:tab===k?"#0f172a":"#94a3b8",borderBottom:tab===k?"2.5px solid #0f172a":"2.5px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {tab==="detail"&&(
        <>
          <G2>
            <FRow label="Link OPP Code (Won)"><Sel value={f.oppCode} onChange={e=>{set("oppCode",e.target.value);fillOpp(e.target.value);}}><option value="">— Select Won OPP —</option>{wonOpps.map(o=><option key={o.id} value={o.oppCode}>{o.oppCode} — {customers.find(c=>c.id===o.custId)?.companyEN}</option>)}</Sel></FRow>
            <FRow label="Job Code (Primary)"><Inp value={f.jobCode} onChange={e=>set("jobCode",e.target.value)} style={{fontFamily:"monospace",fontWeight:900,fontSize:15,color:"#16a34a"}}/></FRow>
            <div style={{gridColumn:"1/-1"}}><FRow label="Company"><Inp value={cust?.companyEN||""} readOnly style={{background:"#f8fafc",color:"#64748b",fontWeight:700}}/></FRow></div>
            <FRow label="Quote No."><Inp value={f.quoteNo} onChange={e=>{set("quoteNo",e.target.value);syncInstByQuote(e.target.value,f.totalContractValue);}} style={{fontFamily:"monospace"}}/></FRow>
            <FRow label="Service Type"><Inp value={f.serviceType} readOnly style={{background:"#f8fafc"}}/></FRow>
            <FRow label="Total Contract Value (THB)" tip="Recalculates all installments"><NumInp value={f.totalContractValue} onChange={v=>setCv(v)}/></FRow>
            <FRow label="Delivery Status"><Sel value={f.deliveryStatus} onChange={e=>set("deliveryStatus",e.target.value)}>{DLV_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel></FRow>
            <FRow label="Contract No."><Inp value={f.contractNo} onChange={e=>set("contractNo",e.target.value)}/></FRow>
            <FRow label="Contract Date"><Inp type="date" value={f.contractDate} onChange={e=>set("contractDate",e.target.value)}/></FRow>
            <FRow label="Delivery Date"><Inp type="date" value={f.deliveryDate} onChange={e=>set("deliveryDate",e.target.value)}/></FRow>
            <FRow label="Payment Term"><Sel value={f.paymentTerm} onChange={e=>set("paymentTerm",e.target.value)}>{["Cash","7 days","15 days","30 days","45 days","60 days"].map(v=><option key={v}>{v}</option>)}</Sel></FRow>
            <FRow label="Assigned Agent"><Sel value={f.assignedTo} onChange={e=>set("assignedTo",e.target.value)}>{USERS.filter(u=>u.role!=="operation").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</Sel></FRow>
            <div style={{gridColumn:"1/-1"}}>
              <FRow label="Note Log">
                <div style={{border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
                  {f.remark&&[...f.remark.split("\n").filter(Boolean)].reverse().map((line,i)=>(
                    <div key={i} style={{padding:"6px 10px",fontSize:12,color:"#374151",borderBottom:"1px solid #f1f5f9",background:"#fafafa"}}>{line}</div>
                  ))}
                  <div style={{display:"flex",gap:0}}>
                    <Inp value={noteInput} onChange={e=>sNoteInput(e.target.value)} placeholder={`Add note… (${today()})`}
                      onKeyDown={e=>{if(e.key==="Enter"&&noteInput.trim()){set("remark",(f.remark?f.remark+"\n":"")+`[${today()}] ${noteInput.trim()}`);sNoteInput("");}}}
                      style={{borderRadius:0,background:"#fff",flex:1,border:"none",borderTop:"1px solid #f1f5f9"}}/>
                  </div>
                </div>
              </FRow>
            </div>
          </G2>
          <Divider/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <Span s={13} w={700}>Installment Schedule</Span>
              <Span s={11} c="#94a3b8">Auto-synced from Quotation Payment Schedule</Span>
              <button onClick={()=>{
                const oSync=opps.find(x=>x.quoteNo===f.quoteNo);
                const inst=resolveInstallments(oSync,f.totalContractValue||0);
                if(inst.length>0) sF(p=>({...p,installments:inst}));
              }} style={{fontSize:10,color:"#94a3b8",background:"transparent",border:"none",padding:"2px 4px",cursor:"pointer",whiteSpace:"nowrap",textDecoration:"underline",textDecorationStyle:"dotted"}} title="Re-load installment schedule from the linked Quotation payment plan">Sync from Quotation</button>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Span s={12} w={700} c={Math.abs(totalPct-100)<.1?"#16a34a":"#dc2626"}>Total: {totalPct}% {Math.abs(totalPct-100)>.1?"":""}</Span>
              <Btn variant="ghost" style={{fontSize:12,padding:"4px 10px"}} onClick={addIns}>+ Add</Btn>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <TH cols={["#","Description","% Share","Amount (THB)","Invoice No.","Invoice Date","Receipt No.","Receipt Date","Status",""]}/>
              <tbody>{(f.installments||[]).map((ins,idx)=>(
                <tr key={ins.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <TD><Span s={12} w={700} c="#94a3b8">#{ins.seq}</Span></TD>
                  <TD><Inp value={ins.label} readOnly style={{padding:"4px 6px",fontSize:12,background:"transparent",border:"none",color:"#374151",cursor:"default"}}/></TD>
                  <TD><NumInp value={ins.pct} onChange={v=>changeIns(idx,"pct",v)} style={{padding:"4px 6px",fontSize:12,width:55}}/></TD>
                  <TD><NumInp value={ins.amount} onChange={v=>changeIns(idx,"amount",v)} style={{padding:"4px 6px",fontSize:12,width:90,fontWeight:700}}/></TD>
                  <TD><Inp value={ins.invoiceNo} onChange={e=>changeIns(idx,"invoiceNo",e.target.value)} style={{padding:"4px 6px",fontSize:12}}/></TD>
                  <TD><Inp type="date" value={ins.invoiceDate} onChange={e=>changeIns(idx,"invoiceDate",e.target.value)} style={{padding:"4px 6px",fontSize:12}}/></TD>
                  <TD><Inp value={ins.receiptNo} onChange={e=>changeIns(idx,"receiptNo",e.target.value)} style={{padding:"4px 6px",fontSize:12}}/></TD>
                  <TD><Inp type="date" value={ins.receiptDate} onChange={e=>changeIns(idx,"receiptDate",e.target.value)} style={{padding:"4px 6px",fontSize:12}}/></TD>
                  <TD><Sel value={ins.status} onChange={e=>changeIns(idx,"status",e.target.value)} style={{padding:"4px 6px",fontSize:12}}>{INS_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel></TD>
                  <TD><Btn variant="danger" style={{fontSize:11,padding:"2px 7px"}} onClick={()=>delIns(idx)}>×</Btn></TD>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={{display:"flex",gap:16,marginTop:10,padding:"10px 14px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0"}}>
            {[{l:"Contract Value",v:f.totalContractValue},{l:"Total Received",v:totalRec,c:"#16a34a"},{l:"Balance",v:f.totalContractValue-totalRec,c:"#d97706"}].map(x=>(
              <div key={x.l}><Span s={11} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block"}}>{x.l}</Span><div style={{fontWeight:400,fontSize:14,color:x.c||"#0f172a"}}>฿{fmt(x.v)}</div></div>
            ))}
          </div>
        </>
      )}

      {tab==="steps"&&(
        <div>
          <Span s={13} w={700} style={{display:"block",marginBottom:12}}>Click a step to update current progress</Span>
          <StepProgress steps={DLV_STEPS} current={f.currentStep} onStep={s=>set("currentStep",s)}/>
          <div style={{marginTop:20}}><FRow label="Current Step"><Sel value={f.currentStep} onChange={e=>set("currentStep",e.target.value)}>{DLV_STEPS.map(s=><option key={s}>{s}</option>)}</Sel></FRow></div>
        </div>
      )}
      {tab==="log"&&<ActivityLog logs={f.workLog||[]} currentUser={user} onAdd={entry=>sF(p=>({...p,workLog:[...(p.workLog||[]),entry]}))} placeholder="Log work progress, milestones, issues…"/>}
      {tab==="cost"&&<CostBreakdown quoteNo={f.quoteNo} costSheets={costSheets}/>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={()=>onSave(f)}>Save Delivery</Btn>
      </div>
    </Modal>
  );
};

//  DeliveryCard: proper component — collapsed summary + expandable edit mode 
const DeliveryCard = ({d, opps, costSheets, customers, user, onSave, toast, onGoToCust, onGoToOpp, sQT, onGoToCS}) => {
  const [open, setOpen]       = useState(false);   // card expanded?
  const [dirty, setDirty]     = useState(false);   // unsaved changes?
  const [localD, setLocalD]   = useState(d);       // staged local copy
  const [localInst, setLocalInst] = useState(d.installments||[]);
  const [stepExp, setStepExp] = useState(false);
  const [logExp, setLogExp]   = useState(false);
  const [newNote, setNewNote] = useState("");

  // Sync from parent when d changes (e.g. after save)
  useEffect(()=>{ setLocalD(d); setLocalInst(d.installments||[]); },[d.id, d.saveLog?.length]);

  const opp   = opps.find(o=>o.oppCode===d.oppCode);
  const cust  = customers.find(c=>c.id===d.custId);
  const agent = USERS.find(u=>u.id===(d.assignedTo||opp?.assignedTo));
  const totalRec = (d.installments||[]).filter(i=>i.status==="Received").reduce((s,i)=>s+i.amount,0);
  const lastLog = [...(d.saveLog||[])].sort((a,b)=>b.ts.localeCompare(a.ts))[0];

  //  Helpers 
  const markDirty = (updD, updInst) => {
    if(updD) setLocalD(updD);
    if(updInst) setLocalInst(updInst);
    setDirty(true);
  };
  const set = (k,v) => markDirty({...localD,[k]:v});

  //  Save: commit all staged changes + log entry, collapse card 
  const handleSave = () => {
    const entry = {id:uid(), ts:nowTS(), author:user.id, note:`${localD.jobCode||d.id} updated`};
    const committed = {...localD, installments:localInst, saveLog:[...(localD.saveLog||[]), entry]};
    onSave(committed);
    setDirty(false);
    setOpen(false);
    toast("Saved", localD.jobCode||d.id);
  };

  const handleDiscard = () => {
    setLocalD(d); setLocalInst(d.installments||[]);
    setDirty(false); setOpen(false);
  };

  //  Installment sync 
  const syncInst = () => {
    const quoteNo = localD.quoteNo||d.quoteNo;
    if(!quoteNo) return;
    let srcInst = [];
    for(const cs of costSheets||[]){
      const qo=(cs.quoteOverrides||[]).find(q=>q.quoteNo===quoteNo);
      if(qo?.installments?.length>0){ srcInst=qo.installments; break; }
      const snap=(cs.saveLog||[]).find(l=>l.quoteSnapshot?.quoteNo===quoteNo);
      if(snap?.quoteSnapshot?.installments?.length>0){ srcInst=snap.quoteSnapshot.installments; break; }
    }
    if(srcInst.length===0){
      const oq=opps.find(x=>x.quoteNo===quoteNo);
      srcInst=oq?.quotationData?.installments||[];
    }
    if(srcInst.length===0){ toast("No installments found","Check that the Quotation has a saved Payment Schedule"); return; }
    const cv=localD.totalContractValue||0;
    const inst=srcInst.map((ins,i)=>({
      id:uid(),seq:i+1,label:ins.label||ins.description||`Installment ${i+1}`,
      pct:ins.pct||0,amount:Math.round(cv*(ins.pct||0)/100),
      invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending",recvMonth:ins.recvMonth||i+1,
    }));
    markDirty(null, inst);

  };
  useEffect(()=>{ if((d.installments||[]).length===0&&d.quoteNo) syncInst(); },[]);

  const changeLocalIns=(insId,k,v)=>{
    const next=localInst.map(ins=>{
      if(ins.id!==insId) return ins;
      const u={...ins,[k]:k==="pct"?+v:v};
      if(k==="pct") u.amount=Math.round((localD.totalContractValue||0)*(+v||0)/100);
      return u;
    });
    markDirty(null, next);
  };

  //  Work log (saves immediately, no dirty flag needed) 
  const addLog = () => {
    if(!newNote.trim()) return;
    const entry={id:uid(),ts:nowTS(),author:user.id,note:newNote.trim()};
    const logEntry={id:uid(),ts:nowTS(),author:user.id,note:`Work log: ${newNote.trim().slice(0,60)}`};
    const committed={...d,workLog:[...(d.workLog||[]),entry],saveLog:[...(d.saveLog||[]),logEntry]};
    onSave(committed);
    setLocalD(committed);
    setNewNote("");
    toast("Log added","");
  };

  const totalPct = localInst.reduce((s,i)=>s+(i.pct||0),0);

  //  COLLAPSED VIEW 
  if(!open) return (
    <Card style={{overflow:"hidden"}}>
      <div style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,background:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:280,flexWrap:"wrap"}}>
          <span style={{fontSize:18,fontWeight:900,color:"#0f172a",fontFamily:"monospace",letterSpacing:"-0.02em"}}>{d.jobCode||d.id}</span>
          <Badge value={d.deliveryStatus} colorMap={Object.fromEntries(DLV_STATUSES.map(s=>[s,{c:STATUS_CLR[s]}]))}/>
          <SvcBadge code={d.serviceCode}/>
          <span style={{fontSize:12,color:"#64748b"}}>{cust?.companyEN||d.custId}</span>
          <span style={{fontSize:11,fontFamily:"monospace",color:"#94a3b8"}}>{d.quoteNo||""}</span>
          {d.currentStep&&<span style={{fontSize:10,background:"#f1f5f9",color:"#374151",padding:"2px 8px",borderRadius:10,fontWeight:600}}>{d.currentStep}</span>}
          {lastLog&&<span style={{fontSize:10,color:"#94a3b8"}}>Last saved: {lastLog.ts}</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {[{l:"Contract",v:d.totalContractValue,c:"#0f172a"},{l:"Received",v:totalRec,c:"#16a34a"},{l:"Balance",v:d.totalContractValue-totalRec,c:"#d97706"}].map(x=>(
            <div key={x.l} style={{textAlign:"center",minWidth:80}}>
              <Span s={9} c="#94a3b8" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.06em"}}>{x.l}</Span>
              <span style={{fontSize:13,fontWeight:900,color:x.c}}>฿{fmt(x.v)}</span>
            </div>
          ))}
          <Btn variant="ghost" onClick={()=>setOpen(true)} style={{fontSize:12,padding:"5px 14px"}}>Edit</Btn>
        </div>
      </div>
      {(d.saveLog||[]).length>0&&(
        <div style={{padding:"5px 20px",borderTop:"1px solid #f1f5f9",background:"#fafafa",display:"flex",gap:10,alignItems:"center",fontSize:10}}>
          <span style={{color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Latest:</span>
          <span style={{color:"#64748b",whiteSpace:"nowrap"}}>{lastLog?.ts}</span>
          <span style={{color:"#1e40af",fontWeight:700}}>{USERS.find(u=>u.id===lastLog?.author)?.name.split(" ")[0]||lastLog?.author}</span>
          <span style={{color:"#374151",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lastLog?.note}</span>
        </div>
      )}
    </Card>
  );

  //  EXPANDED / EDIT VIEW 
  return (
    <Card style={{overflow:"hidden",border:dirty?"2px solid #f59e0b":"1px solid #e2e8f0"}}>
      {/* Card header bar */}
      <div style={{padding:"12px 20px",background:dirty?"#fffbeb":"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18,fontWeight:900,color:"#0f172a",fontFamily:"monospace"}}>{localD.jobCode||d.id}</span>
          <Badge value={localD.deliveryStatus} colorMap={Object.fromEntries(DLV_STATUSES.map(s=>[s,{c:STATUS_CLR[s]}]))}/>
          <SvcBadge code={d.serviceCode}/>
          {dirty&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",padding:"2px 8px",borderRadius:10}}> Unsaved changes</span>}
        </div>

      </div>

      {/* Meta fields */}
      <div style={{padding:"14px 20px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:12}}>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:1}}>Customer</Span>
            <button onClick={()=>onGoToCust&&onGoToCust(d.custId)} style={{fontSize:12,fontWeight:700,color:onGoToCust?"#1e40af":"#1e293b",background:"none",border:"none",padding:0,cursor:onGoToCust?"pointer":"default",textDecoration:onGoToCust?"underline":"none"}}>{cust?.companyEN||d.custId}</button>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:1}}>OPP Code</Span>
            <button onClick={()=>onGoToOpp&&onGoToOpp(d.oppCode)} style={{fontSize:12,fontFamily:"monospace",color:onGoToOpp?"#1e40af":"#1e293b",background:"none",border:"none",padding:0,cursor:onGoToOpp?"pointer":"default",textDecoration:onGoToOpp?"underline":"none"}}>{d.oppCode||"–"}</button>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:1}}>Quote No.</Span>
            <button onClick={()=>{if(d.quoteNo){const o=opps.find(x=>x.quoteNo===d.quoteNo);if(o)sQT(o);}}} style={{fontSize:12,fontFamily:"monospace",color:d.quoteNo?"#1e40af":"#94a3b8",background:"none",border:"none",padding:0,cursor:d.quoteNo?"pointer":"default",textDecoration:d.quoteNo?"underline":"none"}}>{d.quoteNo||"–"}</button>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:1}}>Agent</Span>
            <span style={{fontSize:12,color:"#1e293b"}}>{agent?.name?.split(" ")[0]||d.assignedTo}</span>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:2}}>Contract No.</Span>
            <input value={localD.contractNo||""} onChange={e=>markDirty({...localD,contractNo:e.target.value})} placeholder="–" style={{fontSize:12,fontFamily:"monospace",border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 7px",background:"#fafafa",width:110}}/>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:2}}>Contract Date</Span>
            <input type="date" value={localD.contractDate||""} onChange={e=>markDirty({...localD,contractDate:e.target.value})} style={{fontSize:12,border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 7px",background:"#fafafa",width:130}}/>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:1}}>Service Type</Span>
            <span style={{fontSize:12,color:"#1e293b"}}>{d.serviceType}</span>
          </div>
          <div style={{minWidth:110}}>
            <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:2}}>Delivery Date</Span>
            <input type="date" value={localD.deliveryDate||""} onChange={e=>markDirty({...localD,deliveryDate:e.target.value})} style={{fontSize:12,border:"1px solid #e2e8f0",borderRadius:4,padding:"3px 7px",background:"#fafafa",width:130}}/>
          </div>
          <div style={{width:1,height:32,background:"#e2e8f0",flexShrink:0,alignSelf:"center"}}/>
          {[{l:"Contract",v:d.totalContractValue,bg:"#fff",bc:"#e2e8f0",c:"#0f172a"},{l:"Received",v:totalRec,bg:"#f0fdf4",bc:"#86efac",c:"#16a34a"},{l:"Balance",v:d.totalContractValue-totalRec,bg:"#fffbeb",bc:"#fde68a",c:"#d97706"}].map(x=>(
            <div key={x.l} style={{textAlign:"center",padding:"5px 12px",background:x.bg,border:`1px solid ${x.bc}`,borderRadius:7,flexShrink:0}}>
              <Span s={9} c={x.c} style={{display:"block",marginBottom:1}}>{x.l}</Span>
              <div style={{fontWeight:900,fontSize:13,color:x.c}}>฿{fmt(x.v)}</div>
            </div>
          ))}
        </div>

        {/* Progress Steps + Work Log side by side */}
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"start"}}>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,overflow:"hidden"}}>
            <div style={{padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Span s={12} w={700}>Progress Steps</Span>
              <Span s={11} c="#64748b">Step {DLV_STEPS.indexOf(localD.currentStep||DLV_STEPS[0])+1}/{DLV_STEPS.length} — {localD.currentStep||DLV_STEPS[0]}</Span>
            </div>
            <div style={{padding:"8px 14px 12px",borderTop:"1px solid #f1f5f9"}}>
              <StepProgress steps={DLV_STEPS} current={localD.currentStep||DLV_STEPS[0]} onStep={s=>set("currentStep",s)}/>
            </div>
          </div>

        </div>

        {/* Work Log modal-style dropdown */}
        <div style={{marginTop:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,overflow:"hidden"}}>
          <div style={{padding:"9px 14px",borderBottom:"1px solid #f1f5f9"}}><Span s={12} w={700}>Work Log</Span></div>
            <div style={{padding:"12px 14px"}}>
              <div style={{maxHeight:180,overflow:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                {[...(d.workLog||[])].reverse().map(l=>{const u=USERS.find(x=>x.id===l.author);return(
                  <div key={l.id} style={{padding:"7px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:5,display:"flex",gap:8}}>
                    <div style={{width:24,height:24,background:"#0f172a",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,flexShrink:0}}>{(u?.name||"?")[0]}</div>
                    <div><div style={{display:"flex",gap:6,marginBottom:1,flexWrap:"wrap"}}><Span s={11} w={700} c="#0f172a">{u?.name||l.author}</Span><span style={{background:"#f1f5f9",color:"#64748b",fontSize:9,padding:"1px 5px",borderRadius:3,fontFamily:"monospace"}}>{l.ts}</span></div><Span s={12}>{l.note}</Span></div>
                  </div>
                );})}
                {(d.workLog||[]).length===0&&<Span s={12} c="#94a3b8">No entries yet.</Span>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={newNote} onChange={e=>setNewNote(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){addLog();e.preventDefault();}}} placeholder="Add entry… (Enter to save)" style={{flex:1,padding:"6px 10px",fontSize:12,border:"1px solid #e2e8f0",borderRadius:5}}/>
                <button onClick={addLog} style={{padding:"6px 14px",background:"#0f172a",color:"#fff",border:"none",borderRadius:5,fontSize:12,cursor:"pointer"}}>+ Add</button>
              </div>
            </div>
          </div>
      </div>

      {/* Installment Schedule */}
      <div>
        <div style={{padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Span s={12} w={700}>Installment Schedule</Span>
            
            
          </div>
          <Span s={11} w={700} c={Math.abs(totalPct-100)<0.1?"#16a34a":"#dc2626"}>{totalPct}% {Math.abs(totalPct-100)<0.1?"":""}</Span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <TH cols={["#","Description","% Share","Amount (THB)","Invoice No.","Invoice Date","Receipt No.","Receipt Date","Status"]}/>
            <tbody>
              {localInst.map(ins=>(
                <TR key={ins.id}>
                  <TD><Span s={12} w={700} c="#94a3b8">#{ins.seq}</Span></TD>
                  <TD><input value={ins.label||""} readOnly style={{width:"100%",padding:"3px 6px",fontSize:11,border:"none",background:"transparent",color:"#374151",cursor:"default",outline:"none"}}/></TD>
                  <TD style={{whiteSpace:"nowrap"}}><NumInp value={ins.pct} onChange={v=>changeLocalIns(ins.id,"pct",v)} style={{width:48,padding:"3px 5px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa"}}/><span style={{fontSize:10,color:"#94a3b8",marginLeft:2}}>%</span></TD>
                  <TD right style={{fontWeight:700,whiteSpace:"nowrap"}}>฿{fmt(ins.amount)}</TD>
                  <TD><input value={ins.invoiceNo||""} onChange={e=>changeLocalIns(ins.id,"invoiceNo",e.target.value)} style={{width:"100%",padding:"3px 6px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",fontFamily:"monospace"}}/></TD>
                  <TD><input type="date" value={ins.invoiceDate||""} onChange={e=>changeLocalIns(ins.id,"invoiceDate",e.target.value)} style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",padding:"2px 4px"}}/></TD>
                  <TD><input value={ins.receiptNo||""} onChange={e=>changeLocalIns(ins.id,"receiptNo",e.target.value)} style={{width:"100%",padding:"3px 6px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",fontFamily:"monospace"}}/></TD>
                  <TD><input type="date" value={ins.receiptDate||""} onChange={e=>changeLocalIns(ins.id,"receiptDate",e.target.value)} style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",padding:"2px 4px"}}/></TD>
                  <TD><select value={ins.status} onChange={e=>changeLocalIns(ins.id,"status",e.target.value)} style={{padding:"3px 5px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:ins.status==="Received"?"#dcfce7":ins.status==="Overdue"?"#fee2e2":ins.status==="Invoiced"?"#eff6ff":"#f8fafc",color:ins.status==="Received"?"#16a34a":ins.status==="Overdue"?"#dc2626":ins.status==="Invoiced"?"#1e40af":"#64748b",fontWeight:700,cursor:"pointer"}}>{INS_STATUSES.map(s=><option key={s}>{s}</option>)}</select></TD>
                </TR>
              ))}
              {localInst.length===0&&<tr><td colSpan={9} style={{padding:"16px",textAlign:"center",color:"#94a3b8",fontSize:12}}>No installments — click  Sync from Quotation{(localD.quoteNo||d.quoteNo)?` (${localD.quoteNo||d.quoteNo})`:" (set Quote No. first)"}</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Save Log — latest first */}
        {(d.saveLog||[]).length>0&&(
          <div style={{padding:"10px 16px",borderTop:"1px solid #f1f5f9",background:"#fafafa"}}>
            <Span s={10} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Save Log</Span>
            <div style={{maxHeight:120,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {[...(d.saveLog||[])].sort((a,b)=>b.ts.localeCompare(a.ts)).map(l=>(
                <div key={l.id} style={{display:"flex",gap:8,fontSize:10,padding:"3px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <span style={{color:"#94a3b8",whiteSpace:"nowrap",minWidth:130}}>{l.ts}</span>
                  <span style={{color:"#1e40af",fontWeight:700,minWidth:60}}>{USERS.find(u=>u.id===l.author)?.name.split(" ")[0]||l.author}</span>
                  <span style={{color:"#374151"}}>{l.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Bottom Save bar */}
        <div style={{padding:"10px 16px",borderTop:"1px solid #e2e8f0",background:dirty?"#fffbeb":"#f8fafc",display:"flex",justifyContent:"flex-end",gap:8,alignItems:"center"}}>
          {dirty&&<span style={{fontSize:11,color:"#d97706",marginRight:"auto",fontWeight:600}}> You have unsaved changes</span>}
          <Btn variant="ghost" onClick={handleDiscard}>Cancel</Btn>
          <Btn onClick={handleSave}>Save</Btn>
        </div>
      </div>
    </Card>
  );
};



const DLV_HDR = ["Delivery ID","Customer","OPP Code","Quote No.","Job Code","Contract No.","Contract Date","Service Type","Contract Value","Status","Step","Delivery Date","Total Received","Balance"];
const DeliveryPage = ({user,customers,opps,deliveries,onSave,toast,costSheets,onGoToCS,onGoToCust,onGoToOpp}) => {
  const [search,sS]=useState(""); const [fDS,setFDS]=useState([]); const [fStep,setFStep]=useState([]);
  const [form,sF]=useState(false); const [edit,sE]=useState(null); const [gs,sGS]=useState(false);
  const [initTab,sInitTab]=useState("detail"); // which tab to open in DeliveryForm
  const [quotationOpp,sQT]=useState(null); // for inline Quotation Preview modal
  // Req 9: expandable sections per delivery card

  const list=deliveries
    .filter(d=>{const c=customers.find(x=>x.id===d.custId);const q=search.toLowerCase();return(!search||d.jobCode.toLowerCase().includes(q)||(c?.companyEN||"").toLowerCase().includes(q)||d.contractNo.toLowerCase().includes(q)||d.oppCode.toLowerCase().includes(q))&&(fDS.length===0||fDS.includes(d.deliveryStatus))&&(fStep.length===0||fStep.includes(d.currentStep));})
    .sort((a,b)=>{
      const ta=[...(a.saveLog||[])].sort((x,y)=>y.ts.localeCompare(x.ts))[0]?.ts||"";
      const tb=[...(b.saveLog||[])].sort((x,y)=>y.ts.localeCompare(x.ts))[0]?.ts||"";
      return tb.localeCompare(ta);
    });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Delivery</Span><Span s={13} c="#94a3b8" style={{marginLeft:8}}>{list.length} contracts</Span></div>
        <div style={{display:"flex",gap:8}}><Btn variant="export" onClick={()=>dlCSV("deliveries.csv",DLV_HDR,list.map(d=>{const c=customers.find(x=>x.id===d.custId);const rec=(d.installments||[]).filter(i=>i.status==="Received").reduce((s,i)=>s+i.amount,0);return[d.id,c?.companyEN||d.custId,d.oppCode,d.quoteNo,d.jobCode,d.contractNo,d.contractDate,d.serviceType,d.totalContractValue,d.deliveryStatus,d.currentStep,d.deliveryDate,rec,d.totalContractValue-rec];}))}>↓ CSV</Btn></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search Job Code / Company…" style={{maxWidth:240}}/>
        <MultiSelect label="Status" options={DLV_STATUSES.map(s=>({value:s,label:s}))} selected={fDS}   onChange={setFDS}   width={180}/>
        <MultiSelect label="Step"   options={DLV_STEPS.map(s=>({value:s,label:s}))}    selected={fStep} onChange={setFStep} width={195}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {list.map(d => {
          return (
            <DeliveryCard key={d.id} d={d} opps={opps} costSheets={costSheets} customers={customers} user={user}
              onSave={upd=>onSave(upd)}
              toast={toast} onGoToCust={onGoToCust} onGoToOpp={onGoToOpp} sQT={sQT} onGoToCS={onGoToCS}/>
          );
        })}
                {list.length===0&&<Card style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No delivery records found.</Card>}
      </div>
      {form&&<DeliveryForm initial={edit} customers={customers} opps={opps} user={user} onSave={d=>{onSave(d);sF(false);sE(null);sInitTab("detail");toast("Delivery saved",d.jobCode||d.id);}} onClose={()=>{sF(false);sE(null);sInitTab("detail");}} costSheets={costSheets} initTab={initTab}/>}

      {quotationOpp&&<QuotationPreview opp={quotationOpp} customer={customers.find(c=>c.id===quotationOpp.custId)} costSheets={costSheets||[]} onClose={()=>sQT(null)}/>}
    </div>
  );
};

//  TaskRow: isolated component so taskName input retains focus on keystroke 
const TaskRow = React.memo(({t,onSet,onDel,months,dragStyle,onDragStart,onDragEnter,onDragEnd}) => {
  const [name,setName]         = useState(t.taskName);
  const [agentOpen,setAO]      = useState(false);
  useEffect(()=>{ setName(t.taskName); },[t.taskName]);
  const tc=(t.manager||0)*IH_LEVELS.Manager+(t.senior||0)*IH_LEVELS.Senior+(t.junior||0)*IH_LEVELS.Junior;
  const agents = t.agents||[];

  const toggleAgent = (uid) => {
    const next = agents.includes(uid) ? agents.filter(a=>a!==uid) : [...agents,uid];
    onSet(t.id,"agents",next);
  };

  // Agents eligible: all users except md/admin-only
  const eligibleUsers = USERS.filter(u=>["sales","operation"].includes(u.role));

  return (
    <>
      <tr draggable onDragStart={onDragStart||undefined} onDragEnter={onDragEnter||undefined} onDragEnd={onDragEnd||undefined} onDragOver={e=>e.preventDefault()} style={{borderBottom:agentOpen?"none":"1px solid #f8fafc",cursor:"default",...(dragStyle||{})}}>
        <td style={{padding:"3px 4px",cursor:"grab",color:"#94a3b8",userSelect:"none",textAlign:"center",fontSize:12}}>⠿</td>
        <td style={{padding:"3px 4px"}}>
          <input value={name}
            onChange={e=>setName(e.target.value)}
            onBlur={e=>onSet(t.id,"taskName",e.target.value)}
            style={{padding:"2px 5px",fontSize:13,width:"100%",boxSizing:"border-box",border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",outline:"none"}}/>
        </td>
        {["manager","senior","junior"].map(lvl=>(
          <td key={lvl} style={{padding:"3px 4px"}}>
            <input type="text" inputMode="numeric" value={t[lvl]||""}
              onChange={e=>onSet(t.id,lvl,+e.target.value)}
              style={{padding:"2px 4px",fontSize:13,width:48,textAlign:"center",border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",outline:"none"}}/>
          </td>
        ))}
        <td style={{padding:"3px 4px",fontWeight:700,whiteSpace:"nowrap",fontSize:13}}>฿{fmt(tc)}</td>
        <td style={{padding:"3px 4px"}}>
          <Sel value={t.payMonth||1} onChange={e=>onSet(t.id,"payMonth",+e.target.value)} style={{padding:"2px 3px",fontSize:13,width:52}}>
            {Array.from({length:(months||3)+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
          </Sel>
        </td>
        <td style={{padding:"3px 4px"}}>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <button onClick={()=>setAO(p=>!p)} title="Assign agents"
              style={{fontSize:12,padding:"1px 5px",border:`1px solid ${agents.length>0?"#86efac":"#e2e8f0"}`,borderRadius:3,background:agents.length>0?"#f0fdf4":"#f8fafc",color:agents.length>0?"#16a34a":"#64748b",cursor:"pointer",whiteSpace:"nowrap"}}>
              {agents.length>0?` ${agents.length}`:""}
            </button>
            <Btn variant="danger" style={{fontSize:13,padding:"1px 5px"}} onClick={()=>onDel(t.id)}>×</Btn>
          </div>
        </td>
      </tr>
      {agentOpen&&(
        <tr style={{borderBottom:"1px solid #f8fafc",background:"#f8fffe"}}>
          <td colSpan={7} style={{padding:"5px 8px"}}>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginRight:2}}>Assigned:</span>
              {/* Agent chips */}
              {agents.map(uid=>{
                const u=USERS.find(x=>x.id===uid);
                return u?(
                  <span key={uid} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",background:"#0f172a",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600}}>
                    {u.name.split(" ")[0]}
                    <button onClick={()=>toggleAgent(uid)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:11,padding:0,lineHeight:1}}>×</button>
                  </span>
                ):null;
              })}
              {/* Add agent dropdown */}
              <select onChange={e=>{if(e.target.value)toggleAgent(e.target.value);e.target.value="";}}
                style={{fontSize:13,padding:"2px 5px",border:"1px dashed #bfdbfe",borderRadius:4,background:"#eff6ff",color:"#1e40af",cursor:"pointer"}}>
                <option value="">+ Add Agent</option>
                {eligibleUsers.filter(u=>!agents.includes(u.id)).map(u=>(
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              {agents.length===0&&<span style={{fontSize:12,color:"#94a3b8",fontStyle:"italic"}}>No agents assigned yet</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

//  TaskTableWidget: standalone table, uses TaskRow to prevent focus loss 
const TaskTableWidget = ({tasks,onSet,onAdd,onDel,onReorder,dragProps,months}) => (
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,tableLayout:"fixed"}}>
      <colgroup><col style={{width:"20px"}}/><col style={{width:"36%"}}/><col style={{width:"9%"}}/><col style={{width:"9%"}}/><col style={{width:"9%"}}/><col style={{width:"10%"}}/><col style={{width:"9%"}}/><col style={{width:"13%"}}/></colgroup>
      <thead><tr style={{background:"#f8fafc"}}>
        <th style={{padding:"5px 4px",borderBottom:"1px solid #e2e8f0"}}/>
        {["Task / Activity","Mgr (days)","Sr (days)","Jr (days)","Total Cost","Pay Month","Agents / Actions"].map(h=><th key={h} style={{padding:"5px 6px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:9,borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}
      </tr></thead>
      <tbody>
        {(tasks||[]).map(t=><TaskRow key={t.id} t={t} onSet={onSet} onDel={onDel} onReorder={onReorder} months={months} dragStyle={dragProps?dragProps.getRowStyle(t.id):{}} onDragStart={dragProps?()=>dragProps.handleDragStart(t.id):null} onDragEnter={dragProps?()=>dragProps.handleDragEnter(t.id):null} onDragEnd={dragProps?dragProps.handleDragEnd:null}/>)}
        {/* +Task button on left under Task/Activity column */}
        <tr><td/><td style={{padding:"4px 4px"}}><button onClick={onAdd} style={{fontSize:13,color:"#1e40af",background:"transparent",border:"1px dashed #bfdbfe",borderRadius:4,padding:"2px 14px",cursor:"pointer",fontWeight:600}}>+ Task</button></td><td colSpan={5} style={{padding:"4px 6px",fontWeight:700,fontSize:11,textAlign:"right"}}>Total OPEX: <span style={{fontWeight:900,fontSize:12}}>฿{fmt((tasks||[]).reduce((s,t)=>(s+(t.manager||0)*IH_LEVELS.Manager+(t.senior||0)*IH_LEVELS.Senior+(t.junior||0)*IH_LEVELS.Junior),0))}</span></td><td/></tr>
      </tbody>
    </table>
);

// 
// Smooth drag-to-sort hook
// 
const useDragSort = (items, onReorder) => {
  const [dragging, setDragging] = React.useState(null); // id being dragged
  const [over, setOver] = React.useState(null); // id being hovered over

  const handleDragStart = (id) => setDragging(id);
  const handleDragEnter = (id) => { if(id !== dragging) setOver(id); };
  const handleDragEnd = () => {
    if(dragging && over && dragging !== over) onReorder(dragging, over);
    setDragging(null); setOver(null);
  };

  const getRowStyle = (id) => ({
    opacity: id === dragging ? 0.4 : 1,
    background: id === over ? "#eff6ff" : "",
    transition: "background .1s, opacity .1s",
    transform: id === over ? "scaleY(1.03)" : "scaleY(1)",
    transformOrigin: "top",
  });

  return { dragging, over, handleDragStart, handleDragEnter, handleDragEnd, getRowStyle };
};

// 
// COST SHEET (COGS + OPEX + Cashflow)
// 
const QuoteCard = ({q,editCS,customers,opps,user,setQF,setQIC,setQEC,setQTK,setQInst,setQDlv,addQEC,addQTK,addQInst,addQDlv,delQIC,delQEC,delQTK,delQO,reorderCOGS,reorderQTK,updQO,handleSave}) => {
  const qIC=calcIC(q.internalCosts||[]),qEC=calcEC(q.externalCosts||[],true),qOPEX=calcTask(q.tasks||[]);
  const qTC=qIC+qEC+qOPEX,qMg=margin(q.salesPrice,qTC);
  const months=q.projectMonths||editCS.projectMonths||3;
  const instSum=(q.installments||[]).reduce((s,i)=>s+(i.pct||0),0);
  const cogsDrag = useDragSort(
    [...(q.internalCosts||[]),...(q.externalCosts||[])],
    (fid,tid)=>reorderCOGS(q.id,fid,tid)
  );
  const taskDrag = useDragSort(q.tasks||[],(fid,tid)=>reorderQTK(q.id,fid,tid));
  return (
            const qTC=qIC+qEC+qOPEX,qMg=margin(q.salesPrice,qTC);
            const months=q.projectMonths||editCS.projectMonths||3;
            const instSum=(q.installments||[]).reduce((s,i)=>s+(i.pct||0),0);
            return (
              <Card key={q.id} style={{marginBottom:14,overflow:"hidden",position:"relative"}}>
                {/* Header row — single line, no wrap */}
                <div style={{padding:"10px 16px",background:+qMg>=30?"#f0fdf4":"#fffbeb",borderBottom:"1px solid #e2e8f0",display:"flex",gap:8,alignItems:"center",flexWrap:"nowrap",overflow:"hidden"}}>
                  {/* CS Code */}
                  <div style={{flexShrink:0}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>CS Code</Span>
                    <div style={{fontFamily:"monospace",fontWeight:900,fontSize:12,color:"#1e40af",padding:"3px 0"}}>{q.csCode}</div>
                  </div>
                  <div style={{width:1,background:"#e2e8f0",alignSelf:"stretch",marginX:4,flexShrink:0}}/>
                  {/* OPP Code */}
                  <div style={{flex:"0 0 120px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>OPP Code</Span>
                    <Inp value={q.oppCode||""} onChange={e=>setQF(q.id,"oppCode",e.target.value)} style={{fontSize:11,fontFamily:"monospace",fontWeight:700,padding:"3px 6px",color:"#1e40af"}}/>
                  </div>
                  {/* Quote No. */}
                  <div style={{flex:"0 0 110px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Quote No.</Span>
                    <Inp value={q.quoteNo||""} onChange={e=>setQF(q.id,"quoteNo",e.target.value)} style={{fontSize:11,fontFamily:"monospace",padding:"3px 6px"}}/>
                  </div>
                  {/* Customer */}
                  <div style={{flex:"1 1 160px",minWidth:0}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Customer</Span>
                    <Sel value={q.custId||""} onChange={e=>setQF(q.id,"custId",e.target.value)} style={{fontSize:11,padding:"3px 6px",width:"100%"}}>
                      <option value="">— Select —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.companyEN}</option>)}
                    </Sel>
                  </div>
                  {/* Sales Agent */}
                  <div style={{flex:"0 0 140px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Agent</Span>
                    <Sel value={q.salesAgent||""} onChange={e=>setQF(q.id,"salesAgent",e.target.value)} style={{fontSize:11,padding:"3px 6px"}}>
                      <option value="">— Select —</option>{SALES_USERS.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                    </Sel>
                  </div>
                  {/* Contact Person */}
                  <div style={{flex:"0 0 150px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Contact</Span>
                    <Sel value={q.contactPersonId||""} onChange={e=>setQF(q.id,"contactPersonId",e.target.value)} style={{fontSize:11,padding:"3px 6px"}}>
                      <option value="">— Select —</option>
                      {(customers.find(c=>c.id===q.custId)?.contacts||[]).filter(ct=>ct.active).map(ct=><option key={ct.id} value={ct.id}>{ct.name}</option>)}
                    </Sel>
                  </div>
                  {/* Sales Price */}
                  <div style={{flex:"0 0 90px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Price</Span>
                    <Inp type="number" value={q.salesPrice} onChange={e=>updQO(q.id,q=>({...q,salesPrice:+e.target.value,lineItems:(q.lineItems||[]).map((li,i)=>i===0?{...li,unitPrice:+e.target.value}:li)}))} style={{fontSize:12,fontWeight:700,padding:"3px 6px"}}/>
                  </div>
                  {/* Months */}
                  <div style={{flex:"0 0 52px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",display:"block",marginBottom:2}}>Mo.</Span>
                    <Inp type="number" value={months} onChange={e=>setQF(q.id,"projectMonths",+e.target.value)} style={{fontSize:11,padding:"3px 5px"}}/>
                  </div>
                  {/* Margin badge */}
                  <div style={{flex:"0 0 72px",padding:"5px 8px",borderRadius:6,background:+qMg>=30?"#dcfce7":"#fee2e2",textAlign:"center",flexShrink:0}}>
                    <div style={{fontWeight:900,fontSize:15,color:+qMg>=30?"#16a34a":"#dc2626",lineHeight:1.2}}>{qMg}%</div>
                    <div style={{fontWeight:700,fontSize:13,color:+qMg>=30?"#16a34a":"#dc2626"}}>{fmtK(marginAmt(q.salesPrice,qTC))}</div>
                  </div>
                  {/* Close button */}

                </div>

                {/* Cost grids */}
                <div style={{padding:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    {/* Unified COGS table */}
                    <div style={{marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                      <Span s={11} w={700}>COGS</Span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,tableLayout:"fixed"}}>
                      <colgroup><col style={{width:"24px"}}/><col style={{width:"25%"}}/><col style={{width:"12%"}}/><col style={{width:"8%"}}/><col style={{width:"7%"}}/><col style={{width:"12%"}}/><col style={{width:"11%"}}/><col style={{width:"8%"}}/><col style={{width:"4%"}}/></colgroup>
                      <TH cols={["","Label","Vendor","Unit","Qty","Rate","Total","Pay M.",""]}/>
                      <tbody>
                        {(q.internalCosts||[]).map(r=>(
                          <tr key={r.id} draggable onDragStart={()=>cogsDrag.handleDragStart(r.id)} onDragEnter={()=>cogsDrag.handleDragEnter(r.id)} onDragEnd={cogsDrag.handleDragEnd} onDragOver={e=>e.preventDefault()} style={{borderBottom:"1px solid #f8fafc",cursor:"default",...cogsDrag.getRowStyle(r.id)}}>
                            <td style={{padding:"3px 4px",cursor:"grab",color:"#94a3b8",userSelect:"none",textAlign:"center",fontSize:12}}>⠿</td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.label} onChange={e=>setQIC(q.id,r.id,"label",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px",fontSize:11,color:"#94a3b8",textAlign:"center"}}>—</td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.unit} onChange={e=>setQIC(q.id,r.id,"unit",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.qty} onChange={v=>setQIC(q.id,r.id,"qty",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.rate} onChange={v=>setQIC(q.id,r.id,"rate",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px",fontWeight:700,fontSize:13}}>฿{fmt((r.qty||0)*(r.rate||0))}</td>
                            <td style={{padding:"3px 3px"}}>
                              <Sel value={r.payMonth||1} onChange={e=>setQIC(q.id,r.id,"payMonth",+e.target.value)} style={{padding:"1px 3px",fontSize:11,width:"100%"}}>
                                {Array.from({length:(months||3)+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
                              </Sel>
                            </td>
                            <td><Btn variant="danger" style={{fontSize:13,padding:"1px 4px"}} onClick={()=>delQIC(q.id,r.id)}>×</Btn></td>
                          </tr>
                        ))}
                        {(q.externalCosts||[]).map(r=>(
                          <tr key={r.id} draggable onDragStart={()=>cogsDrag.handleDragStart(r.id)} onDragEnter={()=>cogsDrag.handleDragEnter(r.id)} onDragEnd={cogsDrag.handleDragEnd} onDragOver={e=>e.preventDefault()} style={{borderBottom:"1px solid #f8fafc",cursor:"default",...cogsDrag.getRowStyle(r.id)}}>
                            <td style={{padding:"3px 4px",cursor:"grab",color:"#94a3b8",userSelect:"none",textAlign:"center",fontSize:12}}>⠿</td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.label} onChange={e=>setQEC(q.id,r.id,"label",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.vendorName||""} onChange={e=>setQEC(q.id,r.id,"vendorName",e.target.value)} placeholder="Vendor" style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.unit||""} onChange={e=>setQEC(q.id,r.id,"unit",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.qty} onChange={v=>setQEC(q.id,r.id,"qty",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.rate} onChange={v=>setQEC(q.id,r.id,"rate",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px",fontWeight:700,fontSize:13}}>฿{fmt((r.qty||0)*(r.rate||0))}</td>
                            <td style={{padding:"3px 3px"}}>
                              <Sel value={r.payMonth||1} onChange={e=>setQEC(q.id,r.id,"payMonth",+e.target.value)} style={{padding:"1px 3px",fontSize:11,width:"100%"}}>
                                {Array.from({length:(months||3)+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
                              </Sel>
                            </td>
                            <td><Btn variant="danger" style={{fontSize:13,padding:"1px 4px"}} onClick={()=>delQEC(q.id,r.id)}>×</Btn></td>
                          </tr>
                        ))}
                        <tr style={{borderTop:"1px solid #f1f5f9"}}>
                          <td colSpan={6} style={{padding:"5px 4px"}}>
                            <button onClick={()=>addQEC(q.id)} style={{fontSize:13,color:"#1e40af",background:"#eff6ff",border:"1px dashed #bfdbfe",borderRadius:4,padding:"2px 12px",cursor:"pointer",fontWeight:600}}>+ Add</button>
                          </td>
                          <td colSpan={2} style={{padding:"5px 4px",textAlign:"right",whiteSpace:"nowrap"}}>
                            <span style={{fontSize:11,color:"#94a3b8",fontWeight:700,marginRight:6}}>Total COGS</span>
                            <span style={{fontWeight:900,fontSize:12,color:"#0f172a"}}>฿{fmt(qIC+qEC)}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <Span s={12} w={700} style={{display:"block",marginBottom:6}}>OPEX — Man-day Tasks</Span>
                    <TaskTableWidget tasks={q.tasks||[]} onSet={(tid,k,v)=>setQTK(q.id,tid,k,v)} onAdd={()=>addQTK(q.id)} onDel={tid=>delQTK(q.id,tid)} months={months}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:6,padding:"5px 2px",borderTop:"1px solid #e2e8f0"}}><Span s={11} w={700}>Total OPEX</Span><Span s={12} w={900}>฿{fmt(qOPEX)}</Span></div>
                  </div>
                </div>

                {/*  INSTALLMENTS (left) + CASHFLOW (right) — 2-col layout  */}
                <div style={{padding:"0 16px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,borderTop:"1px solid #f1f5f9"}}>
                  {/* Installments */}
                  <div style={{paddingTop:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Span s={12} w={700}>Installments</Span>
                      <span style={{fontSize:13,fontWeight:700,color:Math.abs(instSum-100)<0.1?"#16a34a":"#dc2626"}}>({instSum}% {Math.abs(instSum-100)<0.1?"":""})</span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr style={{background:"#f8fafc"}}>
                        <th style={{padding:"5px 4px",width:22,textAlign:"center",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>#</th>
                        <th style={{padding:"5px 6px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>Label</th>
                        <th style={{padding:"5px 4px",width:46,textAlign:"right",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>%</th>
                        <th style={{padding:"5px 4px",width:76,textAlign:"right",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>Amount</th>
                        <th style={{padding:"5px 4px",width:54,textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>Recv M.</th>
                        <th style={{padding:"5px 4px",width:20,borderBottom:"1px solid #e2e8f0"}}/>
                      </tr></thead>
                      <tbody>
                        {(q.installments||[]).map((ins,idx)=>(
                          <tr key={ins.id} style={{borderBottom:"1px solid #f8fafc"}}>
                            <td style={{padding:"4px 4px",textAlign:"center",color:"#94a3b8",fontWeight:700,fontSize:11,width:22}}>{idx+1}</td>
                            <td style={{padding:"4px 4px"}}><Inp value={ins.label} onChange={e=>setQInst(q.id,ins.id,"label",e.target.value)} placeholder="" style={{padding:"2px 5px",fontSize:13,width:"100%",background:"#f8fafc"}}/></td>
                            <td style={{padding:"4px 4px",width:46}}><Inp type="number" value={ins.pct} onChange={e=>setQInst(q.id,ins.id,"pct",+e.target.value)} style={{padding:"2px 4px",fontSize:13,width:38,textAlign:"right"}}/></td>
                            <td style={{padding:"4px 4px",fontWeight:700,fontSize:13,textAlign:"right",whiteSpace:"nowrap",width:76}}>฿{fmt(Math.round(q.salesPrice*(ins.pct||0)/100))}</td>
                            <td style={{padding:"4px 4px",width:54}}>
                              <Sel value={ins.recvMonth||1} onChange={e=>setQInst(q.id,ins.id,"recvMonth",+e.target.value)} style={{padding:"2px 3px",fontSize:11,width:48}}>
                                {Array.from({length:months+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
                              </Sel>
                            </td>
                            <td style={{padding:"4px 4px",width:20}}><Btn variant="danger" style={{fontSize:13,padding:"1px 4px"}} onClick={()=>delQInst(q.id,ins.id)}>×</Btn></td>
                          </tr>
                        ))}
                        <tr><td colSpan={6} style={{padding:"6px 4px"}}>
                          <button onClick={()=>addQInst(q.id)} style={{fontSize:13,color:"#1e40af",background:"#eff6ff",border:"1px dashed #bfdbfe",borderRadius:4,padding:"2px 14px",cursor:"pointer",fontWeight:600}}>+ Installment</button>
                        </td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cashflow */}
                  {(()=>{
                    const cfM=q.projectMonths||editCS.projectMonths||3;
                    const allM=Array.from({length:cfM+1},(_,i)=>i+1);
                    const cByM={};
                    (q.tasks||[]).forEach(t=>{const m=t.payMonth||1;const tc=(t.manager||0)*IH_LEVELS.Manager+(t.senior||0)*IH_LEVELS.Senior+(t.junior||0)*IH_LEVELS.Junior;cByM[m]=(cByM[m]||0)+tc;});
                    (q.internalCosts||[]).forEach(r=>{const m=r.payMonth||1;const amt=(r.qty||0)*(r.rate||0);cByM[m]=(cByM[m]||0)+amt;});
                    (q.externalCosts||[]).filter(r=>!r.clientBorne).forEach(r=>{const m=r.payMonth||1;const amt=(r.qty||0)*(r.rate||0);cByM[m]=(cByM[m]||0)+amt;});
                    const rByM={};
                    (q.installments||[]).forEach(ins=>{const m=ins.recvMonth||1;rByM[m]=(rByM[m]||0)+Math.round(q.salesPrice*(ins.pct||0)/100);});
                    let run=0;
                    const cfRows=allM.map(m=>{const out=cByM[m]||0,inn=rByM[m]||0;run+=inn-out;return{m,out,inn,net:inn-out,run};});
                    const hasNeg=cfRows.some(r=>r.run<0);
                    const maxAbs=Math.max(...cfRows.map(r=>Math.abs(r.run)),1);
                    return(
                      <div style={{paddingTop:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <Span s={12} w={700}>Cashflow</Span>
                          <span style={{fontSize:11,color:"#94a3b8"}}>{cfM} months</span>
                          <span style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:hasNeg?"#dc2626":"#16a34a",background:hasNeg?"#fee2e2":"#dcfce7",padding:"1px 8px",borderRadius:10,whiteSpace:"nowrap"}}>
                            {hasNeg?" Goes negative":" Positive throughout"}
                          </span>
                        </div>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                          <thead><tr>
                            {["M","Cost Out","Revenue In","Net","Cumulative",""].map((h,i)=>(
                              <th key={i} style={{padding:"2px 5px",textAlign:i>=1&&i<=4?"right":"left",fontWeight:700,color:"#94a3b8",fontSize:8,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap",letterSpacing:"0.04em"}}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>{cfRows.map(r=>(
                            <tr key={r.m} style={{borderBottom:"1px solid #f8fafc",background:r.run<0?"#fff5f5":"transparent"}}>
                              <td style={{padding:"2px 5px",fontWeight:700,color:"#374151"}}>M{r.m}</td>
                              <td style={{padding:"2px 5px",color:"#dc2626",textAlign:"right"}}>{r.out>0?`฿${fmt(r.out)}`:"—"}</td>
                              <td style={{padding:"2px 5px",color:"#16a34a",textAlign:"right"}}>{r.inn>0?`฿${fmt(r.inn)}`:"—"}</td>
                              <td style={{padding:"2px 5px",textAlign:"right",fontWeight:600,color:r.net>=0?"#16a34a":"#dc2626"}}>{r.net!==0?`${r.net>0?"+":""}฿${fmt(r.net)}`:"—"}</td>
                              <td style={{padding:"2px 5px",textAlign:"right",fontWeight:800,color:r.run>=0?"#16a34a":"#dc2626"}}>{r.run>=0?"+":""}฿{fmt(r.run)}</td>
                              <td style={{padding:"2px 6px",width:64}}>
                                <div style={{height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${Math.abs(r.run)/maxAbs*100}%`,background:r.run>=0?"#16a34a":"#dc2626",borderRadius:3}}/>
                                </div>
                              </td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

                {/*  PROJECT SCOPE (full width)  */}
                <div style={{padding:"0 20px 16px",borderTop:"1px solid #f1f5f9"}}>
                  <div style={{marginTop:14,marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}><Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Service Description</Span><Span s={11} c="#94a3b8">— Project title as it will appear in the Quotation</Span></div>
                    <Inp value={q.projectTitle||""} onChange={e=>setQF(q.id,"projectTitle",e.target.value)} placeholder="" style={{fontSize:12}}/>
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}><Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Project Scope</Span><Span s={11} c="#94a3b8">— Scope details e.g. Project Address, Boundary, Base Year</Span></div>
                    <Txta value={q.projectScope||""} onChange={e=>setQF(q.id,"projectScope",e.target.value)} placeholder="" style={{minHeight:80,fontSize:12}}/>
                  </div>
                </div>

                {/*  DELIVERABLES (full width, editable list + preview)  */}
                <div style={{padding:"0 20px 16px"}}>
                  <Span s={11} w={800} c="#64748b" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Deliverables</Span>
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:6}}>
                    {(q.deliverables||[]).map(d=>(
                      <div key={d.id} style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{color:"#06b6d4",fontWeight:900,fontSize:13,flexShrink:0}}></span>
                        <Inp value={d.item} onChange={e=>setQDlv(q.id,d.id,e.target.value)} placeholder="" style={{padding:"3px 8px",fontSize:12,flex:1}}/>
                        {(q.deliverables||[]).length>1&&<Btn variant="danger" style={{fontSize:13,padding:"1px 5px",flexShrink:0}} onClick={()=>delQDlv(q.id,d.id)}>×</Btn>}
                      </div>
                    ))}
                    <button onClick={()=>addQDlv(q.id)} style={{alignSelf:"flex-start",marginTop:4,fontSize:13,color:"#1e40af",background:"none",border:"1px dashed #bfdbfe",borderRadius:4,padding:"2px 10px",cursor:"pointer"}}>+ Add Deliverable</button>
                  </div>
                </div>

                {/*  NOTES & CONDITIONS (full width)  */}
                <div style={{padding:"0 20px 16px"}}>
                  <Span s={11} w={800} c="#64748b" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Notes & Conditions</Span>
                  <Txta value={q.notes||""} onChange={e=>setQF(q.id,"notes",e.target.value)} placeholder="" style={{minHeight:80,fontSize:12}}/>
                </div>

                {/* Cost + margin + Save/Cancel footer */}
                <div style={{borderTop:"1px solid #e2e8f0",padding:"12px 20px",background:"#f8fafc",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  {[{l:"COGS",v:qIC+qEC},{l:"OPEX",v:qOPEX},{l:"Total Cost",v:qTC,bold:true}].map(x=>(
                    <div key={x.l} style={{textAlign:"center"}}>
                      <Span s={9} c="#94a3b8" style={{display:"block",marginBottom:1,textTransform:"uppercase"}}>{x.l}</Span>
                      <Span s={13} w={x.bold?900:700}>฿{fmt(x.v)}</Span>
                    </div>
                  ))}
                  <div style={{padding:"5px 12px",borderRadius:6,background:+qMg>=30?"#dcfce7":"#fee2e2",textAlign:"center"}}>
                    <Span s={9} c={+qMg>=30?"#16a34a":"#dc2626"} style={{display:"block"}}>Margin</Span>
                    <Span s={15} w={900} c={+qMg>=30?"#16a34a":"#dc2626"}>{qMg}%</Span>
                  </div>
                  <div style={{width:1,height:32,background:"#e2e8f0",flexShrink:0}}/>
                  <Btn variant="ghost" onClick={()=>delQO(q.id)}>Cancel</Btn>
                  <Btn onClick={handleSave} style={{padding:"8px 24px"}}>Save</Btn>
                </div>
              </Card>
  );
};

const CostSheetPage = ({costSheets,onSave,customers,opps,user,onSaveOpp,toast,initSvcCode,onSvcReady}) => {
  const [selCode,sCode] = useState(SERVICES[0].code);
  useEffect(()=>{if(initSvcCode){sCode(initSvcCode);sView("quote");if(onSvcReady)onSvcReady();}},[initSvcCode]);
  const [view,sView]    = useState("quote");
  const [gs,sGS]        = useState(false);
  const cs = useMemo(()=>costSheets.find(c=>c.serviceCode===selCode)||buildDefaultCS(SERVICES.find(s=>s.code===selCode)||SERVICES[0]),[costSheets,selCode]);
  const [editCS,sECS] = useState(cs);
  const [editPrice,sEP] = useState(0);
  useEffect(()=>{const f=costSheets.find(c=>c.serviceCode===selCode)||buildDefaultCS(SERVICES.find(s=>s.code===selCode)||SERVICES[0]);sECS(f);sEP(f.stdPrice||0);},[selCode,costSheets]);

  // COGS calcs
  const totalIC = calcIC(editCS.internalCosts||[]);
  const totalEC = calcEC(editCS.externalCosts||[],true); // co-borne only
  const totalECClient = (editCS.externalCosts||[]).filter(r=>r.clientBorne).reduce((s,r)=>s+(r.qty||0)*(r.rate||0),0);
  const totalCOGS = totalIC + totalEC;
  // OPEX calcs
  const totalOPEX = calcTask(editCS.tasks||[]);
  const totalCost = totalCOGS + totalOPEX;
  const mg = margin(editPrice, totalCost);

  const setIC=(id,k,v)=>sECS(p=>({...p,internalCosts:(p.internalCosts||[]).map(r=>r.id===id?{...r,[k]:v}:r)}));
  const addIC=()=>sECS(p=>({...p,internalCosts:[...(p.internalCosts||[]),{id:uid(),label:"",unit:"Unit",qty:0,rate:0}]}));
  const delIC=id=>sECS(p=>({...p,internalCosts:(p.internalCosts||[]).filter(r=>r.id!==id)}));
  const setEC=(id,k,v)=>sECS(p=>({...p,externalCosts:(p.externalCosts||[]).map(r=>r.id===id?{...r,[k]:v}:r)}));
  const addEC=()=>sECS(p=>({...p,externalCosts:[...(p.externalCosts||[]),{id:uid(),label:"",unit:"Job",qty:0,rate:0,vendorName:"",clientBorne:false}]}));
  const delEC=id=>sECS(p=>({...p,externalCosts:(p.externalCosts||[]).filter(r=>r.id!==id)}));
  const setTK=(id,k,v)=>sECS(p=>({...p,tasks:(p.tasks||[]).map(t=>t.id===id?{...t,[k]:v}:t)}));
  const addTK=()=>sECS(p=>({...p,tasks:[...(p.tasks||[]),{id:uid(),taskName:"",manager:0,senior:0,junior:0,payMonth:1,agents:[]}]}));
  const delTK=id=>sECS(p=>({...p,tasks:(p.tasks||[]).filter(t=>t.id!==id)}));

  // Per-quotation — only 1 CS per quote
  const updQO=(qid,fn)=>sECS(p=>({...p,quoteOverrides:(p.quoteOverrides||[]).map(q=>q.id===qid?fn(q):q)}));
  const setQF=(qid,k,v)=>updQO(qid,q=>({...q,[k]:v}));
  const setQTK=(qid,tid,k,v)=>updQO(qid,q=>({...q,tasks:(q.tasks||[]).map(t=>t.id===tid?{...t,[k]:v}:t)}));
  const addQTK=qid=>updQO(qid,q=>({...q,tasks:[...(q.tasks||[]),{id:uid(),taskName:"",manager:0,senior:0,junior:0,payMonth:1,agents:[]}]}));
  const delQTK=(qid,tid)=>updQO(qid,q=>({...q,tasks:(q.tasks||[]).filter(t=>t.id!==tid)}));
  const reorderQTK=(qid,fromId,toId)=>updQO(qid,q=>{
    const arr=[...(q.tasks||[])];
    const fi=arr.findIndex(t=>t.id===fromId); const ti=arr.findIndex(t=>t.id===toId);
    if(fi<0||ti<0||fi===ti) return q;
    arr.splice(ti,0,arr.splice(fi,1)[0]);
    return {...q,tasks:arr};
  });
  const setQIC=(qid,rid,k,v)=>updQO(qid,q=>({...q,internalCosts:(q.internalCosts||[]).map(r=>r.id===rid?{...r,[k]:v}:r)}));
  const addQIC=qid=>updQO(qid,q=>({...q,internalCosts:[...(q.internalCosts||[]),{id:uid(),label:"",unit:"Unit",qty:0,rate:0,payMonth:1}]}));
  const delQIC=(qid,rid)=>updQO(qid,q=>({...q,internalCosts:(q.internalCosts||[]).filter(r=>r.id!==rid)}));
  const setQEC=(qid,rid,k,v)=>updQO(qid,q=>({...q,externalCosts:(q.externalCosts||[]).map(r=>r.id===rid?{...r,[k]:v}:r)}));
  const addQEC=qid=>updQO(qid,q=>({...q,externalCosts:[...(q.externalCosts||[]),{id:uid(),label:"",unit:"Job",qty:0,rate:0,vendorName:"",clientBorne:false,payMonth:1}]}));
  const delQEC=(qid,rid)=>updQO(qid,q=>({...q,externalCosts:(q.externalCosts||[]).filter(r=>r.id!==rid)}));
  const reorderCOGS=(qid,fromId,toId)=>updQO(qid,q=>{
    const all=[...(q.internalCosts||[]).map(r=>({...r,_t:"i"})),...(q.externalCosts||[]).map(r=>({...r,_t:"e"}))];
    const fi=all.findIndex(r=>r.id===fromId); const ti=all.findIndex(r=>r.id===toId);
    if(fi<0||ti<0||fi===ti) return q;
    const reordered=[...all]; reordered.splice(ti,0,reordered.splice(fi,1)[0]);
    return {...q,internalCosts:reordered.filter(r=>r._t==="i").map(({_t,...r})=>r),externalCosts:reordered.filter(r=>r._t==="e").map(({_t,...r})=>r)};
  });
  const setQInst=(qid,iid,k,v)=>updQO(qid,q=>({...q,installments:(q.installments||[]).map(i=>i.id===iid?{...i,[k]:v}:i)}));
  const addQInst=qid=>updQO(qid,q=>({...q,installments:[...(q.installments||[]),{id:uid(),seq:(q.installments||[]).length+1,label:"",pct:0,detail:"",recvMonth:1}]}));
  const delQInst=(qid,iid)=>updQO(qid,q=>({...q,installments:(q.installments||[]).filter(i=>i.id!==iid)}));

  // lineItems helpers
  const setQLI=(qid,rid,k,v)=>updQO(qid,q=>({...q,lineItems:(q.lineItems||[]).map(r=>r.id===rid?{...r,[k]:v}:r)}));
  const addQLI=qid=>updQO(qid,q=>({...q,lineItems:[...(q.lineItems||[]),{id:uid(),description:"",qty:1,unit:"Job",unitPrice:0}]}));
  const delQLI=(qid,rid)=>updQO(qid,q=>({...q,lineItems:(q.lineItems||[]).filter(r=>r.id!==rid)}));
  // deliverables helpers
  const setQDlv=(qid,did,v)=>updQO(qid,q=>({...q,deliverables:(q.deliverables||[]).map(d=>d.id===did?{...d,item:v}:d)}));
  const addQDlv=qid=>updQO(qid,q=>({...q,deliverables:[...(q.deliverables||[]),{id:uid(),item:""}]}));
  const delQDlv=(qid,did)=>updQO(qid,q=>({...q,deliverables:(q.deliverables||[]).filter(d=>d.id!==did)}));


  const addQO=()=>{
    const existingQ = (editCS.quoteOverrides||[]);
    if(existingQ.length>0){toast("One CS per Quote","Each Quote No. can only have 1 CS Code. Edit the existing one.","error");return;}
    const quoteNo=genQuoteNo(opps);
    const csCode=genCSCode(quoteNo);
    const oppCode=genOppCode(opps);
    sECS(p=>({...p,quoteOverrides:[{
      id:uid(),csCode,oppCode,quoteNo,custId:"",salesAgent:"",contactPersonId:"",salesPrice:0,
      projectTitle:"",
      projectScope:"",
      projectMonths:editCS.projectMonths||3,
      internalCosts:(editCS.internalCosts||[]).map(r=>({...r,id:uid()})),
      externalCosts:(editCS.externalCosts||[]).map(r=>({...r,id:uid()})),
      tasks:(editCS.tasks||[]).map(t=>({...t,id:uid()})),
      installments:[
        {id:uid(),seq:1,label:"",pct:40,detail:"",recvMonth:1},
        {id:uid(),seq:2,label:"",pct:40,detail:"",recvMonth:2},
        {id:uid(),seq:3,label:"",pct:20,detail:"",recvMonth:3},
      ],
      lineItems:[{id:uid(),description:"",qty:1,unit:"Job",unitPrice:0}],
      deliverables:[
        {id:uid(),item:""},
      ],
      notes:"",
    }]}));
  };
  const delQO=id=>sECS(p=>({...p,quoteOverrides:(p.quoteOverrides||[]).filter(r=>r.id!==id)}));

  const handleSave=()=>{
    // Build detailed save log entries — one per completed quotation, plus a general entry
    const newSaveEntries=[];
    const savedQOIds=[];   // IDs of quoteOverrides that get committed → removed from screen

    (editCS.quoteOverrides||[]).forEach(q=>{
      // Commit any QO that has custId + oppCode (new OR re-opened re-edit)
      if(q.custId&&q.oppCode){
        const qIC=calcIC(q.internalCosts||[]),qEC=calcEC(q.externalCosts||[],true),qOPEX=calcTask(q.tasks||[]);
        const qCost=qIC+qEC+qOPEX;
        const csCode=q.csCode||genCSCode(q.quoteNo||"");
        const qMg=margin(q.salesPrice,qCost);
        const cust=customers.find(c=>c.id===q.custId);
        const existingOpp=opps.find(o=>o.oppCode===q.oppCode);
        const opp={
          id:q.oppCode,custId:q.custId,oppCode:q.oppCode,quoteNo:q.quoteNo,csCode,jobCode:existingOpp?.jobCode||"",
          serviceCode:editCS.serviceCode,serviceType:editCS.serviceType,salesPrice:q.salesPrice,totalCost:qCost,
          status:existingOpp?.status||"Proposal",
          assignedTo:q.salesAgent||cust?.assignedTo||SALES_USERS[0]?.id||user.id,
          createdDate:existingOpp?.createdDate||today(),lostReason:existingOpp?.lostReason||"",
          activityLog:[
            ...(existingOpp?.activityLog||[]),
            {id:uid(),ts:nowTS(),author:user.id,note:`${existingOpp?"Updated":"Created"} from Cost Sheet ${csCode} (${editCS.serviceCode}) · ${q.quoteNo} · Cost: ฿${fmt(qCost)} · Margin: ${qMg}%`},
          ],
          remark:q.notes||existingOpp?.remark||"",
        };
        onSaveOpp(opp);
        savedQOIds.push(q.id);
        newSaveEntries.push({
          id:uid(),ts:nowTS(),author:user.id,
          note:`Quotation ${existingOpp?"updated":"saved"} → ${csCode} · ${q.quoteNo} · ${cust?.companyEN||q.custId} · Price ฿${fmt(q.salesPrice)} · Cost ฿${fmt(qCost)} · Margin ${qMg}%`,
          quoteSnapshot:{...q,csCode},  // stored for re-edit
        });
      }
    });

    // General save entry (always)
    newSaveEntries.push({id:uid(),ts:nowTS(),author:user.id,note:`Cost Sheet saved — ${selCode}`});

    // Remove committed quotations from quoteOverrides; keep uncommitted ones
    const remainingQOs=(editCS.quoteOverrides||[]).filter(q=>!savedQOIds.includes(q.id));

    const saved={
      ...editCS,
      stdPrice:editPrice,
      quoteOverrides:remainingQOs,
      saveLog:[...(editCS.saveLog||[]),...newSaveEntries],
    };
    onSave(saved);
    // Sync local editCS to reflect cleared quotations
    sECS(saved);

    const nOpps=savedQOIds.length;
    toast(
      "Cost Sheet saved",
      nOpps>0
        ? `${nOpps} Quotation${nOpps>1?"s":""} committed → OPP ${savedQOIds.length>0?"saved":"created"}. Cleared from Per-Quotation view.`
        : "Cost structure updated"
    );
  };

  const curSvc = SERVICES.find(s=>s.code===selCode);



  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Cost Sheet & Pricing</Span>
        <div></div>
      </div>

      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
        {SERVICES.map(s=>(
          <button key={s.code} onClick={()=>sCode(s.code)} style={{padding:"5px 11px",borderRadius:5,border:"1px solid",borderColor:selCode===s.code?"#0f172a":"#e2e8f0",background:selCode===s.code?"#0f172a":"#fff",color:selCode===s.code?"#fff":"#374151",fontSize:11,fontWeight:selCode===s.code?700:400,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontWeight:800,letterSpacing:"0.02em"}}>{s.code}</span>
            <span style={{fontSize:9,opacity:.7,whiteSpace:"nowrap",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</span>
          </button>
        ))}
      </div>

      <div style={{padding:"10px 16px",background:"#f1f5f9",borderRadius:7,marginBottom:12,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <SvcBadge code={selCode}/>
        <Span s={14} w={700} c="#0f172a">{curSvc?.name}</Span>
        

      </div>




      {/*  PER-QUOTATION VIEW  */}
      <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <Span s={16} w={800} c="#0f172a" style={{display:"block",marginBottom:2}}>
                Per-Quotation Cost Sheet{(editCS.quoteOverrides||[]).length>0?`: ${editCS.quoteOverrides[0].csCode}`:""}
              </Span>
              <Span s={12} c="#94a3b8">One CS Code per quotation — auto-generated. Save to create an Opportunity with actual cost automatically.</Span>
            </div>
            {(editCS.quoteOverrides||[]).length===0&&<Btn onClick={addQO}>+ New Quotation</Btn>}
          </div>
          {(editCS.quoteOverrides||[]).length===0&&(
            <div>
              {(editCS.saveLog||[]).filter(l=>l.quoteSnapshot).length>0&&(
                <div style={{marginBottom:12}}>
                  {Object.values(
                    [...(editCS.saveLog||[])].filter(l=>l.quoteSnapshot).reduce((acc,l)=>{
                      const key=l.quoteSnapshot.quoteNo;
                      if(!acc[key]||l.ts>acc[key].ts) acc[key]=l;
                      return acc;
                    },{})
                  ).sort((a,b)=>b.ts.localeCompare(a.ts)).map(l=>(
                    <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:7,marginBottom:6}}>
                      <span style={{fontSize:12,color:'#94a3b8',whiteSpace:'nowrap'}}>{l.ts}</span>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:'monospace',color:'#92400e',background:'#fef3c7',padding:'2px 8px',borderRadius:4,border:'1px solid #fde68a'}}>{l.quoteSnapshot.csCode}</span>
                      <span style={{fontSize:12,color:'#374151',flex:1}}>{l.quoteSnapshot.quoteNo} {customers.find(c=>c.id===l.quoteSnapshot.custId)?.companyEN||l.quoteSnapshot.custId}</span>
                      <Btn variant='ghost' style={{fontSize:13,padding:'4px 14px'}} onClick={()=>{
                        sECS(p=>({...p,quoteOverrides:[{...l.quoteSnapshot,id:uid()}]}));
                        const logEntry={id:uid(),ts:nowTS(),author:user.id,note:`Re-opened ${l.quoteSnapshot.csCode} for editing`};
                        sECS(p=>({...p,saveLog:[...(p.saveLog||[]),logEntry]}));
                      }}>Edit</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {(editCS.quoteOverrides||[]).map((q)=>(
            <QuoteCard key={q.id} q={q} editCS={editCS} customers={customers} opps={opps} user={user}
              setQF={setQF} setQIC={setQIC} setQEC={setQEC} setQTK={setQTK} setQInst={setQInst} setQDlv={setQDlv}
              addQEC={addQEC} addQTK={addQTK} addQInst={addQInst} addQDlv={addQDlv}
              delQIC={delQIC} delQEC={delQEC} delQTK={delQTK} delQO={delQO}
              reorderCOGS={reorderCOGS} reorderQTK={reorderQTK}
              updQO={updQO} handleSave={handleSave}
            />
          ))}
        </div>


    </div>
  );
};


// 
// SETUP GUIDE
// 
const SetupPage = () => (
  <div style={{maxWidth:760}}>
    <Span s={22} w={900} c="#0f172a" style={{display:"block",marginBottom:4,letterSpacing:"-0.03em"}}>Setup Guide</Span>
    <Span s={13} c="#94a3b8" style={{display:"block",marginBottom:20}}>Connect to Google Sheets as a zero-cost cloud database</Span>
    {[
      {n:"1",t:"Google Sheets Tabs Required",b:`Customers · Opportunities · Deliveries · Installments\nCostSheets_Std · CostSheets_Quotes · WorkLogs · ActivityLogs\nKPI_Splits · Users · Contacts`},
      {n:"2",t:"Apps Script — Universal Upsert",b:`function doPost(e){\n  const d=JSON.parse(e.postData.contents);\n  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(d.sheet);\n  const all=sh.getDataRange().getValues();\n  const idx=all.findIndex((r,i)=>i>0&&r[0]===d.row[0]);\n  if(idx>0) sh.getRange(idx+1,1,1,d.row.length).setValues([d.row]);\n  else sh.appendRow(d.row);\n  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);\n}`},
      {n:"3",t:"Deploy → Web App",b:`Extensions → Apps Script → Deploy → New Deployment\nType: Web App · Execute as: Me · Access: Anyone with Google Account`},
      {n:"4",t:"V8 Key Changes",b:`Users: 13 total (2 admin, 2 sales, 9 operation)\n  New: Piyabut Mahasabsombut · Taraphong Sriaram\n\nCustomers: Multiple Contact Persons per company with Active/Inactive status\n  Last Contact auto-synced from Delivery Work Log\n  Remark visible directly in table\n\nServices: Reordered (19 total) — CFO, CFP, ISO14064, ISO14067, CFOISO,\n  CNE, DR, TRN, GSTC, GHOTEL, GHOTELP, CSRDIW, AWD, REF, CSRAWD,\n  LCR (new), FS, CC, REC\n\nCost Sheet:\n  COGS field added to Standard & Per-Quotation pricing\n  Margin shown as both % and ฿ amount\n  Contact Person selector in Per-Quotation (filtered by customer)\n  CSV export now functional for all cost sheets\n\nOpportunities:\n  CS Code + Quote No. are clickable hyperlinks\n  Quotation tab: fill-in form matching Wave BCG PDF template\n  Print / Export PDF directly from Quotation tab\n  Margin shown as % and ฿ in table and form\n\nAll tabs: CSV Export enabled`},
    ].map(s=>(
      <Card key={s.n} style={{padding:20,marginBottom:12,display:"flex",gap:14}}>
        <div style={{width:32,height:32,background:"#0f172a",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,flexShrink:0}}>{s.n}</div>
        <div style={{flex:1}}><Span s={14} w={700} c="#0f172a" style={{display:"block",marginBottom:8}}>{s.t}</Span><pre style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:12,fontSize:13,color:"#374151",whiteSpace:"pre-wrap",lineHeight:1.6,margin:0}}>{s.b}</pre></div>
      </Card>
    ))}
  </div>
);

// 
// ROOT APP
// 
const NAV = [
  {key:"dashboard",label:"Dashboard / KPI"},
  {key:"customers",label:"Customers"},
  {key:"costsheet",label:"Cost Sheet"},
  {key:"opps",label:"Opportunities"},
  {key:"delivery",label:"Delivery"},
  {key:"setup",label:"Setup"},
];

function App() {
  const [user,sUser] = useState(()=>{ try { const s=localStorage.getItem("crm_user"); if(s){ const p=JSON.parse(s); return USERS.find(u=>u.id===p.id)||null; } } catch(e){} return null; });

  // Hash-based routing — syncs with browser back/forward
  const getPageFromHash = () => { const h=location.hash.replace("#",""); return NAV.find(n=>n.key===h)?h:"dashboard"; };
  const [page,setPageState] = useState(getPageFromHash);
  const sPage = (p) => { location.hash = p; setPageState(p); };
  useEffect(()=>{
    const onHash = () => setPageState(getPageFromHash());
    window.addEventListener("hashchange", onHash);
    return ()=>window.removeEventListener("hashchange", onHash);
  },[]);
  const [customers,sCusts]   = useState(SEED_CUSTOMERS);
  const [opps,sOpps]         = useState(SEED_OPPS);
  const [deliveries,sDlv]    = useState(SEED_DELIVERIES);
  const [costSheets,sCS]     = useState(SEED_COST_SHEETS);
  const [initSvcCode,sSvcCode] = useState(null);
  const [initCustId,sCustId]   = useState(null);
  const [initOppCode,sOppCode] = useState(null);
  const [kpiSplits,sKPI]     = useState({2026:DEFAULT_SPLIT.slice(),2027:DEFAULT_SPLIT.slice(),2028:DEFAULT_SPLIT.slice()});
  const [gsStatus,sGSStatus] = useState("idle"); // "idle"|"loading"|"synced"|"error"
  const {toasts,show:toast}  = useToast();

  //  Load all data from Google Sheets on mount 
  useEffect(()=>{
    sGSStatus("loading");
    Promise.all([
      gsGet("customers"),
      gsGet("opportunities"),
      gsGet("deliveries"),
      gsGet("costsheets"),
      gsGet("kpi"),
    ]).then(([c,o,d,cs,k])=>{
      if(c.length) sCusts(c.map(x=>({...x,id:String(x.id||"")})));
      if(o.length) sOpps(o.map(x=>({...x,id:String(x.id||""),custId:String(x.custId||"")})));
      if(d.length) sDlv(d.map(x=>({...x,id:String(x.id||""),custId:String(x.custId||"")})));
      // Merge loaded costSheets with defaults for any services not yet in Sheet
      // Always clear quoteOverrides on load — user must click Edit to re-open
      if(cs.length){
        const merged = SEED_COST_SHEETS.map(def=>{
          const fromGS = cs.find(x=>x.serviceCode===def.serviceCode);
          return fromGS ? {...def,...fromGS, quoteOverrides:[]} : def;
        });
        sCS(merged);
      }
      if(k.length){
        const kpiObj={};
        k.forEach(r=>{ if(r.year) kpiObj[r.year]=r.splits||DEFAULT_SPLIT.slice(); });
        if(Object.keys(kpiObj).length) sKPI(p=>({...p,...kpiObj}));
      }
      sGSStatus("synced");
    }).catch(()=>sGSStatus("error"));
  },[]);

  //  saveItem: update local state + push to Google Sheets 
  const saveItem = (setter, collection) => item => {
    const norm = (item.custId!==undefined)
      ? {...item,id:String(item.id||""),custId:String(item.custId||"")}
      : {...item,id:String(item.id||"")};
    setter(p => p.find(x=>x.id===norm.id) ? p.map(x=>x.id===norm.id?norm:x) : [...p,norm]);
    if(collection) gsSave(collection, norm);
  };
  //  deleteItem: remove from local state + delete from Google Sheets 
  const deleteItem = (setter, collection) => id => {
    setter(p => p.filter(x=>x.id!==id));
    if(collection) gsDelete(collection, id);
  };
  //  saveOpp: save opp + auto-sync customers.status (Option 1) 
  // Priority: Won > active OPP status > Lost
  const deriveOppStatus = (custId, allOpps) => {
    const custOpps = allOpps.filter(o=>o.custId===custId);
    if(!custOpps.length) return null;
    const sorted = [...custOpps].sort((a,b)=>b.createdDate?.localeCompare(a.createdDate||"")||0);
    if(sorted.some(o=>o.status==="Won")) return "Won";
    const active = sorted.find(o=>o.status!=="Lost");
    if(active) return active.status;
    return "Lost";
  };
  const saveOpp = opp => {
    const norm = {...opp, id:String(opp.id||""), custId:String(opp.custId||"")};
    // 1. Single sOpps call — build merged list, then sync customer inside same updater
    sOpps(prev => {
      // Build new opps list with this opp upserted
      const next = prev.find(x=>x.id===norm.id)
        ? prev.map(x=>x.id===norm.id ? norm : x)
        : [...prev, norm];
      // Derive customer status from the fully updated opps list
      if(norm.custId) {
        const newStatus = deriveOppStatus(norm.custId, next);
        if(newStatus) {
          sCusts(cList => cList.map(c => {
            if(c.id !== norm.custId) return c;
            if(c.status === newStatus) return c; // already correct, no GS call needed
            const updated = {...c, status: newStatus};
            gsSave("customers", updated); // push to GS
            return updated;
          }));
        }
      }
      return next;
    });
    // 2. Push opp to GS
    gsSave("opportunities", norm);
  };

  //  saveCS: update local + push entire costsheets collection 
  const saveCS = cs => {
    sCS(p => {
      const next = p.find(x=>x.serviceCode===cs.serviceCode)
        ? p.map(x=>x.serviceCode===cs.serviceCode?cs:x)
        : [...p,cs];
      gsSave("costsheets", cs); // upsert single cost sheet record
      return next;
    });
  };

  //  Sync status badge 
  const SyncBadge = () => {
    const map = {
      loading: {label:"Syncing…",  c:"#d97706", bg:"#fef3c7"},
      synced:  {label:" GS Live", c:"#16a34a", bg:"#dcfce7"},
      error:   {label:"GS Offline",c:"#dc2626", bg:"#fee2e2"},
      idle:    {label:"GS Ready",  c:"#64748b", bg:"#f1f5f9"},
    };
    const s = map[gsStatus]||map.idle;
    return (
      <span style={{fontSize:10,fontWeight:700,color:s.c,background:s.bg,
        padding:"2px 8px",borderRadius:10,border:`1px solid ${s.c}33`,whiteSpace:"nowrap"}}>
        {s.label}
      </span>
    );
  };

  if(!user) return <LoginPage onLogin={u=>{localStorage.setItem("crm_user",JSON.stringify({id:u.id}));sUser(u);sPage("dashboard");}}/>;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans','Noto Sans Thai',system-ui,sans-serif",fontSize:15}}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}} input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0} input[type=number]{-moz-appearance:textfield}`}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:0}}>
          <div onClick={()=>sPage("dashboard")} style={{paddingRight:18,borderRight:"1px solid #f1f5f9",marginRight:4,flexShrink:0,cursor:"pointer"}}>
            <div style={{fontSize:13,fontWeight:900,color:"#0f172a",letterSpacing:"-0.04em",lineHeight:1.2}}>Climate<br/>CRM</div>
          </div>
          <nav style={{display:"flex",flex:1,overflow:"auto"}}>
            {NAV.map(n=><button key={n.key} onClick={()=>sPage(n.key)} style={{padding:"15px 13px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:page===n.key?800:500,color:page===n.key?"#0f172a":"#94a3b8",borderBottom:page===n.key?"2.5px solid #0f172a":"2.5px solid transparent",whiteSpace:"nowrap"}}>{n.label}</button>)}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <SyncBadge/>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#374151"}}>{user.name}</div>
              <div style={{fontSize:10,color:user.role==="md"?"#0ea5e9":user.role==="admin"?"#16a34a":user.role==="operation"?"#7c3aed":"#1e40af",textTransform:"uppercase",letterSpacing:"0.06em"}}>{user.role}</div>
            </div>
            <button onClick={()=>{localStorage.removeItem("crm_user");sUser(null);window.location.reload();}} style={{padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:5,background:"#fff",cursor:"pointer",fontSize:13,color:"#64748b"}}>Sign Out</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1440,margin:"0 auto",padding:24}}>
        {page==="dashboard" && <DashboardKPI user={user} customers={customers} opps={opps} deliveries={deliveries} kpiSplits={kpiSplits} setKpiSplits={sKPI} toast={toast}/>}
        {page==="customers" && <CustomersPage user={user} customers={customers} opps={opps} onSave={saveItem(sCusts,"customers")} onDelete={deleteItem(sCusts,"customers")} toast={toast} deliveries={deliveries} initCustId={initCustId} onCustReady={()=>sCustId(null)}/>}
        {page==="opps"      && <OppsPage user={user} customers={customers} opps={opps} onSave={saveOpp} onDelete={deleteItem(sOpps,"opportunities")} onSaveCS={saveCS} deliveries={deliveries} onSaveDelivery={saveItem(sDlv,"deliveries")} onDeleteDelivery={deleteItem(sDlv,"deliveries")} toast={toast} costSheets={costSheets} onGoToCS={code=>{sSvcCode(code);sPage("costsheet");}} initOppCode={initOppCode} onOppReady={()=>sOppCode(null)}/>}
        {page==="delivery"  && <DeliveryPage user={user} customers={customers} opps={opps} deliveries={deliveries} onSave={saveItem(sDlv,"deliveries")} toast={toast} costSheets={costSheets} onGoToCS={code=>{sSvcCode(code);sPage("costsheet");}} onGoToCust={id=>{sCustId(id);sPage("customers");}} onGoToOpp={code=>{sOppCode(code);sPage("opps");}}/>}
        {page==="costsheet" && <CostSheetPage costSheets={costSheets} onSave={saveCS} customers={customers} opps={opps} user={user} onSaveOpp={saveOpp} toast={toast} initSvcCode={initSvcCode} onSvcReady={()=>sSvcCode(null)}/>}
        {page==="setup"     && <SetupPage/>}
      </div>
      <Toast toasts={toasts}/>
    </div>
  );
}
