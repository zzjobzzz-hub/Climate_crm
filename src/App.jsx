// React, useState, useMemo, useRef, useEffect, useCallback — globals from CDN

// 
// SECURITY CONFIG
// S1: Passwords validated server-side via Google Apps Script (no credentials in source)
// S2: User list loaded from GS "users" tab at runtime (id, name, role only — no hash)
// S3: Session expires after SESSION_HOURS hours
// S4: All GS requests include GS_AUTH_TOKEN matched against Script Properties on server
// 
const GS_AUTH_TOKEN  = "wB@CRM-2026-xK9q";   // Must match AUTH_SECRET in GAS Script Properties
const SESSION_HOURS  = 4;
const SESSION_KEY    = "crm_session";
const SESSION_EXPIRY_MS = SESSION_HOURS * 60 * 60 * 1000;

// S3: Session helpers
const saveSession = user => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id, name: user.name, email: user.email, role: user.role,
    expiry: Date.now() + SESSION_EXPIRY_MS,
  }));
};
const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.expiry || Date.now() > s.expiry) { localStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch (_) { return null; }
};
const clearSession = () => localStorage.removeItem(SESSION_KEY);

// S2: USERS, SALES_USERS, OP_USERS are populated at runtime from GS "users" tab.
// These start empty and are filled by the App() useEffect on mount.
// All dropdown/lookup code uses these module-level arrays so they work once populated.
let USERS       = [];
let SALES_USERS = [];
let OP_USERS    = [];
let MANAGER_USERS = [];

// 
// CONSTANTS
// 
const CRM_STATUSES = ["Lead","Qualified","Email Profile","Meeting","Proposal","Negotiation","Won","Lost"];
const OPP_STATUSES = ["KYC","Proposal","Negotiation","Won","Lost"];
const DLV_STATUSES = ["In Progress","Pending Client","Under Review","Delivered","Completed","On Hold"];
// Req 8: Add "Verification" before "Final Delivery"
const DLV_STEPS = ["Contract Signed","Kick-off Meeting","Data Collection","Analysis","Report Draft",
                   "Client Review","Revision","Verification","Final Delivery","Invoice Sent","Completed"];
const INS_STATUSES = ["Pending","Invoiced","Received","Overdue"];
const LOST_REASONS = ["Price Too High","Budget Frozen","Selected Competitor","Scope Mismatch",
                      "Project Postponed","No Response","Internal Policy","Inactive","Other"];
// In-House levels with standard day rates (THB/day)
const IH_LEVELS = {Manager:1441, Senior:948, Junior:600};
const IH_LEVEL_NAMES = Object.keys(IH_LEVELS);
// Sales agent mobile numbers
const SALES_MOBILE = {"songyot.kr":"062-197-4449","theerayut.c":"080-441-2295"};

const STATUS_CLR = {
  Lead:"#94a3b8",Qualified:"#60a5fa","Email Profile":"#818cf8",Meeting:"#f472b6",
  KYC:"#64748b",Proposal:"#a78bfa",Negotiation:"#f59e0b",Won:"#22c55e",Lost:"#ef4444",
  "In Progress":"#3b82f6","Pending Client":"#f59e0b","Under Review":"#8b5cf6",
  Delivered:"#06b6d4",Completed:"#16a34a","On Hold":"#ef4444",
};
const RANK_CLR = { High:{c:"#16a34a",bg:"#dcfce7"}, Medium:{c:"#d97706",bg:"#fef3c7"}, Low:{c:"#dc2626",bg:"#fee2e2"} };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STAGE_COLORS = ["#64748b","#818cf8","#f59e0b","#22c55e","#ef4444"];
const SVC_PALETTE = ["#3b82f6","#f59e0b","#22c55e","#ef4444","#8b5cf6","#06b6d4","#f472b6","#84cc16",
                     "#a78bfa","#fb923c","#14b8a6","#e879f9","#fbbf24","#34d399","#60a5fa","#f87171","#c084fc","#4ade80"];

// Wave BCG brand identity — used sparingly per The One Teal Rule (teal ≤5% of any screen).
// teal = the brand voice (mark + one hero action + quotation signature). ink/navy = authority/headings.
const BRAND = { teal:"#00b3a4", tealDeep:"#00897e", navy:"#0c1a2e", ink:"#0f172a" };

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
  // VRF: Verifier
  {code:"VRF",    name:"Verifier",                           stdCost:0,  stdPrice:0},
  // OTH: 3M+6S+5J + COGS
  {code:"OTH",    name:"Other Service",                      stdCost:0,  stdPrice:0},
  
];

const ANNUAL_KPI    = 0;
const DEFAULT_SPLIT = [0,0,0,0,0,0,0,0,0,0,0,0]; // Adjust & Save in Dashboard KPI tab

// 
// UTILS
// 
const fmt   = n => new Intl.NumberFormat("en-US").format(Math.round(n||0));
const fmtM  = n => `${((n||0)/1e6).toFixed(2)}M`;
const fmtK  = n => (n||0)>=1e6?`฿${((n||0)/1e6).toFixed(1)}M`:(n||0)>=1000?`฿${Math.round((n||0)/1000)}K`:`฿${fmt(n)}`;
const fmtDate = d => { if(!d) return "—"; const [y,m,day]=String(d).split("-"); if(!y||!m||!day) return d; return `${day}-${MONTHS[+m-1]||m}-${y}`; };
// Thai date: Thai month abbrev + Buddhist-era year (e.g. 29 เม.ย. 2569)
const TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const fmtDateTH = d => { if(!d) return "—"; const [y,m,day]=String(d).split("-"); if(!y||!m||!day) return d; const by=+y<2500?+y+543:+y; return `${+day} ${TH_MONTHS[+m-1]||m} ${by}`; };
const uid   = () => `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
const today = () => new Date().toISOString().slice(0,10);
const nowTS = () => { const d=new Date(); return `${d.getFullYear()+543}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; };
const pad2  = n => String(n).padStart(2,"0");
const safeArr = v => { if(Array.isArray(v)) return v; if(typeof v==="string"&&v.trim().startsWith("[")) { try{return JSON.parse(v);}catch(_){} } return []; };
// Coerce a notes/deliverables value into [{id,item}]: arrays pass through; a legacy
// multi-line string becomes one item per non-empty line; everything else → [].
const toItemList = v => {
  const arr = Array.isArray(v) ? v
    : (typeof v==="string" && v.trim() ? v.split("\n").filter(t=>t.trim()).map(t=>({item:t})) : []);
  // Assign deterministic ids so render + edit handlers always agree (random ids per
  // render would remount inputs every keystroke → edits/deletes wouldn't stick).
  return arr.map((it,i) => (it && it.id) ? it : {id:`li-${i}`, item:(it && typeof it==="object") ? (it.item||"") : (it||"")});
};
// Quotation length caps — keep the exported PDF on one A4 page so the signature block isn't clipped.
// Derived from the fixed-height page layout (see Project Scope / Deliverables / Notes in QuoteCard).
const SCOPE_MAX_CHARS = 3000, SCOPE_MAX_LINES = 15, DELIV_MAX = 6, NOTES_MAX = 6;
const calcSuccessRate = o => {
  if(o.status==="Won") return 100;
  if(o.status==="Lost") return 0;
  if(o.successRate&&+o.successRate>0) return Math.min(100,Math.max(0,+o.successRate));
  if(o.status==="Negotiation") return 60;
  if(o.status==="Proposal")    return 50;
  return 0;
};
const successRateColor = pct => pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";

const calcIC   = rows => (rows||[]).reduce((s,r)=>s+(r.qty||0)*(r.rate||0),0);
const calcEC   = (rows,coOnly) => (rows||[]).filter(r=>coOnly?!r.clientBorne:true).reduce((s,r)=>s+(r.qty||0)*(r.rate||0),0);
const calcTask = tasks => (tasks||[]).reduce((s,t)=>{const ag=Array.isArray(t.agents)&&t.agents.length>0&&typeof t.agents[0]==="object"?t.agents:[];const mgr=ag.length>0?ag.reduce((a,x)=>a+(x.manager||0),0):(t.manager||0);const sr=ag.length>0?ag.reduce((a,x)=>a+(x.senior||0),0):(t.senior||0);const jr=ag.length>0?ag.reduce((a,x)=>a+(x.junior||0),0):(t.junior||0);return s+mgr*IH_LEVELS.Manager+sr*IH_LEVELS.Senior+jr*IH_LEVELS.Junior;},0);
const calcTotalCS = cs => calcIC(cs.costs||[]) + calcTask(cs.tasks||[]);
// Legacy helpers kept for per-quotation overrides
const calcIH  = rows => (rows||[]).reduce((s,r)=>s+(r.days||0)*(r.rate||IH_LEVELS[r.level]||0),0);
const calcOS  = rows => (rows||[]).reduce((s,r)=>s+(r.amount||0),0);
const calcTrv = (rows,co) => (rows||[]).filter(r=>co?!r.clientBorne:r.clientBorne).reduce((s,r)=>s+(r.amount||0),0);
const calcQCost = q => {
  const ic=calcIC(q.costs||[]),opex=calcTask(q.tasks||[]);
  return ic+opex;
};
const margin     = (p,c) => p>0?((p-c)/p*100).toFixed(1):"0.0";
const marginAmt  = (p,c) => Math.round((p||0)-(c||0));

// Multi-column sort model. `sorts` is an ordered [{col,dir}] list; priority = index.
// Click cycle on a column: absent → asc → desc → removed.
const cycleSort = (sorts, col) => {
  const cur = sorts.find(s => s.col === col);
  if (!cur)              return [...sorts, {col, dir:"asc"}];
  if (cur.dir === "asc") return sorts.map(s => s.col===col ? {...s, dir:"desc"} : s);
  return sorts.filter(s => s.col !== col);           // was desc → drop the key
};
// Comparator across all keys in priority order — first non-zero result wins.
// getV(row, col) is per-page; numbers compare numerically, everything else by Thai locale.
const multiCmp = (a, b, sorts, getV) => {
  for (const {col, dir} of sorts) {
    const va = getV(a, col), vb = getV(b, col);
    const c = (typeof va === "number" && typeof vb === "number")
      ? va - vb : String(va).localeCompare(String(vb), "th");
    if (c !== 0) return dir === "asc" ? c : -c;
  }
  return 0;
};

const YEAR   = new Date().getFullYear() + 543; // Thai Buddhist Era (พ.ศ.)
const YEAR2  = String(YEAR).slice(-2);          // 2-digit BE year, e.g. 2569 -> "69"
const padNum = n => String(n).padStart(4,"0");
const nextNum = (items,field) => { const ns=items.map(x=>{const m=String(x[field]||"").match(/-(\d{3,})$/);return m?parseInt(m[1]):0;}); return Math.max(0,...ns)+1; };
const genOppCode = opps => `O${YEAR2}-${padNum(nextNum(opps,"oppCode"))}`;
const genQuoteNo = opps => `Q${YEAR2}-${padNum(nextNum(opps,"quoteNo"))}`;
const genJobCode = opp  => "J"+(opp||"").slice(1);
const genCSCode  = qtNo => "C"+(qtNo||"").slice(1);

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
  costs: [],          // unified COGS cost rows
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
// S4: All requests include GS_AUTH_TOKEN verified server-side
// 
const GS_URL = "https://script.google.com/macros/s/AKfycbye1TYl6dSxlhvzkQwaLXHlGRu0WZPHX0FMfEV0W9-1gQ38n0v0yk1h0js4isHocy_JVA/exec";

// S1: Server-side login — credentials validated in GAS, never in browser
const gsLogin = async (email, password) => {
  const r = await fetch(GS_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"login", email, password}),
  });
  return r.json();
};

// Read a full collection from Google Sheets (S4: token in query param)
const gsGet = async (collection) => {
  try {
    const url = `${GS_URL}?collection=${encodeURIComponent(collection)}&token=${encodeURIComponent(GS_AUTH_TOKEN)}`;
    const r = await fetch(url, {cache:"no-store",redirect:"follow"});
    const j = await r.json();
    return j.ok ? j.data : [];
  } catch(e) { return []; }
};

// Normalize a record before saving — moves plain JSON fields into _json twins
// This ensures the sheet never has data split across both "contacts" and "contacts_json"
const GS_JSON_FIELDS = ["contacts","saveLog","activityLog","costs","tasks","quoteOverrides","quotationData","installments","splits","tags"];
const normalizeForGS = record => {
  const out = {...record};
  GS_JSON_FIELDS.forEach(field => {
    const plain = record[field];
    const json  = record[field+"_json"];
    const val   = (plain !== undefined && plain !== null && plain !== "") ? plain
                : (json  !== undefined && json  !== null && json  !== "") ? json
                : [];
    out[field+"_json"] = val;
    out[field] = "";  // always blank the plain twin
  });
  return out;
};

// Save (upsert) a single record — fire-and-forget, non-blocking (S4: token in body)
let _onSaveError = null; // registered by App on mount; called on any save failure
const gsSave = (collection, record, userId="", summary="") => {
  fetch(GS_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"save", collection, record:normalizeForGS(record), userId, summary, token:GS_AUTH_TOKEN}),
  }).catch(()=>{ if(_onSaveError) _onSaveError(); });
};

// Save entire collection (S4: token in body)
const gsSaveAll = (collection, records) => {
  fetch(GS_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"saveAll", collection, records, token:GS_AUTH_TOKEN}),
  }).catch(()=>{});
};

// Delete a single record from Google Sheets (S4: token in body)
const gsDelete = (collection, id) => {
  fetch(GS_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"delete", collection, id, token:GS_AUTH_TOKEN}),
  }).catch(()=>{});
};
// 
// UI PRIMITIVES
// 
const SI = {width:"100%",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 11px",fontSize:14,color:"#1e293b",background:"#fafafa",outline:"none",boxSizing:"border-box"};
const Inp  = ({style,...p}) => <input {...p} style={{...SI,...style}}/>;
// Numeric input that shows commas and allows empty/partial editing
const NumInp = ({value,onChange,style,showZero,...p}) => {
  const [focused,setFocused] = React.useState(false);
  const ref = React.useRef();
  const zeroStr = showZero ? "0" : "";
  const [raw,setRaw] = React.useState(value===0?zeroStr:String(value));
  React.useEffect(()=>{ if(!focused) setRaw(value===0?zeroStr:String(value)); },[value,focused]);
  const display = focused ? raw : (value===0?zeroStr:Number(value).toLocaleString("en-US"));
  return <input ref={ref} {...p} type="text" inputMode="numeric"
    value={display}
    onFocus={()=>{setFocused(true);setRaw(value===0?"":String(value));}}
    onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,"");setRaw(v);const n=parseFloat(v);if(!isNaN(n))onChange(n);else if(v===""||v===".")onChange(0);}}
    onBlur={()=>{setFocused(false);}}
    style={{...SI,...style,textAlign:"right"}}/>;
};
const Sel  = ({style,children,...p}) => <select {...p} style={{...SI,...style}}>{children}</select>;
// SuccessRateInput: local state — only commits to parent on blur (no re-render on keystroke)
const SuccessRateInput = ({value, onCommit}) => {
  const [local, setLocal] = React.useState(value===0||value===undefined||value===""?"":String(value));
  React.useEffect(()=>{ setLocal(value===0||value===undefined||value===""?"":String(value)); },[value]);
  return (
    <input type="text" inputMode="numeric" value={local} placeholder="Auto"
      onChange={e=>{ const v=e.target.value.replace(/[^0-9.]/g,""); setLocal(v); }}
      onBlur={()=>{ const n=parseFloat(local); onCommit(isNaN(n)?0:Math.min(100,Math.max(0,n))); }}
      style={{...SI,width:72,textAlign:"right"}}/>
  );
};
const Txta = ({style,...p}) => <textarea {...p} style={{...SI,resize:"vertical",...style}}/>;

// Button system — class-based so every button gets real hover / focus-visible / active
// states (inline styles can't). Injected once; variants follow DESIGN.md roles.
// Primary = ink-slate (committing action). Export/ghost/danger = quiet secondaries.
// Brand = the single reserved teal hero action (The One Teal Rule).
const WB_BTN_CSS = `
.wb-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 15px;
  border:1px solid transparent;border-radius:7px;font-family:inherit;font-size:14px;font-weight:600;
  line-height:1;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent;
  transition:background .16s cubic-bezier(.25,1,.5,1),border-color .16s ease,color .16s ease,box-shadow .16s ease,transform .12s ease;}
.wb-btn>svg{flex-shrink:0;display:block;}
.wb-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(30,64,175,.30);}
.wb-btn:active{transform:translateY(.5px);}
.wb-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.wb-btn--sm{gap:5px;padding:6px 11px;font-size:12.5px;border-radius:6px;}
.wb-btn--icon{padding:7px;}
.wb-btn--primary{background:#0f172a;color:#fff;}
.wb-btn--primary:not(:disabled):hover{background:#020617;box-shadow:0 2px 8px rgba(15,23,42,.22);}
.wb-btn--ghost{background:#fff;color:#475569;border-color:#e2e8f0;}
.wb-btn--ghost:not(:disabled):hover{background:#f8fafc;color:#0f172a;border-color:#cbd5e1;}
.wb-btn--export{background:#fff;color:#1e40af;border-color:#dbe4f5;}
.wb-btn--export:not(:disabled):hover{background:#eff6ff;border-color:#bfdbfe;}
.wb-btn--success{background:#dcfce7;color:#15803d;border-color:#86efac;}
.wb-btn--success:not(:disabled):hover{background:#bbf7d0;border-color:#4ade80;}
.wb-btn--danger{background:#fff;color:#dc2626;border-color:#fecaca;}
.wb-btn--danger:not(:disabled):hover{background:#fef2f2;border-color:#fca5a5;}
.wb-btn--danger-solid{background:#dc2626;color:#fff;}
.wb-btn--danger-solid:not(:disabled):hover{background:#b91c1c;box-shadow:0 2px 8px rgba(220,38,38,.30);}
.wb-btn--danger-solid:focus-visible{box-shadow:0 0 0 3px rgba(220,38,38,.32);}
.wb-btn--brand{background:#00897e;color:#fff;}
.wb-btn--brand:not(:disabled):hover{background:#00736a;box-shadow:0 2px 10px rgba(0,179,164,.32);}
/* Icon-only ghost button — for in-row and inline micro-actions (edit / delete / save / cancel). */
.wb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
  border:none;border-radius:6px;background:transparent;color:#94a3b8;cursor:pointer;flex-shrink:0;
  transition:background .14s ease,color .14s ease;}
.wb-iconbtn>svg{display:block;}
.wb-iconbtn:hover{background:#f1f5f9;color:#0f172a;}
.wb-iconbtn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(30,64,175,.30);}
.wb-iconbtn--danger:hover{background:#fef2f2;color:#dc2626;}
.wb-iconbtn--accept:hover{background:#dcfce7;color:#15803d;}
.wb-iconbtn--sm{width:22px;height:22px;border-radius:5px;}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-btn-css")) {
  const _s = document.createElement("style"); _s.id = "wb-btn-css"; _s.textContent = WB_BTN_CSS;
  document.head.appendChild(_s);
}
// icon: optional leading SVG node. size: "sm" for compact toolbar buttons.
const Btn = ({variant="primary",size,icon,iconOnly,className="",style,children,...p}) => (
  <button {...p}
    className={`wb-btn wb-btn--${variant}${size==="sm"?" wb-btn--sm":""}${iconOnly?" wb-btn--icon":""}${className?" "+className:""}`}
    style={style}>{icon}{children}</button>
);
// Record count shown beside a page title.
const CountPill = ({n,label}) => <span style={{fontSize:12,fontWeight:700,color:"#475569",background:"#f1f5f9",borderRadius:999,padding:"2px 9px",minWidth:22,textAlign:"center",lineHeight:1.55}}>{n}{label&&<span style={{fontWeight:500,marginLeft:4,color:"#94a3b8"}}>{label}</span>}</span>;
// Icon-only button for in-row / inline micro-actions. variant: "danger" | "accept". size: "sm".
const IconBtn = ({variant,size,title,style,children,...p}) => (
  <button {...p} title={title}
    className={`wb-iconbtn${variant?` wb-iconbtn--${variant}`:""}${size==="sm"?" wb-iconbtn--sm":""}`}
    style={style}>{children}</button>
);

const Card  = ({children,style,...rest}) => <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,...style}} {...rest}>{children}</div>;
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

// ── Customer tags ──
// User-defined labels (e.g. "hotel"). Chip colour is deterministic per tag name so the
// same tag reads the same everywhere. allTags powers the filter + input suggestions.
const TAG_PALETTE = [
  {bg:"#dbeafe",c:"#1e40af"},{bg:"#dcfce7",c:"#15803d"},{bg:"#fef3c7",c:"#92400e"},
  {bg:"#ede9fe",c:"#6d28d9"},{bg:"#fee2e2",c:"#b91c1c"},{bg:"#cffafe",c:"#0e7490"},
  {bg:"#fce7f3",c:"#be185d"},{bg:"#ecfccb",c:"#4d7c0f"},{bg:"#ffedd5",c:"#c2410c"},
];
const tagColor = tag => {
  let h=0; const s=String(tag||""); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0;
  return TAG_PALETTE[h % TAG_PALETTE.length];
};
const allTags = customers => [...new Set((customers||[]).flatMap(c=>safeArr(c.tags)))].sort((a,b)=>a.localeCompare(b));
const TagChip = ({tag,onRemove,size=11}) => { const cl=tagColor(tag); return (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,background:cl.bg,color:cl.c,fontWeight:700,fontSize:size,padding:size>11?"3px 9px":"1px 7px",borderRadius:999,whiteSpace:"nowrap",lineHeight:1.5,maxWidth:"100%"}}>
    <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{tag}</span>
    {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove(tag);}} title={`Remove ${tag}`} style={{border:"none",background:"none",color:cl.c,cursor:"pointer",padding:0,lineHeight:1,fontSize:size+2,opacity:.7,flexShrink:0}}>×</button>}
  </span>
);};

// Tag input with a styled, clickable suggestion dropdown (replaces native <datalist>).
// Caller owns `value`/`onChange` (the pending typed text) and must render this inside a
// position:relative ancestor so the dropdown anchors correctly. onCommit fires with the
// chosen/typed tag text on click, Enter, or Tab — caller decides what "commit" means
// (add a chip, stage a bulk-assign value, etc.) and is responsible for clearing `value`.
const TagTypeahead = ({value,onChange,suggestions=[],onCommit,placeholder,inputStyle}) => {
  const [open,setOpen] = React.useState(false);
  const [hi,setHi] = React.useState(0);
  const q = value.trim().toLowerCase();
  const filtered = suggestions.filter(t=>t.toLowerCase().includes(q));

  const commit = t => { const v=(t??"").trim(); if(!v) return; onCommit(v); setOpen(false); };

  const handleKeyDown = e => {
    if(open && filtered.length>0) {
      if(e.key==="ArrowDown"){ e.preventDefault(); setHi(i=>Math.min(i+1,filtered.length-1)); return; }
      if(e.key==="ArrowUp"){   e.preventDefault(); setHi(i=>Math.max(i-1,0)); return; }
      if(e.key==="Enter"||e.key==="Tab"){ e.preventDefault(); commit(filtered[hi]); return; }
      if(e.key==="Escape"){ setOpen(false); return; }
    }
    if(e.key==="Enter"){ e.preventDefault(); commit(value); }
  };

  return (<>
    <input value={value} placeholder={placeholder} style={inputStyle}
      onChange={e=>{ onChange(e.target.value); setOpen(true); setHi(0); }}
      onFocus={()=>setOpen(true)}
      onBlur={()=>setTimeout(()=>setOpen(false),150)}
      onKeyDown={handleKeyDown}/>
    {open && filtered.length>0 && (
      <div style={{position:"absolute",left:0,right:0,top:"100%",marginTop:4,zIndex:800,background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,boxShadow:"0 8px 24px rgba(0,0,0,.18)",maxHeight:200,overflow:"auto"}}>
        {filtered.map((t,i)=>{ const cl=tagColor(t); return (
          <div key={t}
            onMouseDown={e=>{ e.preventDefault(); commit(t); }}
            style={{padding:"7px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:i===hi?"#eff6ff":"transparent",fontSize:12.5,color:"#374151"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:cl.c,flexShrink:0}}/>
            <span>{t}</span>
          </div>
        );})}
      </div>
    )}
  </>);
};

const TH = ({cols}) => <thead><tr style={{background:"#f8fafc"}}>{cols.map((c,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>;
const TR = ({children,onClick,hi}) => { const[h,sH]=useState(false); return <tr onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{borderBottom:"1px solid #f1f5f9",background:hi?"#fffbeb":h?"#f8fafc":"#fff",cursor:onClick?"pointer":"default"}}>{children}</tr>; };
const TD = ({children,right,w,style,...rest}) => <td {...rest} style={{padding:"10px 12px",fontSize:14,color:"#374151",maxWidth:w,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:right?"right":"left",...style}}>{children}</td>;

// ── Multi-sort indicators ──
// Focus/hover states for sortable headers + chips (inline styles can't do :focus-visible).
const WB_SORT_CSS = `
.wb-sort{transition:background .14s ease,color .14s ease;}
.wb-sort:hover{color:#0f172a;}
.wb-sort:focus-visible{outline:none;box-shadow:inset 0 0 0 2px rgba(30,64,175,.5);}
.wb-sortchip{transition:background .14s ease,border-color .14s ease,color .14s ease;}
.wb-sortchip:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(30,64,175,.3);}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-sort-css")) {
  const _s = document.createElement("style"); _s.id = "wb-sort-css"; _s.textContent = WB_SORT_CSS;
  document.head.appendChild(_s);
}

// Opportunity kanban card — resting / hover / focus / grabbing states live here because
// inline styles can't express :hover or :focus-visible. Dragging overrides stay inline
// (dynamic) and win over this class via inline-style specificity.
const WB_OPPCARD_CSS = `
.wb-oppcard{background:#fff;border:1px solid #e2e8f0;border-radius:7px;cursor:grab;user-select:none;
  box-shadow:0 1px 3px rgba(0,0,0,.05);
  transition:border-color .15s ease,box-shadow .15s ease,transform .1s ease,opacity .15s ease;}
.wb-oppcard:hover{border-color:#cbd5e1;box-shadow:0 4px 14px rgba(15,23,42,.10);}
.wb-oppcard:focus-visible{outline:none;border-color:#1e40af;box-shadow:0 0 0 3px rgba(30,64,175,.25);}
.wb-oppcard:active{cursor:grabbing;}
@media (prefers-reduced-motion: reduce){.wb-oppcard{transition:none;}}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-oppcard-css")) {
  const _s = document.createElement("style"); _s.id = "wb-oppcard-css"; _s.textContent = WB_OPPCARD_CSS;
  document.head.appendChild(_s);
}

// Edit-Opportunity modal — 2-col body that stacks on narrow widths, plus the
// right-rail entry links (hover/focus states inline styles can't express).
const WB_OPPEDIT_CSS = `
.wb-oppedit-grid{display:grid;grid-template-columns:1fr 300px;gap:18px;align-items:start;}
@media (max-width:720px){.wb-oppedit-grid{grid-template-columns:1fr;}}
.wb-oplink{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;
  padding:9px 12px;border:1px solid #e2e8f0;border-radius:7px;background:#fff;cursor:pointer;
  font-size:12.5px;font-weight:600;color:#334155;text-align:left;
  transition:background .14s ease,border-color .14s ease,box-shadow .14s ease;}
.wb-oplink:hover{background:#f8fafc;border-color:#cbd5e1;}
.wb-oplink:focus-visible{outline:none;border-color:#1e40af;box-shadow:0 0 0 3px rgba(30,64,175,.25);}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-oppedit-css")) {
  const _s = document.createElement("style"); _s.id = "wb-oppedit-css"; _s.textContent = WB_OPPEDIT_CSS;
  document.head.appendChild(_s);
}

// Cost Sheet quote card — dashed "add row" buttons, editable-row hover, and the two
// cost grids that stack on narrow widths. Inline styles can't express :hover/:focus-visible
// or media queries, so they live here (matching the WB_BTN_CSS / WB_SORT_CSS convention).
const WB_CS_CSS = `
.wb-addrow{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#1e40af;
  background:#fff;border:1px dashed #bfdbfe;border-radius:5px;padding:3px 13px;cursor:pointer;
  transition:background .14s ease,border-color .14s ease,color .14s ease,box-shadow .14s ease;}
.wb-addrow:hover{background:#eff6ff;border-color:#93c5fd;}
.wb-addrow:focus-visible{outline:none;border-color:#1e40af;box-shadow:0 0 0 3px rgba(30,64,175,.25);}
.wb-addrow:disabled{color:#94a3b8;border-color:#e2e8f0;cursor:not-allowed;}
.wb-addrow:disabled:hover{background:#fff;border-color:#e2e8f0;}
.wb-csrow{transition:background .12s ease;}
.wb-csrow:hover{background:#f8fafc;}
.wb-cs-2col{display:grid;grid-template-columns:1fr 1fr;}
@media (max-width:720px){.wb-cs-2col{grid-template-columns:1fr;}}
@media (prefers-reduced-motion: reduce){.wb-addrow,.wb-csrow{transition:none;}}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-cs-css")) {
  const _s = document.createElement("style"); _s.id = "wb-cs-css"; _s.textContent = WB_CS_CSS;
  document.head.appendChild(_s);
}
const WB_OPPTBL_CSS = `
.wb-opptbl td{padding:5px 10px!important;font-size:13px!important;}
.wb-opptbl th{padding:5px 10px!important;}
`;
if (typeof document !== "undefined" && !document.getElementById("wb-opptbl-css")) {
  const _s = document.createElement("style"); _s.id = "wb-opptbl-css"; _s.textContent = WB_OPPTBL_CSS;
  document.head.appendChild(_s);
}
// Filled triangle — crisper than a stroked arrow at this size.
const SortArrow = ({dir,s=9}) => (
  <svg width={s} height={s} viewBox="0 0 10 10" style={{display:"block",flexShrink:0}} aria-hidden="true">
    <path d={dir==="asc"?"M5 2.4 8.4 7.6H1.6Z":"M5 7.6 1.6 2.4H8.4Z"} fill="currentColor"/>
  </svg>
);
// Per-column indicator: active → arrow (+priority number when more than one key); inactive → faint ⇅.
const SortBadge = ({col,sorts}) => {
  const i = (sorts||[]).findIndex(s=>s.col===col);
  if (i < 0) return (
    <svg width="9" height="9" viewBox="0 0 10 10" style={{marginLeft:5,flexShrink:0,color:"#cbd5e1"}} aria-hidden="true">
      <path d="M5 0.6 7.4 3.6H2.6Z" fill="currentColor"/><path d="M5 9.4 2.6 6.4H7.4Z" fill="currentColor"/>
    </svg>
  );
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:2,marginLeft:5,color:"#0f172a"}}>
      <SortArrow dir={sorts[i].dir}/>
      {sorts.length>1 && <span style={{fontSize:9,fontWeight:800,color:"#475569",lineHeight:1}}>{i+1}</span>}
    </span>
  );
};
// Standard sortable header cell (used by the Opportunities table). label + indicator, click cycles.
const SortableTh = ({col,label,sorts,onToggle,style}) => {
  const active = (sorts||[]).some(s=>s.col===col);
  return (
    <th className="wb-sort" tabIndex={0} onClick={()=>onToggle(col)}
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onToggle(col);}}}
      style={{padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:"pointer",userSelect:"none",color:active?"#0f172a":"#64748b",background:active?"#f1f5f9":"#f8fafc",...style}}>
      <span style={{display:"inline-flex",alignItems:"center"}}>{label}<SortBadge col={col} sorts={sorts}/></span>
    </th>
  );
};
// Card-list sort surface (Delivery has no table). Pills that accumulate like sortable headers.
const SortChips = ({fields,sorts,onToggle,onReset}) => (
  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
    <Span s={11} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em"}}>Sort</Span>
    {fields.map(f=>{
      const i = sorts.findIndex(s=>s.col===f.col);
      const active = i>=0;
      return (
        <button key={f.col} className="wb-sortchip" onClick={()=>onToggle(f.col)}
          title={active?"Click to flip ↑/↓, again to remove":"Click to sort"}
          style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:6,
            border:`1px solid ${active?"#bfdbfe":"#e2e8f0"}`,background:active?"#eff6ff":"#fff",
            color:active?"#1e40af":"#64748b",fontSize:12,fontWeight:active?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>
          {f.label}
          {active && <SortArrow dir={sorts[i].dir}/>}
          {active && sorts.length>1 && <span style={{fontSize:9,fontWeight:800,color:"#1e40af",lineHeight:1}}>{i+1}</span>}
        </button>
      );
    })}
    {sorts.length>1 && <button className="wb-sortchip" onClick={onReset} title="Clear extra sort keys" style={{border:"none",background:"none",color:"#64748b",fontSize:11,fontWeight:600,cursor:"pointer",padding:"4px 4px",textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:2}}>Reset</button>}
  </div>
);
// Inline "Reset sort" link for tables — shown only once a second key is added.
const SortReset = ({sorts,onReset}) => (sorts.length>1
  ? <button className="wb-sortchip" onClick={onReset} title="Clear all but the first sort"
      style={{display:"inline-flex",alignItems:"center",gap:4,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:11,fontWeight:600,cursor:"pointer",padding:"5px 10px",borderRadius:6}}>
      <XIcon s={11}/> Reset sort · {sorts.length}
    </button>
  : null);

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
      <button onClick={()=>sO(!open)} style={{
        padding:"6px 10px",border:`1px solid ${allSel?"#e2e8f0":"#93c5fd"}`,borderRadius:6,
        background:allSel?"#fafafa":"#eff6ff",fontSize:13,cursor:"pointer",
        display:"flex",alignItems:"center",gap:6,width,justifyContent:"space-between",
        color:allSel?"#64748b":"#1e40af",transition:"all .15s",
      }}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,textAlign:"left",fontSize:12,fontWeight:allSel?400:600}}>{display}</span>
        <ChevronDown/>
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

// ── @mention helpers ──
const extractMentions = (text, users) => {
  const matches = [...text.matchAll(/@([a-zA-Z0-9._]+)/g)];
  const ids = [];
  matches.forEach(m => {
    const u = users.find(x => x.name.replace(/\s+/g,".").toLowerCase() === m[1].toLowerCase() || x.id === m[1]);
    if(u && !ids.includes(u.id)) ids.push(u.id);
  });
  return ids;
};

// Save a notification row to GS
const gsSaveNotification = (toUserId, fromUser, context, recordId, message) => {
  const n = {id:uid(), toUserId, fromUserId:fromUser.id, fromName:fromUser.name, context, recordId, message, ts:nowTS(), read:"false"};
  fetch(GS_URL, {
    method:"POST", redirect:"follow",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({action:"save", collection:"notifications", record:n, token:GS_AUTH_TOKEN}),
  }).catch(()=>{});
  return n;
};

//  MentionTextarea: textarea with @mention dropdown 
const MentionTextarea = ({value, onChange, onKeyDown, placeholder, style, users=[], minHeight=44, autoFocus=false}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerQ,    setPickerQ]    = useState("");
  const [pickerIdx,  setPickerIdx]  = useState(0);
  const textareaRef  = useRef();
  const mentionStart = useRef(-1); // index of the @ character

  const allUsers = users.length > 0 ? users : USERS;
  const filtered = pickerQ
    ? allUsers.filter(u => u.name.toLowerCase().includes(pickerQ.toLowerCase()) || u.id.toLowerCase().includes(pickerQ.toLowerCase()))
    : allUsers;

  const handleChange = e => {
    const v   = e.target.value;
    const pos = e.target.selectionStart;
    const before = v.slice(0, pos);
    const atMatch = before.match(/@(\w*)$/);
    if(atMatch) {
      mentionStart.current = before.lastIndexOf("@");
      setPickerQ(atMatch[1]);
      setShowPicker(true);
      setPickerIdx(0);
    } else {
      setShowPicker(false);
      setPickerQ("");
    }
    onChange(v);
  };

  const insertMention = u => {
    // Use mentionStart ref + current pickerQ length to know what to replace
    const start = mentionStart.current;
    const qLen  = pickerQ.length; // chars typed after @
    const before = value.slice(0, start);
    const after  = value.slice(start + 1 + qLen); // skip @ + typed chars
    const inserted = `@${u.name.replace(/\s+/g,".")} `;
    const newVal = before + inserted + after;
    onChange(newVal);
    setShowPicker(false);
    setPickerQ("");
    // Restore cursor after inserted mention
    const newPos = before.length + inserted.length;
    setTimeout(()=>{
      const ta = textareaRef.current;
      if(ta){ ta.setSelectionRange(newPos, newPos); ta.focus(); }
    }, 0);
  };

  const handleKeyDown = e => {
    if(showPicker && filtered.length > 0) {
      if(e.key==="ArrowDown"){ e.preventDefault(); setPickerIdx(i=>Math.min(i+1,filtered.length-1)); return; }
      if(e.key==="ArrowUp"){   e.preventDefault(); setPickerIdx(i=>Math.max(i-1,0)); return; }
      if(e.key==="Enter"||e.key==="Tab"){ e.preventDefault(); insertMention(filtered[pickerIdx]||filtered[0]); return; }
      if(e.key==="Escape"){ setShowPicker(false); setPickerQ(""); return; }
    }
    if(onKeyDown) onKeyDown(e);
  };

  return (
    <div style={{position:"relative"}}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={()=>{ /* small delay so onMouseDown on picker fires first */ setTimeout(()=>setShowPicker(false), 150); }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{...SI, resize:"vertical", minHeight, fontSize:13, ...style}}
      />
      {showPicker && filtered.length > 0 && (
        <div style={{position:"absolute",left:0,bottom:"calc(100% + 4px)",zIndex:800,background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,boxShadow:"0 8px 24px rgba(0,0,0,.18)",minWidth:220,maxHeight:200,overflow:"auto"}}>
          <div style={{padding:"4px 10px",fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid #f1f5f9"}}>Mention user</div>
          {filtered.map((u,i)=>(
            <div key={u.id}
              onMouseDown={e=>{ e.preventDefault(); insertMention(u); }}
              style={{padding:"7px 12px",cursor:"pointer",background:i===pickerIdx?"#eff6ff":"transparent",display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:24,height:24,background:"#0f172a",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{u.name[0]}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{u.name}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{u.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//  Render note text with highlighted @mentions 
const RenderMentionText = ({text, users=[]}) => {
  const allUsers = users.length > 0 ? users : USERS;
  if(!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9._]+)/g);
  return (
    <span>
      {parts.map((p,i) => {
        if(p.startsWith("@")) {
          const name = p.slice(1).replace(/\./g," ").toLowerCase();
          const u = allUsers.find(x=>x.name.toLowerCase()===name||x.id===p.slice(1));
          return <span key={i} style={{background:"#eff6ff",color:"#1e40af",fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{p}</span>;
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
};

//  Activity log 
const ActivityLog = ({logs,currentUser,onAdd,onEdit,onDelete,placeholder="Add a note…",users=[],onMentionNotify,context="",recordId=""}) => {
  const [note,sN] = useState("");
  const [editId,setEditId] = useState(null);
  const [editText,setEditText] = useState("");
  const [replyOpen, setReplyOpen] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyEditId,  setReplyEditId]  = useState(null);  // "logId:replyId"
  const [replyEditText,setReplyEditText]= useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // logId pending delete
  const [replyDeleteConfirm, setReplyDeleteConfirm] = useState(null); // "logId:replyId"
  const findUser = id => users.find(x=>x.id===id) || USERS.find(x=>x.id===id);
  const allUsers = users.length > 0 ? users : USERS;

  const submitNote = () => {
    if(!note.trim()) return;
    const mentionedUids = extractMentions(note, allUsers);
    const entry = {id:uid(), ts:nowTS(), author:currentUser.id, note:note.trim(), mentionedUids, replies:[]};
    onAdd(entry);
    if(onMentionNotify && mentionedUids.length > 0) {
      mentionedUids.forEach(uid2 => {
        if(uid2 !== currentUser.id)
          onMentionNotify(uid2, context, recordId, `${currentUser.name} mentioned you: ${note.trim().slice(0,80)}`);
      });
    }
    sN("");
  };

  const submitReply = (logId) => {
    const text = replyText[logId]||"";
    if(!text.trim()) return;
    const mentionedUids = extractMentions(text, allUsers);
    const reply = {id:uid(), ts:nowTS(), author:currentUser.id, note:text.trim(), mentionedUids};
    // Inject reply into the log entry via onEdit with special marker
    const parentLog = (logs||[]).find(l=>l.id===logId);
    if(!parentLog || !onEdit) return;
    const updatedNote = parentLog.note; // keep note, add reply to replies[]
    const updatedReplies = [...(parentLog.replies||[]), reply];
    onEdit(logId, updatedNote, updatedReplies);
    if(onMentionNotify && mentionedUids.length > 0) {
      mentionedUids.forEach(uid2 => {
        if(uid2 !== currentUser.id)
          onMentionNotify(uid2, context, recordId, `${currentUser.name} replied: ${text.trim().slice(0,80)}`);
      });
    }
    setReplyText(p=>({...p,[logId]:""}));
    setReplyOpen(p=>({...p,[logId]:false}));
  };

  return (
    <div>
      <div style={{maxHeight:320,overflow:"auto",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
        {(!logs||!logs.length) && <div style={{padding:20,textAlign:"center",color:"#94a3b8",fontSize:13}}>No activity logged yet.</div>}
        {[...(logs||[])].reverse().map(l => { const u=findUser(l.author); return (
          <div key={l.id} style={{padding:"10px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8}}>
            <div style={{display:"flex",gap:10}}>
              <div style={{width:32,height:32,background:"#0f172a",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{(u?.name||"?")[0]}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <Span s={12} w={700} c="#0f172a">{u?.name||l.author}</Span>
                  <span style={{background:"#f1f5f9",color:"#64748b",fontSize:10,padding:"1px 6px",borderRadius:3,fontFamily:"monospace"}}>{l.ts}</span>
                  {(onEdit||onDelete)&&<div style={{marginLeft:"auto",display:"flex",gap:2,alignItems:"center"}}>
                    <IconBtn size="sm" title="Reply" onClick={()=>setReplyOpen(p=>({...p,[l.id]:!p[l.id]}))} style={{color:"#1e40af",fontSize:13,lineHeight:1}}>↩</IconBtn>
                    {onEdit&&<IconBtn size="sm" title="Edit" onClick={()=>{setEditId(l.id);setEditText(l.note);}}><EditIcon s={13}/></IconBtn>}
                    {onDelete&&(deleteConfirm===l.id
                      ? <span style={{display:"flex",gap:3,alignItems:"center"}}>
                          <span style={{fontSize:10,color:"#ef4444",fontWeight:600,whiteSpace:"nowrap"}}>Delete?</span>
                          <button onClick={()=>{onDelete(l.id);setDeleteConfirm(null);}} style={{border:"none",background:"#dc2626",color:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10,fontWeight:700}}>Yes</button>
                          <button onClick={()=>setDeleteConfirm(null)} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10,color:"#64748b",fontWeight:600}}>No</button>
                        </span>
                      : <IconBtn size="sm" variant="danger" title="Delete" onClick={()=>setDeleteConfirm(l.id)}><TrashIcon s={13}/></IconBtn>
                    )}
                  </div>}
                </div>
                {editId===l.id
                  ? <div style={{display:"flex",gap:6,marginTop:4}}>
                      <input autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){onEdit(l.id,editText,l.replies);setEditId(null);}if(e.key==="Escape")setEditId(null);}} style={{flex:1,fontSize:13,padding:"4px 8px",border:"1px solid #1e40af",borderRadius:5,outline:"none",boxShadow:"0 0 0 3px rgba(30,64,175,.15)"}}/>
                      <IconBtn variant="accept" title="Save" onClick={()=>{onEdit(l.id,editText,l.replies);setEditId(null);}}><CheckIcon s={15}/></IconBtn>
                      <IconBtn title="Cancel" onClick={()=>setEditId(null)}><XIcon s={14}/></IconBtn>
                    </div>
                  : <div style={{fontSize:13,color:"#374151",lineHeight:1.5}}><RenderMentionText text={l.note} users={allUsers}/></div>
                }
                {/* Replies */}
                {(l.replies||[]).length > 0 && (
                  <div style={{marginTop:8,paddingLeft:14,borderLeft:"2px solid #e2e8f0",display:"flex",flexDirection:"column",gap:6}}>
                    {(l.replies||[]).map(r => {
                      const ru = findUser(r.author);
                      const rEditKey = `${l.id}:${r.id}`;
                      const isEditingReply = replyEditId === rEditKey;
                      const canActReply = r.author === currentUser.id || onDelete;
                      return (
                        <div key={r.id} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                          <div style={{width:22,height:22,background:"#334155",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{(ru?.name||"?")[0]}</div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                              <Span s={11} w={700} c="#0f172a">{ru?.name||r.author}</Span>
                              <span style={{fontSize:9,color:"#94a3b8",fontFamily:"monospace"}}>{r.ts}</span>
                              {canActReply && !isEditingReply && (
                                <div style={{marginLeft:"auto",display:"flex",gap:2}}>
                                  {r.author===currentUser.id && onEdit && (
                                    <IconBtn size="sm" title="Edit reply" onClick={()=>{setReplyEditId(rEditKey);setReplyEditText(r.note);}}><EditIcon s={12}/></IconBtn>
                                  )}
                                  {(r.author===currentUser.id||onDelete) && onEdit && (
                                    replyDeleteConfirm===`${l.id}:${r.id}`
                                    ? <span style={{display:"flex",gap:3,alignItems:"center"}}>
                                        <span style={{fontSize:10,color:"#ef4444",fontWeight:600,whiteSpace:"nowrap"}}>Delete?</span>
                                        <button onClick={()=>{
                                          const updatedReplies=(l.replies||[]).filter(x=>x.id!==r.id);
                                          onEdit(l.id,l.note,updatedReplies);
                                          setReplyDeleteConfirm(null);
                                        }} style={{border:"none",background:"#dc2626",color:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10,fontWeight:700}}>Yes</button>
                                        <button onClick={()=>setReplyDeleteConfirm(null)} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10,color:"#64748b",fontWeight:600}}>No</button>
                                      </span>
                                    : <IconBtn size="sm" variant="danger" title="Delete reply" onClick={()=>setReplyDeleteConfirm(`${l.id}:${r.id}`)}><TrashIcon s={12}/></IconBtn>
                                  )}
                                </div>
                              )}
                            </div>
                            {isEditingReply
                              ? <div style={{display:"flex",gap:6,marginTop:2}}>
                                  <input autoFocus value={replyEditText}
                                    onChange={e=>setReplyEditText(e.target.value)}
                                    onKeyDown={e=>{
                                      if(e.key==="Enter"){
                                        const updatedReplies=(l.replies||[]).map(x=>x.id===r.id?{...x,note:replyEditText}:x);
                                        onEdit(l.id,l.note,updatedReplies);
                                        setReplyEditId(null);
                                      }
                                      if(e.key==="Escape") setReplyEditId(null);
                                    }}
                                    style={{flex:1,fontSize:12,padding:"3px 7px",border:"1px solid #1e40af",borderRadius:5,outline:"none",boxShadow:"0 0 0 3px rgba(30,64,175,.15)"}}/>
                                  <IconBtn size="sm" variant="accept" title="Save reply" onClick={()=>{
                                    const updatedReplies=(l.replies||[]).map(x=>x.id===r.id?{...x,note:replyEditText}:x);
                                    onEdit(l.id,l.note,updatedReplies);
                                    setReplyEditId(null);
                                  }}><CheckIcon s={13}/></IconBtn>
                                  <IconBtn size="sm" title="Cancel" onClick={()=>setReplyEditId(null)}><XIcon s={12}/></IconBtn>
                                </div>
                              : <div style={{fontSize:12,color:"#374151"}}><RenderMentionText text={r.note} users={allUsers}/></div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {replyOpen[l.id] && (
                  <div style={{marginTop:6,paddingLeft:42,display:"flex",gap:6,alignItems:"flex-end"}}>
                    <div style={{flex:1}}>
                      <MentionTextarea
                        autoFocus
                        value={replyText[l.id]||""}
                        onChange={v=>setReplyText(p=>({...p,[l.id]:v}))}
                        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitReply(l.id);}if(e.key==="Escape")setReplyOpen(p=>({...p,[l.id]:false}));}}
                        placeholder="Reply… (@mention, Enter to send)"
                        style={{fontSize:12,padding:"4px 8px",border:"1px solid #bfdbfe",borderRadius:4,background:"#f8fbff",minHeight:0}}
                        users={allUsers}
                        minHeight={30}
                      />
                    </div>
                    <Btn variant="primary" size="sm" icon={<SendIcon s={12}/>} onClick={()=>submitReply(l.id)} style={{flexShrink:0,height:30}}>Send</Btn>
                    <IconBtn size="sm" title="Close reply" onClick={()=>setReplyOpen(p=>({...p,[l.id]:false}))}><XIcon s={13}/></IconBtn>
                  </div>
                )}
              </div>
            </div>
          </div>
        );})}
      </div>
      {onAdd&&(
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <MentionTextarea
            value={note}
            onChange={sN}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&note.trim()){submitNote();e.preventDefault();}}}
            placeholder={placeholder}
            style={{minHeight:44,fontSize:13}}
            users={allUsers}
            minHeight={44}
          />
          <Btn icon={<SendIcon/>} onClick={submitNote} style={{flexShrink:0,height:44}}>Send</Btn>
        </div>
      )}
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

const DlIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SheetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/>
    <line x1="4" y1="15" x2="20" y2="15"/><line x1="12" y1="9" x2="12" y2="21"/>
  </svg>
);
const EditIcon = ({s=14}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);
const TrashIcon = ({s=14}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
const CheckIcon = ({s=15}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = ({s=14}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SendIcon = ({s=13}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
// Note/log icon — a lined page; used for the activity-log buttons.
const LogIcon = ({s=12}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>
  </svg>
);
const FilterIcon = ({size=14,color="#94a3b8"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,color:"#94a3b8"}}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
// Shared financial summary — used in DeliveryForm, DeliveryCard collapsed, DeliveryCard expanded
const InstallmentSummary = ({contractValue, received, variant="form"}) => {
  const balance = (contractValue||0) - (received||0);
  if(variant==="collapsed") return (
    <>
      {[{l:"Contract",v:contractValue||0,c:"#0f172a"},{l:"Received",v:received||0,c:"#16a34a"},{l:"Balance",v:balance,c:"#d97706"}].map(x=>(
        <div key={x.l} style={{textAlign:"center",minWidth:80}}>
          <Span s={9} c="#94a3b8" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.06em"}}>{x.l}</Span>
          <span style={{fontSize:13,fontWeight:900,color:x.c}}>฿{fmt(x.v)}</span>
        </div>
      ))}
    </>
  );
  if(variant==="expanded") return (
    <>
      {[{l:"Contract",v:contractValue||0,bg:"#fff",bc:"#e2e8f0",c:"#0f172a"},{l:"Received",v:received||0,bg:"#f0fdf4",bc:"#86efac",c:"#16a34a"},{l:"Balance",v:balance,bg:"#fffbeb",bc:"#fde68a",c:"#d97706"}].map(x=>(
        <div key={x.l} style={{textAlign:"center",padding:"5px 12px",background:x.bg,border:`1px solid ${x.bc}`,borderRadius:7,flexShrink:0}}>
          <Span s={9} c={x.c} style={{display:"block",marginBottom:1}}>{x.l}</Span>
          <div style={{fontWeight:900,fontSize:13,color:x.c}}>฿{fmt(x.v)}</div>
        </div>
      ))}
    </>
  );
  return (
    <div style={{display:"flex",gap:16,marginTop:10,padding:"10px 14px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0"}}>
      {[{l:"Contract Value",v:contractValue||0},{l:"Total Received",v:received||0,c:"#16a34a"},{l:"Balance",v:balance,c:"#d97706"}].map(x=>(
        <div key={x.l}><Span s={11} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block"}}>{x.l}</Span><div style={{fontWeight:400,fontSize:14,color:x.c||"#0f172a"}}>฿{fmt(x.v)}</div></div>
      ))}
    </div>
  );
};

const ExportBar = ({onCSV,onGS}) =><div style={{display:"flex",gap:6}}><Btn variant="export" size="sm" icon={<DlIcon/>} onClick={onCSV}>CSV</Btn><Btn variant="export" size="sm" icon={<SheetIcon/>} onClick={onGS}>Sheets</Btn></div>;
const GSGuideModal = ({module,headers,onClose}) => (
  <Modal title={`Google Sheets Guide — ${module}`} width={600} onClose={onClose}>
    <FRow label="Tab Name"><div style={{fontFamily:"monospace",padding:"6px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:5,fontWeight:700}}>{module}</div></FRow>
    <FRow label="Headers"><div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:5,padding:"8px 10px",lineHeight:2}}>{headers.map((h,i)=><span key={i} style={{display:"inline-block",background:"#dbeafe",color:"#1e40af",margin:"2px",padding:"1px 7px",borderRadius:3,fontSize:11}}>{h}</span>)}</div></FRow>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><Btn onClick={onClose}>Close</Btn></div>
  </Modal>
);

// Error boundary — catches runtime crashes at page level so one broken tab
// doesn't blank the whole app. Class component required by React's API.
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  componentDidCatch(err,info){console.error("Page error:",err,info);}
  render(){
    if(this.state.err) return (
      <div style={{padding:40,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠</div>
        <div style={{fontSize:15,fontWeight:700,color:"#dc2626",marginBottom:8}}>Something went wrong on this page</div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:20,fontFamily:"monospace",maxWidth:420,margin:"0 auto 20px"}}>{this.state.err?.message}</div>
        <button onClick={()=>this.setState({err:null})} style={{padding:"8px 24px",background:"#0f172a",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:13}}>Retry</button>
      </div>
    );
    return this.props.children;
  }
}

//
// LOGIN — S1: Server-side credential validation via GAS
//
const LoginPage = ({onLogin}) => {
  const [email,sEmail]     = useState("");
  const [pwd,sPwd]         = useState("");
  const [err,sErr]         = useState("");
  const [loading,sLoading] = useState(false);

  const go = async () => {
    if (!email.trim() || !pwd) { sErr("Please enter your email and password."); return; }
    sLoading(true); sErr("");
    try {
      const result = await gsLogin(email.trim(), pwd);
      if (result.ok) {
        onLogin(result.user);
      } else {
        sErr(result.error || "Email or password is incorrect.");
      }
    } catch (_) {
      sErr("Unable to connect. Please check your connection and try again.");
    } finally {
      sLoading(false);
    }
  };
  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(120% 90% at 85% -10%, ${BRAND.tealDeep} 0%, rgba(0,137,126,0) 45%), linear-gradient(150deg, ${BRAND.navy} 0%, #0f2740 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Noto Sans Thai',system-ui,sans-serif"}}>
      <div style={{width:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {/* Req 19: no version number, no year */}
          <div style={{display:"inline-flex",alignItems:"center",gap:11,marginBottom:14}}>
            <span style={{width:38,height:38,borderRadius:9,background:BRAND.teal,display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:`0 6px 22px ${BRAND.teal}59`,flexShrink:0}}>
              <span style={{fontSize:19,fontWeight:900,color:"#fff",letterSpacing:"-0.04em"}}>W</span>
            </span>
            <span style={{fontSize:16,fontWeight:800,color:"#fff",letterSpacing:"0.16em",textTransform:"uppercase"}}>Wave BCG</span>
          </div>
          <div style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.05em",lineHeight:1}}>Climate <span style={{color:BRAND.teal}}>CRM</span></div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginTop:8}}>Sales &amp; delivery, lead to invoice</div>
        </div>
        <Card style={{padding:28,boxShadow:"0 24px 64px rgba(0,0,0,.28)"}}>
          {/* Req 17: email as username, text input not dropdown */}
          <FRow label="Email"><Inp type="email" value={email} onChange={e=>sEmail(e.target.value)} placeholder="your.email@wavebcg.com" onKeyDown={e=>e.key==="Enter"&&!loading&&go()} disabled={loading}/></FRow>
          <FRow label="Password"><Inp type="password" value={pwd} onChange={e=>sPwd(e.target.value)} placeholder="Enter your password" onKeyDown={e=>e.key==="Enter"&&!loading&&go()} disabled={loading}/></FRow>
          {err && <div style={{background:"#fee2e2",color:"#dc2626",padding:"8px 12px",borderRadius:5,fontSize:13,marginBottom:12}}>{err}</div>}
          {/* The single teal hero action, per The One Teal Rule. brand variant = tealDeep (white label AA 4.3:1) + hover. */}
          <Btn variant="brand" style={{width:"100%",padding:11,fontSize:14,fontWeight:700,boxShadow:loading?"none":`0 6px 18px ${BRAND.teal}4d`,opacity:loading?0.85:1}} onClick={go} disabled={loading}>{loading?"Signing in…":"Sign In"}</Btn>
          {/* Req 18: no credential hints shown */}
        </Card>
      </div>
    </div>
  );
};

// 
// DASHBOARD (Req 12, 13, 14)
// 
const DashboardKPI = ({user,customers,opps,deliveries,kpiSplits,setKpiSplits,toast,onGoToCS}) => {
  const [tab,sTab]   = useState("dash");
  const [year,sYear] = useState(new Date().getFullYear() + 543); // BE year
  const [annual,sAnn] = useState(()=>kpiSplits[new Date().getFullYear()+543+"_annual"]||ANNUAL_KPI);
  // Sync annual from kpiSplits when year changes or data loads from GS
  useEffect(()=>{
    const saved = kpiSplits[year+"_annual"];
    if(saved !== undefined && saved !== null && saved !== "") sAnn(+saved);
  },[year,kpiSplits]);
  // "Last Year POs Paid this year" — editable, persisted per year alongside the KPI row.
  const LAST_YEAR_PO_DEFAULT = 205000; // preserves current ฿2.05M until edited
  const [lastYearPO,sLYPO] = useState(()=>{const v=kpiSplits[(new Date().getFullYear()+543)+"_lastYearPO"];return (v===undefined||v===null||v==="")?LAST_YEAR_PO_DEFAULT:+v;});
  useEffect(()=>{const v=kpiSplits[year+"_lastYearPO"];if(v!==undefined&&v!==null&&v!=="")sLYPO(+v);},[year,kpiSplits]);
  const [editingPO,setEditingPO]=useState(false);
  const [poInput,setPoInput]=useState("");
  // Req 14: multi-select dashboard filters
  const [fSt,setFSt]   = useState([]);
  const [fSvc,setFSvc] = useState([]);
  const [fAg,setFAg]   = useState([]);
  // Req 13: pipeline sort
  const [pSort,setPSort] = useState("desc");
  const [pMonth,setPMonth] = useState("All");

  const filteredOpps = useMemo(()=>opps.filter(o=>
    (fSt.length===0||fSt.includes(o.status))&&
    (fSvc.length===0||fSvc.includes(o.serviceCode))&&
    (fAg.length===0||fAg.includes(o.assignedTo))
  ),[opps,fSt,fSvc,fAg]);

  const wonOpps       = filteredOpps.filter(o=>o.status==="Won");
  const totalWon      = wonOpps.reduce((s,o)=>s+o.salesPrice,0);
  const pipeline      = filteredOpps.filter(o=>o.status!=="Lost").reduce((s,o)=>s+o.salesPrice,0);
  const oppsPipeline  = filteredOpps.filter(o=>o.status==="Proposal"||o.status==="Negotiation").reduce((s,o)=>s+o.salesPrice,0);
  const oppsPipelineCount = filteredOpps.filter(o=>o.status==="Proposal"||o.status==="Negotiation").length;
  const splits      = kpiSplits[year]||DEFAULT_SPLIT.slice();
  const totalSplit  = splits.reduce((s,v)=>s+v,0);

  // Revenue: sum of installment.amount where expected_date is in the current CE year (no status filter)
  const revenue = useMemo(()=>{
    const ceYear = new Date().getFullYear();
    const prefix = String(ceYear);
    return deliveries.reduce((total,d)=>{
      return total + safeArr(d.installments).reduce((s,ins)=>{
        if(!ins.expected_date) return s;
        const dateStr = String(ins.expected_date);
        if(dateStr.startsWith(prefix)) return s + (ins.amount||0);
        return s;
      },0);
    },0);
  },[deliveries]);

  // Invoice Received: sum of installment.amount where invoiceDate is in the current CE year AND status="Received"
  const invoiceReceived = useMemo(()=>{
    const ceYear = new Date().getFullYear();
    const prefix = String(ceYear);
    return deliveries.reduce((total,d)=>{
      return total + safeArr(d.installments).reduce((s,ins)=>{
        if(ins.status!=="Received") return s;
        if(!ins.invoiceDate) return s;
        const dateStr = String(ins.invoiceDate);
        if(dateStr.startsWith(prefix)) return s + (ins.amount||0);
        return s;
      },0);
    },0);
  },[deliveries]);

  // Annual KPI Progress is measured against Received + Last Year POs Paid this year
  const kpiPct = annual>0 ? Math.min(((invoiceReceived+lastYearPO)/annual)*100,100) : 0;

  const invoiceBreakdown = useMemo(()=>{
    const ceYear = new Date().getFullYear();
    const prefix = String(ceYear);
    const map={};
    deliveries.forEach(d=>{
      const total=safeArr(d.installments).reduce((s,ins)=>{
        if(ins.status!=="Invoiced"||!ins.invoiceDate) return s;
        if(!String(ins.invoiceDate).startsWith(prefix)) return s;
        return s+(ins.amount||0);
      },0);
      if(total>0){
        const cust=customers.find(c=>c.id===d.custId);
        const name=cust?.companyEN||d.custId;
        map[name]=(map[name]||0)+total;
      }
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]);
  },[deliveries,customers]);

  // Group [{name,amount}] → [name,amount][] sorted desc (drops zero/empty)
  const groupByCompany = rows => {
    const map={};
    rows.forEach(({name,amount})=>{ if(amount) map[name]=(map[name]||0)+amount; });
    return Object.entries(map).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  };
  const custName = id => customers.find(c=>c.id===id)?.companyEN || id;

  // Per-card breakdowns (company → value) for hover tooltips
  // Expected Revenue breaks down by month (Jan-Dec, calendar order, zeros included) rather than by company,
  // with a per-month company breakdown ([2]) for the modal's month→company drill-down.
  const revenueByMonth = useMemo(()=>{
    const prefix = String(new Date().getFullYear());
    const perMonth = Array.from({length:12},()=>({})); // company name -> amount, per month
    deliveries.forEach(d=>{
      const name = custName(d.custId);
      safeArr(d.installments).forEach(ins=>{
        if(!ins.expected_date || !String(ins.expected_date).startsWith(prefix)) return;
        const m = parseInt(String(ins.expected_date).slice(5,7),10)-1;
        if(m<0||m>11) return;
        perMonth[m][name] = (perMonth[m][name]||0) + (ins.amount||0);
      });
    });
    return MONTHS.map((name,i)=>{
      const companies = Object.entries(perMonth[i]).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
      return [name, companies.reduce((s,[,v])=>s+v,0), companies];
    });
  },[deliveries,customers]);
  const wonBreakdown = useMemo(()=>
    groupByCompany(wonOpps.map(o=>({name:custName(o.custId),amount:o.salesPrice||0})))
  ,[filteredOpps,customers]);
  const receivedBreakdown = useMemo(()=>{
    const prefix = String(new Date().getFullYear());
    return groupByCompany(deliveries.flatMap(d=>safeArr(d.installments)
      .filter(ins=>ins.status==="Received" && ins.invoiceDate && String(ins.invoiceDate).startsWith(prefix))
      .map(ins=>({name:custName(d.custId),amount:ins.amount||0}))));
  },[deliveries,customers]);

  // Convert any date string to BE year format for consistent comparison
  const toBEDate = d => {
    if (!d) return "";
    const y = parseInt(d.slice(0, 4));
    if (y < 2500) return `${y + 543}${d.slice(4)}`; // CE → BE
    return d; // already BE
  };

  // Won opps only enter the Backlog once their linked Delivery's Contract Date is filled in —
  // deliberately no fallback (no auto-inferred date) so Backlog reflects an actually signed/dated contract.
  const getWonDate = opp => {
    const dlv = deliveries.find(d => d.oppCode === opp.oppCode);
    return dlv?.contractDate ? toBEDate(dlv.contractDate) : null;
  };

  const monthData = MONTHS.map((m,i) => {
    const ms=`${year}-${String(i+1).padStart(2,"0")}`;
    const fc=Math.round(annual*splits[i]/100);
    // Backlog = Won opps by Delivery's Contract Date (excluded until Contract Date is entered on the Delivery page)
    const blItems=filteredOpps.filter(o=>o.status==="Won"&&getWonDate(o)?.startsWith(ms)).map(o=>({company:customers.find(c=>c.id===o.custId)?.companyEN||o.custId,amount:o.salesPrice||0}));
    // Received = Delivery installments status=Received by receiptDate month (auto-synced from Delivery)
    const recItems=deliveries.flatMap(d=>(safeArr(d.installments)).filter(ins=>toBEDate(ins.receiptDate)?.startsWith(ms)&&ins.status==="Received").map(ins=>({company:customers.find(c=>c.id===d.custId)?.companyEN||d.custId,amount:ins.amount||0})));
    const bl=blItems.reduce((s,it)=>s+it.amount,0);
    const rec=recItems.reduce((s,it)=>s+it.amount,0);
    return{m,ms,fc,bl,rec,ach:fc>0?((bl/fc)*100).toFixed(0):"0",blItems,recItems};
  });

  const upSplit=(i,v)=>setKpiSplits(p=>({...p,[year]:splits.map((x,j)=>j===i?+v:x)}));
  const saveKpi=()=>{
    const entry={id:uid(),ts:nowTS(),author:user.id,note:`KPI saved — ${year} · Annual ฿${fmtM(annual)} · Split total ${totalSplit.toFixed(1)}%`};
    setKpiSplits(p=>({...p,[year]:splits,[year+"_annual"]:annual,[year+"_lastYearPO"]:lastYearPO,[year+"_log"]:[...(p[year+"_log"]||[]),entry]}));
    // Persist to Google Sheets — one row per year, primary key = year
    gsSave("kpi", {
      year:   year,
      annual: annual,
      splits: splits,
      lastYearPO: lastYearPO,
      saveLog:[entry],
    });
    toast("KPI & Forecast saved",`${year} splits saved by ${user.name}`);
  };
  // Inline-save the editable "Last Year POs Paid" figure (writes the full kpi row so the
  // GS upsert doesn't blank annual/splits).
  const saveLastYearPO=v=>{
    const n=Math.max(0,Math.round(v||0));
    sLYPO(n);
    setKpiSplits(p=>({...p,[year+"_lastYearPO"]:n}));
    gsSave("kpi",{year,annual,splits,lastYearPO:n,saveLog:[{id:uid(),ts:nowTS(),author:user.id,note:`Last Year POs Paid set to ฿${fmt(n)} for ${year}`}]});
    toast("Saved",`Last Year POs Paid = ฿${fmt(n)}`);
  };
  const BAR_H=160;
  const maxV=Math.max(...monthData.map(d=>Math.max(d.fc,d.bl,d.rec)),1);

  let ytdFc=0,ytdBl=0,ytdRec=0;
  const rows=monthData.map(d=>{ytdFc+=d.fc;ytdBl+=d.bl;ytdRec+=d.rec;return{...d,ytdFc,ytdBl,ytdRec,ytdRem:ytdFc-ytdBl};});

  const [detailSC,setDetailSC]=useState(null); // click-opened breakdown payload {title,items,total}
  const SC = ({label,val,sub,detail,c="#2B2B2B",grad,tip}) => (
    <Card style={{padding:"14px 18px",position:"relative",cursor:tip?"pointer":"auto"}}
      onClick={tip?()=>setDetailSC(tip):undefined}>
      <Span s={10} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4,lineHeight:1.3,minHeight:"2.6em"}}>{label}</Span>
      <div style={{fontSize:22,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1.1,...(grad?{background:grad,WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:c})}}>{val}</div>
      {sub&&<Span s={11} c="#94a3b8" style={{marginTop:3,display:"block"}}>{sub}</Span>}
      {detail&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:"3px 8px"}}>{detail}</div>}
    </Card>
  );
  // Click-opened breakdown — full, scrollable list (replaces the old cramped hover tooltip).
  // Defaults to a per-company ฿ list; a card's tip can override unitLabel/fmtAmt (e.g. a per-month ฿M list),
  // and optionally set drillDown(name,i)=>newPayload to make rows clickable into a second-level breakdown.
  const SCDetailModal = () => detailSC ? (
    <Modal title={detailSC.title} width={520} onClose={()=>setDetailSC(null)}>
      {(()=>{ const fmtAmt = detailSC.fmtAmt || (amt=>`฿${fmt(amt)}`); const canDrill = !!detailSC.drillDown; return (<>
      {detailSC.parent && (
        <button onClick={()=>setDetailSC(detailSC.parent)} style={{border:"none",background:"none",color:"#1e40af",fontSize:12,fontWeight:700,cursor:"pointer",padding:0,marginBottom:10,display:"flex",alignItems:"center",gap:4}}>
          ← Back to {detailSC.parent.unitLabel||"list"}
        </button>
      )}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <CountPill n={(detailSC.items||[]).length} label={detailSC.unitLabel||"companies"}/>
        <Span s={13} w={800} c="#0f172a" style={{marginLeft:"auto"}}>Total {fmtAmt(detailSC.total)}</Span>
      </div>
      <div style={{maxHeight:420,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:8}}>
        {(!detailSC.items||detailSC.items.length===0)&&<div style={{padding:24,textAlign:"center",color:"#94a3b8",fontSize:13}}>No records</div>}
        {(detailSC.items||[]).map(([name,amt],i)=>(
          <div key={name}
            onClick={canDrill?()=>setDetailSC({...detailSC.drillDown(name,i), parent:detailSC}):undefined}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,padding:"9px 14px",borderBottom:"1px solid #f1f5f9",background:i%2?"#fafafa":"#fff",cursor:canDrill?"pointer":"default"}}>
            <span style={{fontSize:13,color:"#374151"}}>{name}</span>
            <span style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13,fontWeight:800,color:"#0f172a",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{fmtAmt(amt)}</span>
              {canDrill && <span style={{color:"#cbd5e1",fontSize:13}}>›</span>}
            </span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTop:"2px solid #0f172a"}}>
        <Span s={14} w={800} c="#0f172a">Total</Span>
        <Span s={16} w={900} c="#d97706">{fmtAmt(detailSC.total)}</Span>
      </div>
      </>); })()}
    </Modal>
  ) : null;

  // Req 13: Pipeline analysis with monthly breakdown + sort + service count
  const PipelineAnalysis = () => {
    const [hoveredTag, setHoveredTag] = React.useState(null); // {stage, code, x, y}
    const monthOpps = pMonth==="All"?filteredOpps:filteredOpps.filter(o=>{
      const ms=`${year}-${String(MONTHS.indexOf(pMonth)+1).padStart(2,"0")}`;
      return o.createdDate?.startsWith(ms);
    });
    const PIPELINE_STAGE_ORDER = ["KYC","Proposal","Negotiation","Won","Lost"];
    const byStage = PIPELINE_STAGE_ORDER.map(st => {
      const items=monthOpps.filter(o=>o.status===st);
      const total=items.reduce((s,o)=>s+o.salesPrice,0);
      const bySvc={};
      items.forEach(o=>{if(!bySvc[o.serviceCode])bySvc[o.serviceCode]=0;bySvc[o.serviceCode]+=o.salesPrice;});
      return{stage:st,count:items.length,total,bySvc};
    });
    const sorted=byStage;
    const maxTotal=Math.max(...sorted.map(s=>s.total),1);
    const allStagesTotal=sorted.reduce((s,x)=>s+x.total,0);
    // service type count per stage
    const allSvcs=[...new Set(monthOpps.map(o=>o.serviceCode))];

    // companies for hovered tag
    const tooltipOpps = hoveredTag
      ? monthOpps.filter(o=>o.serviceCode===hoveredTag.code && o.status===hoveredTag.stage)
      : [];

    return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card style={{padding:20,position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <Span s={13} w={700}>Pipeline by Stage</Span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Sel value={pMonth} onChange={e=>setPMonth(e.target.value)} style={{width:90,padding:"4px 6px",fontSize:12}}>
                <option>All</option>{MONTHS.map(m=><option key={m}>{m}</option>)}
              </Sel>
            </div>
          </div>
          {sorted.map((s,i) => (
            <div key={s.stage} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:4}}>
                <Badge value={s.stage} colorMap={Object.fromEntries(OPP_STATUSES.map((x,j)=>[x,{c:STAGE_COLORS[j]}]))}/>
                <div style={{textAlign:"right"}}>
                  <Span s={13} w={700} c="#0f172a">฿{fmtM(s.total)}</Span>
                  <Span s={11} c="#94a3b8" style={{marginLeft:6}}>{s.count} deals</Span>
                  <Span s={11} c="#94a3b8" style={{marginLeft:6}}>({allStagesTotal>0?((s.total/allStagesTotal)*100).toFixed(1):0}%)</Span>
                </div>
              </div>
              <div style={{background:"#f1f5f9",borderRadius:4,height:10,overflow:"hidden"}}>
                <div style={{background:STAGE_COLORS[OPP_STATUSES.indexOf(s.stage)],height:"100%",width:`${(s.total/maxTotal)*100}%`,borderRadius:4,transition:"width .3s"}}/>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                {Object.entries(s.bySvc).sort((a,b)=>b[1]-a[1]).map(([code,val],ci) => (
                  <span key={code}
                    onMouseEnter={e=>{const r=e.currentTarget.getBoundingClientRect();setHoveredTag({stage:s.stage,code,x:r.left,y:r.bottom+6});}}
                    onMouseLeave={()=>setHoveredTag(null)}
                    style={{background:SVC_PALETTE[ci%SVC_PALETTE.length]+"22",color:SVC_PALETTE[ci%SVC_PALETTE.length],border:`1px solid ${SVC_PALETTE[ci%SVC_PALETTE.length]}44`,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:3,cursor:"default",userSelect:"none"}}>
                    {code}: {fmtK(val)}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Tooltip */}
          {hoveredTag && tooltipOpps.length>0 && (
            <div style={{position:"fixed",left:hoveredTag.x,top:hoveredTag.y,zIndex:9999,background:"#1e293b",color:"#f8fafc",borderRadius:8,padding:"10px 14px",boxShadow:"0 8px 32px rgba(0,0,0,.28)",minWidth:260,maxWidth:340,pointerEvents:"none"}}>
              <div style={{fontWeight:800,fontSize:12,marginBottom:7,color:"#94a3b8",letterSpacing:"0.05em",textTransform:"uppercase"}}>{hoveredTag.code} · {hoveredTag.stage}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #334155",borderBottom:"1px solid #334155",padding:"4px 0",marginBottom:6}}>
                <span style={{fontSize:10,color:"#64748b",fontStyle:"italic"}}>Company · Value</span>
                <span style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.05em"}}>% Success</span>
              </div>
              {tooltipOpps.map(o=>{
                const cust=customers.find(c=>c.id===o.custId);
                return(
                  <div key={o.id} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:5,fontSize:12,alignItems:"center"}}>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#e2e8f0"}}>{cust?.companyEN||o.custId}</span>
                    <span style={{fontWeight:700,color:"#fbbf24",whiteSpace:"nowrap"}}>฿{fmt(o.salesPrice)}</span>
                    {(()=>{const sr=calcSuccessRate(o);const clr=sr>=70?"#4ade80":sr>=40?"#fbbf24":"#f87171";return <span style={{fontWeight:700,color:clr,whiteSpace:"nowrap",minWidth:36,textAlign:"right",border:`1px solid ${clr}55`,borderRadius:3,padding:"1px 4px",fontSize:10}}>{sr}%</span>;})()}
                  </div>
                );
              })}
              <div style={{borderTop:"1px solid #334155",marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700}}>
                <span style={{color:"#94a3b8"}}>{tooltipOpps.length} deal{tooltipOpps.length>1?"s":""}</span>
                <span style={{color:"#fbbf24"}}>฿{fmt(tooltipOpps.reduce((s,o)=>s+o.salesPrice,0))}</span>
              </div>
            </div>
          )}
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
                {allSvcs.length===0&&<tr><td colSpan={7} style={{padding:20,textAlign:"center",color:"#94a3b8"}}>No data</td></tr>}
                {allSvcs.map(code => {
                  const rowOpps=monthOpps.filter(o=>o.serviceCode===code);
                  const rowTotal=rowOpps.reduce((s,o)=>s+o.salesPrice,0);
                  return (
                    <tr key={code} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"6px 8px",fontWeight:700}}>
                        <button onClick={()=>onGoToCS&&onGoToCS(code)} style={{background:"none",border:"none",padding:0,cursor:"pointer",color:"#1e40af",fontWeight:700,fontSize:11,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:2}}>{code}</button>
                      </td>
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
          {tab==="dash"&&<><FilterIcon/><MultiSelect label="Agents" options={SALES_USERS.map(u=>({value:u.id,label:u.name.split(" ")[0]}))} selected={fAg} onChange={setFAg} width={150}/></>}
          {tab==="kpi"&&<><Sel value={year} onChange={e=>sYear(+e.target.value)} style={{width:88}}>{[2569,2570,2571].map(y=><option key={y}>{y}</option>)}</Sel><NumInp value={annual} onChange={v=>sAnn(v)} style={{width:160}}/></>}
        </div>
      </div>

      {tab==="dash"&&(
        <>
          <Card style={{padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <Span s={13} w={700}>Annual KPI Progress</Span>
              <Span s={14} w={600} c="#0f172a">฿{fmtM(invoiceReceived+lastYearPO)} / ฿{fmtM(annual)} ({kpiPct.toFixed(1)}%)</Span>
            </div>
            <div style={{background:"#f1f5f9",borderRadius:5,height:10}}><div style={{background:kpiPct>=75?"#16a34a":kpiPct>=50?"#f59e0b":"#0f172a",height:"100%",width:`${kpiPct}%`,borderRadius:5,transition:"width .5s"}}/></div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12,marginBottom:14}}>
            <SC label="Customers"        val={customers.length}/>
            <Card style={{padding:"14px 18px",position:"relative"}}>
              <Span s={10} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4,lineHeight:1.3,minHeight:"2.6em"}}>Last Year POs Paid this year</Span>
              {editingPO
                ? <input autoFocus value={poInput} inputMode="numeric"
                    onChange={e=>setPoInput(e.target.value.replace(/[^0-9.]/g,""))}
                    onBlur={()=>{setEditingPO(false);saveLastYearPO(+poInput||0);}}
                    onKeyDown={e=>{if(e.key==="Enter"){setEditingPO(false);saveLastYearPO(+poInput||0);}if(e.key==="Escape")setEditingPO(false);}}
                    style={{...SI,fontSize:20,fontWeight:900,padding:"2px 6px",width:"100%"}}/>
                : <div onClick={()=>{setPoInput(String(lastYearPO||0));setEditingPO(true);}} title="Click to edit"
                    style={{fontSize:22,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1.1,color:"#2B2B2B",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                    ฿{fmtM(lastYearPO)}<span style={{color:"#cbd5e1"}}><EditIcon s={13}/></span>
                  </div>}
            </Card>
            <SC label="This Year Expected Revenue" val={`฿${fmtM(revenue)}`} c="#d97706"
              tip={{title:`Expected Revenue ${new Date().getFullYear()}`, items:revenueByMonth.map(([m,t])=>[m,t]), total:revenue,
                    unitLabel:"months", fmtAmt:amt=>`฿${fmt(amt)}`,
                    drillDown:(monthName,i)=>({
                      title:`${monthName} ${new Date().getFullYear()} — Expected Revenue by Company`,
                      items:revenueByMonth[i][2], total:revenueByMonth[i][1],
                      unitLabel:"companies", fmtAmt:amt=>`฿${fmt(amt)}`,
                    })}}/>
            <SC label="Won YTD"          val={`฿${fmtM(totalWon)}`}      sub={`${wonOpps.length} deals closed`} c="#1e40af"
              tip={{title:"Won YTD", items:wonBreakdown, total:totalWon}}/>
            <SC label="Received" val={`฿${fmtM(invoiceReceived)}`} c="#22c55e"
              tip={{title:`Received ${new Date().getFullYear()}`, items:receivedBreakdown, total:invoiceReceived}}/>
            <SC label="Opportunities" val={`฿${fmtM(oppsPipeline)}`} grad="linear-gradient(90deg,#a78bfa,#f59e0b)"/>
            <SC label="Pipeline (Proposal+Nego+Won)" val={`฿${fmtM(pipeline)}`}/>
          </div>
          {SCDetailModal()}

          {/* Req 12: Monthly bar chart with value labels on top */}
          <Card style={{padding:20,marginBottom:14}}>
            <Span s={13} w={700} style={{display:"block",marginBottom:8}}>Monthly Forecast / Backlog / Received</Span>
            <div style={{display:"flex",gap:12,marginBottom:10,flexWrap:"wrap"}}>
              {[{c:"#cbd5e1",l:"Forecast"},{c:"#1e40af",l:"Backlog"},{c:"#22c55e",l:"Received"}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,background:x.c,borderRadius:2}}/><Span s={11} c="#94a3b8">{x.l}</Span></div>
              ))}
            </div>
            <div style={{position:"relative",paddingTop:24}}>
              {/* Horizontal grid lines */}
              {[0.25,0.5,0.75,1].map(r=>(
                <div key={r} style={{position:"absolute",left:0,right:0,bottom:36+Math.round(r*BAR_H),borderTop:"1px dashed #f1f5f9",zIndex:0}}/>
              ))}
              <div style={{display:"flex",gap:3,alignItems:"flex-end",height:BAR_H+36}}>
                {monthData.map((d,i) => {
                  const fcH=Math.round((d.fc/maxV)*BAR_H);
                  const blH=Math.round((d.bl/maxV)*BAR_H);
                  const recH=Math.round((d.rec/maxV)*BAR_H);
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative",zIndex:1,borderLeft:i>0?"1px solid #f1f5f9":"none"}}>
                      <div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:BAR_H}}>
                        {/* Forecast */}
                        <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                          {d.fc>0&&<span style={{position:"absolute",top:-20,fontSize:9,color:"#94a3b8",fontWeight:700,whiteSpace:"nowrap",letterSpacing:"-0.03em"}}>{fmtK(d.fc)}</span>}
                          <div style={{width:"100%",background:"#cbd5e1",borderRadius:"3px 3px 0 0",height:`${fcH}px`,minHeight:d.fc>0?2:0}}/>
                        </div>
                        {/* Backlog */}
                        <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                          {d.bl>0&&<span style={{position:"absolute",top:-20,fontSize:9,color:"#1e40af",fontWeight:700,whiteSpace:"nowrap",letterSpacing:"-0.03em"}}>{fmtK(d.bl)}</span>}
                          {d.bl>0&&<span style={{position:"absolute",top:-32,fontSize:9,color:+d.ach>=100?"#16a34a":+d.ach>=80?"#d97706":"#ef4444",fontWeight:700,whiteSpace:"nowrap"}}>{d.ach}%</span>}
                          <div style={{width:"100%",background:"#1e40af",borderRadius:"3px 3px 0 0",height:`${blH}px`,minHeight:d.bl>0?2:0,cursor:"pointer"}} onClick={()=>setDetailSC({title:`${d.m} Backlog`, items:groupByCompany(d.blItems.map(it=>({name:it.company,amount:it.amount}))), total:d.bl})}/>
                        </div>
                        {/* Received */}
                        <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                          {d.rec>0&&<span style={{position:"absolute",top:-20,fontSize:9,color:"#16a34a",fontWeight:700,whiteSpace:"nowrap",letterSpacing:"-0.03em"}}>{fmtK(d.rec)}</span>}
                          <div style={{width:"100%",background:"#22c55e",borderRadius:"3px 3px 0 0",height:`${recH}px`,minHeight:d.rec>0?2:0,cursor:"pointer"}} onClick={()=>setDetailSC({title:`${d.m} Received`, items:groupByCompany(d.recItems.map(it=>({name:it.company,amount:it.amount}))), total:d.rec})}/>
                        </div>
                      </div>
                      <span style={{fontSize:10,color:"#94a3b8",marginTop:5,fontWeight:500}}>{d.m}</span>
                    </div>
                  );
                })}
              </div>
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
                const aWonBreakdown = groupByCompany(opps.filter(o=>o.assignedTo===a.id&&o.status==="Won").map(o=>({name:custName(o.custId),amount:o.salesPrice||0})));
                return (
                  <div key={a.id} style={{flex:1,minWidth:160,padding:16,background:"#f8fafc",borderRadius:7,border:"1px solid #e2e8f0",cursor:"pointer"}}
                    onClick={()=>setDetailSC({title:`${a.name} — Won Deals`, items:aWonBreakdown, total:aw})}>
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
          {SCDetailModal()}
          <Card style={{padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Span s={13} w={700}>Monthly Split %</Span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <Span s={12} w={700} c={Math.abs(totalSplit-100)<0.1?"#16a34a":"#dc2626"}>Total: {totalSplit.toFixed(1)}%</Span>
                <Btn size="sm" icon={<CheckIcon s={13}/>} onClick={saveKpi}>Save KPI</Btn>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {MONTHS.map((m,i)=>(
                <div key={m} style={{textAlign:"center",minWidth:62}}>
                  <Span s={10} c="#64748b" style={{display:"block",marginBottom:3}}>{m}</Span>
                  <NumInp value={splits[i]} onChange={v=>upSplit(i,v)} showZero style={{textAlign:"center",padding:"4px",fontSize:12}}/>
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
                <TD right style={{color:"#1e40af",fontWeight:700,cursor:"pointer"}} onClick={()=>setDetailSC({title:`${r.m} Backlog`, items:groupByCompany(r.blItems.map(it=>({name:it.company,amount:it.amount}))), total:r.bl})}>฿{fmt(r.bl)}</TD>
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

const CustForm = ({initial,user,onSave,onClose,onDelete,tagSuggestions=[]}) => {
  const blankContact = () => ({id:uid(),name:"",title:"",email:"",phone:"",active:true});
  const blank={id:"",companyEN:"",industry:"",sector:"",businessType:"",companySize:"",address:"",province:"",contacts:[blankContact()],assignedTo:"",remark:"",lastContact:today(),tags:[]};
  const [f,sF] = useState(initial?{...initial,contacts:initial.contacts||[{id:uid(),name:initial.contactName||"",title:initial.titlePosition||"",email:initial.email||"",phone:initial.phone||"",active:true}],tags:safeArr(initial.tags)}:blank);
  const [tagInput,setTagInput] = useState("");
  const set = (k,v) => sF(p=>({...p,[k]:v}));
  const setCt=(id,k,v)=>sF(p=>({...p,contacts:p.contacts.map(c=>c.id===id?{...c,[k]:v}:c)}));
  const addCt=()=>sF(p=>({...p,contacts:[...p.contacts,blankContact()]}));
  const delCt=id=>sF(p=>({...p,contacts:p.contacts.filter(c=>c.id!==id)}));
  const addTag=(override)=>{const t=(override??tagInput).trim();if(!t)return;sF(p=>({...p,tags:[...new Set([...safeArr(p.tags),t])]}));setTagInput("");};
  const removeTag=t=>sF(p=>({...p,tags:safeArr(p.tags).filter(x=>x!==t)}));
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
        <div style={{gridColumn:"1/-1"}}>
          <FRow label="Tags" tip="Custom labels e.g. hotel, VIP — type and press Enter">
            <div style={{position:"relative",display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",border:"1px solid #e2e8f0",borderRadius:6,padding:"7px 9px",background:"#fafafa"}}>
              {safeArr(f.tags).map(t=><TagChip key={t} tag={t} size={12} onRemove={removeTag}/>)}
              <TagTypeahead value={tagInput} onChange={setTagInput}
                suggestions={tagSuggestions.filter(t=>!safeArr(f.tags).includes(t))}
                onCommit={addTag}
                placeholder={safeArr(f.tags).length?"Add tag…":"e.g. hotel, VIP — Enter to add"}
                inputStyle={{flex:"1 1 120px",minWidth:100,border:"none",background:"none",outline:"none",fontSize:13,padding:"2px 0"}}/>
            </div>
          </FRow>
        </div>
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
        {onDelete&&<Btn variant="danger" icon={<TrashIcon/>} style={{marginRight:"auto"}} onClick={()=>onDelete(f)}>Delete</Btn>}
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn icon={<CheckIcon/>} onClick={()=>onSave({...f,lastContact:today()})}>Save customer</Btn>
      </div>
    </Modal>
  );
};

const CUST_HDR = ["ID","Company EN","Industry","Province","Contacts","Agent","Ranking","Status","Last Contact","Remark","Tags"];
const CustomersPage = ({user,customers,opps,onSave,onDelete,toast,deliveries,initCustId,onCustReady,userList=[]}) => {
  const [search,sS]=useState(""); const [fR,setFR]=useState([]); const [fSt,setFSt]=useState([]); const [fAg,setFAg]=useState([]);
  const [form,sF]=useState(false); const [edit,sE]=useState(null); const [gs,sGS]=useState(false);
  const [logCust,sLog]=useState(null);
  const [delConfirm,sDelConfirm]=useState(null);
  const [sorts,setSorts]=useState([{col:"companyEN",dir:"asc"}]);
  const [colWidths,setColWidths] = React.useState([130,220,200,110,180,90,120,140,60,60]);
  const toggleSort=col=>setSorts(p=>cycleSort(p,col));
  const resetSort=()=>setSorts(p=>p.slice(0,1));
  // Tags: row selection + bulk assign/delete + tag filter
  const [fTag,setFTag]=useState([]);
  const [selected,setSelected]=useState(()=>new Set());
  const [bulkTag,setBulkTag]=useState("");
  const [bulkDel,setBulkDel]=useState(false);
  const tagOptions=useMemo(()=>allTags(customers),[customers]);
  const toggleRow=(id)=>setSelected(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const clearSel=()=>setSelected(new Set());
  // Drop selected ids that no longer exist (e.g. after a delete elsewhere)
  useEffect(()=>{setSelected(p=>{const valid=new Set(customers.map(c=>c.id));let changed=false;const n=new Set();p.forEach(id=>{if(valid.has(id))n.add(id);else changed=true;});return changed?n:p;});},[customers]);
  const applyBulkTag=(override)=>{
    const t=(typeof override==="string"?override:bulkTag).trim(); if(!t||selected.size===0) return;
    customers.filter(c=>selected.has(c.id)).forEach(c=>onSave({...c,tags:[...new Set([...safeArr(c.tags),t])]}));
    toast("Tag assigned",`"${t}" → ${selected.size} customer${selected.size>1?"s":""}`);
    setBulkTag("");
  };
  const applyBulkDelete=()=>{
    const n=selected.size;
    customers.filter(c=>selected.has(c.id)).forEach(c=>onDelete(c.id));
    toast("Customers deleted",`${n} record${n>1?"s":""} removed`,"error");
    clearSel(); setBulkDel(false);
  };
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
    const dlvLogs = (deliveries||[]).filter(d=>d.custId===custId).flatMap(d=>safeArr(d.workLog).map(w=>w.ts));
    const latest = dlvLogs.sort().slice(-1)[0];
    const cust = customers.find(c=>c.id===custId);
    if(!latest) return cust?.lastContact||"";
    return latest.slice(0,10) > (cust?.lastContact||"") ? latest.slice(0,10) : (cust?.lastContact||"");
  };
  const list=useMemo(()=>{
    const RANK_ORDER=["High","Medium","Low"];
    const filtered=customers.filter(c=>{const q=search.toLowerCase();return(!search||c.companyEN.toLowerCase().includes(q)||c.id.includes(q)||(c.contacts||[]).some(ct=>(ct.name||"").toLowerCase().includes(q)))&&(fR.length===0||fR.includes(c.ranking))&&(fSt.length===0||fSt.includes(c.status))&&(fAg.length===0||fAg.includes(c.assignedTo))&&(fTag.length===0||fTag.some(t=>safeArr(c.tags).includes(t)));});
    const getV=(c,col)=>{
      if(col==="id") return c.id||"";
      if(col==="companyEN") return (c.companyEN||"").toLowerCase();
      if(col==="industry") return (c.industry||"").toLowerCase();
      if(col==="province") return (c.province||"").toLowerCase();
      if(col==="agent") return (USERS.find(u=>u.id===c.assignedTo)?.name||"").toLowerCase();
      if(col==="lastContact") return getLastContact(c.id)||"";
      if(col==="remark") return (c.remark||"").toLowerCase();
      return "";
    };
    return [...filtered].sort((a,b)=>multiCmp(a,b,sorts,getV));
  },[customers,opps,deliveries,search,fR,fSt,fAg,fTag,sorts]);
  const activeContacts = c => (c.contacts||[]).filter(ct=>ct.active);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Customers</Span>
          <CountPill n={list.length} label="customers"/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><Btn variant="export" size="sm" icon={<DlIcon/>} onClick={()=>dlCSV("customers.csv",CUST_HDR,list.map(c=>[c.id,c.companyEN,c.industry,c.province,(c.contacts||[]).map(ct=>ct.name).join("; "),USERS.find(u=>u.id===c.assignedTo)?.name||c.assignedTo,c.ranking,c.status,getLastContact(c.id),c.remark||"",safeArr(c.tags).join("; ")]))}>CSV</Btn><Btn icon={<PlusIcon/>} onClick={()=>{sE(null);sF(true);}}>Add Customer</Btn></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <FilterIcon/>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search…" style={{maxWidth:220}}/>
        <MultiSelect label="Tags" options={tagOptions.map(t=>({value:t,label:t}))} selected={fTag} onChange={setFTag} width={150}/>
        <div style={{marginLeft:"auto"}}><SortReset sorts={sorts} onReset={resetSort}/></div>
      </div>
      {selected.size>0&&(
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:12,padding:"10px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:9}}>
          <Span s={13} w={800} c="#1e40af">{selected.size} selected</Span>
          <div style={{width:1,height:20,background:"#bfdbfe"}}/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{position:"relative"}}>
              <TagTypeahead value={bulkTag} onChange={setBulkTag} suggestions={tagOptions}
                onCommit={applyBulkTag} placeholder="Tag name… e.g. hotel"
                inputStyle={{...SI,width:170,fontSize:13,padding:"6px 10px"}}/>
            </div>
            <Btn size="sm" disabled={!bulkTag.trim()} onClick={applyBulkTag}>Assign tag</Btn>
          </div>
          <div style={{width:1,height:20,background:"#bfdbfe"}}/>
          <Btn variant="danger" size="sm" icon={<TrashIcon s={13}/>} onClick={()=>setBulkDel(true)}>Delete {selected.size}</Btn>
          <button onClick={clearSel} style={{marginLeft:"auto",border:"none",background:"none",color:"#64748b",fontSize:12,fontWeight:600,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:2}}>Clear</button>
        </div>
      )}
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
        // colWidths / setColWidths hoisted to component body (Rules of Hooks)
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
        <table style={{borderCollapse:"collapse",tableLayout:"fixed",width:40+colWidths.reduce((s,w)=>s+w,0)}}>
          <colgroup><col style={{width:40}}/>{colWidths.map((w,i)=><col key={i} style={{width:w}}/>)}</colgroup>
          <thead><tr style={{background:"#f8fafc"}}>
            <th style={{padding:"9px 0",textAlign:"center",borderBottom:"1px solid #e2e8f0",background:"#f8fafc"}}>
              <input type="checkbox" title="Select all"
                ref={el=>{if(el)el.indeterminate=selected.size>0&&!list.every(c=>selected.has(c.id));}}
                checked={list.length>0&&list.every(c=>selected.has(c.id))}
                onChange={e=>{if(e.target.checked)setSelected(new Set(list.map(c=>c.id)));else clearSel();}}
                style={{width:15,height:15,cursor:"pointer",accentColor:"#1e40af"}}/>
            </th>
            {COLS.map(({l,c},i)=>{const active=c&&sorts.some(s=>s.col===c);return(
              <th key={i} className={c?"wb-sort":undefined} tabIndex={c?0:undefined}
                onClick={c?()=>toggleSort(c):undefined}
                onKeyDown={c?(e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleSort(c);}}):undefined}
                style={{padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap",cursor:c?"pointer":"default",userSelect:"none",color:active?"#0f172a":"#64748b",background:active?"#f1f5f9":"#f8fafc",position:"relative",overflow:"hidden"}}>
                <span style={{display:"flex",alignItems:"center",overflow:"hidden"}}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{l}</span>{c&&<SortBadge col={c} sorts={sorts}/>}</span>
                <span onMouseDown={e=>startResize(i,e)} onDoubleClick={e=>autoFitCol(i,e)} onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:0,bottom:0,width:6,cursor:"col-resize",background:"transparent",zIndex:2}}/>
              </th>
            );})}
          </tr></thead>
          <tbody>{list.map(c=>(
            <TR key={c.id} onClick={()=>{sE(c);sF(true);}} hi={selected.has(c.id)}>
              <td onClick={e=>e.stopPropagation()} style={{textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleRow(c.id)} style={{width:15,height:15,cursor:"pointer",accentColor:"#1e40af"}}/>
              </td>
              <TD style={{fontFamily:"monospace",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.id}</TD>
              <TD style={{fontWeight:600,overflow:"hidden"}}>
                <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.companyEN}</div>
                {safeArr(c.tags).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>{safeArr(c.tags).map(t=><TagChip key={t} tag={t}/>)}</div>}
              </TD>
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
              <TD><button onClick={e=>{e.stopPropagation();sLog(c);}} style={{border:"1px solid #e2e8f0",borderRadius:5,background:"#f8fafc",cursor:"pointer",padding:"3px 9px",fontSize:11,color:"#475569",fontWeight:600}}>{safeArr(c.workLog).length}</button></TD>
              <TD style={{overflow:"visible",whiteSpace:"nowrap"}}>
                <Btn variant="ghost" size="sm" icon={<EditIcon s={12}/>} onClick={e=>{e.stopPropagation();sE(c);sF(true);}}>Edit</Btn>
              </TD>
            </TR>
          ))}</tbody>
        </table>
        );
      })()}
      {list.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No records.</div>}</div></Card>
      {form&&<CustForm initial={edit} user={user} tagSuggestions={tagOptions} onSave={c=>{if(edit&&edit.id&&edit.id!==c.id)onDelete(edit.id);onSave(c);sF(false);toast("Customer saved",c.companyEN);}} onClose={()=>sF(false)} onDelete={edit?c=>{sF(false);sDelConfirm(c);}:null}/>}
      {bulkDel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.2)",overflow:"hidden"}}>
            <div style={{background:"#fef2f2",borderBottom:"1px solid #fecaca",padding:"24px 28px 20px",textAlign:"center"}}>
              <div style={{width:48,height:48,background:"#fee2e2",border:"1.5px solid #fecaca",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4h4M3 6h14M5 6l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:"#0f172a",letterSpacing:"-0.01em"}}>Delete {selected.size} Customer{selected.size>1?"s":""}</div>
              <div style={{fontSize:12,color:"#ef4444",marginTop:4}}>This action cannot be undone</div>
            </div>
            <div style={{padding:"20px 28px 24px"}}>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.6,marginBottom:20}}>
                {selected.size} customer record{selected.size>1?"s":""} will be permanently removed from Google Sheets. Linked opportunities and deliveries will not be deleted.
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" style={{flex:1,justifyContent:"center"}} onClick={()=>setBulkDel(false)}>Cancel</Btn>
                <Btn variant="danger-solid" icon={<TrashIcon s={15}/>} style={{flex:1,justifyContent:"center"}} onClick={applyBulkDelete}>Delete {selected.size}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
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
                <Btn variant="danger-solid" icon={<TrashIcon s={15}/>} style={{flex:1,justifyContent:"center"}} onClick={()=>{
                  onDelete(delConfirm.id);
                  toast("Customer deleted",delConfirm.companyEN,"error");
                  sDelConfirm(null);
                }}>Delete Customer</Btn>
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
            <Span s={11} c="#94a3b8">Customer Work Log: {safeArr(logCust.workLog).length} entries</Span>
          </div>
          {/* Delivery-linked logs (read-only) */}
          {(()=>{
            const dlvLogs=(deliveries||[]).filter(d=>d.custId===logCust.id).flatMap(d=>safeArr(d.workLog).map(w=>({...w,_dlvJob:d.jobCode||d.oppCode||d.id,_dlvSvc:d.serviceType||d.serviceCode})));
            if(dlvLogs.length===0) return null;
            return (
              <div style={{marginBottom:12}}>
                <Span s={11} w={700} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:6}}>Delivery Work Logs (linked)</Span>
                <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                  {[...dlvLogs].sort((a,b)=>(b.ts||"").localeCompare(a.ts||"")).map(w=>(
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
          <ActivityLog logs={safeArr(logCust.workLog)} currentUser={user}
            onAdd={entry=>{const up={...logCust,workLog:[...safeArr(logCust.workLog),entry],lastContact:today()};onSave(up);sLog(up);toast("Log added",logCust.companyEN);}}
            placeholder="Log a call, meeting, site visit…" users={userList}/>
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
// QUOTATION PREVIEW & EXPORT — Wave BCG Company Limited
// 
// 
// QUOTATION PREVIEW & EXPORT — Wave BCG Company Limited
// 

// Logo removed — using company name text only

const WAVE_CO = {
  name:       "Wave BCG Company Limited",
  taxId:      "0105528019566",
  address:    "2445/19 Tararom Business Tower 14th Floor, New Petchaburi Rd, Bang Kapi, Huai Khwang, Bangkok 10310",
  tel:        "02-665-6705 #1015",
  email:      "service@wavebcg.com",
  signer:     "Korakoj Sanguanpiyapan",
  signerTitle:"Chief Executive Officer",
};
// Thai company block — wording from th information.xlsx (content reference, not layout)
const WAVE_CO_TH = {
  name:       "บริษัท เวฟ บีซีจี จำกัด",
  taxId:      "0105528019566",
  address:    "2445/19 อาคารธารารมณ์ บิสซิเนส ทาวเวอร์ ชั้น 14 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310",
  tel:        "02-665-6705 #1015",
  email:      "service@wavebcg.com",
  signer:     "กรกช สงวนปิยะพันธ์",
  signerTitle:"ประธานเจ้าหน้าที่บริหาร",
};

// Wave BCG quotation logo — fetched once from Drive, cached at module scope so every
// caller (QuotationPreview + the Cost Sheet card export) gets it without re-fetching.
let _waveLogoB64 = "";
const useWaveLogo = () => {
  const [logoB64, setLogoB64] = useState(_waveLogoB64);
  useEffect(()=>{
    if(_waveLogoB64){ setLogoB64(_waveLogoB64); return; }
    const URLS=[
      "https://lh3.googleusercontent.com/d/191l9t4ftBD6PV42Lo293UzYI9VWx8leX",
      "https://drive.google.com/uc?export=view&id=191l9t4ftBD6PV42Lo293UzYI9VWx8leX",
      "https://drive.google.com/thumbnail?id=191l9t4ftBD6PV42Lo293UzYI9VWx8leX&sz=w400",
    ];
    let alive=true;
    const tryNext=async(idx)=>{
      if(idx>=URLS.length||!alive) return;
      try{
        const r=await fetch(URLS[idx],{mode:"cors",cache:"no-store"});
        if(r.ok){const blob=await r.blob();const fr=new FileReader();fr.onload=()=>{ _waveLogoB64=fr.result; if(alive) setLogoB64(fr.result); };fr.readAsDataURL(blob);return;}
      }catch(e){}
      tryNext(idx+1);
    };
    tryNext(0);
    return ()=>{ alive=false; };
  },[]);
  return logoB64;
};

// Pure quotation-PDF generator — opens a print-ready A4 window. Shared by QuotationPreview
// and the Cost Sheet quote card so the layout has a single source of truth. `f` is the
// quotation data object; call synchronously from a click so window.open keeps its gesture.
const exportQuotationPDF = (f, customer, logoB64="", lang="en") => {
    const isTH = lang==="th";
    const co   = isTH ? WAVE_CO_TH : WAVE_CO;
    const df   = isTH ? fmtDateTH : fmtDate;   // date formatter
    const cur  = isTH ? "฿" : "THB";          // currency label
    const L = isTH ? {
      title:"ใบเสนอราคา", coLegal:"บริษัท เวฟ บีซีจี จำกัด", taxId:"เลขทะเบียนนิติบุคคล:", tel:"เบอร์:",
      quoteFor:"เสนอราคาแก่:", contact:"ผู้ติดต่อ",
      mQuote:"ใบเสนอราคา #", mIssued:"วันที่ออก:", mValid:"วันครบกำหนด:", mSales:"พนักงานขาย", mMobile:"เบอร์โทร:", mDiscount:"ส่วนลด:",
      sProject:"โครงการ", sScope:"ขอบเขตงาน", cDesc:"คำอธิบาย", cQty:"จำนวน", cUnit:"หน่วย", cUnitPrice:"ราคาต่อหน่วย", cSubtotal:"ยอดรวม",
      sDeliv:"สิ่งที่นำส่ง", sPay:"การชำระเงิน", pNo:"ลำดับ", pDesc:"รายละเอียด", pPct:"%", pAmount:"จำนวนเงิน",
      tSub:"ยอดรวม (ไม่รวมภาษี)", tDiscount:"ส่วนลด", tNet:"ยอดหลังหักส่วนลด", tVat:"ภาษี (7%)", tTotal:"ยอดรวมสุทธิ", sNotes:"หมายเหตุและเงื่อนไข",
      onBehalf:"ในนามของ", name:"ชื่อ:", role:"ตำแหน่ง:", date:"วันที่:",
    } : {
      title:"QUOTATION", coLegal:"Company Limited", taxId:"Tax ID:", tel:"Tel:",
      quoteFor:"Quote For", contact:"Contact Person",
      mQuote:"QUOTE #", mIssued:"ISSUED", mValid:"VALID UNTIL", mSales:"SALES", mMobile:"MOBILE", mDiscount:"DISCOUNT",
      sProject:"Project", sScope:"Scope", cDesc:"Description", cQty:"Qty", cUnit:"Unit", cUnitPrice:"Unit Price", cSubtotal:"Subtotal",
      sDeliv:"Deliverables", sPay:"Payment Schedule", pNo:"#", pDesc:"Description", pPct:"%", pAmount:"Amount",
      tSub:"Subtotal (excl. VAT)", tDiscount:"Discount", tNet:"Price after Discount", tVat:"VAT 7%", tTotal:"TOTAL", sNotes:"Notes &amp; Conditions",
      onBehalf:"On behalf of", name:"Name:", role:"Title:", date:"Date:",
    };
    // Discount reduces the list price before VAT; installments are computed on the net.
    const listT=f.salesPrice||0;
    const discPctT=f.discountEnabled?(f.discountPct||0):0;
    const discAmtT=Math.round(listT*discPctT/100);
    const netT=listT-discAmtT;
    const subT=netT, vatT=Math.round(netT*0.07), totT=netT+vatT;
    const agentName=USERS.find(u=>u.id===f.salesAgentId)?.name||"—";
    const agentMobP=SALES_MOBILE[f.salesAgentId]||"—";
    const instRowsHtml=(f.installments||[]).map((ins,i)=>`
      <tr>
        <td class="idx">${i+1}</td>
        <td>${ins.label||""}</td>
        <td class="num">${ins.pct||0}%</td>
        <td class="num amt">${cur} ${fmt(Math.round(subT*(ins.pct||0)/100))}</td>
      </tr>`).join("");
    const dlvHtml=(f.deliverables||[]).map((d,i)=>`<div class="row"><span class="n">${i+1}</span><span>${d.item||""}</span></div>`).join("");
    const custName=customer?.companyEN||"—";
    const custTax=customer?.id||"—";
    const custAddr=[customer?.address,customer?.province].filter(Boolean).join(", ");
    const custContacts=(customer?.contacts||[]).filter(c=>c.active).slice(0,2)
      .map(ct=>`<div style="margin-bottom:3px"><strong style="color:#0c1a2e">${ct.name}</strong>${ct.title?` <span style="color:#9aa4b1">· ${ct.title}</span>`:""}<br/>${[ct.email,ct.phone].filter(Boolean).join("<br/>")}</div>`).join("");
    const acceptLbl = isTH ? `${custName} — เพื่อยืนยันการตอบรับใบเสนอราคาฉบับนี้ กรุณาลงนาม:` : `Accepted by ${custName}`;
    const notesHtml=toItemList(f.notes).map((n,i)=>`<div class="row"><span class="n">${i+1}</span><span>${n.item||""}</span></div>`).join("");
    const scopeHtml=f.projectScope?`<div class="scope"><b>${L.sScope}</b>${f.projectScope}</div>`:"";
    const lineItemsHtml=(f.lineItems||[]).map((li,i)=>{
      const sub=(li.qty||0)*(li.unitPrice||0);
      return `<tr>
        <td>${li.description||""}</td>
        <td class="num">${li.qty||0}</td>
        <td>${li.unit||""}</td>
        <td class="num">${fmt(li.unitPrice||0)}</td>
        <td class="num amt">${cur} ${fmt(sub)}</td>
      </tr>`;
    }).join("");
    // PDF logo: use cached base64 from state, or empty
    const pdfLogoHtml = logoB64 ? `<img src="${logoB64}" style="height:46px;width:auto;object-fit:contain;flex-shrink:0" alt="Wave BCG"/>` : "";
    // Thai needs a Thai-capable font + no uppercasing/letter-spacing (it mangles Thai glyph clusters)
    const thStyle = isTH ? `
#page{font-family:'Noto Sans Thai','Inter','Helvetica Neue',Arial,sans-serif}
.co-name,.quo-title,.party .name,.tot-final .v{font-family:'Noto Sans Thai','Inter Tight','Inter',sans-serif!important}
th,.sec-hdr,.meta-key,.lbl,.scope b,.tot-final .k{text-transform:none;letter-spacing:normal}
` : "";

    const w = window.open("","_blank");
    if(!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${L.title} ${f.quoteNo}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Inter+Tight:wght@700;800;900&family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4 portrait;margin:0}
html{width:794px;height:1123px;overflow:hidden;background:#fff}
body{width:794px;height:1123px;overflow:hidden;background:#fff}
#page{
  width:794px;height:1123px;
  padding:46px 52px 40px;
  font-family:'Inter','Helvetica Neue',Arial,'Noto Sans Thai',sans-serif;
  font-size:8.5px;color:#243042;line-height:1.4;
  display:flex;flex-direction:column;overflow:hidden;
  -webkit-font-smoothing:antialiased;
}
table{width:100%;border-collapse:collapse}
th,td{padding:5px 8px;text-align:left;font-size:8.5px;vertical-align:top}
th:first-child,td:first-child{padding-left:0}
th:last-child,td:last-child{padding-right:0}
th{font-weight:700;font-size:7.5px;text-transform:uppercase;letter-spacing:.05em;color:#7c8794;border-bottom:1px solid #c9d2dc;padding-bottom:5px}
td{border-bottom:1px solid #eef1f5}
.num{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.amt{font-weight:700;color:#0c1a2e}
.idx{color:#9aa4b1;font-weight:700}
/* Header */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:13px;border-bottom:2px solid #0c1a2e}
.co-name{font-size:13px;font-weight:900;color:#0c1a2e;letter-spacing:-0.02em;line-height:1.1;font-family:'Inter Tight','Inter',sans-serif;margin-bottom:5px}
.co-addr{color:#7c8794;font-size:7.5px;line-height:1.7}
.quo-title{font-size:23px;font-weight:900;color:#0c1a2e;letter-spacing:-0.04em;line-height:1;margin-bottom:8px;font-family:'Inter Tight','Inter',sans-serif}
.meta{margin-left:auto;width:auto}
.meta td{padding:2px 0 2px 14px;font-size:8.5px;border:none}
.meta-key{color:#9aa4b1;font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:right}
.meta-val{font-weight:700;color:#0c1a2e;text-align:right}
/* Party band — flush to content column, no fill */
.party{display:grid;grid-template-columns:1.15fr 1fr;gap:32px;padding:2px 0 14px;margin-bottom:6px;border-bottom:1px solid #e2e8f0}
.lbl{font-size:7px;font-weight:700;color:#9aa4b1;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:4px}
.party .name{font-weight:800;font-size:11.5px;color:#0c1a2e;margin-bottom:3px;letter-spacing:-0.01em}
.party .detail{color:#5b6675;font-size:8px;line-height:1.65}
/* Sections */
.body{display:flex;flex-direction:column;gap:13px;padding-top:4px}
.sec-hdr{display:flex;align-items:center;gap:7px;font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#0c1a2e;border-bottom:1.5px solid #0c1a2e;padding-bottom:5px;margin-bottom:7px}
.badge{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;background:#0c1a2e;color:#fff;border-radius:50%;font-weight:800;font-size:8px;flex-shrink:0;font-family:'Inter',sans-serif}
.scope{margin-top:7px;font-size:8px;color:#5b6675;line-height:1.6;white-space:pre-wrap}
.scope b{color:#7c8794;font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:7px;display:block;margin-bottom:2px}
/* Numbered list (deliverables / notes) */
.list .row{display:flex;gap:8px;margin-bottom:4px;font-size:8.5px;color:#374151;line-height:1.55}
.list .n{color:#9aa4b1;font-weight:700;flex-shrink:0;min-width:13px;font-variant-numeric:tabular-nums}
/* Totals — flush right to content column, no box */
.totals-wrap{display:flex;justify-content:flex-end;margin-top:10px}
.totals{width:264px}
.tot-row{display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;font-size:8.5px;border-bottom:1px solid #eef1f5}
.tot-row .k{color:#5b6675}
.tot-row .v{font-variant-numeric:tabular-nums;font-weight:600;color:#243042}
.tot-final{border-bottom:none;border-top:1.5px solid #0c1a2e;margin-top:2px;padding-top:5px}
.tot-final .k{font-weight:800;color:#0c1a2e;font-size:9.5px;text-transform:uppercase;letter-spacing:.04em}
.tot-final .v{font-weight:900;color:#0c1a2e;font-size:12px;font-family:'Inter Tight','Inter',sans-serif}
/* Signature */
.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;border-top:1px solid #e2e8f0;padding-top:16px;margin-top:auto}
.sig-lbl{font-size:8px;color:#5b6675;margin-bottom:26px;font-style:italic}
.sig-line{border-bottom:1px solid #9aa4b1;height:0;margin-bottom:7px}
.sig-detail{font-size:8px;color:#374151;line-height:1.95}
.foot{margin-top:14px;text-align:right;font-size:6.5px;color:#9aa4b1;letter-spacing:.03em}
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  html,body{width:794px;height:1123px;overflow:hidden}
  #page{page-break-after:avoid;page-break-inside:avoid}
}
${thStyle}
</style></head><body>
<div id="page">
<!-- HEADER -->
<div class="hdr">
  <div style="display:flex;gap:13px;align-items:flex-start">
    ${pdfLogoHtml}
    <div>
      <div class="co-name"><span style="color:#0c1a2e">WAVE BCG</span><span style="color:#0c1a2e"> ${L.coLegal}</span></div>
      <div class="co-addr">${L.taxId} ${co.taxId}<br/>${co.address}<br/>${L.tel} ${co.tel} &nbsp;·&nbsp; ${co.email}</div>
    </div>
  </div>
  <div style="text-align:right">
    <div class="quo-title">${L.title}</div>
    <table class="meta">
      <tr><td class="meta-key">${L.mQuote}</td><td class="meta-val" style="letter-spacing:0.02em">${f.quoteNo}</td></tr>
      <tr><td class="meta-key">${L.mIssued}</td><td class="meta-val">${df(f.issueDate)}</td></tr>
      <tr><td class="meta-key">${L.mValid}</td><td class="meta-val">${df(f.dueDate)}</td></tr>
      <tr><td class="meta-key">${L.mSales}</td><td class="meta-val">${agentName}</td></tr>
      <tr><td class="meta-key">${L.mMobile}</td><td class="meta-val">${agentMobP}</td></tr>
      ${discPctT>0?`<tr><td class="meta-key">${L.mDiscount}</td><td class="meta-val" style="color:#b91c1c">${discPctT}%</td></tr>`:""}
    </table>
  </div>
</div>
<!-- PARTY BAND -->
<div class="party">
  <div>
    <span class="lbl">${L.quoteFor}</span>
    <div class="name">${custName}</div>
    <div class="detail">${L.taxId} ${custTax}<br/>${custAddr}</div>
  </div>
  <div>
    <span class="lbl">${L.contact}</span>
    <div class="detail">${custContacts||"—"}</div>
  </div>
</div>
<!-- BODY SECTIONS -->
<div class="body">
  <!-- SEC 1: PROJECT -->
  <div>
    <div class="sec-hdr"><span class="badge">1</span>${L.sProject}</div>
    <table>
      <thead><tr>
        <th>${L.cDesc}</th>
        <th style="width:42px;text-align:right">${L.cQty}</th>
        <th style="width:48px">${L.cUnit}</th>
        <th style="width:96px;text-align:right">${L.cUnitPrice}</th>
        <th style="width:108px;text-align:right">${L.cSubtotal}</th>
      </tr></thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>
    ${scopeHtml}
  </div>
  <!-- SEC 2: DELIVERABLES -->
  <div>
    <div class="sec-hdr"><span class="badge">2</span>${L.sDeliv}</div>
    <div class="list">${dlvHtml}</div>
  </div>
  <!-- SEC 3: PAYMENT SCHEDULE -->
  <div>
    <div class="sec-hdr"><span class="badge">3</span>${L.sPay}</div>
    <table>
      <thead><tr><th style="width:24px">${L.pNo}</th><th>${L.pDesc}</th><th style="width:48px;text-align:right">${L.pPct}</th><th style="width:108px;text-align:right">${L.pAmount}</th></tr></thead>
      <tbody>${instRowsHtml}</tbody>
    </table>
    <div class="totals-wrap">
      <div class="totals">
        <div class="tot-row"><span class="k">${L.tSub}</span><span class="v">${cur} ${fmt(listT)}</span></div>
        ${discPctT>0?`<div class="tot-row"><span class="k" style="color:#dc2626">${L.tDiscount} (${discPctT}%)</span><span class="v" style="color:#dc2626">− ${cur} ${fmt(discAmtT)}</span></div>
        <div class="tot-row"><span class="k">${L.tNet}</span><span class="v">${cur} ${fmt(netT)}</span></div>`:""}
        <div class="tot-row"><span class="k">${L.tVat}</span><span class="v">${cur} ${fmt(vatT)}</span></div>
        <div class="tot-row tot-final"><span class="k">${L.tTotal}</span><span class="v">${cur} ${fmt(totT)}</span></div>
      </div>
    </div>
  </div>
  <!-- SEC 4: NOTES -->
  <div>
    <div class="sec-hdr"><span class="badge">4</span>${L.sNotes}</div>
    <div class="list">${notesHtml}</div>
  </div>
</div>
<!-- SIGNATURES -->
<div class="sig-grid">
  <div>
    <div class="sig-lbl">${L.onBehalf} ${co.name}</div>
    <div class="sig-line"></div>
    <div class="sig-detail">${L.name} <strong>${co.signer}</strong><br/>${L.role} ${co.signerTitle}<br/>${L.date} ${df(f.issueDate)}</div>
  </div>
  <div>
    <div class="sig-lbl">${acceptLbl}</div>
    <div class="sig-line"></div>
    <div class="sig-detail">${L.name}<br/>${L.role}<br/>${L.date}</div>
  </div>
</div>
<div class="foot">FR-BD-01-02 Rev.00 · Issue date 01/04/2569</div>
</div>
</body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),600);
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

  const buildNotes = () => {
    const items = toItemList(qSnap?.notes);
    return items.length ? items.map(n=>({...n,id:n.id||uid()})) : [{id:uid(),item:""}];
  };

  const initIssue = today();
  const savedQD = opp?.quotationData; // persisted from previous save

  const defaultNotes = buildNotes();



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
    notes:         Array.isArray(savedQD.notes) && savedQD.notes.length ? savedQD.notes : (toItemList(savedQD.notes).length ? toItemList(savedQD.notes) : defaultNotes),
    salesPrice:    savedQD.salesPrice    || qPrice,
    projectTitle:  savedQD.projectTitle  || qSnap?.projectTitle  || qSnap?.serviceType   || opp?.serviceType || cs?.serviceType || "",
    projectDuration: savedQD.projectDuration || qSnap?.projectMonths || cs?.projectMonths || 3,
    salesAgentId:  savedQD.salesAgentId  || qSnap?.salesAgent    || opp?.assignedTo   || SALES_USERS[0]?.id || "",
    discountEnabled: savedQD.discountEnabled!==undefined ? savedQD.discountEnabled : (qSnap?.discountEnabled||false),
    discountPct:     savedQD.discountPct!==undefined     ? savedQD.discountPct     : (qSnap?.discountPct||0),
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
    discountEnabled: qSnap?.discountEnabled||false,
    discountPct:     qSnap?.discountPct||0,
    lineItems: buildLineItems(),
    installments: buildInstallments(),
    notes: buildNotes(),
  });

  const set    = (k,v) => sF(p=>({...p,[k]:v}));
  const setIssue = v  => sF(p=>({...p,issueDate:v,dueDate:addDays(v,30)}));

  // Logo: fetch from Google Drive as base64 on mount
  const LOGO_GDRIVE = "https://lh3.googleusercontent.com/d/191l9t4ftBD6PV42Lo293UzYI9VWx8leX";
  const logoB64 = useWaveLogo();

  const agent    = USERS.find(u=>u.id===f.salesAgentId);
  const agentMob = SALES_MOBILE[f.salesAgentId]||"";
  // Discount reduces the list price before VAT; installments & VAT are computed on the net.
  const listPrice   = f.salesPrice||0;
  const discountPct = f.discountEnabled ? (f.discountPct||0) : 0;
  const discountAmt = Math.round(listPrice*discountPct/100);
  const netPrice    = listPrice - discountAmt;
  const subTotal = netPrice;            // base for installments
  const vat      = Math.round(netPrice*0.07);
  const total    = netPrice + vat;
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
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:6,borderBottom:"1.5px solid #0c1a2e"}}>
      <div style={{width:19,height:19,background:"#0c1a2e",color:"#fff",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{n}</div>
      <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.08em",color:"#0c1a2e"}}>{label}</span>
      {warn&&<span style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:instOk?"#16a34a":"#dc2626"}}>{instSum}% {instOk?"":" must = 100%"}</span>}
    </div>
  );

  // EN/TH quotation PDF — delegates to the shared module-level generator (single source of truth).
  const exportPDF = (lang="en") => exportQuotationPDF(f, customer, logoB64, lang);

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
          ...(discountPct>0?[["Discount", `${discountPct}% (−฿${fmt(discountAmt)})`, false]]:[]),
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
            {logoB64&&<img src={logoB64} style={{height:44,width:"auto",objectFit:"contain",flexShrink:0}} alt="Wave BCG"/>}
            <div>
              <div style={{fontSize:13,fontWeight:900,letterSpacing:"-0.02em",lineHeight:1.2,fontFamily:"'Inter Tight','Inter',system-ui,sans-serif"}}>
                <span style={{color:"#0c1a2e"}}>WAVE BCG</span><span style={{color:"#0c1a2e"}}> Company Limited</span>
              </div>
              <div style={{color:"#64748b",fontSize:9,lineHeight:1.7,marginTop:3}}>
                Tax ID: {WAVE_CO.taxId}<br/>
                {WAVE_CO.address}<br/>
                Tel: {WAVE_CO.tel}<br/>
                {WAVE_CO.email}
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

        {/* PARTY BAND */}
        <div style={{display:"grid",gridTemplateColumns:"1.15fr 1fr",gap:32,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #e2e8f0"}}>
          <div>
            <span style={{fontSize:9,fontWeight:700,color:"#9aa4b1",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Quote For</span>
            <div style={{fontWeight:800,fontSize:13,color:"#0c1a2e",marginBottom:3,letterSpacing:"-0.01em"}}>{customer?.companyEN||"—"}</div>
            <div style={{color:"#5b6675",fontSize:11,lineHeight:1.75}}>
              Tax ID {customer?.id||"—"}<br/>
              {[customer?.address,customer?.province].filter(Boolean).join(", ")}
            </div>
          </div>
          <div>
            <span style={{fontSize:9,fontWeight:700,color:"#9aa4b1",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Contact Person</span>
            {(customer?.contacts||[]).filter(c=>c.active).slice(0,2).map(ct=>(
              <div key={ct.id} style={{fontSize:11,lineHeight:1.7,color:"#5b6675"}}>
                <strong style={{color:"#0c1a2e"}}>{ct.name}</strong>{ct.title&&<span style={{color:"#9aa4b1"}}> · {ct.title}</span>}<br/>
                {ct.email&&<span>{ct.email}</span>}{ct.email&&ct.phone&&<br/>}{ct.phone&&<span>{ct.phone}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 1: PROJECT */}
        <div style={{marginBottom:12}}>
          <SH n="1" label="Project"/>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr>
                {[["Description","left"],["Qty","right"],["Unit","left"],["Unit Price","right"],["Subtotal","right"]].map(([h,al],i,arr)=>(
                  <th key={i} style={{padding:`0 ${i===arr.length-1?0:8}px 6px ${i===0?0:8}px`,textAlign:al,fontWeight:700,color:"#7c8794",fontSize:9.5,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #c9d2dc",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(f.lineItems||[]).map((li)=>{
                const sub=(li.qty||0)*(li.unitPrice||0);
                return(
                  <tr key={li.id} style={{borderBottom:"1px solid #eef1f5"}}>
                    <td style={{padding:"6px 8px 6px 0",fontSize:11}}>{li.description||"—"}</td>
                    <td style={{padding:"6px 8px",textAlign:"right",fontSize:11,fontVariantNumeric:"tabular-nums"}}>{li.qty||0}</td>
                    <td style={{padding:"6px 8px",fontSize:11}}>{li.unit||""}</td>
                    <td style={{padding:"6px 8px",textAlign:"right",fontSize:11,fontVariantNumeric:"tabular-nums"}}>{fmt(li.unitPrice||0)}</td>
                    <td style={{padding:"6px 0 6px 8px",textAlign:"right",fontWeight:700,color:"#0c1a2e",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",fontSize:11}}>฿{fmt(sub)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {f.projectScope&&<div style={{marginTop:8,fontSize:10.5,color:"#5b6675",lineHeight:1.6,whiteSpace:"pre-wrap"}}><span style={{display:"block",fontSize:9,fontWeight:700,color:"#7c8794",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Scope</span>{f.projectScope}</div>}
        </div>

        {/* SECTION 2: DELIVERABLES */}
        <div style={{marginBottom:12}}>
          <SH n="2" label="Deliverables"/>
          {(f.deliverables||[]).map((d,i)=>(
            <div key={d.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
              <span style={{color:"#9aa4b1",fontWeight:700,fontSize:11,flexShrink:0,marginTop:1,minWidth:14}}>{i+1}</span>
              <span style={{fontSize:11,color:"#374151",lineHeight:1.5}}>{d.item}</span>
            </div>
          ))}
        </div>

        {/* SECTION 3: PAYMENT SCHEDULE */}
        <div style={{marginBottom:12}}>
          <SH n="3" label="Payment Schedule" warn={true}/>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr>
                {[["#","left"],["Description","left"],["% Share","right"],["Amount","right"]].map(([h,al],i,arr)=>(
                  <th key={i} style={{padding:`0 ${i===arr.length-1?0:8}px 6px ${i===0?0:8}px`,textAlign:al,fontWeight:700,color:"#7c8794",fontSize:9.5,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #c9d2dc",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(f.installments||[]).map((ins,idx)=>(
                <tr key={ins.id} style={{borderBottom:"1px solid #eef1f5"}}>
                  <td style={{padding:"6px 8px 6px 0",color:"#9aa4b1",fontWeight:700}}>{idx+1}</td>
                  <td style={{padding:"6px 8px",fontSize:11}}>{ins.label}</td>
                  <td style={{padding:"6px 8px",textAlign:"right",fontSize:11,fontVariantNumeric:"tabular-nums"}}>{ins.pct||0}%</td>
                  <td style={{padding:"6px 0 6px 8px",textAlign:"right",fontWeight:700,color:"#0c1a2e",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",fontSize:11}}>฿{fmt(Math.round(subTotal*(ins.pct||0)/100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
            <div style={{width:300}}>
              {[
                {l:"Subtotal (excl. VAT)",v:listPrice,b:false},
                ...(discountPct>0?[
                  {l:`Discount (${discountPct}%)`,v:discountAmt,b:false,disc:true},
                  {l:"Net (excl. VAT)",v:netPrice,b:false},
                ]:[]),
                {l:"VAT 7%",v:vat,b:false},
                {l:"TOTAL",v:total,b:true},
              ].map(x=>(
                <div key={x.l} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:x.b?"6px 0 0":"4px 0",borderTop:x.b?"1.5px solid #0c1a2e":"none",borderBottom:x.b?"none":"1px solid #eef1f5",marginTop:x.b?2:0}}>
                  <span style={{fontWeight:x.b?800:500,color:x.disc?"#dc2626":x.b?"#0c1a2e":"#5b6675",fontSize:x.b?12.5:11.5,textTransform:x.b?"uppercase":"none",letterSpacing:x.b?"0.04em":"normal"}}>{x.l}</span>
                  <span style={{fontWeight:x.b?900:600,color:x.disc?"#dc2626":x.b?"#0c1a2e":"#243042",fontSize:x.b?15:11.5,fontVariantNumeric:"tabular-nums",fontFamily:x.b?"'Inter Tight','Inter',sans-serif":"inherit"}}>{x.disc?"−":""}฿{fmt(x.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: NOTES */}
        <div style={{marginBottom:12}}>
          <SH n="4" label="Notes &amp; Conditions"/>
          {toItemList(f.notes).map((n,i)=>(
            <div key={n.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
              <span style={{color:"#9aa4b1",fontWeight:700,fontSize:11,flexShrink:0,marginTop:1,minWidth:14}}>{i+1}</span>
              <span style={{fontSize:11,color:"#374151",lineHeight:1.5}}>{n.item}</span>
            </div>
          ))}
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
        <Btn variant="export" icon={<DlIcon/>} onClick={()=>exportPDF("en")}>Print / Export PDF (EN)</Btn>
        <Btn variant="export" icon={<DlIcon/>} onClick={()=>exportPDF("th")}>พิมพ์ / Export PDF (TH)</Btn>
      </div>
    </Modal>
  );
};

const OppForm = ({initial,customers,opps,user,onSave,onClose,costSheets,onGoToCS,onDelete,initTab="detail",userList=[],onMentionNotify=()=>{}}) => {
  const newOppCode=genOppCode(opps); const newQtNo=genQuoteNo(opps);
  const blank={id:newOppCode,custId:customers[0]?.id||"",oppCode:newOppCode,quoteNo:newQtNo,memoNo:"",jobCode:"",serviceCode:SERVICES[0].code,serviceType:SERVICES[0].name,salesPrice:SERVICES[0].stdPrice,totalCost:SERVICES[0].stdCost,status:"Proposal",assignedTo:SALES_USERS[0]?.id||"",createdDate:today(),lostReason:"",activityLog:[],remark:"",ranking:"Medium",successRate:""};
  const [f,sF] = useState(initial?{...initial,activityLog:initial.activityLog||[]}:blank);
  // view: "edit" (primary) | "activity" | "quotation". initTab kept for caller compatibility.
  const [view,setView] = useState(initTab==="log"?"activity":initTab==="quotation"?"quotation":"edit");
  const [noteInput,sNoteInput] = useState("");
  // srLocal: tracks successRate input locally so typing then clicking Save without blur still captures the value
  const [srLocal,setSrLocal] = useState(()=>{const v=initial?.successRate;return(v===0||v===undefined||v===""||v===null)?"":String(v);});
  const getSrValue=()=>{const n=parseFloat(srLocal);return isNaN(n)?0:Math.min(100,Math.max(0,n));};
  const set=(k,v)=>sF(p=>({...p,[k]:v}));
  const isWon=f.status==="Won", isLost=f.status==="Lost";
  const mg=margin(f.salesPrice,f.totalCost||0);
  const jobCode=isWon?genJobCode(f.oppCode):"";
  const [delConfirm,setDelConfirm] = useState(false);
  const [validErr,setValidErr] = useState("");
  return (
    <>
    <Modal title={initial?"Edit Opportunity":"New Opportunity"} width={940} onClose={onClose}>
      {/* ── IDENTITY HEADER — read-only context + the promoted Status control ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap",paddingBottom:14,marginBottom:18,borderBottom:"1px solid #e2e8f0"}}>
        <div style={{minWidth:0,flex:"1 1 300px"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:9,flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:"#1e40af"}}>{f.oppCode}</span>
            <span style={{fontSize:19,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em",lineHeight:1.1}}>{customers.find(c=>c.id===f.custId)?.companyEN||f.custId||"—"}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <SvcBadge code={f.serviceCode}/>
            <span style={{fontSize:12,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis"}}>{f.serviceType}</span>
            {f.quoteNo&&<button onClick={()=>setView("quotation")} title="Open quotation" style={{fontFamily:"monospace",fontSize:11.5,fontWeight:600,background:"none",color:"#1e40af",border:"none",padding:0,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{f.quoteNo}</button>}
            {f.csCode&&<button onClick={()=>{onSave({...f,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""});if(onGoToCS)onGoToCS(f.serviceCode,f.csCode);}} title="Open Cost Sheet (saves first)" style={{fontFamily:"monospace",fontSize:11.5,fontWeight:700,background:"none",color:"#1e40af",border:"none",padding:0,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{f.csCode}</button>}
            {f.memoNo&&<span style={{fontFamily:"monospace",fontSize:11,color:"#64748b"}}>Memo {f.memoNo}</span>}
            <span style={{fontSize:11,color:"#94a3b8"}}>· {SALES_USERS.find(u=>u.id===f.assignedTo)?.name||f.assignedTo||"No agent"} · {fmtDate(f.createdDate)}</span>
          </div>
        </div>
        <div style={{flexShrink:0,textAlign:"right"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>Status</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:STATUS_CLR[f.status]||"#94a3b8",flexShrink:0}}/>
            <Sel value={f.status} onChange={e=>set("status",e.target.value)} style={{width:152,fontWeight:700}}>{OPP_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel>
          </div>
          {isWon&&jobCode&&<div style={{fontSize:11,color:"#16a34a",fontFamily:"monospace",fontWeight:700,marginTop:6}}>{jobCode}</div>}
        </div>
      </div>

      {view==="edit"&&(
        <>
          {/* ── TOP: Note Log (left) · Sales Price (right) ── */}
          <div className="wb-oppedit-grid" style={{marginBottom:18,alignItems:"stretch"}}>
            {/* LEFT — Note Log */}
            <div style={{display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",flexDirection:"column",flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:"#64748b",marginBottom:4}}>Note Log</div>
                <div style={{border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden",flex:1,display:"flex",flexDirection:"column"}}>
                  {f.remark&&(()=>{
                    const lines=f.remark.split("\n").filter(Boolean);
                    return [...lines].reverse().map((line,i)=>{
                      const origIdx=lines.length-1-i;
                      const m=line.match(/^\[([^\]]+)\]\s*(.*)/);
                      const meta=m?m[1]:""; const body=m?m[2]:line;
                      const datePart=meta.split("·")[0].trim(); const authorPart=meta.includes("·")?meta.split("·").slice(1).join("·").trim():"";
                      return(
                      <div key={origIdx} style={{padding:"5px 8px 5px 10px",fontSize:12,color:"#374151",borderBottom:"1px solid #f1f5f9",background:"#fafafa",display:"flex",alignItems:"flex-start",gap:6}}>
                        <div style={{flex:1,lineHeight:1.5}}>
                          <span style={{fontSize:10,fontFamily:"monospace",color:"#94a3b8",marginRight:6}}>{datePart}</span>
                          {authorPart&&<span style={{fontSize:10,fontWeight:700,color:"#1e40af",background:"#eff6ff",padding:"1px 5px",borderRadius:3,marginRight:6}}>{authorPart}</span>}
                          <RenderMentionText text={body} users={userList}/>
                        </div>
                        <button onClick={()=>set("remark",lines.filter((_,idx)=>idx!==origIdx).join("\n"))} style={{flexShrink:0,border:"none",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:14,lineHeight:1,padding:"1px 2px"}} title="Delete note">×</button>
                      </div>
                    );});
                  })()}
                  <MentionTextarea
                    value={noteInput} onChange={sNoteInput}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&noteInput.trim()){
                      set("remark",(f.remark?f.remark+"\n":"")+`[${today()} · ${user.name}] ${noteInput.trim()}`);
                      extractMentions(noteInput,userList).forEach(uid=>{if(uid!==user.id)onMentionNotify(uid,"OPP",f.oppCode,`${user.name} mentioned you in a note: ${noteInput.trim().slice(0,80)}`);});
                      sNoteInput("");e.preventDefault();}}}
                    placeholder="Add entry… (@mention, Enter to save)"
                    style={{borderRadius:"0 0 5px 5px",background:"#fff",border:"none",borderTop:"1px solid #f1f5f9",fontSize:13}}
                    users={userList} minHeight={36}
                  />
                </div>
              </div>
            </div>
            {/* RIGHT — Sales Price */}
            <div>
              <div style={{padding:"14px 16px",borderRadius:8,background:+mg>=30?"#f0fdf4":"#fef2f2",border:`1px solid ${+mg>=30?"#86efac":"#fca5a5"}`}}>
                <Span s={10} c="#64748b" style={{display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Sales Price</Span>
                <div style={{fontWeight:900,fontSize:24,color:"#0f172a",letterSpacing:"-0.02em",lineHeight:1}}>฿{fmt(f.salesPrice)}</div>
                <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
                  <div>
                    <Span s={10} c="#64748b" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:1}}>Cost</Span>
                    <span style={{fontWeight:700,fontSize:14,color:"#334155"}}>฿{fmt(f.totalCost||0)}</span>
                  </div>
                  <div>
                    <Span s={10} c="#64748b" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:1}}>Margin</Span>
                    <span style={{fontWeight:800,fontSize:14,color:+mg>=30?"#16a34a":"#dc2626"}}>{mg}% · ฿{fmt(marginAmt(f.salesPrice,f.totalCost||0))}</span>
                  </div>
                </div>
                {(()=>{const sr=calcSuccessRate({...f,successRate:getSrValue()});const clr=successRateColor(sr);return(
                  <div style={{marginTop:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <Span s={10} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.05em"}}>Success</Span>
                      <span style={{fontSize:11,fontWeight:800,color:clr}}>{sr}%</span>
                    </div>
                    <div style={{height:5,background:"#fff",borderRadius:99,overflow:"hidden",border:"1px solid rgba(15,23,42,.08)"}}>
                      <div style={{height:"100%",width:`${sr}%`,background:clr,borderRadius:99,transition:"width .3s"}}/>
                    </div>
                  </div>
                );})()}
              </div>
            </div>
          </div>

          {/* ── BOTTOM: fields (left) · links (right) ── */}
          <div className="wb-oppedit-grid">
            {/* LEFT — editable fields */}
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",alignItems:"end"}}>
                <FRow label="Memo No." tip="Format: M + 2-digit year (BE) + 3-digit number, e.g. M69-001"><Inp value={f.memoNo||""} onChange={e=>set("memoNo",e.target.value)} placeholder="e.g. M69-001" style={{fontFamily:"monospace",fontWeight:600}}/></FRow>
                <FRow label="Nickname" tip="Short label shown on kanban card"><Inp value={f.nickname||""} onChange={e=>set("nickname",e.target.value)} placeholder="e.g. BKK Hotel, Phase 2…"/></FRow>
                <FRow label="Success %" tip="Leave blank to use auto-calculated score">
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="text" inputMode="numeric" value={srLocal} placeholder="Auto"
                      onChange={e=>setSrLocal(e.target.value.replace(/[^0-9.]/g,""))}
                      onBlur={()=>{ const n=getSrValue(); setSrLocal(n===0?"":String(n)); set("successRate",n); }}
                      style={{...SI,width:60,textAlign:"right"}}/>
                    <span style={{fontSize:11,color:"#94a3b8"}}>%</span>
                    {(!getSrValue())&&<span style={{fontSize:11,color:"#64748b",fontStyle:"italic"}}>Auto: {calcSuccessRate({...f,successRate:0})}%</span>}
                    {getSrValue()>0&&<span style={{fontSize:11,fontWeight:700,color:successRateColor(getSrValue())}}>{getSrValue()}%</span>}
                  </div>
                </FRow>
                <FRow label="Ranking" tip="ระดับความสำคัญของ Opportunity นี้">
                  <Sel value={f.ranking||"Medium"} onChange={e=>set("ranking",e.target.value)}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </Sel>
                </FRow>
              </div>
              {isLost&&<FRow label="Lost Reason" style={{marginTop:6}}><Sel value={f.lostReason} onChange={e=>set("lostReason",e.target.value)}><option value="">— Select Reason —</option>{LOST_REASONS.map(r=><option key={r}>{r}</option>)}</Sel></FRow>}
            </div>

            {/* RIGHT — entry links */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <button className="wb-oplink" onClick={()=>setView("activity")}>
                <span style={{display:"inline-flex",alignItems:"center",gap:8}}><LogIcon s={14}/> Activity Log</span>
                <span style={{display:"inline-flex",alignItems:"center",gap:7}}><CountPill n={(f.activityLog||[]).length}/><span style={{color:"#cbd5e1",fontSize:15}}>›</span></span>
              </button>
              {f.quoteNo&&(
                <button className="wb-oplink" onClick={()=>setView("quotation")}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:8}}><SheetIcon/> Quotation</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:7}}><span style={{fontFamily:"monospace",fontSize:11,color:"#64748b"}}>{f.quoteNo}</span><span style={{color:"#cbd5e1",fontSize:15}}>›</span></span>
                </button>
              )}
              {f.csCode&&(
                <button className="wb-oplink" title="Saves first, then opens the Cost Sheet" onClick={()=>{onSave({...f,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""});if(onGoToCS)onGoToCS(f.serviceCode,f.csCode);}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:8}}><SheetIcon/> Open Cost Sheet</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:7}}><span style={{fontFamily:"monospace",fontSize:11,color:"#64748b"}}>{f.csCode}</span><span style={{color:"#cbd5e1",fontSize:15}}>›</span></span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {view==="activity"&&(
        <>
          <button onClick={()=>setView("edit")} style={{display:"inline-flex",alignItems:"center",gap:6,border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:"#1e40af",padding:0,marginBottom:14}}>‹ Back to details</button>
          <ActivityLog logs={f.activityLog||[]} currentUser={user} users={userList} onEdit={(id,text,replies)=>sF(p=>({...p,activityLog:(p.activityLog||[]).map(x=>x.id===id?{...x,note:text,replies:replies||x.replies||[]}:x)}))} onDelete={id=>sF(p=>({...p,activityLog:(p.activityLog||[]).filter(x=>x.id!==id)}))}/>
        </>
      )}

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
        {initial&&onDelete&&<Btn variant="danger" icon={<TrashIcon/>} style={{marginRight:"auto"}} onClick={()=>setDelConfirm(true)}>Delete</Btn>}
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        {validErr&&<span style={{fontSize:12,color:"#dc2626",fontWeight:600,marginRight:4,alignSelf:"center"}}>{validErr}</span>}
        <Btn icon={<CheckIcon/>} onClick={()=>{
          if(!f.custId){setValidErr("Customer is required");return;}
          if(!(f.salesPrice>0)){setValidErr("Sales Price must be > 0");return;}
          setValidErr("");
          onSave({...f,successRate:getSrValue(),jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""});
        }}>Save</Btn>
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
                <Btn variant="ghost" style={{flex:1,justifyContent:"center"}} onClick={()=>setDelConfirm(false)}>Cancel</Btn>
                <Btn variant="danger-solid" icon={<TrashIcon s={15}/>} style={{flex:1,justifyContent:"center"}} onClick={()=>{setDelConfirm(false);onDelete(f);}}>Delete</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>

    {/* Quotation opens as its own overlay (it returns a full Modal); closing returns to the edit view */}
    {view==="quotation"&&<QuotationPreview opp={f} customer={customers.find(c=>c.id===f.custId)} costSheets={costSheets||[]} onClose={()=>setView("edit")} onSaveQuotation={qd=>{const updated={...f,quotationData:qd,jobCode:isWon?genJobCode(f.oppCode):f.jobCode,lostReason:isLost?f.lostReason:""};onSave(updated);}}/>}
    </>
  );
};

const OPP_HDR = ["OPP Code","Quote No.","CS Code","Job Code","Company","Service Code","Service Type","Sales Price","Total Cost","Margin%","Margin ฿","Status","Agent","Created","Lost Reason"];
const OppsPage = ({user,customers,opps,onSave,onDelete,onSaveCS,deliveries,onSaveDelivery,onDeleteDelivery,toast,costSheets,onGoToCS,initOppCode,onOppReady,userList=[],onMentionNotify}) => {
  const [search,sS]=useState(""); const [fSt,setFSt]=useState([]); const [fAg,setFAg]=useState([]); const [fSvc,setFSvc]=useState([]);
  const [view,sView]=useState("kanban"); const [form,sF]=useState(false); const [edit,sE]=useState(null);
  const [kanbanSorts,setKanbanSorts]=useState([{col:"date",dir:"desc"}]); // SortChips: date (Latest) + ranking
  const toggleKanbanSort=col=>setKanbanSorts(p=>cycleSort(p,col));
  const resetKanbanSort=()=>setKanbanSorts(p=>p.slice(0,1));
  // date desc = newest first; ranking asc = High first
  const kanbanV=(o,col)=>col==="ranking"?["High","Medium","Low"].indexOf(o.ranking||"Medium"):(o.createdDate||"");
  const [logOpp,sLog]=useState(null); const [gs,sGS]=useState(false); const [quotationOpp,sQT]=useState(null);
  const [dragId,setDragId]=useState(null); const [dragOver,setDragOver]=useState(null);
  const [sorts,setSorts]=useState([{col:"oppCode",dir:"asc"}]);
  const toggleSort=col=>setSorts(p=>cycleSort(p,col));
  const resetSort=()=>setSorts(p=>p.slice(0,1));
  useEffect(()=>{if(initOppCode){const o=opps.find(x=>x.oppCode===initOppCode);if(o){sE(o);sF(true);}if(onOppReady)onOppReady();}},[initOppCode]);
  const list=useMemo(()=>{
    const filtered=opps.filter(o=>{const c=customers.find(x=>x.id===o.custId);const q=search.toLowerCase();return(!search||o.oppCode.toLowerCase().includes(q)||(c?.companyEN||"").toLowerCase().includes(q)||o.quoteNo.toLowerCase().includes(q)||o.serviceCode.toLowerCase().includes(q))&&(fSt.length===0||fSt.includes(o.status))&&(fAg.length===0||fAg.includes(o.assignedTo))&&(fSvc.length===0||fSvc.includes(o.serviceCode));});
    const getV=(o,col)=>{
      const c=customers.find(x=>x.id===o.custId);
      if(col==="oppCode")    return o.oppCode||"";
      if(col==="quoteNo")    return o.quoteNo||"";
      if(col==="memoNo")     return (o.memoNo||"").toLowerCase();
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
      if(col==="successRate") return calcSuccessRate(o);
      return "";
    };
    return [...filtered].sort((a,b)=>multiCmp(a,b,sorts,getV));
  },[opps,customers,search,fSt,fAg,fSvc,sorts]);
  const totalPipeline=list.filter(o=>o.status!=="Lost").reduce((s,o)=>s+o.salesPrice,0);
  const totalWon=list.filter(o=>o.status==="Won").reduce((s,o)=>s+o.salesPrice,0);

  const handleSave=o=>{
    if(o.status==="Won"&&o.jobCode){
      const exists=deliveries.find(d=>d.oppCode===o.oppCode);
      if(!exists){
        const buildInstFromSrc=(srcInst,cv)=>srcInst.map((ins,i)=>({id:uid(),seq:i+1,label:ins.label||`Installment ${i+1}`,pct:ins.pct||0,amount:Math.round((cv||0)*(ins.pct||0)/100),expected_date:ins.expected_date||"",invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending",recvMonth:ins.recvMonth||i+1}));
        const autoInst=(()=>{const cs2=(costSheets||[]).find(c2=>(c2.quoteOverrides||[]).some(q=>q.quoteNo===o.quoteNo));const qo2=cs2?(cs2.quoteOverrides||[]).find(q=>q.quoteNo===o.quoteNo):null;if(qo2?.installments?.length>0)return buildInstFromSrc(qo2.installments,o.salesPrice);const qdInst=o?.quotationData?.installments||[];if(qdInst.length>0)return buildInstFromSrc(qdInst,o.salesPrice);return[];})();
        const dlv={id:`DLV-${o.oppCode.slice(1)}`,custId:o.custId,oppCode:o.oppCode,quoteNo:o.quoteNo,jobCode:o.jobCode,contractNo:"",contractDate:"",serviceCode:o.serviceCode,serviceType:o.serviceType,totalContractValue:o.salesPrice,deliveryStatus:"In Progress",currentStep:DLV_STEPS[0],deliveryDate:"",assignedTo:o.assignedTo,installments:autoInst,paymentTerm:"30 days",remark:"",saveLog:[{id:uid(),ts:nowTS(),author:user.id,note:`Auto-created from ${o.oppCode} — Won.`}]};
        onSaveDelivery(dlv);
        toast("Delivery auto-created",`${o.jobCode} added to Delivery tab`);
      }
    }
    onSave(o); sF(false); sE(null);
    toast("Opportunity saved",`${o.oppCode} · ${o.status}`);
  };

  //  Drag and Drop state 

  const kanbanView = (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
      {OPP_STATUSES.map(status => {
        const col=list.filter(o=>o.status===status).sort((a,b)=>multiCmp(a,b,kanbanSorts,kanbanV));
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
                    className="wb-oppcard"
                    draggable
                    tabIndex={0}
                    aria-label={`Opportunity ${o.oppCode}, ${c?.companyEN||"unknown company"}, ${o.status}. Press Enter to edit.`}
                    onDragStart={e=>{
                      e.dataTransfer.effectAllowed="move";
                      setDragId(o.id);
                    }}
                    onDragEnd={()=>{setDragId(null);setDragOver(null);}}
                    onClick={()=>{sE(o);sF(true);}}
                    onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sE(o);sF(true);}}}
                    style={{
                      padding:"10px 12px",marginBottom:8,
                      display:"flex",flexDirection:"column",gap:6,
                      ...(isDragging?{
                        opacity:.45,
                        borderColor:"#3b82f6",
                        boxShadow:"0 8px 24px rgba(59,130,246,.25)",
                        transform:"scale(1.02)",
                      }:{}),
                    }}
                  >
                    {/* Identity: OPP code + ranking dot */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10.5,fontWeight:700,color:"#1e40af",fontFamily:"monospace"}}>{o.oppCode}</span>
                      {(()=>{const r=o.ranking||"Medium";const rc=RANK_CLR[r]?.c||"#64748b";return(
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,flexShrink:0}} title={`Ranking: ${r}`}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:rc}}/>
                          <span style={{fontSize:10,fontWeight:700,color:rc}}>{r}</span>
                        </span>
                      );})()}
                    </div>
                    {/* Company (anchor) + nickname */}
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:"#0f172a",lineHeight:1.3}}>{c?.companyEN||"—"}</div>
                      {o.nickname&&<div style={{fontSize:11,color:"#64748b",fontStyle:"italic",lineHeight:1.3,marginTop:1}}>{o.nickname}</div>}
                    </div>
                    {/* Codes meta — one quiet row */}
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <SvcBadge code={o.serviceCode}/>
                      {o.csCode&&<span style={{fontFamily:"monospace",fontSize:10,color:"#64748b"}}>{o.csCode}</span>}
                      {o.memoNo&&<span style={{fontFamily:"monospace",fontSize:10,color:"#64748b"}}>Memo {o.memoNo}</span>}
                    </div>
                    {/* Money (loud) + margin */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
                      <span style={{fontWeight:900,fontSize:16,color:"#0f172a",letterSpacing:"-0.01em"}}>฿{fmt(o.salesPrice)}</span>
                      <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:800,color:+mg>=30?"#16a34a":"#dc2626",whiteSpace:"nowrap"}}>
                        <SortArrow dir={+mg>=30?"asc":"desc"} s={8}/>{mg}%
                      </span>
                    </div>
                    {/* Success */}
                    {(()=>{const sr=calcSuccessRate(o);const clr=successRateColor(sr);return(
                      <div style={{display:"flex",alignItems:"center",gap:8}} title="Success rate">
                        <div style={{flex:1,height:4,background:"#e2e8f0",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${sr}%`,background:clr,borderRadius:99,transition:"width .3s"}}/>
                        </div>
                        <span style={{fontSize:10,fontWeight:800,color:clr,minWidth:30,textAlign:"right"}}>{sr}%</span>
                      </div>
                    );})()}
                    {/* Lost reason / Job code */}
                    {o.status==="Lost"&&o.lostReason&&<div style={{fontSize:10,color:"#dc2626",background:"#fee2e2",padding:"2px 6px",borderRadius:3,alignSelf:"flex-start"}}>{o.lostReason}</div>}
                    {o.status==="Won"&&o.jobCode&&<div style={{fontSize:10,color:"#16a34a",fontFamily:"monospace",fontWeight:700}}>{o.jobCode}</div>}
                    {/* Footer: agent + activity log */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:"#64748b"}}>{USERS.find(u=>u.id===o.assignedTo)?.name.split(" ")[0]||"—"}</span>
                      <button onClick={e=>{e.stopPropagation();sE(o);sF(true);}} title="Note log"
                        style={{display:"inline-flex",alignItems:"center",gap:4,border:"1px solid #e2e8f0",borderRadius:5,background:"#fff",cursor:"pointer",padding:"2px 7px",fontSize:10,fontWeight:600,color:"#64748b"}}>
                        <LogIcon s={11}/>
                        {o.remark?o.remark.split("\n").filter(Boolean).length:0}
                      </button>
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Opportunities</Span>
          <CountPill n={list.length} label="opps"/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn variant="export" size="sm" icon={<DlIcon/>} onClick={()=>dlCSV("opps.csv",OPP_HDR,list.map(o=>{const c=customers.find(x=>x.id===o.custId);const mg=margin(o.salesPrice,o.totalCost||0);return[o.oppCode,o.quoteNo,o.csCode||"",o.jobCode||"",c?.companyEN||"",o.serviceCode,o.serviceType,o.salesPrice,o.totalCost||0,mg,marginAmt(o.salesPrice,o.totalCost||0),o.status,USERS.find(u=>u.id===o.assignedTo)?.name||"",o.createdDate,o.lostReason||""];}))}>CSV</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <FilterIcon/>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search…" style={{maxWidth:200,minWidth:140}}/>
        <MultiSelect label="Status"  options={OPP_STATUSES.map(s=>({value:s,label:s}))}       selected={fSt}  onChange={setFSt}  width={140}/>
        <MultiSelect label="Service" options={SERVICES.map(s=>({value:s.code,label:s.code}))} selected={fSvc} onChange={setFSvc} width={140}/>
        <MultiSelect label="Agents"  options={SALES_USERS.map(u=>({value:u.id,label:u.name.split(" ")[0]}))} selected={fAg} onChange={setFAg} width={155}/>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {view==="table"&&<SortReset sorts={sorts} onReset={resetSort}/>}
          {view==="kanban"&&<SortChips fields={[{col:"date",label:"Latest"},{col:"ranking",label:"Ranking"}]} sorts={kanbanSorts} onToggle={toggleKanbanSort} onReset={resetKanbanSort}/>}
          <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
            {[["table"," Table"],["kanban","⊞ Kanban"]].map(([k,l])=>(
              <button key={k} onClick={()=>sView(k)} style={{padding:"7px 14px",border:"none",background:view===k?"#0f172a":"#fff",color:view===k?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:view===k?700:400}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {view==="table"&&(
        <Card><div className="wb-opptbl" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#f8fafc"}}>
            {[
              {label:"OPP Code",     col:"oppCode"},
              {label:"QT No.",       col:"quoteNo"},
              {label:"Memo No.",     col:"memoNo"},
              {label:"CS Code",      col:"csCode"},
              {label:"Company",      col:"company"},
              {label:"Code",         col:"serviceCode"},
              {label:"Price",        col:"salesPrice"},
              {label:"Cost",         col:"totalCost"},
              {label:"Margin % / ฿", col:"margin"},
              {label:"Status",       col:"status"},
              {label:"Agent",        col:"agent"},
              {label:"Ranking",      col:"ranking"},
              {label:"Success",      col:"successRate"},
              {label:"Notes",        col:"log"},
            ].map(({label,col})=>(
              <SortableTh key={col} col={col} label={label} sorts={sorts} onToggle={toggleSort}/>
            ))}
          </tr></thead>
          <tbody>{list.map(o=>{const c=customers.find(x=>x.id===o.custId);const mg=margin(o.salesPrice,o.totalCost||0);const mAmt=marginAmt(o.salesPrice,o.totalCost||0);const oRank=o.ranking||"Medium";return(
            <TR key={o.id} onClick={()=>{sE(o);sF(true);}}>
              <TD style={{fontWeight:700,color:"#1e40af",fontFamily:"monospace",fontSize:12}}>{o.oppCode}</TD>
              <TD>
                {o.quoteNo
                  ? <button onClick={e=>{e.stopPropagation();sE(o);sQT(o);}} style={{fontFamily:"monospace",fontSize:11,background:"none",border:"none",color:"#1e40af",cursor:"pointer",padding:0,textDecoration:"underline",fontWeight:600}}>{o.quoteNo}</button>
                  : "—"}
              </TD>
              <TD style={{fontFamily:"monospace",fontSize:11,color:o.memoNo?"#64748b":"#cbd5e1"}}>{o.memoNo||"—"}</TD>
              <TD>
                {o.csCode
                  ? <button onClick={e=>{e.stopPropagation();if(onGoToCS)onGoToCS(o.serviceCode,o.csCode);}} style={{fontFamily:"monospace",fontWeight:700,fontSize:11,background:"none",color:"#1e40af",padding:"2px 0",border:"none",cursor:"pointer",textDecoration:"underline"}}>{o.csCode}</button>
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
              <TD>{(()=>{const sr=calcSuccessRate(o);const clr=successRateColor(sr);return(<div style={{minWidth:72}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,fontWeight:800,color:clr}}>{sr}%</span></div><div style={{height:4,background:"#e2e8f0",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${sr}%`,background:clr,borderRadius:99}}/></div></div>);})()}</TD>
              <TD><button onClick={e=>{e.stopPropagation();sE(o);sF(true);}} title="Note log" style={{display:"inline-flex",alignItems:"center",gap:4,border:"1px solid #e2e8f0",borderRadius:5,background:"#f8fafc",cursor:"pointer",padding:"3px 7px",color:"#64748b",fontSize:10,fontWeight:600}}><LogIcon s={12}/>{o.remark?o.remark.split("\n").filter(Boolean).length:0}</button></TD>
              <TD><Btn variant="ghost" style={{fontSize:11,padding:"3px 10px"}} onClick={e=>{e.stopPropagation();sE(o);sF(true);}}>Edit</Btn></TD>
            </TR>
          );})}
          </tbody>
        </table>{list.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No records.</div>}</div></Card>
      )}
      {view==="kanban"&&kanbanView}

      {form&&<OppForm initial={edit} customers={customers} opps={opps} user={user} onSave={handleSave} onClose={()=>{sF(false);sE(null);sQT(null);}} costSheets={costSheets} onGoToCS={onGoToCS} userList={userList} onMentionNotify={onMentionNotify} onDelete={o=>{
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
        // Also delete the persisted quotation snapshot row from the costsheet_quotes GS tab
        // (keyed by csCode) so it doesn't reappear on reload.
        if(o.csCode) gsDelete("costsheet_quotes", o.csCode);
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
          <ActivityLog logs={logOpp.activityLog||[]} currentUser={user} onAdd={entry=>{const up={...logOpp,activityLog:[...(logOpp.activityLog||[]),entry]};onSave(up);sLog(up);toast("Log added",logOpp.oppCode);}} onEdit={(id,text,replies)=>{const up={...logOpp,activityLog:(logOpp.activityLog||[]).map(x=>x.id===id?{...x,note:text,replies:replies||x.replies||[]}:x)};onSave(up);sLog(up);}} onDelete={id=>{const up={...logOpp,activityLog:(logOpp.activityLog||[]).filter(x=>x.id!==id)};onSave(up);sLog(up);}} placeholder="Log a call, meeting, or follow-up… (@mention to notify)" users={userList} context="OPP" recordId={logOpp.oppCode} onMentionNotify={onMentionNotify}/>
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

const DeliveryForm = ({initial,customers,opps,user,onSave,onClose,costSheets,initTab="detail",userList=[],onMentionNotify=()=>{}}) => {
  const wonOpps=opps.filter(o=>o.status==="Won");
  const blank={id:`DLV-${uid()}`,custId:"",oppCode:"",quoteNo:"",jobCode:"",contractNo:"",contractDate:"",serviceCode:"",serviceType:"",totalContractValue:0,deliveryStatus:"In Progress",currentStep:DLV_STEPS[0],deliveryDate:"",assignedTo:SALES_USERS[0]?.id||"",installments:[],paymentTerm:"30 days",remark:""};
  const [f,sF] = useState(initial?{...initial}:blank);
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
    expected_date:ins.expected_date||"",
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
  const addIns=()=>sF(p=>({...p,installments:[...p.installments,{id:uid(),seq:p.installments.length+1,label:`Installment ${p.installments.length+1}`,pct:0,amount:0,expected_date:"",invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending"}]}));
  const delIns=idx=>sF(p=>({...p,installments:p.installments.filter((_,i)=>i!==idx)}));
  const [validErr,setValidErr] = useState("");
  return (
    <Modal title={initial?`Edit — ${f.jobCode||f.id}`:"Add Delivery"} width={1000} onClose={onClose}>
      <div style={{display:"flex",gap:0,borderBottom:"2px solid #e2e8f0",marginBottom:16}}>
        {[["detail","Contract & Billing"],["cost","Pricing Breakdown"]].map(([k,l])=>(
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
                  {f.remark&&(()=>{
                    const lines=f.remark.split("\n").filter(Boolean);
                    return [...lines].reverse().map((line,i)=>{
                      const origIdx=lines.length-1-i;
                      const m=line.match(/^\[([^\]]+)\]\s*(.*)/);
                      const meta=m?m[1]:""; const body=m?m[2]:line;
                      const datePart=meta.split("·")[0].trim(); const authorPart=meta.includes("·")?meta.split("·").slice(1).join("·").trim():"";
                      return(
                      <div key={origIdx} style={{padding:"5px 8px 5px 10px",fontSize:12,color:"#374151",borderBottom:"1px solid #f1f5f9",background:"#fafafa",display:"flex",alignItems:"flex-start",gap:6}}>
                        <div style={{flex:1,lineHeight:1.5}}>
                          <span style={{fontSize:10,fontFamily:"monospace",color:"#94a3b8",marginRight:6}}>{datePart}</span>
                          {authorPart&&<span style={{fontSize:10,fontWeight:700,color:"#1e40af",background:"#eff6ff",padding:"1px 5px",borderRadius:3,marginRight:6}}>{authorPart}</span>}
                          <RenderMentionText text={body} users={userList}/>
                        </div>
                        <button onClick={()=>set("remark",lines.filter((_,idx)=>idx!==origIdx).join("\n"))} style={{flexShrink:0,border:"none",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:14,lineHeight:1,padding:"1px 2px"}} title="Delete note">×</button>
                      </div>
                    );});
                  })()}
                  <div style={{display:"flex",alignItems:"flex-end",gap:0,position:"relative"}}>
                    <MentionTextarea
                      value={noteInput} onChange={sNoteInput}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&noteInput.trim()){
                        set("remark",(f.remark?f.remark+"\n":"")+`[${today()} · ${user.name}] ${noteInput.trim()}`);
                        extractMentions(noteInput,userList).forEach(uid=>{if(uid!==user.id)onMentionNotify(uid,"Delivery",f.jobCode||f.id,`${user.name} mentioned you in a note: ${noteInput.trim().slice(0,80)}`);});
                        sNoteInput("");e.preventDefault();}}}
                      placeholder="Add note… (@mention, Enter to save)"
                      style={{borderRadius:0,background:"#fff",border:"none",borderTop:"1px solid #f1f5f9",fontSize:13,flex:1}}
                      users={userList} minHeight={36}
                    />
                    {noteInput&&(
                      <button onClick={()=>sNoteInput("")} title="Clear"
                        style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",border:"none",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 4px"}}>×</button>
                    )}
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
              <TH cols={["#","Description","% Share","Amount (THB)","Exp. Invoice Date","Invoice No.","Act. Invoice Date","Receipt No.","Receipt Date","Status",""]}/>
              <tbody>{(f.installments||[]).map((ins,idx)=>(
                <tr key={ins.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <TD><Span s={12} w={700} c="#94a3b8">{ins.seq}</Span></TD>
                  <TD><Inp value={ins.label} readOnly style={{padding:"4px 6px",fontSize:12,background:"transparent",border:"none",color:"#374151",cursor:"default"}}/></TD>
                  <TD><NumInp value={ins.pct} onChange={v=>changeIns(idx,"pct",v)} style={{padding:"4px 6px",fontSize:12,width:55}}/></TD>
                  <TD><NumInp value={ins.amount} onChange={v=>changeIns(idx,"amount",v)} style={{padding:"4px 6px",fontSize:12,width:90,fontWeight:700}}/></TD>
                  <TD><Inp type="date" value={ins.expected_date||""} onChange={e=>changeIns(idx,"expected_date",e.target.value)} style={{padding:"4px 6px",fontSize:12}}/></TD>
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
          <InstallmentSummary contractValue={f.totalContractValue} received={totalRec} variant="form"/>
        </>
      )}

      {tab==="cost"&&<CostBreakdown quoteNo={f.quoteNo} costSheets={costSheets}/>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        {validErr&&<span style={{fontSize:12,color:"#dc2626",fontWeight:600,marginRight:4}}>{validErr}</span>}
        <Btn icon={<CheckIcon/>} onClick={()=>{
          if(!f.oppCode){setValidErr("OPP Code is required");return;}
          if(!(f.totalContractValue>0)){setValidErr("Contract Value must be > 0");return;}
          setValidErr("");
          onSave(f);
        }}>Save Delivery</Btn>
      </div>
    </Modal>
  );
};

//  DeliveryCard: proper component — collapsed summary + expandable edit mode 
const DeliveryCard = ({d, opps, costSheets, customers, user, onSave, toast, onGoToCust, onGoToOpp, sQT, onGoToCS, userList=[], onMentionNotify=()=>{}}) => {
  const [open, setOpen]       = useState(false);   // card expanded?
  const [dirty, setDirty]     = useState(false);   // unsaved changes?
  const [localD, setLocalD]   = useState(d);       // staged local copy
  const [noteInput, setNoteInput] = useState("");
  const [localInst, setLocalInst] = useState(safeArr(d.installments));

  // Sync from parent when d changes (e.g. after save)
  useEffect(()=>{ setLocalD(d); setLocalInst(safeArr(d.installments)); },[d.id, d.saveLog?.length]);
  const [editLogId,setEditLogId]=useState(null);
  const [editLogText,setEditLogText]=useState("");

  const opp   = opps.find(o=>o.oppCode===d.oppCode);
  const cust  = customers.find(c=>c.id===d.custId);
  const agent = USERS.find(u=>u.id===(d.assignedTo||opp?.assignedTo));
  const totalRec = safeArr(d.installments).filter(i=>i.status==="Received").reduce((s,i)=>s+i.amount,0);
  const lastLog = [...(d.saveLog||[])].sort((a,b)=>(b.ts||"").localeCompare(a.ts||""))[0];

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
    setLocalD(d); setLocalInst(safeArr(d.installments));
    setDirty(false); setOpen(false);
  };

  //  Installment sync 
  const syncInst = (silent=false) => {
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
    if(srcInst.length===0){ if(!silent) toast("No installments found","Check that the Quotation has a saved Payment Schedule"); return; }
    const cv=localD.totalContractValue||0;
    const inst=srcInst.map((ins,i)=>({
      id:uid(),seq:i+1,label:ins.label||ins.description||`Installment ${i+1}`,
      pct:ins.pct||0,amount:Math.round(cv*(ins.pct||0)/100),
      expected_date:ins.expected_date||"",invoiceNo:"",invoiceDate:"",receiptNo:"",receiptDate:"",status:"Pending",recvMonth:ins.recvMonth||i+1,
    }));
    markDirty(null, inst);
  };
  useEffect(()=>{ if(safeArr(d.installments).length===0&&d.quoteNo) syncInst(true); },[]);

  const changeLocalIns=(insId,k,v)=>{
    const next=localInst.map(ins=>{
      if(ins.id!==insId) return ins;
      const u={...ins,[k]:k==="pct"?+v:v};
      if(k==="pct") u.amount=Math.round((localD.totalContractValue||0)*(+v||0)/100);
      return u;
    });
    markDirty(null, next);
  };

  const totalPct = localInst.reduce((s,i)=>s+(i.pct||0),0);

  //  COLLAPSED VIEW 
  if(!open) return (
    <Card style={{overflow:"hidden"}}>
      <div onClick={()=>setOpen(true)} style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,background:"#fff",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:280,flexWrap:"wrap",pointerEvents:"none"}}>
          <span style={{fontSize:18,fontWeight:900,color:"#0f172a",fontFamily:"monospace",letterSpacing:"-0.02em"}}>{d.jobCode||d.id}</span>
          <SvcBadge code={d.serviceCode}/>
          <span style={{fontSize:12,color:"#64748b"}}>{cust?.companyEN||d.custId}</span>
          <span style={{fontSize:11,fontFamily:"monospace",color:"#94a3b8"}}>{d.quoteNo||""}</span>
          {lastLog&&<span style={{fontSize:10,color:"#94a3b8"}}>Last saved: {lastLog.ts}</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",pointerEvents:"none"}}>
          <InstallmentSummary contractValue={d.totalContractValue} received={totalRec} variant="collapsed"/>
          <span style={{fontSize:18,color:"#94a3b8",padding:"0 8px"}}>›</span>
        </div>
      </div>
      {lastLog&&(
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
          <SvcBadge code={d.serviceCode}/>
          {dirty&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",padding:"2px 8px",borderRadius:10}}> Unsaved changes</span>}
        </div>
        <button onClick={()=>setOpen(false)} style={{border:"none",background:"none",fontSize:22,color:"#94a3b8",cursor:"pointer",padding:"0 4px",lineHeight:1,transform:"rotate(90deg)",display:"inline-block"}}>›</button>
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
          <InstallmentSummary contractValue={d.totalContractValue} received={totalRec} variant="expanded"/>
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
            <TH cols={["#","Description","% Share","Amount (THB)","Exp. Invoice Date","Invoice No.","Act. Invoice Date","Receipt No.","Receipt Date","Status"]}/>
            <tbody>
              {localInst.map(ins=>(
                <TR key={ins.id}>
                  <TD><Span s={12} w={700} c="#94a3b8">{ins.seq}</Span></TD>
                  <TD><input value={ins.label||""} readOnly style={{width:"100%",padding:"3px 6px",fontSize:11,border:"none",background:"transparent",color:"#374151",cursor:"default",outline:"none"}}/></TD>
                  <TD style={{whiteSpace:"nowrap"}}><span style={{fontSize:12,color:"#64748b",fontWeight:500}}>{ins.pct||0}%</span></TD>
                  <TD right style={{fontWeight:700,whiteSpace:"nowrap"}}>฿{fmt(ins.amount)}</TD>
                  <TD><input type="date" value={ins.expected_date||""} onChange={e=>changeLocalIns(ins.id,"expected_date",e.target.value)} style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",padding:"2px 4px"}}/></TD>
                  <TD><input value={ins.invoiceNo||""} onChange={e=>changeLocalIns(ins.id,"invoiceNo",e.target.value)} style={{width:"100%",padding:"3px 6px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",fontFamily:"monospace"}}/></TD>
                  <TD><input type="date" value={ins.invoiceDate||""} onChange={e=>changeLocalIns(ins.id,"invoiceDate",e.target.value)} style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",padding:"2px 4px"}}/></TD>
                  <TD><input value={ins.receiptNo||""} onChange={e=>changeLocalIns(ins.id,"receiptNo",e.target.value)} style={{width:"100%",padding:"3px 6px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",fontFamily:"monospace"}}/></TD>
                  <TD><input type="date" value={ins.receiptDate||""} onChange={e=>changeLocalIns(ins.id,"receiptDate",e.target.value)} style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",padding:"2px 4px"}}/></TD>
                  <TD><select value={ins.status} onChange={e=>changeLocalIns(ins.id,"status",e.target.value)} style={{padding:"3px 5px",fontSize:11,border:"1px solid #e2e8f0",borderRadius:3,background:ins.status==="Received"?"#dcfce7":ins.status==="Overdue"?"#fee2e2":ins.status==="Invoiced"?"#eff6ff":"#f8fafc",color:ins.status==="Received"?"#16a34a":ins.status==="Overdue"?"#dc2626":ins.status==="Invoiced"?"#1e40af":"#64748b",fontWeight:700,cursor:"pointer"}}>{INS_STATUSES.map(s=><option key={s}>{s}</option>)}</select></TD>
                </TR>
              ))}
              {localInst.length===0&&<tr><td colSpan={10} style={{padding:"16px",textAlign:"center",color:"#94a3b8",fontSize:12}}>No installments — click  Sync from Quotation{(localD.quoteNo||d.quoteNo)?` (${localD.quoteNo||d.quoteNo})`:" (set Quote No. first)"}</td></tr>}
            </tbody>
          </table>
        </div>
        {/* Note Log */}
        <div style={{padding:"10px 16px",borderTop:"1px solid #f1f5f9"}}>
          <Span s={11} w={700} c="#64748b" style={{display:"block",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Note Log</Span>
          <div style={{border:"1px solid #e2e8f0",borderRadius:6}}>
            {(localD.remark||"").split("\n").filter(Boolean).length > 0 && (
              <div style={{maxHeight:140,overflowY:"auto"}}>
                {(localD.remark||"").split("\n").filter(Boolean).slice().reverse().map((line,i,arr)=>{
                  const origIdx=arr.length-1-i;
                  const m=line.match(/^\[([^\]]+)\]\s*(.*)/);
                  const meta=m?m[1]:""; const body=m?m[2]:line;
                  const datePart=meta.split("·")[0].trim(); const authorPart=meta.includes("·")?meta.split("·").slice(1).join("·").trim():"";
                  return (
                    <div key={origIdx} style={{padding:"5px 8px 5px 10px",fontSize:12,color:"#374151",borderBottom:"1px solid #f1f5f9",background:"#fafafa",display:"flex",alignItems:"flex-start",gap:6}}>
                      <div style={{flex:1,lineHeight:1.5}}>
                        <span style={{fontSize:10,fontFamily:"monospace",color:"#94a3b8",marginRight:6}}>{datePart}</span>
                        {authorPart&&<span style={{fontSize:10,fontWeight:700,color:"#1e40af",background:"#eff6ff",padding:"1px 5px",borderRadius:3,marginRight:6}}>{authorPart}</span>}
                        <RenderMentionText text={body} users={userList}/>
                      </div>
                      <button onClick={()=>{const lines=(localD.remark||"").split("\n").filter(Boolean);markDirty({...localD,remark:lines.filter((_,idx)=>idx!==arr.length-1-i).join("\n")});}} style={{flexShrink:0,border:"none",background:"transparent",color:"#cbd5e1",cursor:"pointer",fontSize:14,lineHeight:1,padding:"1px 2px"}} title="Delete">×</button>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{position:"relative"}}>
              <MentionTextarea
                value={noteInput} onChange={setNoteInput}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&noteInput.trim()){
                  markDirty({...localD,remark:(localD.remark?localD.remark+"\n":"")+`[${today()} · ${user.name}] ${noteInput.trim()}`});
                  extractMentions(noteInput,userList).forEach(uid=>{if(uid!==user.id)onMentionNotify(uid,"Delivery",localD.jobCode||d.id,`${user.name} mentioned you in a note: ${noteInput.trim().slice(0,80)}`);});
                  setNoteInput("");e.preventDefault();}}}
                placeholder="Add note… (@mention, Enter to save)"
                style={{borderRadius:"0 0 5px 5px",background:"#fff",border:"none",borderTop:"1px solid #e2e8f0",fontSize:12}}
                users={userList} minHeight={32}
              />
            </div>
          </div>
        </div>

        {/* Bottom Save bar */}
        <div style={{padding:"10px 16px",borderTop:"1px solid #e2e8f0",background:dirty?"#fffbeb":"#f8fafc",display:"flex",justifyContent:"flex-end",gap:8,alignItems:"center"}}>
          {dirty&&<span style={{fontSize:11,color:"#d97706",marginRight:"auto",fontWeight:600}}> You have unsaved changes</span>}
          <Btn variant="ghost" onClick={handleDiscard}>Cancel</Btn>
          <Btn icon={<CheckIcon/>} onClick={handleSave}>Save</Btn>
        </div>
      </div>
    </Card>
  );
};



const DLV_HDR = ["Delivery ID","Customer","OPP Code","Quote No.","Job Code","Contract No.","Contract Date","Service Type","Contract Value","Status","Step","Delivery Date","Total Received","Balance"];
const DeliveryPage = ({user,customers,opps,deliveries,onSave,toast,costSheets,onGoToCS,onGoToCust,onGoToOpp,userList=[],onMentionNotify=()=>{}}) => {
  const [search,sS]=useState(""); const [fDSvc,setFDSvc]=useState([]);
  const [form,sF]=useState(false); const [edit,sE]=useState(null); const [gs,sGS]=useState(false);
  const [initTab,sInitTab]=useState("detail"); // which tab to open in DeliveryForm
  const [quotationOpp,sQT]=useState(null); // for inline Quotation Preview modal
  const [sorts,setSorts]=useState([{col:"date",dir:"desc"}]); // date | contractDate | contractValue
  const toggleSort=col=>setSorts(p=>cycleSort(p,col));
  const resetSort=()=>setSorts(p=>p.slice(0,1));
  // date = latest saveLog ts; everything else is a direct field
  const getDV=(d,col)=>{
    if(col==="contractDate")  return d.contractDate||"";
    if(col==="contractValue") return Number(d.totalContractValue)||0;
    return [...(d.saveLog||[])].sort((x,y)=>(y.ts||"").localeCompare(x.ts||""))[0]?.ts||"";
  };
  // Req 9: expandable sections per delivery card

  const list=deliveries
    .filter(d=>{const c=customers.find(x=>x.id===d.custId);const q=search.toLowerCase();return(!search||(d.jobCode||"").toLowerCase().includes(q)||(c?.companyEN||"").toLowerCase().includes(q)||(d.contractNo||"").toLowerCase().includes(q)||(d.oppCode||"").toLowerCase().includes(q))&&(fDSvc.length===0||fDSvc.includes(d.serviceCode));})
    .sort((a,b)=>multiCmp(a,b,sorts,getDV));

  const totContract = list.reduce((s,d)=>s+(Number(d.totalContractValue)||0),0);
  const totReceived = list.reduce((s,d)=>s+safeArr(d.installments).filter(i=>i.status==="Received").reduce((x,i)=>x+(i.amount||0),0),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Delivery</Span>
          <CountPill n={list.length} label="deliveries"/>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Btn variant="export" size="sm" icon={<DlIcon/>} onClick={()=>dlCSV("deliveries.csv",DLV_HDR,list.map(d=>{const c=customers.find(x=>x.id===d.custId);const rec=safeArr(d.installments).filter(i=>i.status==="Received").reduce((s,i)=>s+i.amount,0);return[d.id,c?.companyEN||d.custId,d.oppCode,d.quoteNo,d.jobCode,d.contractNo,d.contractDate,d.serviceType,d.totalContractValue,d.deliveryStatus,d.currentStep,d.deliveryDate,rec,d.totalContractValue-rec];}))}>CSV</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <FilterIcon/>
        <Inp value={search} onChange={e=>sS(e.target.value)} placeholder="Search…" style={{maxWidth:200,minWidth:140}}/>
        <MultiSelect label="Service" options={SERVICES.map(s=>({value:s.code,label:s.code}))} selected={fDSvc} onChange={setFDSvc} width={140}/>
        <div style={{marginLeft:"auto"}}>
          <SortChips fields={[{col:"date",label:"Latest"},{col:"contractDate",label:"Contract"},{col:"contractValue",label:"Value"}]} sorts={sorts} onToggle={toggleSort} onReset={resetSort}/>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {list.length>0&&(
          <Card style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,background:"#f1f5f9",border:"1px solid #cbd5e1"}}>
            <div style={{flex:1,minWidth:280,display:"flex",alignItems:"center",gap:8}}>
              <Span s={14} w={900} c="#0f172a" style={{letterSpacing:"0.02em",textTransform:"uppercase"}}>Total</Span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <InstallmentSummary contractValue={totContract} received={totReceived} variant="collapsed"/>
              <span style={{fontSize:18,padding:"0 8px",visibility:"hidden"}}>›</span>
            </div>
          </Card>
        )}
        {list.map(d => {
          return (
            <DeliveryCard key={d.id} d={d} opps={opps} costSheets={costSheets} customers={customers} user={user}
              onSave={upd=>onSave(upd)}
              toast={toast} onGoToCust={onGoToCust} onGoToOpp={onGoToOpp} sQT={sQT} onGoToCS={onGoToCS} userList={userList} onMentionNotify={onMentionNotify}/>
          );
        })}
                {list.length===0&&<Card style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No delivery records found.</Card>}
      </div>
      {form&&<DeliveryForm initial={edit} customers={customers} opps={opps} user={user} onSave={d=>{onSave(d);sF(false);sE(null);sInitTab("detail");toast("Delivery saved",d.jobCode||d.id);}} onClose={()=>{sF(false);sE(null);sInitTab("detail");}} costSheets={costSheets} initTab={initTab} userList={userList} onMentionNotify={onMentionNotify}/>}

      {quotationOpp&&<QuotationPreview opp={quotationOpp} customer={customers.find(c=>c.id===quotationOpp.custId)} costSheets={costSheets||[]} onClose={()=>sQT(null)}/>}
    </div>
  );
};

//  TaskRow: isolated component so taskName input retains focus on keystroke
//  agents is now an array of {uid, manager, senior, junior} objects
const TaskRow = React.memo(({t, rowNum, onSet, onDel, months}) => {
  const [name, setName] = useState(t.taskName);
  const [agentOpen, setAO] = useState(false);
  useEffect(() => { setName(t.taskName); }, [t.taskName]);

  // agents: [{uid, manager, senior, junior}]
  const agents = Array.isArray(t.agents) && t.agents.length > 0 && typeof t.agents[0] === "object"
    ? t.agents
    : []; // legacy string[] treated as empty — agents will be re-added

  // Totals summed across all agent rows (or from task-level if no agents)
  const totalMgr  = agents.length > 0 ? agents.reduce((s,a)=>s+(a.manager||0),0) : (t.manager||0);
  const totalSr   = agents.length > 0 ? agents.reduce((s,a)=>s+(a.senior||0),0)  : (t.senior||0);
  const totalJr   = agents.length > 0 ? agents.reduce((s,a)=>s+(a.junior||0),0)  : (t.junior||0);
  const tc = totalMgr*IH_LEVELS.Manager + totalSr*IH_LEVELS.Senior + totalJr*IH_LEVELS.Junior;

  const eligibleUsers = USERS.filter(u => ["sales","operation","manager"].includes(u.role));
  const assignedUids  = agents.map(a => a.uid);

  const addAgent = uid => {
    if(!uid || assignedUids.includes(uid)) return;
    const next = [...agents, {uid, manager:0, senior:0, junior:0}];
    onSet(t.id, "agents", next);
  };
  const removeAgent = uid => onSet(t.id, "agents", agents.filter(a=>a.uid!==uid));
  const setAgentField = (uid, k, v) => onSet(t.id, "agents", agents.map(a=>a.uid===uid?{...a,[k]:+v}:a));

  // When no agents: allow direct editing on the task row
  const setTaskField = (k, v) => onSet(t.id, k, +v);

  return (
    <>
      {/* ── Main task row ── */}
      <tr style={{borderBottom: agentOpen ? "none" : "1px solid #f8fafc"}}>
        <td style={{padding:"3px 4px",textAlign:"center",fontSize:11,color:"#94a3b8",fontWeight:700,width:24}}>{rowNum}</td>
        <td style={{padding:"3px 4px"}}>
          <input value={name}
            onChange={e=>setName(e.target.value)}
            onBlur={e=>onSet(t.id,"taskName",e.target.value)}
            style={{padding:"2px 5px",fontSize:13,width:"100%",boxSizing:"border-box",border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",outline:"none"}}/>
        </td>
        {/* Mgr / Sr / Jr — read-only totals when agents assigned, editable otherwise */}
        {["manager","senior","junior"].map(lvl => {
          const val = agents.length > 0
            ? agents.reduce((s,a)=>s+(a[lvl]||0),0)
            : (t[lvl]||0);
          return (
            <td key={lvl} style={{padding:"3px 4px"}}>
              {agents.length > 0
                ? <span style={{display:"block",textAlign:"center",fontSize:13,fontWeight:600,color:"#64748b",padding:"2px 4px"}}>{val||""}</span>
                : <input type="text" inputMode="numeric" value={t[lvl]||""}
                    onChange={e=>setTaskField(lvl,e.target.value)}
                    style={{padding:"2px 4px",fontSize:13,width:48,textAlign:"center",border:"1px solid #e2e8f0",borderRadius:3,background:"#fafafa",outline:"none"}}/>
              }
            </td>
          );
        })}
        <td style={{padding:"3px 4px",fontWeight:700,whiteSpace:"nowrap",fontSize:13}}>฿{fmt(tc)}</td>
        <td style={{padding:"3px 4px"}}>
          <Sel value={t.payMonth||1} onChange={e=>onSet(t.id,"payMonth",+e.target.value)} style={{padding:"2px 3px",fontSize:13,width:52}}>
            {Array.from({length:(months||3)+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
          </Sel>
        </td>
        <td style={{padding:"3px 4px"}}>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <button onClick={()=>setAO(p=>!p)} title="Assign agents"
              style={{fontSize:13,padding:"1px 5px",border:`1px solid ${agents.length>0?"#86efac":"#e2e8f0"}`,borderRadius:3,background:agents.length>0?"#f0fdf4":"#f8fafc",color:agents.length>0?"#16a34a":"#64748b",cursor:"pointer",whiteSpace:"nowrap",minWidth:24,textAlign:"center"}}>
              {agents.length > 0 ? `@${agents.length}` : "@"}
            </button>
            <Btn variant="danger" style={{fontSize:13,padding:"1px 5px"}} onClick={()=>onDel(t.id)}>×</Btn>
          </div>
        </td>
      </tr>

      {/* ── Per-agent sub-rows ── */}
      {agentOpen && (
        <>
          {agents.map(a => {
            const u = USERS.find(x=>x.id===a.uid);
            const agentCost = (a.manager||0)*IH_LEVELS.Manager + (a.senior||0)*IH_LEVELS.Senior + (a.junior||0)*IH_LEVELS.Junior;
            return (
              <tr key={a.uid} style={{background:"#f0fdf4",borderBottom:"1px solid #dcfce7"}}>
                <td colSpan={2} style={{padding:"3px 8px 3px 28px"}}>
                  <select
                    value={a.uid}
                    onChange={e=>{
                      const newUid = e.target.value;
                      if(!newUid || assignedUids.filter(x=>x!==a.uid).includes(newUid)) return;
                      onSet(t.id, "agents", agents.map(x=>x.uid===a.uid?{...x,uid:newUid}:x));
                    }}
                    style={{fontSize:12,padding:"2px 5px",border:"1px solid #86efac",borderRadius:3,background:"#fff",color:"#16a34a",fontWeight:700,width:"100%"}}>
                    {eligibleUsers.map(eu=>(
                      <option key={eu.id} value={eu.id} disabled={assignedUids.includes(eu.id)&&eu.id!==a.uid}>
                        {eu.name.split(" ")[0]} ({eu.role})
                      </option>
                    ))}
                  </select>
                </td>
                {["manager","senior","junior"].map(lvl=>(
                  <td key={lvl} style={{padding:"3px 4px"}}>
                    <input type="text" inputMode="numeric" value={a[lvl]||""}
                      onChange={e=>setAgentField(a.uid,lvl,e.target.value||0)}
                      style={{padding:"2px 4px",fontSize:13,width:48,textAlign:"center",border:"1px solid #bbf7d0",borderRadius:3,background:"#fff",outline:"none"}}/>
                  </td>
                ))}
                <td style={{padding:"3px 4px",fontWeight:700,fontSize:12,whiteSpace:"nowrap",color:"#16a34a"}}>฿{fmt(agentCost)}</td>
                <td colSpan={2} style={{padding:"3px 4px"}}>
                  <button onClick={()=>removeAgent(a.uid)} style={{fontSize:12,color:"#dc2626",background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:3,padding:"1px 7px",cursor:"pointer"}}>×</button>
                </td>
              </tr>
            );
          })}

          {/* Add agent row */}
          <tr style={{background:"#f8fffe",borderBottom:"1px solid #e2e8f0"}}>
            <td colSpan={8} style={{padding:"5px 8px 5px 28px"}}>
              <select onChange={e=>{addAgent(e.target.value);e.target.value="";}}
                style={{fontSize:12,padding:"2px 8px",border:"1px dashed #86efac",borderRadius:4,background:"#fff",color:"#16a34a",cursor:"pointer"}}>
                <option value="">+ Add Agent</option>
                {eligibleUsers.filter(u=>!assignedUids.includes(u.id)).map(u=>(
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              {agents.length===0 && <span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic",marginLeft:8}}>No agents assigned yet</span>}
            </td>
          </tr>
        </>
      )}
    </>
  );
});

//  TaskTableWidget: standalone table, uses TaskRow to prevent focus loss
const TaskTableWidget = ({tasks, onSet, onAdd, onDel, months}) => {
  const totalOPEX = (tasks||[]).reduce((s,t) => {
    const agents = Array.isArray(t.agents) && t.agents.length > 0 && typeof t.agents[0] === "object" ? t.agents : [];
    const mgr  = agents.length > 0 ? agents.reduce((x,a)=>x+(a.manager||0),0) : (t.manager||0);
    const sr   = agents.length > 0 ? agents.reduce((x,a)=>x+(a.senior||0),0)  : (t.senior||0);
    const jr   = agents.length > 0 ? agents.reduce((x,a)=>x+(a.junior||0),0)  : (t.junior||0);
    return s + mgr*IH_LEVELS.Manager + sr*IH_LEVELS.Senior + jr*IH_LEVELS.Junior;
  }, 0);
  return (
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,tableLayout:"fixed"}}>
      <colgroup><col style={{width:24}}/><col style={{width:"36%"}}/><col style={{width:"8%"}}/><col style={{width:"8%"}}/><col style={{width:"8%"}}/><col style={{width:"10%"}}/><col style={{width:"8%"}}/><col style={{width:"12%"}}/></colgroup>
      <thead><tr style={{background:"#f8fafc"}}>
        {["#","Task / Activity","Mgr (hrs)","Sr (hrs)","Jr (hrs)","Total Cost","Pay Month","Agent / Cancel"].map(h=>(
          <th key={h} style={{padding:"5px 6px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:9,borderBottom:"1px solid #e2e8f0"}}>{h}</th>
        ))}
      </tr></thead>
      <tbody>
        {(tasks||[]).length===0&&(
          <tr><td colSpan={8} style={{padding:"9px 6px",fontSize:11.5,color:"#94a3b8",fontStyle:"italic"}}>No tasks yet — add man-hour tasks and assign agents.</td></tr>
        )}
        {(tasks||[]).map((t,idx)=><TaskRow key={t.id} t={t} rowNum={idx+1} onSet={onSet} onDel={onDel} months={months}/>)}
        <tr style={{borderTop:"1px solid #e2e8f0"}}>
          <td colSpan={5} style={{padding:"5px 4px"}}>
            <button onClick={onAdd} className="wb-addrow">+ Task</button>
          </td>
          <td colSpan={2} style={{padding:"5px 4px",textAlign:"right",whiteSpace:"nowrap",color:"#94a3b8",fontSize:11,fontWeight:600}}>Total OPEX</td>
          <td style={{padding:"5px 8px",textAlign:"right",whiteSpace:"nowrap",fontWeight:700,fontSize:13,color:"#0f172a"}}>฿{fmt(totalOPEX)}</td>
        </tr>
      </tbody>
    </table>
  );
};

// 
// Smooth drag-to-sort hook
// 


// 
// COST SHEET (COGS + OPEX + Cashflow)
// 
const QuoteCard = ({q,editCS,customers,opps,user,setQF,setQIC,setQTK,setQInst,setQDlv,setQNote,addQIC,addQTK,addQInst,addQDlv,addQNote,delQIC,delQTK,delQInst,delQO,delQDlv,delQNote,updQO,handleSave,highlight,cardRef}) => {
  const qIC=calcIC(q.costs||[]),qOPEX=calcTask(q.tasks||[]);
  const qTC=qIC+qOPEX;
  // Discount: gross price stays in q.salesPrice; margin & opp price use the net (post-discount) figure.
  const qDiscPct=q.discountEnabled?(q.discountPct||0):0;
  const qNetPrice=Math.round((q.salesPrice||0)*(1-qDiscPct/100));
  const qMg=margin(qNetPrice,qTC);
  const months=q.projectMonths||editCS.projectMonths||3;
  const instSum=(q.installments||[]).reduce((s,i)=>s+(i.pct||0),0);
  const [page,setPage]=useState("costs");      // "costs" (COGS/OPEX/Installments/Cashflow) | "content" (Service/Deliverables/Notes)
  const logoB64=useWaveLogo();
  const cust=customers.find(c=>c.id===q.custId);
  // Direct quotation-PDF export from the card — builds the quote data from the live edits
  // and calls the shared generator synchronously so window.open keeps its click gesture.
  const doExportPDF=(lang)=>{
    if(!q.custId) return;
    const data={
      quoteNo: q.quoteNo,
      issueDate: today(),
      dueDate: addDays(today(),30),
      salesAgentId: q.salesAgent,
      projectScope: q.projectScope||"",
      salesPrice: q.salesPrice||0,
      discountEnabled: q.discountEnabled||false,
      discountPct: q.discountPct||0,
      lineItems: (q.lineItems&&q.lineItems.length)
        ? q.lineItems.map(li=>({...li, description: li.description||q.projectTitle||editCS.serviceType, unitPrice: q.salesPrice||0}))
        : [{id:uid(), description:q.projectTitle||editCS.serviceType, qty:1, unit:"Job", unitPrice:q.salesPrice||0}],
      installments: q.installments||[],
      deliverables: q.deliverables||[],
      notes: toItemList(q.notes),
    };
    exportQuotationPDF(data, cust, logoB64, lang);
  };

  return (
              <div ref={cardRef} style={{marginBottom:14}}>
              <Card style={{position:"relative",transition:"box-shadow .3s",boxShadow:highlight?"0 0 0 2.5px #3b82f6, 0 4px 24px rgba(59,130,246,.18)":"none"}}>
                {/* ── Page tabs (card top) — Costs & Cashflow / Quotation Content ── */}
                <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",gap:6}}>
                  {[["costs","Costs & Cashflow"],["content","Quotation Content"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setPage(k)} style={{padding:"7px 16px",border:"1px solid",borderColor:page===k?"#0f172a":"#e2e8f0",background:page===k?"#0f172a":"#fff",color:page===k?"#fff":"#64748b",borderRadius:7,fontSize:12.5,fontWeight:page===k?700:500,cursor:"pointer",transition:"background .14s,border-color .14s,color .14s"}}>{l}</button>
                  ))}
                </div>
                {/* ── Header: identity + parties (row 1) ── */}
                <div style={{padding:"12px 16px 0",display:"flex",gap:"10px 14px",alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div style={{flex:"0 0 116px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>OPP Code</Span>
                    <div style={{fontFamily:"monospace",fontWeight:800,fontSize:14,color:"#1e40af",letterSpacing:"-0.01em",padding:"5px 0"}}>{q.oppCode||"—"}</div>
                  </div>
                  <div style={{flex:"0 0 108px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Quote No.</Span>
                    <div style={{fontFamily:"monospace",fontWeight:800,fontSize:14,color:"#334155",letterSpacing:"-0.01em",padding:"5px 0"}}>{q.quoteNo||"—"}</div>
                  </div>
                  <div style={{flex:"0 0 100px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Memo No.</Span>
                    <Inp value={q.memoNo||""} onChange={e=>setQF(q.id,"memoNo",e.target.value)} placeholder="M69-001" style={{fontSize:11,fontFamily:"monospace",padding:"4px 7px"}}/>
                  </div>
                  <div style={{flex:"1 1 180px",minWidth:0}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Customer <span style={{color:"#dc2626",fontWeight:800}}>*</span></Span>
                    <Sel value={q.custId||""} onChange={e=>setQF(q.id,"custId",e.target.value)} style={{fontSize:11,padding:"4px 7px",width:"100%"}}>
                      <option value="">— Select —</option>{[...customers].sort((a,b)=>(a.companyEN||"").localeCompare(b.companyEN||"")).map(c=><option key={c.id} value={c.id}>{c.companyEN}</option>)}
                    </Sel>
                  </div>
                  <div style={{flex:"0 0 140px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Agent</Span>
                    <Sel value={q.salesAgent||""} onChange={e=>setQF(q.id,"salesAgent",e.target.value)} style={{fontSize:11,padding:"4px 7px",width:"100%"}}>
                      <option value="">— Select —</option>{SALES_USERS.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                    </Sel>
                  </div>
                  <div style={{flex:"0 0 150px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Contact</Span>
                    <Sel value={q.contactPersonId||""} onChange={e=>setQF(q.id,"contactPersonId",e.target.value)} style={{fontSize:11,padding:"4px 7px",width:"100%"}}>
                      <option value="">— Select —</option>
                      {(customers.find(c=>c.id===q.custId)?.contacts||[]).filter(ct=>ct.active).map(ct=><option key={ct.id} value={ct.id}>{ct.name}</option>)}
                    </Sel>
                  </div>
                  <div style={{flex:"0 0 64px"}}>
                    <Span s={9} c="#94a3b8" style={{textTransform:"uppercase",letterSpacing:"0.06em",display:"block",marginBottom:3}}>Months</Span>
                    <NumInp value={months} onChange={v=>setQF(q.id,"projectMonths",Math.max(1,Math.round(v)))} style={{fontSize:11,padding:"4px 7px"}}/>
                  </div>
                </div>

                {/* ── Pricing strip: right-aligned summary — gross, discount, price after discount, margin ──
                    Each cell shares a 3-row template (label 16 · value 30 · sub 13) so labels and value
                    baselines line up; the cluster is flush right (like the footer totals), nowrap + overflow-x. */}
                <div style={{margin:"12px 16px 0",overflowX:"auto"}}>
                  <div style={{padding:"12px 16px",borderRadius:10,background:+qMg>=30?"#f0fdf4":"#fffbeb",border:`1px solid ${+qMg>=30?"#bbf7d0":"#fde68a"}`,display:"flex",gap:18,alignItems:"stretch",flexWrap:"nowrap",justifyContent:"flex-end",minWidth:"min-content"}}>
                    {/* Sales Price (gross) */}
                    <div style={{flex:"0 0 132px",display:"flex",flexDirection:"column"}}>
                      <div style={{height:16,marginBottom:4,textAlign:"right"}}><Span s={9} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.05em"}}>Sales Price (gross)</Span></div>
                      <div style={{height:30,display:"flex",alignItems:"center"}}><NumInp value={q.salesPrice} onChange={v=>updQO(q.id,q=>({...q,salesPrice:v,lineItems:(q.lineItems||[]).map((li,i)=>i===0?{...li,unitPrice:v}:li)}))} style={{fontSize:14,fontWeight:700,padding:"5px 9px"}}/></div>                    </div>
                    {/* Discount % */}
                    <div style={{flex:"0 0 104px",display:"flex",flexDirection:"column"}}>
                      <div style={{height:16,marginBottom:4}}>
                        <label style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:5,cursor:"pointer",userSelect:"none"}}>
                          <input type="checkbox" checked={!!q.discountEnabled} onChange={e=>setQF(q.id,"discountEnabled",e.target.checked)} style={{width:13,height:13,cursor:"pointer",accentColor:"#0f172a",flexShrink:0}}/>
                          <Span s={9} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.05em"}}>Discount %</Span>
                        </label>
                      </div>
                      <div style={{height:30,display:"flex",alignItems:"center"}}><NumInp value={q.discountPct||0} onChange={v=>setQF(q.id,"discountPct",Math.min(100,Math.max(0,v)))} showZero disabled={!q.discountEnabled} style={{fontSize:14,padding:"5px 9px",opacity:q.discountEnabled?1:0.45}}/></div>                    </div>
                    {/* Price after Discount — the headline figure the client pays (ex-VAT) */}
                    <div style={{flex:"0 0 150px",display:"flex",flexDirection:"column"}}>
                      <div style={{height:16,marginBottom:4,textAlign:"right"}}><Span s={9} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.05em"}}>Price after Discount</Span></div>
                      <div style={{height:30,display:"flex",alignItems:"center",justifyContent:"flex-end"}}><span style={{fontWeight:900,fontSize:20,color:"#0f172a",letterSpacing:"-0.015em"}}>฿{fmt(qNetPrice)}</span></div>                    </div>
                    {/* Margin — the health metric */}
                    <div style={{flex:"0 0 96px",display:"flex",flexDirection:"column"}}>
                      <div style={{height:16,marginBottom:4,textAlign:"right"}}><Span s={9} c={+qMg>=30?"#15803d":"#dc2626"} style={{textTransform:"uppercase",letterSpacing:"0.05em"}}>Margin</Span></div>
                      <div style={{height:30,display:"flex",alignItems:"center",justifyContent:"flex-end"}}><span style={{fontWeight:900,fontSize:20,color:+qMg>=30?"#15803d":"#dc2626"}}>{qMg}%</span></div>                    </div>
                  </div>
                </div>

                {page==="costs"&&(<>
                {/* Cost grids */}
                <div className="wb-cs-2col" style={{padding:16,gap:14}}>
                  <div>
                    {/* Unified COGS table */}
                    <div style={{marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                      <Span s={11} w={700}>COGS</Span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,tableLayout:"fixed"}}>
                      <colgroup><col style={{width:20}}/><col style={{width:"25%"}}/><col style={{width:"12%"}}/><col style={{width:"7%"}}/><col style={{width:"7%"}}/><col style={{width:"12%"}}/><col style={{width:"11%"}}/><col style={{width:"7%"}}/><col style={{width:"4%"}}/></colgroup>
                      <TH cols={["#","Label","Vendor","Unit","Qty","Rate","Total","Pay M.",""]}/>
                      <tbody>
                        {(q.costs||[]).length===0&&(
                          <tr><td colSpan={9} style={{padding:"9px 6px",fontSize:11.5,color:"#94a3b8",fontStyle:"italic"}}>No cost rows yet — add materials or external/vendor costs.</td></tr>
                        )}
                        {(q.costs||[]).map((r,idx)=>(
                          <tr key={r.id} className="wb-csrow" style={{borderBottom:"1px solid #f8fafc"}}>
                            <td style={{padding:"3px 3px",textAlign:"center",fontSize:11,color:"#94a3b8",fontWeight:700}}>{idx+1}</td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.label} onChange={e=>setQIC(q.id,r.id,"label",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.vendorName||""} onChange={e=>setQIC(q.id,r.id,"vendorName",e.target.value)} placeholder="Vendor" style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><Inp value={r.unit} onChange={e=>setQIC(q.id,r.id,"unit",e.target.value)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.qty} onChange={v=>setQIC(q.id,r.id,"qty",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px"}}><NumInp value={r.rate} onChange={v=>setQIC(q.id,r.id,"rate",v)} style={{padding:"2px 4px",fontSize:13,width:"100%",boxSizing:"border-box"}}/></td>
                            <td style={{padding:"3px 3px",fontWeight:700,fontSize:13,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>฿{fmt((r.qty||0)*(r.rate||0))}</td>
                            <td style={{padding:"3px 3px"}}>
                              <Sel value={r.payMonth||1} onChange={e=>setQIC(q.id,r.id,"payMonth",+e.target.value)} style={{padding:"1px 3px",fontSize:11,width:"100%"}}>
                                {Array.from({length:(months||3)+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
                              </Sel>
                            </td>
                            <td><Btn variant="danger" style={{fontSize:13,padding:"1px 4px"}} onClick={()=>delQIC(q.id,r.id)}>×</Btn></td>
                          </tr>
                        ))}
                        <tr style={{borderTop:"1px solid #e2e8f0"}}>
                          <td colSpan={5} style={{padding:"5px 4px"}}>
                            <button onClick={()=>addQIC(q.id)} className="wb-addrow">+ Add</button>
                          </td>
                          <td colSpan={2} style={{padding:"5px 4px",textAlign:"right",whiteSpace:"nowrap",color:"#94a3b8",fontSize:11,fontWeight:600}}>Total COGS</td>
                          <td colSpan={2} style={{padding:"5px 8px",textAlign:"right",whiteSpace:"nowrap",fontWeight:700,fontSize:13,color:"#0f172a"}}>฿{fmt(qIC)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <Span s={12} w={700} style={{display:"block",marginBottom:6}}>OPEX — Man-hour Tasks</Span>
                    <TaskTableWidget tasks={q.tasks||[]} onSet={(tid,k,v)=>setQTK(q.id,tid,k,v)} onAdd={()=>addQTK(q.id)} onDel={tid=>delQTK(q.id,tid)} months={months}/>

                  </div>
                </div>

                {/*  INSTALLMENTS (left) + CASHFLOW (right) — 2-col layout  */}
                <div className="wb-cs-2col" style={{padding:"0 16px 16px",gap:16,borderTop:"1px solid #f1f5f9"}}>
                  {/* Installments */}
                  <div style={{paddingTop:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Span s={12} w={700}>Installments</Span>
                      <span style={{fontSize:13,fontWeight:700,color:Math.abs(instSum-100)<0.1?"#15803d":"#dc2626"}}>({instSum}%)</span>
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
                        {(q.installments||[]).length===0&&(
                          <tr><td colSpan={6} style={{padding:"9px 6px",fontSize:11.5,color:"#94a3b8",fontStyle:"italic"}}>No installments yet — add payment milestones (should total 100%).</td></tr>
                        )}
                        {(q.installments||[]).map((ins,idx)=>(
                          <tr key={ins.id} className="wb-csrow" style={{borderBottom:"1px solid #f8fafc"}}>
                            <td style={{padding:"4px 4px",textAlign:"center",color:"#94a3b8",fontWeight:700,fontSize:11,width:22}}>{idx+1}</td>
                            <td style={{padding:"4px 4px"}}><Inp value={ins.label} onChange={e=>setQInst(q.id,ins.id,"label",e.target.value)} placeholder="" style={{padding:"2px 5px",fontSize:13,width:"100%",background:"#f8fafc"}}/></td>
                            <td style={{padding:"4px 4px",width:46}}><Inp type="number" value={ins.pct} onChange={e=>setQInst(q.id,ins.id,"pct",+e.target.value)} style={{padding:"2px 4px",fontSize:13,width:38,textAlign:"right"}}/></td>
                            <td style={{padding:"4px 4px",fontWeight:700,fontSize:13,textAlign:"right",whiteSpace:"nowrap",width:76,fontVariantNumeric:"tabular-nums"}}>฿{fmt(Math.round(qNetPrice*(ins.pct||0)/100))}</td>
                            <td style={{padding:"4px 4px",width:66}}>
                              <Sel value={ins.recvMonth||1} onChange={e=>setQInst(q.id,ins.id,"recvMonth",+e.target.value)} style={{padding:"2px 3px",fontSize:11,width:60}}>
                                {Array.from({length:months+1},(_,i)=><option key={i+1} value={i+1}>M{i+1}</option>)}
                              </Sel>
                            </td>
                            <td style={{padding:"4px 4px",width:20}}><Btn variant="danger" style={{fontSize:13,padding:"1px 4px"}} onClick={()=>delQInst(q.id,ins.id)}>×</Btn></td>
                          </tr>
                        ))}
                        <tr><td colSpan={6} style={{padding:"6px 4px"}}>
                          <button onClick={()=>addQInst(q.id)} className="wb-addrow">+ Installment</button>
                        </td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cashflow */}
                  {(()=>{
                    const cfM=q.projectMonths||editCS.projectMonths||3;
                    const allM=Array.from({length:cfM+1},(_,i)=>i+1);
                    const cByM={};
                    (q.tasks||[]).forEach(t=>{const m=t.payMonth||1;const ag=Array.isArray(t.agents)&&t.agents.length>0&&typeof t.agents[0]==="object"?t.agents:[];const mgr=ag.length>0?ag.reduce((s,a)=>s+(a.manager||0),0):(t.manager||0);const sr=ag.length>0?ag.reduce((s,a)=>s+(a.senior||0),0):(t.senior||0);const jr=ag.length>0?ag.reduce((s,a)=>s+(a.junior||0),0):(t.junior||0);const tc=mgr*IH_LEVELS.Manager+sr*IH_LEVELS.Senior+jr*IH_LEVELS.Junior;cByM[m]=(cByM[m]||0)+tc;});
                    (q.costs||[]).forEach(r=>{const m=r.payMonth||1;const amt=(r.qty||0)*(r.rate||0);cByM[m]=(cByM[m]||0)+amt;});
                    const rByM={};
                    (q.installments||[]).forEach(ins=>{const m=ins.recvMonth||1;rByM[m]=(rByM[m]||0)+Math.round(qNetPrice*(ins.pct||0)/100);});
                    let run=0;
                    const cfRows=allM.map(m=>{const out=cByM[m]||0,inn=rByM[m]||0;run+=inn-out;return{m,out,inn,net:inn-out,run};});
                    const hasNeg=cfRows.some(r=>r.run<0);
                    const maxAbs=Math.max(...cfRows.map(r=>Math.abs(r.run)),1);
                    return(
                      <div style={{paddingTop:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <Span s={12} w={700}>Cashflow</Span>
                          <span style={{fontSize:11,color:"#94a3b8"}}>{cfM} months</span>
                          <span style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:hasNeg?"#dc2626":"#15803d",background:hasNeg?"#fee2e2":"#dcfce7",padding:"1px 8px",borderRadius:10,whiteSpace:"nowrap"}}>
                            {hasNeg?"Negative":"Positive"}
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
                              <td style={{padding:"2px 5px",color:"#dc2626",textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{r.out>0?`฿${fmt(r.out)}`:"—"}</td>
                              <td style={{padding:"2px 5px",color:"#15803d",textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{r.inn>0?`฿${fmt(r.inn)}`:"—"}</td>
                              <td style={{padding:"2px 5px",textAlign:"right",fontWeight:600,fontVariantNumeric:"tabular-nums",color:r.net>=0?"#15803d":"#dc2626"}}>{r.net!==0?`${r.net>0?"+":""}฿${fmt(r.net)}`:"—"}</td>
                              <td style={{padding:"2px 5px",textAlign:"right",fontWeight:800,fontVariantNumeric:"tabular-nums",color:r.run>=0?"#15803d":"#dc2626"}}>{r.run>=0?"+":""}฿{fmt(r.run)}</td>
                              <td style={{padding:"2px 6px",width:64}}>
                                <div style={{height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${Math.abs(r.run)/maxAbs*100}%`,background:r.run>=0?"#15803d":"#dc2626",borderRadius:3}}/>
                                </div>
                              </td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
                </>)}

                {page==="content"&&(<>
                {/*  SERVICE DESCRIPTION + PROJECT SCOPE (full width)  */}
                <div style={{padding:"18px 20px 16px"}}>
                  <div style={{marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}><Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Service Description</Span><Span s={11} c="#94a3b8">— Project title as it will appear in the Quotation</Span></div>
                    <Inp value={q.projectTitle||""} onChange={e=>setQF(q.id,"projectTitle",e.target.value)} placeholder="" style={{fontSize:12}}/>
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
                      <Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Project Scope</Span>
                      <Span s={11} c="#94a3b8">— Scope details e.g. Project Address, Boundary, Base Year</Span>
                      <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"baseline"}}>
                        <Span s={11} w={700} c={(q.projectScope||"").split("\n").length>=SCOPE_MAX_LINES?"#d97706":"#94a3b8"} style={{fontVariantNumeric:"tabular-nums"}}>{(q.projectScope||"").split("\n").length} / {SCOPE_MAX_LINES} lines</Span>
                        <Span s={11} w={700} c={(q.projectScope||"").length>=SCOPE_MAX_CHARS?"#d97706":"#94a3b8"} style={{fontVariantNumeric:"tabular-nums"}}>{(q.projectScope||"").length} / {SCOPE_MAX_CHARS}</Span>
                      </div>
                    </div>
                    <Txta value={q.projectScope||""} maxLength={SCOPE_MAX_CHARS} onChange={e=>{const v=e.target.value;if(v.split("\n").length<=SCOPE_MAX_LINES)setQF(q.id,"projectScope",v);}} placeholder={`Scope details e.g. Project Address, Boundary, Base Year — max ${SCOPE_MAX_LINES} lines / ${SCOPE_MAX_CHARS} characters so the signature stays on the quotation page.`} style={{minHeight:80,fontSize:12}}/>
                  </div>
                </div>

                {/*  DELIVERABLES (full width, editable list + preview)  */}
                <div style={{padding:"0 20px 16px"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:8}}>
                    <Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Deliverables</Span>
                    <Span s={11} c="#94a3b8">— max {DELIV_MAX} items so the signature stays on the page</Span>
                    <Span s={11} w={700} c={(q.deliverables||[]).length>=DELIV_MAX?"#d97706":"#94a3b8"} style={{marginLeft:"auto",fontVariantNumeric:"tabular-nums"}}>{(q.deliverables||[]).length} / {DELIV_MAX} items</Span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:6}}>
                    {(q.deliverables||[]).map((d,i)=>(
                      <div key={d.id} style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:"#94a3b8",fontWeight:700,fontSize:12,flexShrink:0,minWidth:20,textAlign:"right"}}>{i+1}</span>
                        <Inp value={d.item} onChange={e=>setQDlv(q.id,d.id,e.target.value)} placeholder="" style={{fontSize:12,flex:1}}/>
                        <Btn variant="danger" style={{fontSize:13,padding:"1px 5px",flexShrink:0}} onClick={()=>delQDlv(q.id,d.id)}>×</Btn>
                      </div>
                    ))}
                    {(()=>{const full=(q.deliverables||[]).length>=DELIV_MAX;return(
                    <button onClick={()=>{if(!full)addQDlv(q.id);}} disabled={full} title={full?`Max ${DELIV_MAX} items`:""} className="wb-addrow" style={{alignSelf:"flex-start",marginTop:4}}>+ Deliverable</button>
                    );})()}
                  </div>
                </div>

                {/*  NOTES & CONDITIONS (full width)  */}
                <div style={{padding:"0 20px 16px"}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:8}}>
                    <Span s={11} w={800} c="#64748b" style={{textTransform:"uppercase",letterSpacing:"0.07em"}}>Notes & Conditions</Span>
                    <Span s={11} c="#94a3b8">— max {NOTES_MAX} items so the signature stays on the page</Span>
                    <Span s={11} w={700} c={toItemList(q.notes).length>=NOTES_MAX?"#d97706":"#94a3b8"} style={{marginLeft:"auto",fontVariantNumeric:"tabular-nums"}}>{toItemList(q.notes).length} / {NOTES_MAX} items</Span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:6}}>
                    {toItemList(q.notes).map((n,i)=>(
                      <div key={n.id} style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:"#94a3b8",fontWeight:700,fontSize:12,flexShrink:0,minWidth:20,textAlign:"right"}}>{i+1}</span>
                        <Inp value={n.item} onChange={e=>setQNote(q.id,n.id,e.target.value)} placeholder="" style={{fontSize:12,flex:1}}/>
                        <Btn variant="danger" style={{fontSize:13,padding:"1px 5px",flexShrink:0}} onClick={()=>delQNote(q.id,n.id)}>×</Btn>
                      </div>
                    ))}
                    {(()=>{const full=toItemList(q.notes).length>=NOTES_MAX;return(
                    <button onClick={()=>{if(!full)addQNote(q.id);}} disabled={full} title={full?`Max ${NOTES_MAX} items`:""} className="wb-addrow" style={{alignSelf:"flex-start",marginTop:4}}>+ Note</button>
                    );})()}
                  </div>
                </div>
                {/* Export bar — pinned at the bottom of the quotation content */}
                <div style={{padding:"14px 20px 18px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{minWidth:0}}>
                    <Span s={12} w={800} c="#0f172a" style={{display:"block"}}>Export Quotation</Span>
                    <Span s={11} c="#94a3b8">Generates the A4 quotation PDF{q.quoteNo?` · ${q.quoteNo}`:""} from the content above.</Span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                    <Btn variant="export" size="sm" icon={<DlIcon/>} disabled={!q.custId} title={q.custId?`Export quotation ${q.quoteNo} (EN)`:"Select a customer first"} onClick={()=>doExportPDF("en")}>PDF · EN</Btn>
                    <Btn variant="export" size="sm" icon={<DlIcon/>} disabled={!q.custId} title={q.custId?`Export quotation ${q.quoteNo} (TH)`:"Select a customer first"} onClick={()=>doExportPDF("th")}>PDF · TH</Btn>
                  </div>
                </div>
                </>)}

                {/* Cost + margin + Save/Cancel footer (pinned on both pages) */}
                <div style={{borderTop:"1px solid #e2e8f0",padding:"12px 20px",background:"#f8fafc",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  {[{l:"COGS",v:qIC},{l:"OPEX",v:qOPEX},{l:"Total Cost",v:qTC,bold:true}].map(x=>(
                    <div key={x.l} style={{textAlign:"center"}}>
                      <Span s={9} c="#94a3b8" style={{display:"block",marginBottom:1,textTransform:"uppercase"}}>{x.l}</Span>
                      <Span s={13} w={x.bold?900:700}>฿{fmt(x.v)}</Span>
                    </div>
                  ))}
                  <div style={{textAlign:"center"}}>
                    <Span s={9} c="#94a3b8" style={{display:"block",marginBottom:1,textTransform:"uppercase"}}>Price after Discount</Span>
                    <Span s={13} w={900} c="#0f172a">฿{fmt(qNetPrice)}{qDiscPct>0&&<span style={{fontSize:10,fontWeight:700,color:"#dc2626",marginLeft:4}}>−{qDiscPct}%</span>}</Span>
                  </div>
                  <div style={{padding:"5px 12px",borderRadius:6,background:+qMg>=30?"#dcfce7":"#fee2e2",textAlign:"center"}}>
                    <Span s={9} c={+qMg>=30?"#15803d":"#dc2626"} style={{display:"block"}}>Margin</Span>
                    <Span s={15} w={900} c={+qMg>=30?"#15803d":"#dc2626"}>{qMg}%</Span>
                  </div>
                  <div style={{width:1,height:32,background:"#e2e8f0",flexShrink:0}}/>
                  <Btn variant="ghost" onClick={()=>delQO(q.id)}>Cancel</Btn>
                  <Btn icon={<CheckIcon/>} onClick={handleSave} style={{padding:"8px 24px"}}>Save</Btn>
                </div>
              </Card>
              </div>
  );
};

const CostSheetPage = ({costSheets,onSave,customers,opps,user,onSaveOpp,toast,initSvcCode,onSvcReady,initCsCode,onCsReady}) => {
  const [selCode,sCode] = useState(SERVICES[0].code);
  const [highlightCs,sHighlightCs] = useState(null);
  const csRefs = React.useRef({});
  const [pendingCs,setPendingCs] = useState(null);
  useEffect(()=>{if(initSvcCode){sCode(initSvcCode);sView("quote");if(onSvcReady)onSvcReady();}},[initSvcCode]);
  // Deep-link resolver: after load, snapshots live in saveLog (quoteOverrides is empty), so locate the
  // owning service by csCode, select its tab, and stage the csCode to auto-open once editCS settles.
  useEffect(()=>{
    if(!initCsCode) return;
    const owner=costSheets.find(c=>
      (c.saveLog||[]).some(l=>l.quoteSnapshot && l.quoteSnapshot.csCode===initCsCode) ||
      (c.quoteOverrides||[]).some(q=>q.csCode===initCsCode)
    );
    if(!owner) return; // costSheets may still be loading — retry when it changes
    sCode(owner.serviceCode);
    setPendingCs(initCsCode);
    if(onCsReady)onCsReady();
  },[initCsCode,costSheets]);
  const [view,sView]    = useState("quote");
  const [gs,sGS]        = useState(false);
  const cs = useMemo(()=>costSheets.find(c=>c.serviceCode===selCode)||buildDefaultCS(SERVICES.find(s=>s.code===selCode)||SERVICES[0]),[costSheets,selCode]);
  const [editCS,sECS] = useState(cs);
  const [editPrice,sEP] = useState(0);
  useEffect(()=>{const f=costSheets.find(c=>c.serviceCode===selCode)||buildDefaultCS(SERVICES.find(s=>s.code===selCode)||SERVICES[0]);sECS(f);sEP(f.stdPrice||0);},[selCode,costSheets]);
  // Auto-open the staged quotation card once editCS reflects the resolved service.
  // Reuses the same snapshot→override transform as the Edit button, minus the "Re-opened" log entry.
  useEffect(()=>{
    if(!pendingCs) return;
    if((editCS.quoteOverrides||[]).length>0) return; // a card is already open
    const entry=[...(editCS.saveLog||[])]
      .filter(l=>l.quoteSnapshot && l.quoteSnapshot.csCode===pendingCs)
      .sort((a,b)=>(b.ts||"").localeCompare(a.ts||""))[0];
    if(!entry) return; // editCS not yet the owning service
    const snap=entry.quoteSnapshot;
    sECS(p=>({...p,quoteOverrides:[{...snap,id:uid(),notes:toItemList(snap.notes),deliverables:toItemList(snap.deliverables)}]}));
    sHighlightCs(pendingCs);
    const cs2=pendingCs;
    setPendingCs(null);
    setTimeout(()=>{const el=csRefs.current[cs2];if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},300);
  },[editCS,pendingCs]);
  // Keep the address bar in sync with the open quotation (silent — replaceState fires no hashchange).
  useEffect(()=>{
    const openCs=(editCS.quoteOverrides||[])[0]?.csCode;
    const target=openCs?`#costsheet/${openCs}`:"#costsheet";
    if(location.hash!==target) history.replaceState(null,"",target);
  },[editCS.quoteOverrides]);

  // COGS calcs
  const totalIC = calcIC(editCS.costs||[]);
  const totalCOGS = totalIC;
  // OPEX calcs
  const totalOPEX = calcTask(editCS.tasks||[]);
  const totalCost = totalCOGS + totalOPEX;
  const mg = margin(editPrice, totalCost);

  const setIC=(id,k,v)=>sECS(p=>({...p,costs:(p.costs||[]).map(r=>r.id===id?{...r,[k]:v}:r)}));
  const addIC=()=>sECS(p=>({...p,costs:[...(p.costs||[]),{id:uid(),label:"",vendorName:"",unit:"Unit",qty:0,rate:0}]}));
  const delIC=id=>sECS(p=>({...p,costs:(p.costs||[]).filter(r=>r.id!==id)}));
  const setTK=(id,k,v)=>sECS(p=>({...p,tasks:(p.tasks||[]).map(t=>t.id===id?{...t,[k]:v}:t)}));
  const addTK=()=>sECS(p=>({...p,tasks:[...(p.tasks||[]),{id:uid(),taskName:"",manager:0,senior:0,junior:0,payMonth:1,agents:[]}]}));
  const delTK=id=>sECS(p=>({...p,tasks:(p.tasks||[]).filter(t=>t.id!==id)}));

  // Per-quotation — only 1 CS per quote
  const updQO=(qid,fn)=>sECS(p=>({...p,quoteOverrides:(p.quoteOverrides||[]).map(q=>q.id===qid?fn(q):q)}));
  const setQF=(qid,k,v)=>updQO(qid,q=>({...q,[k]:v}));
  const setQTK=(qid,tid,k,v)=>updQO(qid,q=>({...q,tasks:(q.tasks||[]).map(t=>t.id===tid?{...t,[k]:v}:t)}));
  const addQTK=qid=>updQO(qid,q=>({...q,tasks:[...(q.tasks||[]),{id:uid(),taskName:"",manager:0,senior:0,junior:0,payMonth:1,agents:[]}]}));
  const delQTK=(qid,tid)=>updQO(qid,q=>({...q,tasks:(q.tasks||[]).filter(t=>t.id!==tid)}));

  const setQIC=(qid,rid,k,v)=>updQO(qid,q=>({...q,costs:(q.costs||[]).map(r=>r.id===rid?{...r,[k]:v}:r)}));
  const addQIC=qid=>updQO(qid,q=>({...q,costs:[...(q.costs||[]),{id:uid(),label:"",vendorName:"",unit:"Unit",qty:0,rate:0,payMonth:1}]}));
  const delQIC=(qid,rid)=>updQO(qid,q=>({...q,costs:(q.costs||[]).filter(r=>r.id!==rid)}));

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
  const setQNote=(qid,nid,v)=>updQO(qid,q=>({...q,notes:toItemList(q.notes).map(n=>n.id===nid?{...n,item:v}:n)}));
  const addQNote=qid=>updQO(qid,q=>({...q,notes:[...toItemList(q.notes),{id:uid(),item:""}]}));
  const delQNote=(qid,nid)=>updQO(qid,q=>({...q,notes:toItemList(q.notes).filter(n=>n.id!==nid)}));


  const addQO=()=>{
    const existingQ = (editCS.quoteOverrides||[]);
    if(existingQ.length>0){toast("One CS per Quote","Each Quote No. can only have 1 CS Code. Edit the existing one.","error");return;}
    const quoteNo=genQuoteNo(opps);
    const csCode=genCSCode(quoteNo);
    const oppCode=genOppCode(opps);
    sECS(p=>({...p,quoteOverrides:[{
      id:uid(),csCode,oppCode,quoteNo,memoNo:"",custId:"",salesAgent:"",contactPersonId:"",salesPrice:0,discountEnabled:false,discountPct:0,
      projectTitle:"",
      projectScope:"",
      projectMonths:editCS.projectMonths||3,
      costs:[],
      tasks:[],
      installments:[
        {id:uid(),seq:1,label:"",pct:40,detail:"",recvMonth:1},
        {id:uid(),seq:2,label:"",pct:40,detail:"",recvMonth:2},
        {id:uid(),seq:3,label:"",pct:20,detail:"",recvMonth:3},
      ],
      lineItems:[{id:uid(),description:"",qty:1,unit:"Job",unitPrice:0}],
      deliverables:[
        {id:uid(),item:""},
      ],
      notes:[
        {id:uid(),item:""},
      ],
    }]}));
  };
  const delQO=id=>sECS(p=>({...p,quoteOverrides:(p.quoteOverrides||[]).filter(r=>r.id!==id)}));

  const handleSave=()=>{
    // Customer is required — block save (and alert) if any open quotation has none
    const missingCust=(editCS.quoteOverrides||[]).filter(q=>!q.custId);
    if(missingCust.length>0){ toast("Customer required","Please select a customer before saving the quotation.","error"); return; }
    // Build detailed save log entries — one per completed quotation, plus a general entry
    const newSaveEntries=[];
    const savedQOIds=[];   // IDs of quoteOverrides that get committed → removed from screen

    (editCS.quoteOverrides||[]).forEach(q=>{
      // Commit any QO that has custId + oppCode (new OR re-opened re-edit)
      if(q.custId&&q.oppCode){
        const qIC=calcIC(q.costs||[]),qOPEX=calcTask(q.tasks||[]);
        const qCost=qIC+qOPEX;
        const csCode=q.csCode||genCSCode(q.quoteNo||"");
        // Net (post-discount) price drives the Opportunity sales price + margin; gross stays in the quote.
        const qDiscPct=q.discountEnabled?(q.discountPct||0):0;
        const qNet=Math.round((q.salesPrice||0)*(1-qDiscPct/100));
        const qMg=margin(qNet,qCost);
        const cust=customers.find(c=>c.id===q.custId);
        const existingOpp=opps.find(o=>o.oppCode===q.oppCode);
        const opp={
          id:q.oppCode,custId:q.custId,oppCode:q.oppCode,quoteNo:q.quoteNo,memoNo:q.memoNo||"",csCode,jobCode:existingOpp?.jobCode||"",
          serviceCode:editCS.serviceCode,serviceType:editCS.serviceType,salesPrice:qNet,totalCost:qCost,
          status:existingOpp?.status||"KYC",
          assignedTo:q.salesAgent||"",
          createdDate:existingOpp?.createdDate||today(),lostReason:existingOpp?.lostReason||"",
          activityLog:[
            ...(existingOpp?.activityLog||[]),
            {id:uid(),ts:nowTS(),author:user.id,note:`${existingOpp?"Updated":"Created"} from Cost Sheet ${csCode} (${editCS.serviceCode}) · ${q.quoteNo} · Cost: ฿${fmt(qCost)} · Margin: ${qMg}%`},
          ],
          remark:existingOpp?.remark||"",
        };
        onSaveOpp(opp);
        // Bug 3 fix: write updated quote data to costsheet_quotes tab so edits persist on refresh
        gsSave("costsheet_quotes", {
          csCode,
          serviceCode: editCS.serviceCode,
          oppCode:     q.oppCode,
          quoteNo:     q.quoteNo,
          memoNo:      q.memoNo||"",
          custId:      q.custId,
          salesAgent:  q.salesAgent||"",
          contactPersonId: q.contactPersonId||"",
          salesPrice:  q.salesPrice,
          discountEnabled: q.discountEnabled||false,
          discountPct: q.discountPct||0,
          projectTitle:q.projectTitle||"",
          projectScope:q.projectScope||"",
          projectMonths:q.projectMonths||editCS.projectMonths||3,
          notes:       toItemList(q.notes),
          costs_json:  q.costs||[],
          tasks_json:  q.tasks||[],
          installments_json: q.installments||[],
          lineItems_json:    q.lineItems||[],
          deliverables_json: q.deliverables||[],
          savedTs:     nowTS(),
          savedBy:     user.id,
        });
        savedQOIds.push(q.id);
        newSaveEntries.push({
          id:uid(),ts:nowTS(),author:user.id,
          note:`Quotation ${existingOpp?"updated":"saved"} → ${csCode} · ${q.quoteNo} · ${cust?.companyEN||q.custId} · Price ฿${fmt(qNet)}${qDiscPct>0?` (−${qDiscPct}%)`:""} · Cost ฿${fmt(qCost)} · Margin ${qMg}%`,
          quoteSnapshot:{...q,csCode,_savedTs:nowTS(),_savedBy:user.id},  // stored for re-edit
        });
      }
    });

    // General save entry (always)
    newSaveEntries.push({id:uid(),ts:nowTS(),author:user.id,note:`Cost Sheet saved — ${selCode}`});

    // Remove committed quotations from quoteOverrides; keep uncommitted ones
    const remainingQOs=(editCS.quoteOverrides||[]).filter(q=>!savedQOIds.includes(q.id));

    // Remove stale saveLog entries for quoteNos we just saved, then append fresh ones
    const savedQuoteNos = new Set(savedQOIds.map(id=>{
      const qo=(editCS.quoteOverrides||[]).find(x=>x.id===id);
      return qo?.quoteNo;
    }).filter(Boolean));
    const prunedSaveLog = safeArr(editCS.saveLog).filter(e=>
      !e.quoteSnapshot || !savedQuoteNos.has(e.quoteSnapshot.quoteNo)
    );
    const saved={
      ...editCS,
      stdPrice:editPrice,
      quoteOverrides:remainingQOs,
      saveLog:[...prunedSaveLog,...newSaveEntries],
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

  const duplicateQO = (snapshot) => {
    if((editCS.quoteOverrides||[]).length>0){
      toast("Close current quotation first","Save or cancel the open Per-Quotation form before duplicating.","error");
      return;
    }
    const quoteNo = genQuoteNo(opps);
    const csCode  = genCSCode(quoteNo);
    const oppCode = genOppCode(opps);
    sECS(p=>({...p, quoteOverrides:[{
      ...snapshot,
      id:uid(), csCode, quoteNo, oppCode, memoNo:"",
      custId:"", salesAgent:"", contactPersonId:"",
      notes: toItemList(snapshot.notes),
    }]}));
    toast("Duplicated","Fill in Customer, Agent, and Contact Person then save.");
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
            {(editCS.quoteOverrides||[]).length===0&&<div style={{display:"flex",gap:8}}><Btn onClick={addQO}>+ New Quotation</Btn></div>}
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
                  ).sort((a,b)=>(b.ts||"").localeCompare(a.ts||"")).map(l=>(
                    <div key={l.id} onClick={()=>{
                        sECS(p=>({...p,quoteOverrides:[{...l.quoteSnapshot,id:uid(),notes:toItemList(l.quoteSnapshot.notes),deliverables:toItemList(l.quoteSnapshot.deliverables)}]}));
                        const logEntry={id:uid(),ts:nowTS(),author:user.id,note:`Re-opened ${l.quoteSnapshot.csCode} for editing`};
                        sECS(p=>({...p,saveLog:[...(p.saveLog||[]),logEntry]}));
                      }} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',border:'1px solid #e2e8f0',borderRadius:7,marginBottom:6,cursor:'pointer',transition:'background 0.1s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                      <span style={{fontSize:12,color:'#94a3b8',whiteSpace:'nowrap'}}>{l.ts}</span>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:'monospace',color:'#92400e',background:'#fef3c7',padding:'2px 8px',borderRadius:4,border:'1px solid #fde68a'}}>{l.quoteSnapshot.csCode}</span>
                      <span style={{fontSize:12,color:'#374151',flex:1}}>{l.quoteSnapshot.quoteNo} {customers.find(c=>c.id===l.quoteSnapshot.custId)?.companyEN||l.quoteSnapshot.custId}</span>
                      <Btn variant='ghost' style={{fontSize:12,padding:'4px 12px',color:'#374151',borderColor:'#e2e8f0'}} onClick={e=>{e.stopPropagation();
                        sECS(p=>({...p,quoteOverrides:[{...l.quoteSnapshot,id:uid(),notes:toItemList(l.quoteSnapshot.notes),deliverables:toItemList(l.quoteSnapshot.deliverables)}]}));
                        const logEntry={id:uid(),ts:nowTS(),author:user.id,note:`Re-opened ${l.quoteSnapshot.csCode} for editing`};
                        sECS(p=>({...p,saveLog:[...(p.saveLog||[]),logEntry]}));
                      }}>Edit</Btn>
                      <Btn variant='ghost' style={{fontSize:11,padding:'3px 10px',color:'#64748b',borderColor:'#e2e8f0'}} onClick={e=>{e.stopPropagation();duplicateQO(l.quoteSnapshot);}}>Duplicate</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {(editCS.quoteOverrides||[]).map((q)=>(
            <QuoteCard key={q.id} q={q} editCS={editCS} customers={customers} opps={opps} user={user}
              highlight={highlightCs===q.csCode} cardRef={el=>{if(el)csRefs.current[q.csCode]=el;}}
              setQF={setQF} setQIC={setQIC} setQTK={setQTK} setQInst={setQInst} setQDlv={setQDlv} setQNote={setQNote}
              addQIC={addQIC} addQTK={addQTK} addQInst={addQInst} addQDlv={addQDlv} addQNote={addQNote}
              delQIC={delQIC} delQTK={delQTK} delQInst={delQInst} delQO={delQO} delQDlv={delQDlv} delQNote={delQNote}
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

// ============================================================
//  TIME SHEET PAGE — v2 (Full Replacement)
//  Role routing: manager → Manager View only
//                operation → Agent View only
//                sales / admin → Toggle Manager ↔ Agent
//  Week grid: ISO Mon–Sun weeks, all OPEX months shown
//  New GS schema: one row per oppCode+taskId+agentUid+year+month+week
// ============================================================

const RATE_PER_HOUR = {Manager:1441, Senior:948, Junior:600};

// ── ISO week helpers (Mon = 1) ──
const getISOWeekOfMonth = (date) => {
  // Week 1 = Mon of that week contains day 1-7
  const d = new Date(date);
  const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstMonday = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0=Sun
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  if(dayOfWeek !== 1) firstMonday.setDate(1 + daysUntilMonday - 7); // start of first Mon-week
  const diff = d - firstMonday;
  return Math.floor(diff / (7*24*3600*1000)) + 1;
};

// Get YYYYMM list from payMonth values relative to a contract start date
const getOPEXMonths = (tasks, contractStartDate) => {
  if(!tasks || tasks.length === 0) return [];
  const payMonths = [...new Set(tasks.map(t => t.payMonth||1))];
  const months = [];
  payMonths.forEach(pm => {
    let d;
    if(contractStartDate) {
      d = new Date(contractStartDate);
      d.setMonth(d.getMonth() + (pm - 1));
    } else {
      const now = new Date();
      d = new Date(now.getFullYear(), now.getMonth() + (pm - 1), 1);
    }
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, payMonth: pm });
  });
  return months.sort((a,b) => a.year*100+a.month - (b.year*100+b.month));
};

// Build week columns: [{year,month,week,label}]
const buildWeekColumns = (opexMonths) => {
  const cols = [];
  opexMonths.forEach(({year,month}) => {
    for(let w=1;w<=4;w++) cols.push({year,month,week:w,label:`W${w}`});
  });
  return cols;
};

// ── TSTaskGrid ──────────────────────────────────────────────────────────────
//  Layout per task group:
//    Plan band   = one bold total per task (never split by week)
//    Actual band = per-agent rows, real editable hours per week
//    Gap row     = full-width footer showing Δ plan vs sum-of-actuals
const TSTaskGrid = ({opp, cust, snapshot, tsRows, onSave, toast, user, canEdit}) => {
  const [open,       setOpen]            = useState(false);
  // key = "taskId:agentUid_year_month_week" → actual hours logged that week
  const [weekActual, setWeekActualState] = useState({});

  const tasks      = useMemo(() => safeArr(snapshot?.tasks || []), [snapshot]);
  const opexMonths = useMemo(() => getOPEXMonths(tasks, null), [tasks]);
  const weekCols   = useMemo(() => buildWeekColumns(opexMonths), [opexMonths]);
  const totalCols  = 2 + weekCols.length + 1; // # + name + weeks + hrs

  useEffect(() => {
    const wMap = {};
    (tsRows || []).forEach(r => {
      if(+(r.week) > 0 && r.taskId && r.agentUid)
        wMap[`${r.taskId}:${r.agentUid}_${r.year}_${r.month}_${r.week}`] = +(r.actualHours || 0);
    });
    setWeekActualState(wMap);
  }, [tsRows, opp.oppCode]);

  const getAgents = task =>
    Array.isArray(task.agents) && task.agents.length > 0 && typeof task.agents[0] === "object"
      ? task.agents : [];

  const getAgentWeekPlan = (task, agent, col) => {
    const om = opexMonths.find(m => m.payMonth === (task.payMonth || 1));
    if(!om || om.year !== col.year || om.month !== col.month) return 0;
    const hrs = (agent.manager||0) + (agent.senior||0) + (agent.junior||0);
    return Math.round(hrs / 4 * 10) / 10;
  };

  const getAgentPlanTotal = (task, agent) =>
    (agent.manager||0) + (agent.senior||0) + (agent.junior||0);

  const getTaskPlanTotal = task =>
    getAgents(task).reduce((s,a) => s + getAgentPlanTotal(task,a), 0);

  // Actual hours are entered directly per week against the plan — no separate
  // "select this week" toggle. getActual sums an agent's weekly entries for a task.
  const getWeekActual = (taskId, agentUid, year, month, week) =>
    weekActual[`${taskId}:${agentUid}_${year}_${month}_${week}`] || 0;
  const setWeekActual = (taskId, agentUid, year, month, week, v) =>
    setWeekActualState(p => ({...p, [`${taskId}:${agentUid}_${year}_${month}_${week}`]: v}));
  const getActual = (taskId, agentUid) =>
    weekCols.reduce((s,col) => s + getWeekActual(taskId, agentUid, col.year, col.month, col.week), 0);
  const clearAgentTask = (taskId, agentUid) => {
    const prefix = `${taskId}:${agentUid}_`;
    setWeekActualState(p => {
      const next = {...p};
      Object.keys(next).forEach(k => { if(k.startsWith(prefix)) delete next[k]; });
      return next;
    });
  };

  const agentSummary = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      getAgents(task).forEach(agent => {
        if(!map[agent.uid]) {
          const u    = USERS.find(x => x.id === agent.uid);
          const role = (agent.manager||0)>0?"Manager":(agent.senior||0)>0?"Senior":"Junior";
          map[agent.uid] = {uid:agent.uid, name:u?.name||agent.uid, role, planHrs:0, actualHrs:0};
        }
        map[agent.uid].planHrs += getAgentPlanTotal(task, agent);
      });
    });
    Object.keys(map).forEach(uid => {
      map[uid].actualHrs = tasks.reduce((s,t) => s + getActual(t.id, uid), 0);
    });
    return Object.values(map);
  }, [tasks, weekActual, weekCols]);

  const handleSave = () => {
    const now = nowTS();
    tasks.forEach(task => {
      getAgents(task).forEach(agent => {
        weekCols.forEach(col => {
          const planH   = getAgentWeekPlan(task, agent, col);
          const actualH = getWeekActual(task.id, agent.uid, col.year, col.month, col.week);
          if(planH <= 0 && actualH <= 0) return; // nothing to record for this week
          onSave({
            id:          `${opp.oppCode}_${task.id}_${agent.uid}_${col.year}_${col.month}_${col.week}`,
            oppCode:     opp.oppCode,  jobCode: opp.jobCode,
            taskId:      task.id,      taskName: task.taskName || "",
            agentUid:    agent.uid,    year: col.year,
            month:       col.month,    week: col.week,
            planHours:   planH,        actualHours: actualH,
            savedTs:     now,          savedBy: user.id,
          });
        });
      });
    });
    toast("Saved", opp.jobCode);
  };

  if(!open) return (
    <Card style={{marginBottom:8, overflow:"hidden"}}>
      <div onClick={() => setOpen(true)} style={{padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", background:"#fff", userSelect:"none"}}>
        <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
          <span style={{fontFamily:"monospace", fontWeight:900, fontSize:15, color:"#0f172a"}}>{opp.jobCode}</span>
          <SvcBadge code={opp.serviceCode}/>
          <span style={{fontSize:12, color:"#64748b"}}>{cust?.companyEN || opp.custId}</span>
          <span style={{fontSize:11, color:"#94a3b8"}}>{opexMonths.length} month{opexMonths.length!==1?"s":""} · {tasks.length} task{tasks.length!==1?"s":""}</span>
        </div>
        <span style={{fontSize:22, color:"#94a3b8", transform:"rotate(-90deg)", display:"inline-block"}}>›</span>
      </div>
    </Card>
  );

  const CELL_W = 52;

  return (
    <Card style={{marginBottom:10, overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"12px 18px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8}}>
        <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
          <span style={{fontFamily:"monospace", fontWeight:900, fontSize:15, color:"#0f172a"}}>{opp.jobCode}</span>
          <SvcBadge code={opp.serviceCode}/>
          <span style={{fontSize:12, color:"#64748b"}}>{cust?.companyEN || opp.custId}</span>
        </div>
        <button onClick={() => setOpen(false)} style={{border:"none", background:"none", cursor:"pointer", fontSize:22, color:"#94a3b8", padding:"0 4px", lineHeight:1, transform:"rotate(90deg)"}}>›</button>
      </div>

      {tasks.length === 0 && (
        <div style={{padding:24, textAlign:"center", color:"#94a3b8", fontSize:13}}>No OPEX tasks found in Cost Sheet.</div>
      )}

      {tasks.length > 0 && (
        <div style={{overflowX:"auto"}}>
          <table style={{borderCollapse:"collapse", fontSize:12, minWidth:"100%", tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:32}}/>
              <col style={{width:210}}/>
              {weekCols.map((_,i) => <col key={i} style={{width:CELL_W}}/>)}
              <col style={{width:76}}/>
            </colgroup>
            <thead>
              {/* Month row */}
              <tr style={{background:"#f1f5f9"}}>
                <th colSpan={2} style={{borderBottom:"1px solid #e2e8f0", background:"#f1f5f9"}}/>
                {opexMonths.map(({year,month}) => (
                  <th key={`${year}-${month}`} colSpan={4} style={{textAlign:"center", fontWeight:800, color:"#0f172a", fontSize:11, borderLeft:"2px solid #cbd5e1", borderBottom:"1px solid #e2e8f0", padding:"4px 0", background:"#f1f5f9"}}>
                    {MONTHS[month-1]} {year}
                  </th>
                ))}
                <th style={{textAlign:"right", padding:"4px 8px", fontSize:10, fontWeight:700, color:"#64748b", borderLeft:"2px solid #e2e8f0", borderBottom:"1px solid #e2e8f0", background:"#f1f5f9", whiteSpace:"nowrap"}}>Hrs</th>
              </tr>
              {/* Week row */}
              <tr style={{background:"#f8fafc"}}>
                <th colSpan={2} style={{borderBottom:"2px solid #e2e8f0", background:"#f8fafc"}}/>
                {weekCols.map((c,i) => (
                  <th key={i} style={{textAlign:"center", fontSize:9, color:"#94a3b8", fontWeight:600, borderLeft:c.week===1?"2px solid #cbd5e1":"none", borderBottom:"2px solid #e2e8f0", padding:"2px 0", background:"#f8fafc"}}>
                    W{c.week}
                  </th>
                ))}
                <th style={{borderLeft:"2px solid #e2e8f0", borderBottom:"2px solid #e2e8f0", background:"#f8fafc"}}/>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, ti) => {
                const agents    = getAgents(task);
                const planTotal = getTaskPlanTotal(task);
                const taskActual= agents.reduce((s,a) => s + getActual(task.id,a.uid), 0);
                const hasActual = taskActual > 0;
                const gap       = planTotal - taskActual;
                const gapColor  = gap > 0 ? "#16a34a" : gap < 0 ? "#dc2626" : "#64748b";
                const gapBg     = gap > 0 ? "#dcfce7" : gap < 0 ? "#fee2e2" : "#f1f5f9";
                const gapBorder = gap > 0 ? "#86efac" : gap < 0 ? "#fecaca" : "#e2e8f0";

                return (
                  <React.Fragment key={task.id}>
                    {/* ── Plan band: one solid, bold total per task — never broken out by week ── */}
                    <tr style={{borderTop: ti===0?"none":"2px solid #e2e8f0", background:"#eef1f6"}}>
                      <td style={{padding:"9px 4px 9px 8px", color:"#94a3b8", fontSize:11, fontWeight:700, textAlign:"right", verticalAlign:"middle"}}>{ti+1}</td>
                      <td style={{padding:"9px 10px", fontWeight:700, fontSize:12, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", verticalAlign:"middle"}} title={task.taskName}>
                        {task.taskName||"(Unnamed)"}
                        <span style={{marginLeft:7, fontSize:9, fontWeight:800, color:"#475569", background:"#dde3ec", padding:"2px 6px", borderRadius:3, textTransform:"uppercase", letterSpacing:"0.05em"}}>Plan</span>
                      </td>
                      <td colSpan={weekCols.length} style={{padding:"9px 5px", verticalAlign:"middle"}}/>
                      <td style={{textAlign:"right", padding:"0 8px", borderLeft:"2px solid #dde3ec", verticalAlign:"middle", whiteSpace:"nowrap"}}>
                        <span style={{fontWeight:800, fontSize:14, color:"#0f172a"}}>{planTotal > 0 ? `${planTotal}h` : "—"}</span>
                      </td>
                    </tr>

                    {/* ── Actual band: per agent, real editable hours per week ── */}
                    {agents.map((agent, ai) => {
                      const u           = USERS.find(x => x.id === agent.uid);
                      const agentName   = u?.name || agent.uid;
                      const agentActual = getActual(task.id, agent.uid);
                      const hasAg       = agentActual > 0;
                      const role   = (agent.manager||0)>0?"M":(agent.senior||0)>0?"S":"J";
                      const roleC  = role==="M"?"#1e40af":role==="S"?"#7c3aed":"#16a34a";
                      const roleBg = role==="M"?"#dbeafe":role==="S"?"#ede9fe":"#dcfce7";

                      return (
                        <tr key={agent.uid} style={{background:"#fff", borderBottom: ai===agents.length-1?"2px solid #e2e8f0":"1px solid #f1f5f9"}}>
                          <td/>
                          <td style={{padding:"5px 10px 5px 22px", verticalAlign:"middle"}}>
                            <span style={{color:"#94a3b8", fontSize:10, marginRight:4}}>↳</span>
                            <span style={{fontSize:11, fontWeight:600, color:"#374151", marginRight:5}}>{agentName}</span>
                            <span style={{fontSize:9, fontWeight:700, padding:"1px 4px", borderRadius:3, background:roleBg, color:roleC, marginRight:5}}>
                              {role==="M"?"Mgr":role==="S"?"Sr":"Jr"}
                            </span>
                            {ai===0 && <span style={{fontSize:9, fontWeight:800, color:"#0f766e", background:"#ccfbf1", padding:"2px 6px", borderRadius:3, textTransform:"uppercase", letterSpacing:"0.05em"}}>Actual</span>}
                          </td>
                          {weekCols.map((col, ci) => {
                            const planH = getAgentWeekPlan(task, agent, col);
                            if(planH <= 0) return (
                              <td key={ci} style={{padding:"3px 4px", borderLeft:col.week===1?"2px solid #e2e8f0":"none", textAlign:"center"}}>
                                <span style={{fontSize:11, color:"#e2e8f0"}}>·</span>
                              </td>
                            );
                            const val = getWeekActual(task.id, agent.uid, col.year, col.month, col.week);
                            return (
                              <td key={ci} style={{padding:"3px 4px", borderLeft:col.week===1?"2px solid #e2e8f0":"none", verticalAlign:"middle", textAlign:"center"}}>
                                {canEdit
                                  ? <NumInp value={val} onChange={v => setWeekActual(task.id, agent.uid, col.year, col.month, col.week, v)} showZero={false}
                                      style={{width:CELL_W-16, textAlign:"center", padding:"3px 2px", fontSize:11, fontWeight:val>0?700:400,
                                        border:`1px solid ${val>0?"#5eead4":"#e2e8f0"}`,
                                        background: val>0 ? "#f0fdfa" : "#fafafa", color: val>0?"#0f766e":"#1e293b"}}/>
                                  : <span style={{fontSize:11, color:val>0?"#0f766e":"#cbd5e1", fontWeight:val>0?700:400}}>{val>0?`${val}h`:"—"}</span>
                                }
                              </td>
                            );
                          })}
                          <td style={{padding:"3px 6px", borderLeft:"2px solid #e2e8f0", textAlign:"right", verticalAlign:"middle"}}>
                            <span style={{display:"inline-flex", alignItems:"center", gap:3}}>
                              <span style={{fontSize:12, fontWeight:hasAg?800:400, color:hasAg?"#0f766e":"#94a3b8"}}>{hasAg?`${agentActual}h`:"—"}</span>
                              {canEdit && hasAg && (
                                <IconBtn size="sm" variant="danger" title="Clear all weeks"
                                  onClick={() => clearAgentTask(task.id, agent.uid)}>
                                  <TrashIcon s={12}/>
                                </IconBtn>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {agents.length === 0 && (
                      <tr><td colSpan={totalCols} style={{padding:"4px 22px", fontSize:11, color:"#d97706", fontStyle:"italic", background:"#fffbeb"}}>
                        No agents assigned — add in Cost Sheet OPEX tasks.
                      </td></tr>
                    )}

                    {/* ── Gap row ── */}
                    {hasActual && (
                      <tr style={{background:"#f8fafc", borderBottom:"2px solid #e2e8f0"}}>
                        <td colSpan={totalCols} style={{padding:"4px 12px", textAlign:"right"}}>
                          <span style={{fontSize:10, color:"#94a3b8", marginRight:10}}>
                            Plan {planTotal}h · Actual {Math.round(taskActual*10)/10}h
                          </span>
                          <span style={{fontSize:11, fontWeight:800, color:gapColor, background:gapBg,
                            padding:"2px 8px", borderRadius:4, border:`1px solid ${gapBorder}`}}>
                            {gap>0?`▼ ${gap}h under`:gap<0?`▲ ${Math.abs(gap)}h over`:"On plan"}
                          </span>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canEdit && tasks.length > 0 && (
        <div style={{padding:"10px 16px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"flex-end"}}>
          <Btn icon={<CheckIcon s={13}/>} onClick={handleSave} style={{fontSize:12, padding:"6px 16px"}}>Save Time Sheet</Btn>
        </div>
      )}

      {agentSummary.length > 0 && (
        <div style={{padding:"12px 18px", borderTop:"2px solid #f1f5f9"}}>
          <div style={{fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8}}>By Agent Summary</div>
          <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["Agent","Role","Plan hrs","Plan ฿","Actual hrs","Actual ฿","Var hrs","Var ฿"].map((h,i) => (
                  <th key={h} style={{padding:"6px 10px", textAlign:i>=2?"right":"left", fontWeight:700, color:"#64748b", fontSize:11, borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentSummary.map(r => {
                const rate  = RATE_PER_HOUR[r.role] || 948;
                const pB    = r.planHrs * rate;
                const aB    = r.actualHrs * rate;
                const vH    = r.actualHrs - r.planHrs;
                const vB    = aB - pB;
                const vc    = vH < 0 ? "#16a34a" : vH > 0 ? "#dc2626" : "#64748b";
                const roleC = r.role==="Manager"?"#1e40af":r.role==="Senior"?"#7c3aed":"#16a34a";
                const roleBg= r.role==="Manager"?"#dbeafe":r.role==="Senior"?"#ede9fe":"#dcfce7";
                return (
                  <tr key={r.uid} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={{padding:"6px 10px", fontWeight:600, color:"#0f172a"}}>{r.name}</td>
                    <td style={{padding:"6px 10px"}}>
                      <span style={{fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:3, background:roleBg, color:roleC}}>{r.role}</span>
                    </td>
                    <td style={{padding:"6px 10px", textAlign:"right"}}>{r.planHrs}h</td>
                    <td style={{padding:"6px 10px", textAlign:"right"}}>฿{fmt(pB)}</td>
                    <td style={{padding:"6px 10px", textAlign:"right", color:"#1e40af", fontWeight:600}}>{r.actualHrs}h</td>
                    <td style={{padding:"6px 10px", textAlign:"right", color:"#1e40af", fontWeight:600}}>฿{fmt(aB)}</td>
                    <td style={{padding:"6px 10px", textAlign:"right", fontWeight:700, color:vc}}>{vH>0?"+":""}{vH}h</td>
                    <td style={{padding:"6px 10px", textAlign:"right", fontWeight:700, color:vc}}>{vB>0?"+":""}฿{fmt(Math.abs(vB))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {(() => {
                const totPlanHrs   = agentSummary.reduce((s,r) => s+r.planHrs, 0);
                const totActualHrs = agentSummary.reduce((s,r) => s+r.actualHrs, 0);
                const totPlanB     = agentSummary.reduce((s,r) => s+(r.planHrs*(RATE_PER_HOUR[r.role]||948)), 0);
                const totActualB   = agentSummary.reduce((s,r) => s+(r.actualHrs*(RATE_PER_HOUR[r.role]||948)), 0);
                const totVH = totActualHrs - totPlanHrs;
                const totVB = totActualB - totPlanB;
                const vc    = totVH < 0 ? "#16a34a" : totVH > 0 ? "#dc2626" : "#64748b";
                return (
                  <tr style={{borderTop:"2px solid #e2e8f0", background:"#f8fafc"}}>
                    <td colSpan={2} style={{padding:"7px 10px", fontWeight:800, fontSize:12, color:"#0f172a"}}>Total</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800}}>{totPlanHrs}h</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800}}>฿{fmt(totPlanB)}</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800, color:"#1e40af"}}>{totActualHrs}h</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800, color:"#1e40af"}}>฿{fmt(totActualB)}</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800, color:vc}}>{totVH>0?"+":""}{totVH}h</td>
                    <td style={{padding:"7px 10px", textAlign:"right", fontWeight:800, color:vc}}>{totVB>0?"+":""}฿{fmt(Math.abs(totVB))}</td>
                  </tr>
                );
              })()}
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
};

// ── TimesheetPage v2 ──────────────────────────────────────────────────────────
const TimesheetPage = ({user,opps,customers,costSheets,timesheets,onSaveTimesheet,toast,userList}) => {
  // Role routing
  const isManager  = user.role==="manager";
  const isOp       = user.role==="operation";
  const canToggle  = !isManager && !isOp; // sales/admin can toggle
  const [viewMode, setViewMode] = useState(isManager?"manager":isOp?"agent":"manager");
  const effectiveIsManager = viewMode==="manager";
  const [mainTab, setMainTab] = useState("projects"); // "projects" | "summary"

  const [search,  sSearch]  = useState("");
  const [fSvc,    setFSvc]  = useState([]);

  const wonOpps = useMemo(()=>
    opps.filter(o=>o.status==="Won"&&o.jobCode&&o.csCode)
        .filter(o=>{
          const q=search.toLowerCase();
          const c=customers.find(x=>x.id===o.custId);
          const matchSearch = !q||(o.jobCode||"").toLowerCase().includes(q)||(c?.companyEN||"").toLowerCase().includes(q);
          const matchSvc = fSvc.length===0||fSvc.includes(o.serviceCode);
          return matchSearch&&matchSvc;
        })
        .sort((a,b)=>(b.createdDate||"").localeCompare(a.createdDate||""))
  ,[opps,customers,search,fSvc]);

  const getQuoteSnapshot = opp => {
    const cs = costSheets.find(x=>x.serviceCode===opp.serviceCode);
    if(!cs) return null;
    return (cs.saveLog||[])
      .filter(e=>e.quoteSnapshot&&(e.quoteSnapshot.oppCode===opp.oppCode||e.quoteSnapshot.csCode===opp.csCode))
      .sort((a,b)=>(b.ts||"").localeCompare(a.ts||""))
      [0]?.quoteSnapshot||null;
  };

  const getTSRows = oppCode => timesheets.filter(t=>t.oppCode===oppCode);

  // Agent view: filter opps where agent has tasks assigned
  const visibleOpps = useMemo(()=>{
    if(effectiveIsManager) return wonOpps;
    // Agent: only show opps where this agent is in any task's agents[]
    return wonOpps.filter(opp=>{
      const snap = getQuoteSnapshot(opp);
      if(!snap) return false;
      return safeArr(snap.tasks).some(t=>{
        const agents = Array.isArray(t.agents)&&t.agents.length>0&&typeof t.agents[0]==="object"?t.agents:[];
        return agents.some(a=>a.uid===user.id);
      });
    });
  },[wonOpps, effectiveIsManager, costSheets, user.id]);

  // ── Monthly Summary by project ──
  const monthlySummaryByProject = useMemo(() => {
    return wonOpps.map(opp => {
      const cust     = customers.find(c => c.id === opp.custId);
      const snapshot = getQuoteSnapshot(opp);
      if(!snapshot) return null;
      const tasks      = safeArr(snapshot.tasks || []);
      const opexMonths = getOPEXMonths(tasks, null);
      const tsRows     = getTSRows(opp.oppCode);
      const agentMap   = {};
      tasks.forEach(task => {
        const om = opexMonths.find(m => m.payMonth === (task.payMonth||1));
        if(!om) return;
        const mKey = `${om.year}-${pad2(om.month)}`;
        const agents = Array.isArray(task.agents)&&task.agents.length>0&&typeof task.agents[0]==="object"?task.agents:[];
        agents.forEach(agent => {
          if(!agentMap[agent.uid]){
            const u    = USERS.find(x=>x.id===agent.uid);
            const role = (agent.manager||0)>0?"Manager":(agent.senior||0)>0?"Senior":"Junior";
            agentMap[agent.uid] = {uid:agent.uid, name:u?.name||agent.uid, role, months:{}};
          }
          const actual   = tsRows.filter(r=>r.taskId===task.id && r.agentUid===agent.uid && +r.week>0)
                                  .reduce((s,r)=>s + +(r.actualHours||0), 0);
          agentMap[agent.uid].months[mKey] = (agentMap[agent.uid].months[mKey]||0) + actual;
        });
      });
      const months = [...new Set(opexMonths.map(m=>`${m.year}-${pad2(m.month)}`))].sort();
      if(!Object.keys(agentMap).length) return null;
      return {opp, cust, agents:Object.values(agentMap), months};
    }).filter(Boolean);
  }, [wonOpps, timesheets, costSheets, customers]);

  const allSummaryMonths = useMemo(()=>
    [...new Set(monthlySummaryByProject.flatMap(p=>p.months))].sort()
  ,[monthlySummaryByProject]);

  const grandTotalAgents = useMemo(()=>{
    const map = {};
    monthlySummaryByProject.forEach(proj=>{
      proj.agents.forEach(a=>{
        if(!map[a.uid]) map[a.uid]={uid:a.uid,name:a.name,role:a.role,months:{}};
        Object.entries(a.months).forEach(([m,h])=>{ map[a.uid].months[m]=(map[a.uid].months[m]||0)+h; });
      });
    });
    return Object.values(map);
  },[monthlySummaryByProject]);

  // By Agent Summary across all projects
  const allAgentSummary = useMemo(()=>{
    const map = {};
    wonOpps.forEach(opp=>{
      const tsRows = getTSRows(opp.oppCode);
      tsRows.forEach(r=>{
        const k = r.agentUid;
        if(!k) return;
        if(!map[k]){
          const u = (userList||[]).find(x=>x.id===k)||USERS.find(x=>x.id===k)||{name:k,id:k,role:""};
          map[k]={uid:k,name:u.name,role:"",planHours:0,actualHours:0};
        }
        map[k].planHours  += r.planHours||0;
        map[k].actualHours+= r.actualHours||0;
      });
    });
    return Object.values(map);
  },[wonOpps,timesheets,userList]);

  return (
    <div>
      {/* Row 1: Title + job count + view toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Span s={22} w={900} c="#0f172a" style={{letterSpacing:"-0.03em"}}>Time Sheet</Span>
          <CountPill n={visibleOpps.length} label="projects"/>
          {/* Main tab: Projects / Monthly Summary */}
          <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden",marginLeft:8}}>
            {[["projects","Projects"],["summary","Monthly Summary"]].map(([k,l])=>(
              <button key={k} onClick={()=>setMainTab(k)}
                style={{padding:"5px 14px",border:"none",background:mainTab===k?"#0f172a":"#fff",color:mainTab===k?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:mainTab===k?700:400,whiteSpace:"nowrap"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {canToggle&&(
            <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
              {[["manager","Manager View"],["agent","Agent View"]].map(([k,l])=>(
                <button key={k} onClick={()=>setViewMode(k)}
                  style={{padding:"6px 14px",border:"none",background:viewMode===k?"#0f172a":"#fff",color:viewMode===k?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:viewMode===k?700:400,whiteSpace:"nowrap"}}>
                  {l}
                </button>
              ))}
            </div>
          )}
          {!canToggle&&(
            <span style={{fontSize:11,background:"#eff6ff",color:"#1e40af",padding:"3px 10px",borderRadius:10,fontWeight:700}}>
              {isManager?"Manager View":"Agent View"}
            </span>
          )}
        </div>
      </div>
      {/* Row 2: Filter bar */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <FilterIcon/>
        <input value={search} onChange={e=>sSearch(e.target.value)} placeholder="Search…" style={{...SI,width:200,fontSize:13}}/>
        <MultiSelect label="Service" options={SERVICES.map(s=>({value:s.code,label:s.code}))} selected={fSvc} onChange={setFSvc} width={140}/>
      </div>

      {mainTab==="projects" && visibleOpps.length===0&&(
        <Card style={{padding:40,textAlign:"center"}}>
          <Span s={14} c="#94a3b8">{search||fSvc.length?"No matching projects.":effectiveIsManager?"No Won opportunities yet.":"No tasks assigned to you."}</Span>
        </Card>
      )}

      {mainTab==="projects" && visibleOpps.map(opp=>{
        const cust     = customers.find(c=>c.id===opp.custId);
        const snapshot = getQuoteSnapshot(opp);
        const tsRows   = getTSRows(opp.oppCode);
        return (
          <TSTaskGrid key={opp.oppCode}
            opp={opp} cust={cust} snapshot={snapshot}
            tsRows={tsRows}
            onSave={onSaveTimesheet} toast={toast} user={user}
            canEdit={true}
          />
        );
      })}

      {/* ── Monthly Summary view ── */}
      {mainTab==="summary" && (
        <div>
          {monthlySummaryByProject.length===0 && (
            <Card style={{padding:40,textAlign:"center"}}>
              <Span s={14} c="#94a3b8">No timesheet data yet. Save time sheets on projects first.</Span>
            </Card>
          )}
          {monthlySummaryByProject.map(({opp,cust,agents,months})=>{
            const roleC = r=>r==="Manager"?"#1e40af":r==="Senior"?"#7c3aed":"#16a34a";
            const roleBg= r=>r==="Manager"?"#dbeafe":r==="Senior"?"#ede9fe":"#dcfce7";
            return (
              <Card key={opp.oppCode} style={{marginBottom:10,overflow:"hidden"}}>
                {/* Card header */}
                <div style={{padding:"10px 18px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontFamily:"monospace",fontWeight:900,fontSize:14,color:"#0f172a"}}>{opp.jobCode}</span>
                  <SvcBadge code={opp.serviceCode}/>
                  <span style={{fontSize:12,color:"#64748b"}}>{cust?.companyEN||opp.custId}</span>
                </div>
                {/* Summary table */}
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{background:"#f1f5f9"}}>
                        <th style={{padding:"7px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>Agent</th>
                        <th style={{padding:"7px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>Role</th>
                        {months.map(m=>(
                          <th key={m} style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0",borderLeft:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>
                            {MONTHS[+m.split("-")[1]-1]} {m.split("-")[0]}
                          </th>
                        ))}
                        <th style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#0f172a",fontSize:11,borderBottom:"1px solid #e2e8f0",borderLeft:"2px solid #cbd5e1",whiteSpace:"nowrap"}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map(a=>{
                        const rate     = RATE_PER_HOUR[a.role]||948;
                        const totalHrs = Object.values(a.months).reduce((s,h)=>s+h,0);
                        return (
                          <tr key={a.uid} style={{borderBottom:"1px solid #f1f5f9"}}>
                            <td style={{padding:"8px 12px",fontWeight:600,color:"#0f172a",whiteSpace:"nowrap"}}>{a.name}</td>
                            <td style={{padding:"8px 12px"}}>
                              <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:roleBg(a.role),color:roleC(a.role)}}>{a.role}</span>
                            </td>
                            {months.map(m=>{
                              const h=a.months[m]||0;
                              return (
                                <td key={m} style={{padding:"8px 12px",textAlign:"right",borderLeft:"1px solid #f1f5f9",verticalAlign:"top"}}>
                                  {h>0?<><span style={{fontWeight:600,color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#94a3b8"}}>฿{fmt(h*rate)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>}
                                </td>
                              );
                            })}
                            <td style={{padding:"8px 12px",textAlign:"right",borderLeft:"2px solid #cbd5e1",verticalAlign:"top"}}>
                              {totalHrs>0?<><span style={{fontWeight:700,color:"#0f172a"}}>{totalHrs}h</span><br/><span style={{fontSize:10,color:"#94a3b8"}}>฿{fmt(totalHrs*rate)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{background:"#f8fafc",borderTop:"2px solid #e2e8f0"}}>
                        <td colSpan={2} style={{padding:"7px 12px",fontWeight:800,fontSize:12,color:"#0f172a"}}>Total</td>
                        {months.map(m=>{
                          const h=agents.reduce((s,a)=>s+(a.months[m]||0),0);
                          const b=agents.reduce((s,a)=>s+(a.months[m]||0)*(RATE_PER_HOUR[a.role]||948),0);
                          return (
                            <td key={m} style={{padding:"7px 12px",textAlign:"right",borderLeft:"1px solid #e2e8f0",fontWeight:700,verticalAlign:"top"}}>
                              {h>0?<><span style={{color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#64748b"}}>฿{fmt(b)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>}
                            </td>
                          );
                        })}
                        <td style={{padding:"7px 12px",textAlign:"right",borderLeft:"2px solid #cbd5e1",fontWeight:800,verticalAlign:"top"}}>
                          {(()=>{const h=agents.reduce((s,a)=>s+Object.values(a.months).reduce((x,v)=>x+v,0),0);const b=agents.reduce((s,a)=>s+Object.values(a.months).reduce((x,v)=>x+v,0)*(RATE_PER_HOUR[a.role]||948),0);return h>0?<><span style={{color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#64748b"}}>฿{fmt(b)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>;})()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            );
          })}

          {/* Grand Total */}
          {grandTotalAgents.length>0&&(
            <Card style={{marginTop:8,overflow:"hidden",border:"2px solid #cbd5e1"}}>
              <div style={{padding:"10px 18px",background:"#0f172a",display:"flex",alignItems:"center",gap:8}}>
                <Span s={13} w={800} c="#fff">Grand Total — All Projects</Span>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"#f1f5f9"}}>
                      <th style={{padding:"7px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>Agent</th>
                      <th style={{padding:"7px 12px",textAlign:"left",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0"}}>Role</th>
                      {allSummaryMonths.map(m=>(
                        <th key={m} style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#64748b",fontSize:11,borderBottom:"1px solid #e2e8f0",borderLeft:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>
                          {MONTHS[+m.split("-")[1]-1]} {m.split("-")[0]}
                        </th>
                      ))}
                      <th style={{padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#0f172a",fontSize:11,borderBottom:"1px solid #e2e8f0",borderLeft:"2px solid #cbd5e1",whiteSpace:"nowrap"}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grandTotalAgents.map(a=>{
                      const rate=RATE_PER_HOUR[a.role]||948;
                      const totalHrs=Object.values(a.months).reduce((s,h)=>s+h,0);
                      const roleC=a.role==="Manager"?"#1e40af":a.role==="Senior"?"#7c3aed":"#16a34a";
                      const roleBg=a.role==="Manager"?"#dbeafe":a.role==="Senior"?"#ede9fe":"#dcfce7";
                      return (
                        <tr key={a.uid} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"8px 12px",fontWeight:600,color:"#0f172a",whiteSpace:"nowrap"}}>{a.name}</td>
                          <td style={{padding:"8px 12px"}}>
                            <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:roleBg,color:roleC}}>{a.role}</span>
                          </td>
                          {allSummaryMonths.map(m=>{
                            const h=a.months[m]||0;
                            return (
                              <td key={m} style={{padding:"8px 12px",textAlign:"right",borderLeft:"1px solid #f1f5f9",verticalAlign:"top"}}>
                                {h>0?<><span style={{fontWeight:600,color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#94a3b8"}}>฿{fmt(h*rate)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>}
                              </td>
                            );
                          })}
                          <td style={{padding:"8px 12px",textAlign:"right",borderLeft:"2px solid #cbd5e1",verticalAlign:"top"}}>
                            <span style={{fontWeight:700,color:"#0f172a"}}>{totalHrs}h</span><br/>
                            <span style={{fontSize:10,color:"#94a3b8"}}>฿{fmt(totalHrs*rate)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#f8fafc",borderTop:"2px solid #e2e8f0"}}>
                      <td colSpan={2} style={{padding:"7px 12px",fontWeight:800,fontSize:12,color:"#0f172a"}}>Grand Total</td>
                      {allSummaryMonths.map(m=>{
                        const h=grandTotalAgents.reduce((s,a)=>s+(a.months[m]||0),0);
                        const b=grandTotalAgents.reduce((s,a)=>s+(a.months[m]||0)*(RATE_PER_HOUR[a.role]||948),0);
                        return (
                          <td key={m} style={{padding:"7px 12px",textAlign:"right",borderLeft:"1px solid #e2e8f0",fontWeight:700,verticalAlign:"top"}}>
                            {h>0?<><span style={{color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#64748b"}}>฿{fmt(b)}</span></>:<span style={{color:"#e2e8f0"}}>—</span>}
                          </td>
                        );
                      })}
                      <td style={{padding:"7px 12px",textAlign:"right",borderLeft:"2px solid #cbd5e1",fontWeight:800,verticalAlign:"top"}}>
                        {(()=>{const h=grandTotalAgents.reduce((s,a)=>s+Object.values(a.months).reduce((x,v)=>x+v,0),0);const b=grandTotalAgents.reduce((s,a)=>s+Object.values(a.months).reduce((x,v)=>x+v,0)*(RATE_PER_HOUR[a.role]||948),0);return<><span style={{color:"#0f172a"}}>{h}h</span><br/><span style={{fontSize:10,color:"#64748b"}}>฿{fmt(b)}</span></>;})()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* All-project agent summary (Manager view) */}
      {mainTab==="projects" && effectiveIsManager && allAgentSummary.length>0&&(
        <Card style={{marginTop:16,padding:"14px 18px"}}>
          <Span s={13} w={700} c="#0f172a" style={{display:"block",marginBottom:10}}>All Projects — By Agent Summary</Span>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:"#f8fafc"}}>
                {["Agent","Plan hrs","Plan ฿","Actual hrs","Actual ฿","Var hrs","Var ฿"].map((h,i)=>(
                  <th key={h} style={{padding:"6px 10px",textAlign:i>0?"right":"left",color:"#64748b",fontWeight:700,borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAgentSummary.map(r=>{
                const rate=RATE_PER_HOUR[r.role]||948;
                const pB=r.planHours*rate,aB=r.actualHours*rate;
                const vH=r.actualHours-r.planHours;
                const vc=vH<0?"#16a34a":vH>0?"#dc2626":"#64748b";
                return (
                  <tr key={r.uid} style={{borderBottom:"1px solid #f1f5f9"}}>
                    <td style={{padding:"6px 10px",fontWeight:600}}>{r.name}</td>
                    <td style={{padding:"6px 10px",textAlign:"right"}}>{r.planHours}h</td>
                    <td style={{padding:"6px 10px",textAlign:"right"}}>฿{fmt(pB)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",color:"#1e40af",fontWeight:600}}>{r.actualHours}h</td>
                    <td style={{padding:"6px 10px",textAlign:"right",color:"#1e40af",fontWeight:600}}>฿{fmt(aB)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:700,color:vc}}>{vH>0?"+":""}{vH}h</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontWeight:700,color:vc}}>{(aB-pB)>0?"+":""}฿{fmt(Math.abs(aB-pB))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};



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
  {key:"timesheet",label:"Time Sheet"},
];

function App() {
  // S3: Restore session from localStorage — checks expiry timestamp
  const [user,sUser] = useState(()=>loadSession());

  // Hash-based routing — syncs with browser back/forward.
  // Supports an optional sub-path param, e.g. "#costsheet/CS-2569-039".
  const parseHash = () => {
    const raw = location.hash.replace(/^#/, "");
    const [seg, rawParam] = raw.split("/");
    return {
      page:  NAV.find(n=>n.key===seg) ? seg : "dashboard",
      param: rawParam ? decodeURIComponent(rawParam) : null,
    };
  };
  const getPageFromHash = () => parseHash().page;
  const [page,setPageState] = useState(getPageFromHash);
  const sPage = (p) => { location.hash = p; setPageState(p); };
  useEffect(()=>{
    const onHash = () => {
      const {page:hp, param} = parseHash();
      setPageState(hp);
      if(param) sCsCode(param); // forward "#costsheet/<csCode>" deep links; never clear here
    };
    window.addEventListener("hashchange", onHash);
    return ()=>window.removeEventListener("hashchange", onHash);
  },[]);
  const [customers,sCusts]   = useState(SEED_CUSTOMERS);
  const [opps,sOpps]         = useState(SEED_OPPS);
  const [deliveries,sDlv]    = useState(SEED_DELIVERIES);
  const [costSheets,sCS]     = useState(SEED_COST_SHEETS);
  const [initSvcCode,sSvcCode] = useState(null);
  const [initCsCode,sCsCode]   = useState(()=>parseHash().param);
  const [initCustId,sCustId]   = useState(null);
  const [initOppCode,sOppCode] = useState(null);
  const [kpiSplits,sKPI]     = useState({2569:DEFAULT_SPLIT.slice(),2570:DEFAULT_SPLIT.slice(),2571:DEFAULT_SPLIT.slice()});
  const [timesheets,sTS]     = useState([]);
  const [notifications,sNotifs] = useState([]);
  const [bellOpen,sBellOpen] = useState(false);
  const [gsStatus,sGSStatus] = useState("idle"); // "idle"|"loading"|"synced"|"error"
  const [userList,sUserList] = useState([]);      // S2: safe user list {id,name,role} loaded from GS
  const {toasts,show:toast}  = useToast();

  // Strip _json suffix from GAS column names (e.g. saveLog_json → saveLog)
const stripJsonSuffix = obj => {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  
  // First pass: copy all non-_json fields
  Object.keys(obj).forEach(k => {
    if (!k.endsWith("_json")) out[k] = obj[k];
  });
  
  // Second pass: _json fields override only if value is non-empty
  Object.keys(obj).forEach(k => {
    if (k.endsWith("_json")) {
      const clean = k.slice(0, -5);
      let v = obj[k];
      const isEmpty = v === "" || v === null || v === undefined;
      
      if (!isEmpty) {
        // Parse the JSON string back into a usable array/object
        if (typeof v === "string") {
          try {
            v = JSON.parse(v);
          } catch (e) {
            // Failsafe in case of malformed JSON strings
          }
        }
        out[clean] = v;
      }
    }
  });
  return out;
};

  //  Load all data from Google Sheets on mount 
  useEffect(()=>{
    if(!user) return;
    sGSStatus("loading");
    Promise.all([
      gsGet("customers"),
      gsGet("opportunities"),
      gsGet("deliveries"),
      gsGet("costsheets"),
      gsGet("kpi"),
      gsGet("users"),
      gsGet("costsheet_quotes"),
      gsGet("timesheet"),
    ]).then(([c,o,d,cs,k,u,cq,ts])=>{
      if(c.length) sCusts(c.map(x=>stripJsonSuffix({...x,id:String(x.id||"")})));
      if(o.length) sOpps(o.map(x=>stripJsonSuffix({...x,id:String(x.id||""),custId:String(x.custId||"")})));
      if(d.length) sDlv(d.map(x=>{const s=stripJsonSuffix({...x,id:String(x.id||""),custId:String(x.custId||"")});return {...s, totalContractValue: Number(s.totalContractValue)||0, installments: safeArr(s.installments)};}));
      // S2: Populate module-level USERS arrays for all dropdowns/lookups throughout app
      if(u.length){
        const safe = u.map(x=>({id:String(x.id||""),email:String(x.email||""),name:String(x.name||""),role:String(x.role||"")}));
        USERS       = safe;
        SALES_USERS = safe.filter(x=>x.role==="sales");
        OP_USERS    = safe.filter(x=>x.role==="operation");
        MANAGER_USERS = safe.filter(x=>x.role==="manager");
        sUserList(safe);
      }

      // FIX: Build a map of serviceCode → array of parsed quote rows from costsheet_quotes tab.
      // After migrateCostsheetsV6, all per-quotation snapshots live there, NOT inside costsheets.saveLog.
      // We reconstruct synthetic saveLog entries so the existing "Edit" button flow works without UI changes.
      const quotesByServiceCode = {};
      (cq||[]).forEach(row => {
        const parsed = stripJsonSuffix(row);
        const sc = String(parsed.serviceCode||"").trim();
        if(!sc) return;
        if(!quotesByServiceCode[sc]) quotesByServiceCode[sc] = [];
        // v6 merges internal+external costs into a single costs array
        const costs = safeArr(parsed.costs);
        quotesByServiceCode[sc].push({
          id: uid(),
          csCode:          String(parsed.csCode||""),
          oppCode:         String(parsed.oppCode||""),
          quoteNo:         String(parsed.quoteNo||""),
          memoNo:          String(parsed.memoNo||""),
          custId:          String(parsed.custId||""),
          salesAgent:      String(parsed.salesAgent||""),
          contactPersonId: String(parsed.contactPersonId||""),
          salesPrice:      parsed.salesPrice||0,
          discountEnabled: parsed.discountEnabled===true||parsed.discountEnabled==="true",
          discountPct:     +parsed.discountPct||0,
          projectTitle:    String(parsed.projectTitle||""),
          projectScope:    String(parsed.projectScope||""),
          projectMonths:   parsed.projectMonths||3,
          notes:           toItemList(parsed.notes),
          // unified cost rows expected by QuoteCard
          costs:           costs,
          tasks:           safeArr(parsed.tasks),
          installments:    safeArr(parsed.installments),
          lineItems:       safeArr(parsed.lineItems),
          deliverables:    safeArr(parsed.deliverables),
          _savedTs:        String(parsed.savedTs||""),
          _savedBy:        String(parsed.savedBy||""),
        });
      });

      // Merge loaded costSheets — use LAST row per serviceCode (most recent wins)
      // Always clear quoteOverrides on load
      // Backward compat: if GS still has old internalCosts_json/externalCosts_json, merge into costs
      if(cs.length){
        const csMap={};
        cs.forEach(x=>{ if(x.serviceCode) csMap[x.serviceCode]=x; });
        const merged = SEED_COST_SHEETS.map(def=>{
          const fromGS = csMap[def.serviceCode];
          if(!fromGS) return def;
          const stripped = stripJsonSuffix(fromGS);
          // If costs is empty but old fields exist, merge them (backward compat)
          if((!stripped.costs||!stripped.costs.length)){
            const ic = safeArr(stripped.internalCosts);
            const ec = safeArr(stripped.externalCosts);
            if(ic.length||ec.length){
              stripped.costs = [
                ...ic.map(r=>({id:r.id||uid(),label:r.label||"",vendorName:r.vendorName||"",unit:r.unit||"",qty:r.qty||0,rate:r.rate||0,payMonth:r.payMonth||1})),
                ...ec.map(r=>({id:r.id||uid(),label:r.label||"",vendorName:r.vendorName||"",unit:r.unit||"",qty:r.qty||0,rate:r.rate||0,payMonth:r.payMonth||1})),
              ];
            }
          }

          // FIX: Inject synthetic saveLog entries from costsheet_quotes so "Edit" buttons appear.
          // The CostSheetPage reads saveLog[].quoteSnapshot to show past quotations for re-editing.
          // After migration the snapshots moved to the costsheet_quotes tab, so we rebuild them here.
          const existingSaveLog = safeArr(stripped.saveLog);
          const quotesForSvc = quotesByServiceCode[def.serviceCode] || [];

          // Build synthetic log entries from costsheet_quotes rows
          const syntheticLogEntries = quotesForSvc.map(q => ({
            id:   uid(),
            ts:   q._savedTs,
            author: q._savedBy,
            note: `Quotation loaded → ${q.csCode} · ${q.quoteNo}`,
            quoteSnapshot: q,
          }));

          // Deduplicate: keep existing log entries whose quoteNo isn't covered by the sheet data
          // (prevents double entries if saveLog still has some snapshots)
          const coveredQuoteNos = new Set(syntheticLogEntries.map(e=>e.quoteSnapshot.quoteNo));
          const filteredExisting = existingSaveLog.filter(e =>
            !e.quoteSnapshot || !coveredQuoteNos.has(e.quoteSnapshot.quoteNo)
          );

          return {
            ...def,
            ...stripped,
            saveLog: [...filteredExisting, ...syntheticLogEntries],
            quoteOverrides: [], // always clear live overrides on load
          };
        });
        sCS(merged);
      }
      if(k.length){
        const kpiObj={};
        k.forEach(row=>{
          const r = stripJsonSuffix(row); // strips splits_json → splits, saveLog_json → saveLog
          if(!r.year) return;
          kpiObj[r.year] = safeArr(r.splits).length ? r.splits : DEFAULT_SPLIT.slice();
          if(r.annual !== undefined && r.annual !== null && r.annual !== "")
            kpiObj[r.year+"_annual"] = +r.annual;
          if(r.lastYearPO !== undefined && r.lastYearPO !== null && r.lastYearPO !== "")
            kpiObj[r.year+"_lastYearPO"] = +r.lastYearPO;
        });
        if(Object.keys(kpiObj).length) sKPI(p=>({...p,...kpiObj}));
      }
      if(ts&&ts.length){
        sTS(ts.map(r=>stripJsonSuffix({...r})));
      }
      sGSStatus("synced");
    }).catch(()=>sGSStatus("error"));
  },[user]);

  // Fetch notifications for this user + poll every 60s
  const fetchNotifs = useCallback(async () => {
    if(!user) return;
    const all = await gsGet("notifications");
    const mine = all.filter(n => String(n.toUserId) === String(user.id));
    sNotifs(mine.map(n=>({...n, read: n.read==="true"||n.read===true})));
  }, [user]);

  useEffect(()=>{
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return ()=>clearInterval(interval);
  },[fetchNotifs]);

  const markNotifRead = (nId) => {
    sNotifs(p=>p.map(n=>n.id===nId?{...n,read:true}:n));
    gsSave("notifications", {id:nId, read:"true"});
  };
  const markAllRead = () => {
    sNotifs(p=>p.map(n=>({...n,read:true})));
    notifications.filter(n=>!n.read).forEach(n=>gsSave("notifications",{...n,read:"true"}));
  };

  const handleMentionNotify = (toUserId, context, recordId, message) => {
    const n = gsSaveNotification(toUserId, user, context, recordId, message);
    // Add to local state if it's also for this user
    if(toUserId === user.id) sNotifs(p=>[...p,{...n,read:false}]);
  };

  const unreadCount = notifications.filter(n=>!n.read).length;

  // Register save-failure toast so gsSave (module-level) can surface errors
  useEffect(()=>{
    _onSaveError=()=>toast("Save failed","Check your connection and retry","error");
    return()=>{ _onSaveError=null; };
  },[toast]);

  // Close bell on outside click
  const bellRef = useRef();
  useEffect(()=>{
    const h=e=>{ if(bellRef.current&&!bellRef.current.contains(e.target)) sBellOpen(false); };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  // Fields to never persist to the customers sheet
  const CUST_STRIP = ["status","createdDate","workLog_json"];
  const stripCust  = c => { const o={...c}; CUST_STRIP.forEach(k=>delete o[k]); return o; };

  //  saveItem: update local state + push to Google Sheets
  const saveItem = (setter, collection) => item => {
    const norm = (item.custId!==undefined)
      ? {...item,id:String(item.id||""),custId:String(item.custId||"")}
      : {...item,id:String(item.id||"")};
    setter(p => p.find(x=>x.id===norm.id) ? p.map(x=>x.id===norm.id?norm:x) : [...p,norm]);
    if(collection) gsSave(collection, collection==="customers" ? stripCust(norm) : norm);
  };
  //  deleteItem: remove from local state + delete from Google Sheets
  const deleteItem = (setter, collection) => id => {
    setter(p => p.filter(x=>x.id!==id));
    if(collection) gsDelete(collection, id);
  };
  // Pre-computed stable callbacks — avoids creating new fn refs on every render
  const saveCust   = useMemo(()=>saveItem(sCusts,"customers"),[]);
  const deleteCust = useMemo(()=>deleteItem(sCusts,"customers"),[]);
  const deleteOpp  = useMemo(()=>deleteItem(sOpps,"opportunities"),[]);
  const saveDlv    = useMemo(()=>saveItem(sDlv,"deliveries"),[]);
  const deleteDlv  = useMemo(()=>deleteItem(sDlv,"deliveries"),[]);
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
  const saveOpp = useCallback(opp => {
    const prev = opps.find(x => x.id === opp.id);
    const justWon = opp.status === "Won" && prev?.status !== "Won";
    const norm = {
      ...opp,
      id: String(opp.id||""),
      custId: String(opp.custId||""),
      wonDate: justWon ? nowTS() : (opp.wonDate || ""),
    };
    // 1. Build next opps list and update state
    const nextOpps = opps.find(x=>x.id===norm.id)
      ? opps.map(x=>x.id===norm.id ? norm : x)
      : [...opps, norm];
    sOpps(nextOpps);
    // 2. Derive customer status from updated list (UI only — not persisted to sheet)
    if(norm.custId) {
      const newStatus = deriveOppStatus(norm.custId, nextOpps);
      if(newStatus) {
        sCusts(cList => cList.map(c => {
          if(c.id !== norm.custId) return c;
          if(c.status === newStatus) return c;
          return {...c, status: newStatus};
        }));
      }
    }
    // 3. Push opp to GS
    gsSave("opportunities", norm);
  }, [opps]);

  //  saveCS: update local + push to GS (key = serviceCode, strip quoteOverrides before save)
  const saveCS = useCallback(cs => {
    sCS(p => p.find(x=>x.serviceCode===cs.serviceCode)
      ? p.map(x=>x.serviceCode===cs.serviceCode?cs:x)
      : [...p,cs]);
    gsSave("costsheets", {...cs, quoteOverrides:[]});
  }, []);

  //  saveTimesheet: upsert by id
  const saveTimesheet = useCallback(record => {
    const norm = {...record, id: String(record.id||uid())};
    sTS(prev => prev.find(x=>x.id===norm.id) ? prev.map(x=>x.id===norm.id?norm:x) : [...prev,norm]);
    gsSave("timesheet", norm);
  }, []);

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

  if(!user) return <LoginPage onLogin={u=>{ saveSession(u); sUser(u); sPage("dashboard"); }}/>;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'DM Sans','Noto Sans Thai',system-ui,sans-serif",fontSize:15}}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeInUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0} input[type=number]{-moz-appearance:textfield}`}</style>
      {gsStatus==="loading"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(248,250,252,.94)",zIndex:9000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,backdropFilter:"blur(2px)"}}>
          <div style={{width:44,height:44,border:"4px solid #e2e8f0",borderTopColor:BRAND.teal,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
          <div style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>Loading CRM data…</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>Connecting to Google Sheets</div>
        </div>
      )}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:0}}>
          <div onClick={()=>sPage("dashboard")} title="Wave BCG · Climate CRM" style={{display:"flex",alignItems:"center",gap:9,paddingRight:18,borderRight:"1px solid #f1f5f9",marginRight:4,flexShrink:0,cursor:"pointer"}}>
            <span style={{width:28,height:28,borderRadius:7,background:BRAND.teal,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,fontWeight:900,color:"#fff",letterSpacing:"-0.04em"}}>W</span>
            </span>
            <div style={{fontSize:13,fontWeight:900,color:BRAND.navy,letterSpacing:"-0.04em",lineHeight:1.1}}>Climate<br/>CRM</div>
          </div>
          <nav style={{display:"flex",flex:1,overflow:"auto"}}>
            {NAV.map(n=><button key={n.key} onClick={()=>sPage(n.key)} style={{padding:"15px 13px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:page===n.key?800:500,color:page===n.key?BRAND.navy:"#94a3b8",borderBottom:page===n.key?`2.5px solid ${BRAND.teal}`:"2.5px solid transparent",whiteSpace:"nowrap"}}>{n.label}</button>)}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <SyncBadge/>
            {/* Notification Bell */}
            <div ref={bellRef} style={{position:"relative"}}>
              <button onClick={()=>sBellOpen(p=>!p)} style={{position:"relative",border:"none",borderRadius:6,background:"none",padding:"4px 6px",cursor:"pointer",fontSize:18,lineHeight:1,display:"flex",alignItems:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:"#0f172a",display:"block"}}>
                  <path d="M12 2C10.9 2 10 2.9 10 4c0 .1 0 .2.01.3A7.002 7.002 0 0 0 5 11v5l-2 2v1h18v-1l-2-2v-5a7.002 7.002 0 0 0-5.01-6.7C13.99 4.2 14 4.1 14 4c0-1.1-.9-2-2-2zm0 20c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/>
                </svg>
                {unreadCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",borderRadius:"50%",fontSize:9,fontWeight:900,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{unreadCount>9?"9+":unreadCount}</span>}
              </button>
              {bellOpen&&(
                <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:900,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 16px 48px rgba(0,0,0,.18)",width:360,maxHeight:440,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,color:"#0f172a"}}>Notifications</span>
                    {unreadCount>0&&<button onClick={markAllRead} style={{fontSize:11,color:"#1e40af",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Mark all read</button>}
                  </div>
                  <div style={{overflow:"auto",flex:1}}>
                    {notifications.length===0&&<div style={{padding:24,textAlign:"center",color:"#94a3b8",fontSize:13}}>No notifications</div>}
                    {[...notifications].sort((a,b)=>(b.ts||"").localeCompare(a.ts||"")).map(n=>(
                      <div key={n.id} onClick={()=>{markNotifRead(n.id);if(n.context==="OPP"){sOppCode(n.recordId);sPage("opps");}else if(n.context==="Delivery"){sPage("delivery");}sBellOpen(false);}}
                        style={{padding:"10px 16px",borderBottom:"1px solid #f1f5f9",background:n.read?"#fff":"#eff6ff",cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:n.read?"transparent":"#3b82f6",flexShrink:0,marginTop:5}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{n.fromName||n.fromUserId}</span>
                            <span style={{fontSize:9,background:"#f1f5f9",color:"#64748b",padding:"1px 5px",borderRadius:3,fontWeight:700}}>{n.context}</span>
                            <span style={{fontSize:9,color:"#94a3b8",marginLeft:"auto"}}>{n.ts}</span>
                          </div>
                          <div style={{fontSize:12,color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#374151"}}>{user.name}</div>
              <div style={{fontSize:10,color:user.role==="md"?"#0ea5e9":user.role==="admin"?"#16a34a":user.role==="manager"?"#8b5cf6":user.role==="operation"?"#7c3aed":"#1e40af",textTransform:"uppercase",letterSpacing:"0.06em"}}>{user.role}</div>
            </div>
            <button onClick={()=>{ clearSession(); sUser(null); }} style={{padding:"6px 14px",border:"1px solid #e2e8f0",borderRadius:5,background:"#fff",cursor:"pointer",fontSize:13,color:"#64748b"}}>Sign Out</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1440,margin:"0 auto",padding:24}}>
        {page==="dashboard" && <ErrorBoundary><DashboardKPI user={user} customers={customers} opps={opps} deliveries={deliveries} kpiSplits={kpiSplits} setKpiSplits={sKPI} toast={toast} onGoToCS={(code,csCode)=>{sSvcCode(code);if(csCode)sCsCode(csCode);sPage("costsheet");}}/></ErrorBoundary>}
        {page==="customers" && <ErrorBoundary><CustomersPage user={user} customers={customers} opps={opps} onSave={saveCust} onDelete={deleteCust} toast={toast} deliveries={deliveries} initCustId={initCustId} onCustReady={()=>sCustId(null)} userList={userList}/></ErrorBoundary>}
        {page==="opps"      && <ErrorBoundary><OppsPage user={user} customers={customers} opps={opps} onSave={saveOpp} onDelete={deleteOpp} onSaveCS={saveCS} deliveries={deliveries} onSaveDelivery={saveDlv} onDeleteDelivery={deleteDlv} toast={toast} costSheets={costSheets} onGoToCS={(code,csCode)=>{sSvcCode(code);if(csCode)sCsCode(csCode);sPage("costsheet");}} initOppCode={initOppCode} onOppReady={()=>sOppCode(null)} userList={userList} onMentionNotify={handleMentionNotify}/></ErrorBoundary>}
        {page==="delivery"  && <ErrorBoundary><DeliveryPage user={user} customers={customers} opps={opps} deliveries={deliveries} onSave={saveDlv} toast={toast} costSheets={costSheets} onGoToCS={(code,csCode)=>{sSvcCode(code);if(csCode)sCsCode(csCode);sPage("costsheet");}} onGoToCust={id=>{sCustId(id);sPage("customers");}} onGoToOpp={code=>{sOppCode(code);sPage("opps");}} userList={userList} onMentionNotify={handleMentionNotify}/></ErrorBoundary>}
        {page==="costsheet" && <ErrorBoundary><CostSheetPage costSheets={costSheets} onSave={saveCS} customers={customers} opps={opps} user={user} onSaveOpp={saveOpp} toast={toast} initSvcCode={initSvcCode} onSvcReady={()=>sSvcCode(null)} initCsCode={initCsCode} onCsReady={()=>sCsCode(null)}/></ErrorBoundary>}
        {page==="timesheet" && <ErrorBoundary><TimesheetPage user={user} opps={opps} customers={customers} costSheets={costSheets} timesheets={timesheets} onSaveTimesheet={saveTimesheet} toast={toast} userList={userList}/></ErrorBoundary>}
      </div>
      <Toast toasts={toasts}/>
    </div>
  );
}
