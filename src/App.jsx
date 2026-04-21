import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ================================================================
// CONFIG
// ================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbygufiV9WYsb6eslnNW-45stx2fC2t4NzQtKyGyTLmsVDMGGj-AfzrzMs3U3x_Qo7PD/exec";

// ================================================================
// API LAYER
// ================================================================
async function apiGet(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}?${query}`);
  const json = await res.json();
  if (json.status !== 200) throw new Error(json.data?.error || "API Error");
  return json.data;
}

async function apiPost(body = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.status !== 200) throw new Error(json.data?.error || "API Error");
  return json.data;
}

const API = {
  login:         (u, p)    => apiGet({ action: "login", username: u, password: p }),
  getAll:        (sheet)   => apiGet({ action: "getAll", sheet }),
  getCompany:    ()        => apiGet({ action: "getCompany" }),
  insert:        (sheet,d) => apiPost({ action: "insert", sheet, data: d }),
  update:        (sheet,d) => apiPost({ action: "update", sheet, data: d }),
  delete:        (sheet,id)=> apiPost({ action: "delete", sheet, id }),
  batchInsert:   (sheet,d) => apiPost({ action: "batchInsert", sheet, data: d }),
  replaceAll:    (sheet,d) => apiPost({ action: "replaceAll", sheet, data: d }),
  updateCompany: (d)       => apiPost({ action: "updateCompany", data: d }),
};

// ================================================================
// UTILS
// ================================================================
const fmt   = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const today = () => new Date().toISOString().slice(0, 10);

const KAS="1-101", BCA="1-102", MANDIRI="1-103", BNI="1-104";
const PIUTANG="1-105", PPN_MASUKAN="1-106";
const PERSBB="1-201", PERSBJ="1-202";
const HUTANG_U="2-101", PPN_KELUARAN="2-103";
const MODAL="3-101", PENJUALAN="4-101", HPP="5-101", GAJI="5-102";

const genInvNo = (ar) => { const n=ar.map(r=>parseInt((r.invoice||"").replace(/\D/g,""))).filter(Boolean); return `INV-${String(n.length?Math.max(...n)+1:1).padStart(3,"0")}`; };
const genPONo  = (ap) => { const n=ap.map(r=>parseInt((r.invoice||"").replace(/\D/g,""))).filter(Boolean); return `PO-${String(n.length?Math.max(...n)+1:1).padStart(4,"0")}`; };

// CSV
const csvCb = { set: null };
const showCSVModal = (filename, headers, rows) => {
  const csv = [headers.join(","), ...rows.map(r => headers.map(h=>`"${r[h]??""}`).join(","))].join("\n");
  if (typeof csvCb.set === "function") csvCb.set({ filename, csv });
};
function parseCSV(text) {
  const lines = text.trim().split("\n").map(l=>l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers:[], rows:[] };
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
    const obj = {}; headers.forEach((h,i) => obj[h]=vals[i]||""); return obj;
  });
  return { headers, rows };
}

// NAV
const NAV_GROUPS = [
  { id:"laporan",   label:"Laporan",    icon:"📊", tabs:[{id:"Dashboard",label:"Dashboard",icon:"🏠"},{id:"Buku Besar",label:"Buku Besar",icon:"📖"},{id:"Laporan",label:"Laporan",icon:"📈"},{id:"Invoice",label:"Invoice",icon:"🖨️"}] },
  { id:"transaksi", label:"Transaksi",  icon:"📝", tabs:[{id:"Piutang",label:"Piutang",icon:"💳"},{id:"Hutang",label:"Hutang",icon:"📋"},{id:"Jurnal",label:"Jurnal",icon:"📒"}] },
  { id:"master",    label:"Pengaturan", icon:"⚙️", tabs:[{id:"Inventory",label:"Inventory",icon:"📦"},{id:"Master",label:"Master Data",icon:"👥"},{id:"COA",label:"Chart of Accounts",icon:"🧾"}] },
];

// ================================================================
// TOAST
// ================================================================
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type="success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
}
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${t.type==="success"?"bg-green-600":t.type==="error"?"bg-red-600":"bg-blue-600"}`}>
          <span>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ================================================================
// LOGIN PAGE
// ================================================================
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true); setError("");
    try {
      const result = await API.login(username, password);
      if (result.success) onLogin(result.user);
      else setError(result.message || "Username atau password salah");
    } catch (err) {
      setError("Koneksi gagal. Cek internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-black">E</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Mini ERP</h1>
          <p className="text-gray-400 text-sm mt-1">Masuk ke akun Anda</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Username</label>
              <input className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Password</label>
              <input type="password" className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
            </div>
            {error && <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">❌ {error}</div>}
            <button type="submit" disabled={loading||!username||!password} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-40">
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">Mini ERP v10 · Google Sheets</p>
      </div>
    </div>
  );
}

// ================================================================
// LOADING SCREEN
// ================================================================
function LoadingScreen({ message = "Memuat data..." }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-spin">⚙️</div>
        <div className="text-white text-lg font-medium">{message}</div>
        <div className="text-gray-400 text-sm mt-2">Menghubungkan ke Google Sheets...</div>
      </div>
    </div>
  );
}

// ================================================================
// SIDEBAR
// ================================================================
function Sidebar({ tab, setTab, company, isOpen, onClose, user, onLogout }) {
  const [expanded, setExpanded] = useState({ laporan:true, transaksi:true, master:false });
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const handleTab = (t) => { setTab(t); if (window.innerWidth < 768) onClose(); };
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={onClose}/>}
      <aside className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 flex flex-col transition-all duration-300 ${isOpen?"w-64":"w-0 md:w-16"} md:relative overflow-hidden`}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700 min-h-[60px]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">E</div>
          <div className={`transition-opacity duration-200 ${isOpen?"opacity-100":"opacity-0"} overflow-hidden whitespace-nowrap`}>
            <div className="font-bold text-sm leading-tight">{company?.nama || "Mini ERP"}</div>
            <div className="text-gray-400 text-xs">v10 · Sheets</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_GROUPS.map(g => (
            <div key={g.id} className="mb-1">
              <button onClick={() => toggle(g.id)} className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <span className="text-base flex-shrink-0">{g.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wider flex-1 text-left ${isOpen?"opacity-100":"opacity-0"} whitespace-nowrap transition-opacity`}>{g.label}</span>
                {isOpen && <span className="text-xs text-gray-500">{expanded[g.id]?"▾":"▸"}</span>}
              </button>
              {(expanded[g.id] || !isOpen) && g.tabs.map(t => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => handleTab(t.id)} title={t.label}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors relative group ${active?"bg-blue-600 text-white":"text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r"/>}
                    <span className="text-base flex-shrink-0 ml-2">{t.icon}</span>
                    <span className={`text-sm flex-1 text-left ${isOpen?"opacity-100":"opacity-0"} whitespace-nowrap transition-opacity`}>{t.label}</span>
                    {!isOpen && <div className="absolute left-16 bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 hidden md:block">{t.label}</div>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        {/* User info + logout */}
        <div className={`border-t border-gray-700 p-3 transition-opacity ${isOpen?"opacity-100":"opacity-0"}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{user?.nama?.[0]||"U"}</div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{user?.nama}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-xs text-gray-400 hover:text-red-400 py-1 text-left px-1 transition-colors">🚪 Keluar</button>
        </div>
      </aside>
    </>
  );
}

// ================================================================
// SHARED UI COMPONENTS
// ================================================================
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 shadow-xl max-w-sm w-full">
        <div className="text-gray-700 mb-5">{message}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg text-gray-600">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Hapus</button>
        </div>
      </div>
    </div>
  );
}

function CSVOutputModal({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(data.csv).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col" style={{maxHeight:"80vh"}}>
        <div className="flex justify-between items-center p-4 border-b">
          <div><div className="font-bold text-gray-700">📄 {data.filename}</div><div className="text-xs text-gray-400 mt-0.5">Copy → Notepad → Save As "{data.filename}"</div></div>
          <button onClick={onClose} className="text-gray-400 text-xl ml-3">✕</button>
        </div>
        <div className="overflow-auto flex-1 p-4"><pre className="text-xs bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap break-all font-mono">{data.csv}</pre></div>
        <div className="p-4 border-t flex gap-2">
          <button onClick={copy} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${copied?"bg-green-600 text-white":"bg-blue-700 text-white"}`}>{copied?"✓ Tersalin!":"📋 Copy CSV"}</button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm text-gray-600">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function CSVImportModal({ moduleName, requiredHeaders, onImport, onClose, templateRows=[] }) {
  const [mode, setMode] = useState("tambah");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const dlTemplate = () => showCSVModal(`template_${moduleName}.csv`, requiredHeaders, templateRows);
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers, rows } = parseCSV(ev.target.result);
      const missing = requiredHeaders.filter(h => !headers.includes(h));
      if (missing.length) { setError(`Kolom kurang: ${missing.join(", ")}`); setPreview(null); }
      else { setError(""); setPreview({ headers, rows }); }
    };
    reader.readAsText(file);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b"><div className="font-bold text-gray-700">📂 Import — {moduleName}</div><button onClick={onClose} className="text-gray-400 text-xl">✕</button></div>
        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex justify-between items-center">
            <span className="text-sm text-blue-700">Download template CSV</span>
            <button onClick={dlTemplate} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm">⬇ Template</button>
          </div>
          <div className="flex gap-2 mb-3">
            {[["tambah","➕ Tambah"],["replace","🔄 Replace Semua"]].map(([v,l])=>(
              <label key={v} className={`flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-sm ${mode===v?"border-blue-600 bg-blue-50 text-blue-700":"border-gray-200 text-gray-600"}`}>
                <input type="radio" name="mode" checked={mode===v} onChange={()=>setMode(v)} className="hidden"/>{l}
              </label>
            ))}
          </div>
          {mode==="replace" && <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-600 mb-3">⚠️ Semua data lama akan dihapus.</div>}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 mb-3" onClick={()=>fileRef.current.click()}>
            <div className="text-3xl mb-1">📄</div><div className="text-sm text-gray-500">Klik pilih file CSV</div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile}/>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600 mb-2">❌ {error}</div>}
          {preview && <div className="text-sm text-green-600">✓ {preview.rows.length} baris siap diimport</div>}
        </div>
        <div className="flex gap-2 p-4 border-t">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button>
          <button onClick={()=>{ if(preview){ onImport(preview.rows, mode); onClose(); } }} disabled={!preview||!!error} className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-40">Import</button>
        </div>
      </div>
    </div>
  );
}

function BayarModal({ item, tipe, akunKas, onSave, onClose, toast }) {
  const safe = akunKas?.length > 0 ? akunKas : [{ kode: BCA, nama: "Bank BCA" }];
  const [bayar, setBayar] = useState("");
  const [akunDipilih, setAkunDipilih] = useState(safe[0].kode);
  const [referensi, setReferensi] = useState("");
  const sisa = item.jumlah - item.dibayar;
  const melebihi = Number(bayar) > sisa;
  const handleSave = () => {
    if (Number(bayar) <= 0 || melebihi) return;
    onSave(Number(bayar), akunDipilih, referensi);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="font-bold text-gray-700">{tipe==="piutang"?"💰 Terima Pembayaran":"💸 Bayar Hutang"}</div>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-0.5">{tipe==="piutang"?item.pelanggan:item.supplier}</div>
          <div className="font-mono text-blue-600 text-sm mb-3">{item.invoice}</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-400">Total</div><div className="font-medium text-sm">{fmt(item.jumlah)}</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-400">Sisa</div><div className="font-medium text-sm text-orange-600">{fmt(sisa)}</div></div>
          </div>
          <label className="text-xs text-gray-500">{tipe==="piutang"?"Diterima ke Akun":"Dibayar dari Akun"}</label>
          <select className="w-full border rounded-lg p-2.5 text-sm mt-1 mb-3" value={akunDipilih} onChange={e=>setAkunDipilih(e.target.value)}>
            {safe.map(a => <option key={a.kode} value={a.kode}>{a.kode} — {a.nama}</option>)}
          </select>
          <label className="text-xs text-gray-500">Nominal</label>
          <input type="number" className={`w-full border rounded-lg p-3 text-sm mt-1 mb-1 ${melebihi?"border-red-400":""}`} placeholder="Masukkan nominal" value={bayar} onChange={e=>setBayar(e.target.value)} autoFocus/>
          {melebihi && <div className="text-xs text-red-500 mb-2">⚠️ Melebihi sisa ({fmt(sisa)})</div>}
          <label className="text-xs text-gray-500">No. Referensi (opsional)</label>
          <input className="w-full border rounded-lg p-2.5 text-sm mt-1" placeholder="cth: TRF-20250120-001" value={referensi} onChange={e=>setReferensi(e.target.value)}/>
        </div>
        <div className="flex gap-3 p-4 border-t">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button>
          <button onClick={handleSave} disabled={!bayar||Number(bayar)<=0||melebihi}
            className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-40 ${tipe==="piutang"?"bg-yellow-500":"bg-red-600"}`}>
            Catat & Jurnal
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder="🔍 Cari..." }) {
  return <input className="w-full border rounded-lg p-2.5 text-sm mb-4 bg-white" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>;
}

// Syncing indicator
function SyncBadge({ syncing }) {
  if (!syncing) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-blue-700 text-white text-xs px-3 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      Menyimpan...
    </div>
  );
}

// Item table for invoice/PO
function ItemTable({ items, setItems, inventory=[], showInventoryLink=true }) {
  const updItem = (i,k,v) => setItems(its => its.map((it,idx) => {
    if (idx!==i) return it;
    const u={...it,[k]:v};
    u.subtotal = (Number(k==="qty"?v:u.qty)||0)*(Number(k==="harga"?v:u.harga)||0)*(1-(Number(k==="diskon"?v:u.diskon)||0)/100);
    return u;
  }));
  return (
    <div>
      <div className="grid grid-cols-12 gap-1 mb-1 text-xs text-gray-400 px-1">
        <div className="col-span-4">Nama</div><div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Harga</div><div className="col-span-2 text-right">Disc%</div>
        <div className="col-span-1 text-right">Sub</div><div className="col-span-1"/>
      </div>
      {items.map((it,i) => (
        <div key={i} className="grid grid-cols-12 gap-1 mb-2 items-center">
          <div className="col-span-4">
            {showInventoryLink ? (
              <><input list={`item-${i}`} className="w-full border rounded p-1.5 text-sm" placeholder="Nama barang" value={it.nama} onChange={e=>{const p=inventory.find(x=>x.nama===e.target.value);updItem(i,"nama",e.target.value);if(p)updItem(i,"harga",p.hargaJual);}}/><datalist id={`item-${i}`}>{inventory.map(p=><option key={p.id} value={p.nama}/>)}</datalist></>
            ) : (
              <input className="w-full border rounded p-1.5 text-sm" placeholder="Nama barang" value={it.nama} onChange={e=>updItem(i,"nama",e.target.value)}/>
            )}
          </div>
          <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-center" value={it.qty} onChange={e=>updItem(i,"qty",e.target.value)}/></div>
          <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" value={it.harga} onChange={e=>updItem(i,"harga",e.target.value)}/></div>
          <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" placeholder="0" value={it.diskon||""} onChange={e=>updItem(i,"diskon",e.target.value)}/></div>
          <div className="col-span-1 text-xs text-gray-400 text-right">{it.subtotal>0?(it.subtotal/1000000).toFixed(1)+"jt":""}</div>
          <div className="col-span-1 text-center"><button onClick={()=>setItems(its=>its.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs">✕</button></div>
        </div>
      ))}
      <button onClick={()=>setItems(its=>[...its,{nama:"",qty:1,harga:"",diskon:0,subtotal:0}])} className="text-blue-600 text-xs border border-blue-200 px-2 py-1 rounded">+ Item</button>
    </div>
  );
}

function TaxSummary({ items, diskon, setDiskon, ppnPct, setPpnPct, ppnAktif, setPpnAktif }) {
  const subtotal    = items.reduce((s,it)=>s+(it.subtotal||0),0);
  const diskonNom   = subtotal*(diskon/100);
  const dpp         = subtotal-diskonNom;
  const ppnNom      = ppnAktif?dpp*(ppnPct/100):0;
  const total       = dpp+ppnNom;
  return { subtotal, diskonNom, dpp, ppnNom, total, jsx: (
    <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-2">
      <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 flex-1">Diskon</span>
        <div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" placeholder="0" min="0" max="100" value={diskon||""} onChange={e=>setDiskon(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div>
        <span className="text-sm text-red-500 w-24 text-right">({fmt(diskonNom)})</span>
      </div>
      <div className="flex justify-between text-sm font-medium border-t pt-2"><span className="text-gray-600">DPP</span><span>{fmt(dpp)}</span></div>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer flex-1"><input type="checkbox" checked={ppnAktif} onChange={e=>setPpnAktif(e.target.checked)} className="rounded"/><span className="text-sm text-gray-500">PPN</span></label>
        {ppnAktif && <div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" value={ppnPct} onChange={e=>setPpnPct(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div>}
        <span className="text-sm text-gray-600 w-24 text-right">{ppnAktif?fmt(ppnNom):"-"}</span>
      </div>
      <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-blue-700">{fmt(total)}</span></div>
    </div>
  )};
}

// ================================================================
// MODULES
// ================================================================

function Dashboard({ accounts, journals, ar, ap, inventory, getBalance, labaRugi, totalAset }) {
  const totalPiutang = ar.reduce((s,r)=>s+(r.jumlah-r.dibayar),0);
  const totalHutang  = ap.reduce((s,r)=>s+(r.jumlah-r.dibayar),0);
  const lowStock     = inventory.filter(i=>i.stok<=i.minimum);
  const cards = [
    { label:"Total Aset",  value:fmt(totalAset),   color:"bg-blue-600",   icon:"🏦" },
    { label:"Laba/Rugi",   value:fmt(labaRugi),     color:labaRugi>=0?"bg-green-600":"bg-red-600", icon:"📈" },
    { label:"Piutang",     value:fmt(totalPiutang), color:"bg-yellow-500", icon:"💳" },
    { label:"Hutang",      value:fmt(totalHutang),  color:"bg-red-500",    icon:"📋" },
  ];
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-700 mb-4">Ringkasan</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {cards.map(c=><div key={c.label} className={`${c.color} text-white rounded-xl p-4 shadow`}><div className="text-xl mb-1">{c.icon}</div><div className="text-xs opacity-80">{c.label}</div><div className="font-bold mt-1 text-sm">{c.value}</div></div>)}
      </div>
      {lowStock.length>0 && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"><div className="font-semibold text-red-700 mb-2 text-sm">⚠️ Stok Menipis</div>{lowStock.map(i=><div key={i.id} className="text-sm text-red-600">{i.nama} — {i.stok} {i.satuan}</div>)}</div>}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border"><div className="font-semibold text-gray-700 mb-3 text-sm">📥 Piutang Terbaru</div>{ar.slice(0,3).map(r=><div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0"><div><div className="font-medium">{r.pelanggan}</div><div className="text-gray-400 text-xs">{r.invoice} · {r.jatuhTempo}</div></div><div className="text-right"><div className="text-orange-600 font-medium">{fmt(r.jumlah-r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div></div>)}</div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><div className="font-semibold text-gray-700 mb-3 text-sm">📤 Hutang Terbaru</div>{ap.slice(0,3).map(r=><div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0"><div><div className="font-medium">{r.supplier}</div><div className="text-gray-400 text-xs">{r.invoice} · {r.jatuhTempo}</div></div><div className="text-right"><div className="text-red-600 font-medium">{fmt(r.jumlah-r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div></div>)}</div>
      </div>
    </div>
  );
}

function Jurnal({ journals, accounts, onAdd, onDelete, onClear, toast }) {
  const empty = { tanggal:today(), keterangan:"", entries:[{akun:"",posisi:"D",nominal:""},{akun:"",posisi:"K",nominal:""}] };
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const addEntry = () => setForm(f=>({...f,entries:[...f.entries,{akun:"",posisi:"D",nominal:""}]}));
  const updEntry = (i,k,v) => setForm(f=>{const e=[...f.entries];e[i]={...e[i],[k]:v};return{...f,entries:e};});
  const totD = form.entries.filter(e=>e.posisi==="D").reduce((s,e)=>s+(Number(e.nominal)||0),0);
  const totK = form.entries.filter(e=>e.posisi==="K").reduce((s,e)=>s+(Number(e.nominal)||0),0);
  const ok   = totD===totK && totD>0;

  const save = async () => {
    if (!ok||!form.keterangan) return;
    setSaving(true);
    try {
      const j = { ...form, id:Date.now(), auto:false, entries:form.entries.map(e=>({...e,nominal:Number(e.nominal)})) };
      await onAdd(j);
      toast("Jurnal berhasil disimpan");
      setForm(empty); setShow(false);
    } catch(e){ toast("Gagal simpan: "+e.message,"error"); }
    finally { setSaving(false); }
  };

  const doConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type==="all") { await onClear(); toast("Semua jurnal dihapus","error"); }
      else {
        const j = journals.find(x=>x.id===confirm.id);
        if (j?.auto) { toast("Jurnal otomatis tidak bisa dihapus","error"); setConfirm(null); return; }
        await onDelete(confirm.id);
        toast("Jurnal dihapus","error");
      }
    } catch(e){ toast("Gagal hapus: "+e.message,"error"); }
    setConfirm(null);
  };

  const filtered = journals.filter(j=>j.keterangan.toLowerCase().includes(search.toLowerCase())||j.tanggal.includes(search));

  return (
    <div>
      {confirm && <ConfirmDialog message={confirm.type==="all"?"Hapus semua jurnal manual?":"Hapus jurnal ini?"} onConfirm={doConfirm} onCancel={()=>setConfirm(null)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Jurnal Umum</h2>
        <div className="flex gap-2">
          <button onClick={()=>setConfirm({type:"all"})} className="bg-red-100 text-red-600 border border-red-300 px-3 py-2 rounded-lg text-xs">🗑</button>
          <button onClick={()=>setShow(true)} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Tambah</button>
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari keterangan atau tanggal..."/>
      {show && (
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            <div><label className="text-xs text-gray-500">Keterangan</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.keterangan} onChange={e=>setForm(f=>({...f,keterangan:e.target.value}))}/></div>
          </div>
          {form.entries.map((e,i)=>(
            <div key={i} className="grid grid-cols-12 gap-1 mb-2 items-center">
              <div className="col-span-5"><select className="w-full border rounded p-1.5 text-sm" value={e.akun} onChange={v=>updEntry(i,"akun",v.target.value)}><option value="">-- Akun --</option>{accounts.map(a=><option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>)}</select></div>
              <div className="col-span-2"><select className="w-full border rounded p-1.5 text-sm" value={e.posisi} onChange={v=>updEntry(i,"posisi",v.target.value)}><option value="D">D</option><option value="K">K</option></select></div>
              <div className="col-span-4"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" value={e.nominal} onChange={v=>updEntry(i,"nominal",v.target.value)}/></div>
              <div className="col-span-1 text-center"><button onClick={()=>setForm(f=>({...f,entries:f.entries.filter((_,idx)=>idx!==i)}))} className="text-red-400 text-xs">✕</button></div>
            </div>
          ))}
          <div className={`text-xs mb-3 ${ok?"text-green-600":"text-red-500"}`}>D:{fmt(totD)} K:{fmt(totK)} {ok?"✓":"✗"}</div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm">+ Baris</button>
            <button onClick={save} disabled={!ok||!form.keterangan||saving} className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":"Simpan"}</button>
            <button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-1.5 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length===0 && <div className="p-8 text-center text-gray-400">Belum ada jurnal</div>}
        {filtered.map(j=>(
          <div key={j.id} className="border-b last:border-0 p-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-700 text-sm">{j.keterangan}</span>
                {j.auto && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">auto</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{j.tanggal}</span>
                {!j.auto && <button onClick={()=>setConfirm({type:"single",id:j.id})} className="text-red-400 text-xs border border-red-200 px-1.5 py-0.5 rounded">🗑</button>}
              </div>
            </div>
            <table className="w-full text-xs"><tbody>
              {(Array.isArray(j.entries)?j.entries:[]).map((e,i)=>{
                const acc=accounts.find(a=>a.kode===e.akun);
                return(<tr key={i} className="text-gray-600"><td className={`py-0.5 ${e.posisi==="K"?"pl-6":""}`}>{acc?`${acc.kode} - ${acc.nama}`:e.akun}</td><td className="text-right text-blue-700">{e.posisi==="D"?fmt(e.nominal):""}</td><td className="text-right text-green-700">{e.posisi==="K"?fmt(e.nominal):""}</td></tr>);
              })}
            </tbody></table>
          </div>
        ))}
      </div>
    </div>
  );
}

function BukuBesar({ accounts, journals, getBalance }) {
  const [sel, setSel] = useState(BCA);
  const acc = accounts.find(a=>a.kode===sel);
  const lines=[]; let run=0;
  journals.forEach(j=>(Array.isArray(j.entries)?j.entries:[]).forEach(e=>{
    if(e.akun===sel){
      const isD=["Aset","Beban"].includes(acc?.kategori);
      run+=isD?(e.posisi==="D"?e.nominal:-e.nominal):(e.posisi==="K"?e.nominal:-e.nominal);
      lines.push({tanggal:j.tanggal,keterangan:j.keterangan,debit:e.posisi==="D"?e.nominal:0,kredit:e.posisi==="K"?e.nominal:0,saldo:run});
    }
  }));
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Buku Besar</h2>
        <select className="border rounded-lg px-2 py-2 text-sm" value={sel} onChange={e=>setSel(e.target.value)}>
          {accounts.map(a=><option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>)}
        </select>
      </div>
      {acc && <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-blue-800 text-white px-4 py-3"><div className="font-bold text-sm">{acc.kode} - {acc.nama}</div><div className="text-blue-200 text-xs">{acc.subKategori} · Saldo: {fmt(getBalance(acc.kode,acc.kategori))}</div></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 text-gray-500 text-xs border-b"><th className="p-3 text-left">Tgl</th><th className="p-3 text-left">Ket</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Kredit</th><th className="p-3 text-right">Saldo</th></tr></thead>
        <tbody>{lines.map((l,i)=><tr key={i} className="border-b last:border-0"><td className="p-3 text-gray-500 text-xs">{l.tanggal}</td><td className="p-3 text-xs">{l.keterangan}</td><td className="p-3 text-right text-blue-700 text-xs">{l.debit?fmt(l.debit):"-"}</td><td className="p-3 text-right text-green-700 text-xs">{l.kredit?fmt(l.kredit):"-"}</td><td className="p-3 text-right font-medium text-xs">{fmt(l.saldo)}</td></tr>)}
        {lines.length===0&&<tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada transaksi</td></tr>}</tbody></table></div>
      </div>}
    </div>
  );
}

function Piutang({ ar, accounts, inventory, customers, akunKas, onAdd, onUpdate, onImport, onPrint, onAddJournal, toast }) {
  const [show,setShow]=useState(false);
  const [bayarItem,setBayarItem]=useState(null);
  const [showCSV,setShowCSV]=useState(false);
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("Semua");
  const [items,setItems]=useState([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]);
  const [diskon,setDiskon]=useState(0);const [ppnPct,setPpnPct]=useState(11);const [ppnAktif,setPpnAktif]=useState(false);
  const [form,setForm]=useState({tanggal:today(),pelanggan:"",invoice:"",jatuhTempo:"",catatan:""});
  const [saving,setSaving]=useState(false);

  const tax = TaxSummary({items,diskon,setDiskon,ppnPct,setPpnPct,ppnAktif,setPpnAktif});

  const initForm = () => { setForm({tanggal:today(),pelanggan:"",invoice:genInvNo(ar),jatuhTempo:"",catatan:""}); setItems([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]); setDiskon(0);setPpnPct(11);setPpnAktif(false); setShow(true); };

  const save = async () => {
    if (!form.pelanggan||!tax.total) return;
    setSaving(true);
    try {
      const newAR = { ...form, id:Date.now(), jumlah:tax.total, dibayar:0, status:"Belum", items:JSON.stringify(items), diskon, ppnPct:ppnAktif?ppnPct:0, ppnNominal:tax.ppnNom, dpp:tax.dpp };
      await onAdd(newAR);
      const entries=[{akun:PIUTANG,posisi:"D",nominal:tax.total},{akun:PENJUALAN,posisi:"K",nominal:tax.dpp}];
      if(ppnAktif)entries.push({akun:PPN_KELUARAN,posisi:"K",nominal:tax.ppnNom});
      await onAddJournal({ id:Date.now()+1, tanggal:form.tanggal, keterangan:`Penjualan [${form.invoice}] ${form.pelanggan}`, auto:true, entries:JSON.stringify(entries) });
      toast(`Invoice ${form.invoice} berhasil dibuat`);
      setShow(false);
    } catch(e){ toast("Gagal: "+e.message,"error"); }
    finally { setSaving(false); }
  };

  const handleBayar = async (nominal, akunDebit, referensi) => {
    if (!bayarItem) return;
    const nd = Math.min(bayarItem.dibayar+nominal, bayarItem.jumlah);
    const updated = { ...bayarItem, dibayar:nd, status:nd>=bayarItem.jumlah?"Lunas":"Sebagian" };
    try {
      await onUpdate(updated);
      const ket = `Terima Pembayaran [${bayarItem.invoice}] ${bayarItem.pelanggan}${referensi?` - ${referensi}`:""}`;
      await onAddJournal({ id:Date.now(), tanggal:today(), keterangan:ket, auto:true, entries:JSON.stringify([{akun:akunDebit,posisi:"D",nominal},{akun:PIUTANG,posisi:"K",nominal}]) });
      toast(`Pembayaran ${fmt(nominal)} dicatat`);
    } catch(e){ toast("Gagal: "+e.message,"error"); }
  };

  const filtered = ar.filter(r => {
    const ms = r.pelanggan?.toLowerCase().includes(search.toLowerCase())||r.invoice?.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==="Semua"||r.status===filterStatus;
    return ms && mf;
  });

  return (
    <div>
      {bayarItem && <BayarModal item={bayarItem} tipe="piutang" akunKas={akunKas} onSave={handleBayar} onClose={()=>setBayarItem(null)} toast={toast}/>}
      {showCSV && <CSVImportModal moduleName="Piutang" requiredHeaders={["tanggal","pelanggan","invoice","jumlah","dibayar","jatuhTempo"]} templateRows={[{tanggal:"2025-01-15",pelanggan:"PT Contoh",invoice:"INV-001",jumlah:"10000000",dibayar:"0",jatuhTempo:"2025-02-15",catatan:""}]} onImport={(rows,mode)=>{ onImport(rows.map((r,i)=>({...r,id:Date.now()+i,jumlah:Number(r.jumlah)||0,dibayar:Number(r.dibayar)||0,items:"[]",diskon:0,ppnPct:0,ppnNominal:0,dpp:Number(r.jumlah)||0,status:Number(r.dibayar)>=Number(r.jumlah)?"Lunas":Number(r.dibayar)>0?"Sebagian":"Belum"})),mode); toast("Import berhasil"); }} onClose={()=>setShowCSV(false)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Piutang Usaha</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSV(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">📂</button>
          <button onClick={initForm} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Invoice</button>
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari pelanggan atau invoice..."/>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["Semua","Belum","Sebagian","Lunas"].map(s=><button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filterStatus===s?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{s}{s!=="Semua"&&` (${ar.filter(r=>r.status===s).length})`}</button>)}
      </div>
      {show && (
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <div className="font-semibold text-gray-600 mb-3 text-sm">Invoice Baru</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-500">No. Invoice</label><input className="w-full border rounded p-2 text-sm mt-1 bg-gray-50" value={form.invoice} readOnly/></div>
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Pelanggan</label>
              <input list="cust-list" className="w-full border rounded p-2 text-sm mt-1" placeholder="Ketik nama pelanggan..." value={form.pelanggan} onChange={e=>{const c=customers.find(x=>x.nama===e.target.value);setForm(f=>({...f,pelanggan:e.target.value,...(c&&f.tanggal&&c.termin?{jatuhTempo:new Date(new Date(f.tanggal).getTime()+c.termin*86400000).toISOString().slice(0,10)}:{})}));}}/>
              <datalist id="cust-list">{customers.map(c=><option key={c.id} value={c.nama}/>)}</datalist>
            </div>
            <div><label className="text-xs text-gray-500">Jatuh Tempo</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.jatuhTempo} onChange={e=>setForm(f=>({...f,jatuhTempo:e.target.value}))}/></div>
            <div><label className="text-xs text-gray-500">Catatan</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-2">ITEM</div>
          <ItemTable items={items} setItems={setItems} inventory={inventory} showInventoryLink={true}/>
          {tax.jsx}
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={!form.pelanggan||!tax.total||saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":"Simpan & Jurnal"}</button>
            <button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map(r=>(
          <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="font-semibold text-gray-800">{r.pelanggan}</div><div className="text-xs text-blue-600 font-mono">{r.invoice}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
              <div><div>Total</div><div className="font-medium text-gray-700">{fmt(r.jumlah)}</div></div>
              <div><div>Dibayar</div><div className="font-medium text-green-600">{fmt(r.dibayar)}</div></div>
              <div><div>Sisa</div><div className="font-medium text-orange-600">{fmt(r.jumlah-r.dibayar)}</div></div>
            </div>
            <div className="text-xs text-gray-400 mb-3">JT: {r.jatuhTempo}</div>
            <div className="flex gap-2">
              {r.status!=="Lunas" && <button onClick={()=>setBayarItem(r)} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium">💰 Bayar</button>}
              <button onClick={()=>onPrint(r)} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">🖨️ Invoice</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center text-gray-400 py-8">Tidak ada data</div>}
      </div>
    </div>
  );
}

function Hutang({ ap, inventory, suppliers, akunKas, onAdd, onUpdate, onImport, onAddJournal, toast }) {
  const [show,setShow]=useState(false);
  const [bayarItem,setBayarItem]=useState(null);
  const [showCSV,setShowCSV]=useState(false);
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("Semua");
  const [items,setItems]=useState([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]);
  const [diskon,setDiskon]=useState(0);const [ppnPct,setPpnPct]=useState(11);const [ppnAktif,setPpnAktif]=useState(false);
  const [form,setForm]=useState({tanggal:today(),supplier:"",invoice:"",jatuhTempo:""});
  const [saving,setSaving]=useState(false);

  const tax = TaxSummary({items,diskon,setDiskon,ppnPct,setPpnPct,ppnAktif,setPpnAktif});
  const initForm = () => { setForm({tanggal:today(),supplier:"",invoice:genPONo(ap),jatuhTempo:""}); setItems([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]); setDiskon(0);setPpnPct(11);setPpnAktif(false); setShow(true); };

  const save = async () => {
    if (!form.supplier||!tax.total) return;
    setSaving(true);
    try {
      const newAP = { ...form, id:Date.now(), jumlah:tax.total, dibayar:0, status:"Belum", items:JSON.stringify(items), diskon, ppnPct:ppnAktif?ppnPct:0, ppnNominal:tax.ppnNom, dpp:tax.dpp };
      await onAdd(newAP);
      const entries=[{akun:PERSBB,posisi:"D",nominal:tax.dpp},{akun:HUTANG_U,posisi:"K",nominal:tax.total}];
      if(ppnAktif)entries.push({akun:PPN_MASUKAN,posisi:"D",nominal:tax.ppnNom});
      await onAddJournal({ id:Date.now()+1, tanggal:form.tanggal, keterangan:`Pembelian [${form.invoice}] ${form.supplier}`, auto:true, entries:JSON.stringify(entries) });
      toast(`PO ${form.invoice} berhasil dibuat`);
      setShow(false);
    } catch(e){ toast("Gagal: "+e.message,"error"); }
    finally { setSaving(false); }
  };

  const handleBayar = async (nominal, akunKredit, referensi) => {
    if (!bayarItem) return;
    const nd = Math.min(bayarItem.dibayar+nominal, bayarItem.jumlah);
    const updated = { ...bayarItem, dibayar:nd, status:nd>=bayarItem.jumlah?"Lunas":"Sebagian" };
    try {
      await onUpdate(updated);
      const ket = `Bayar Hutang [${bayarItem.invoice}] ${bayarItem.supplier}${referensi?` - ${referensi}`:""}`;
      await onAddJournal({ id:Date.now(), tanggal:today(), keterangan:ket, auto:true, entries:JSON.stringify([{akun:HUTANG_U,posisi:"D",nominal},{akun:akunKredit,posisi:"K",nominal}]) });
      toast(`Pembayaran ${fmt(nominal)} dicatat`);
    } catch(e){ toast("Gagal: "+e.message,"error"); }
  };

  const filtered = ap.filter(r=>{
    const ms=r.supplier?.toLowerCase().includes(search.toLowerCase())||r.invoice?.toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus==="Semua"||r.status===filterStatus);
  });

  return (
    <div>
      {bayarItem && <BayarModal item={bayarItem} tipe="hutang" akunKas={akunKas} onSave={handleBayar} onClose={()=>setBayarItem(null)} toast={toast}/>}
      {showCSV && <CSVImportModal moduleName="Hutang" requiredHeaders={["tanggal","supplier","invoice","jumlah","dibayar","jatuhTempo"]} templateRows={[{tanggal:"2025-01-10",supplier:"PT Supplier",invoice:"PO-0001",jumlah:"5000000",dibayar:"0",jatuhTempo:"2025-02-10"}]} onImport={(rows,mode)=>{ onImport(rows.map((r,i)=>({...r,id:Date.now()+i,jumlah:Number(r.jumlah)||0,dibayar:Number(r.dibayar)||0,items:"[]",diskon:0,ppnPct:0,ppnNominal:0,dpp:Number(r.jumlah)||0,status:Number(r.dibayar)>=Number(r.jumlah)?"Lunas":Number(r.dibayar)>0?"Sebagian":"Belum"})),mode); toast("Import berhasil"); }} onClose={()=>setShowCSV(false)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Hutang Usaha</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSV(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">📂</button>
          <button onClick={initForm} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ PO Baru</button>
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari supplier atau no. PO..."/>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["Semua","Belum","Sebagian","Lunas"].map(s=><button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filterStatus===s?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{s}{s!=="Semua"&&` (${ap.filter(r=>r.status===s).length})`}</button>)}
      </div>
      {show && (
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <div className="font-semibold text-gray-600 mb-3 text-sm">PO Baru</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-500">No. PO</label><input className="w-full border rounded p-2 text-sm mt-1 bg-gray-50" value={form.invoice} readOnly/></div>
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Supplier</label>
              <input list="supp-list" className="w-full border rounded p-2 text-sm mt-1" placeholder="Ketik nama supplier..." value={form.supplier} onChange={e=>{const s=suppliers.find(x=>x.nama===e.target.value);setForm(f=>({...f,supplier:e.target.value,...(s&&f.tanggal?{jatuhTempo:new Date(new Date(f.tanggal).getTime()+s.termin*86400000).toISOString().slice(0,10)}:{})}));}}/>
              <datalist id="supp-list">{suppliers.map(s=><option key={s.id} value={s.nama}/>)}</datalist>
            </div>
            <div><label className="text-xs text-gray-500">Jatuh Tempo</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.jatuhTempo} onChange={e=>setForm(f=>({...f,jatuhTempo:e.target.value}))}/></div>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-2">ITEM</div>
          <ItemTable items={items} setItems={setItems} inventory={[]} showInventoryLink={false}/>
          {tax.jsx}
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={!form.supplier||!tax.total||saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":"Simpan & Jurnal"}</button>
            <button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map(r=>(
          <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="font-semibold text-gray-800">{r.supplier}</div><div className="text-xs text-blue-600 font-mono">{r.invoice}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
              <div><div>Total</div><div className="font-medium text-gray-700">{fmt(r.jumlah)}</div></div>
              <div><div>Dibayar</div><div className="font-medium text-green-600">{fmt(r.dibayar)}</div></div>
              <div><div>Sisa</div><div className="font-medium text-red-600">{fmt(r.jumlah-r.dibayar)}</div></div>
            </div>
            <div className="text-xs text-gray-400 mb-3">JT: {r.jatuhTempo}</div>
            {r.status!=="Lunas" && <button onClick={()=>setBayarItem(r)} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium">💸 Bayar Hutang</button>}
          </div>
        ))}
        {filtered.length===0 && <div className="text-center text-gray-400 py-8">Tidak ada data</div>}
      </div>
    </div>
  );
}

function Inventory({ inventory, onAdd, onUpdate, onImport, onAddJournal, toast }) {
  const [show,setShow]=useState(false);
  const [adj,setAdj]=useState(null);
  const [showCSV,setShowCSV]=useState(false);
  const [search,setSearch]=useState("");
  const [filterKat,setFilterKat]=useState("Semua");
  const [form,setForm]=useState({kode:"",nama:"",kategori:"Bahan Baku",satuan:"Unit",stok:"",hargaBeli:"",hargaJual:"",minimum:""});
  const [qty,setQty]=useState("");const [tipe,setTipe]=useState("masuk");
  const [saving,setSaving]=useState(false);
  const akunPers=(kat)=>kat==="Barang Jadi"?PERSBJ:PERSBB;

  const save = async () => {
    if (!form.nama) return;
    setSaving(true);
    try {
      const stok=Number(form.stok), hargaBeli=Number(form.hargaBeli);
      const item = { ...form, id:Date.now(), stok, hargaBeli, hargaJual:Number(form.hargaJual), minimum:Number(form.minimum) };
      await onAdd(item);
      if(stok>0&&hargaBeli>0) await onAddJournal({ id:Date.now()+1, tanggal:today(), keterangan:`Stok Awal - ${form.nama}`, auto:true, entries:JSON.stringify([{akun:akunPers(form.kategori),posisi:"D",nominal:stok*hargaBeli},{akun:MODAL,posisi:"K",nominal:stok*hargaBeli}]) });
      toast(`Item ${form.nama} ditambahkan`);
      setForm({kode:"",nama:"",kategori:"Bahan Baku",satuan:"Unit",stok:"",hargaBeli:"",hargaJual:"",minimum:""});
      setShow(false);
    } catch(e){ toast("Gagal: "+e.message,"error"); }
    finally { setSaving(false); }
  };

  const saveAdj = async () => {
    const q=Number(qty); if(!q||!adj) return;
    setSaving(true);
    try {
      const nilai=q*adj.hargaBeli, akun=akunPers(adj.kategori);
      const updated={...adj,stok:tipe==="masuk"?adj.stok+q:Math.max(0,adj.stok-q)};
      await onUpdate(updated);
      await onAddJournal({ id:Date.now(), tanggal:today(), keterangan:`Penyesuaian ${tipe==="masuk"?"Masuk":"Keluar"} - ${adj.nama}`, auto:true, entries:JSON.stringify(tipe==="masuk"?[{akun,posisi:"D",nominal:nilai},{akun:MODAL,posisi:"K",nominal:nilai}]:[{akun:HPP,posisi:"D",nominal:nilai},{akun,posisi:"K",nominal:nilai}]) });
      toast(`Stok ${adj.nama} diupdate`);
      setAdj(null); setQty("");
    } catch(e){ toast("Gagal: "+e.message,"error"); }
    finally { setSaving(false); }
  };

  const katList = ["Semua",...new Set(inventory.map(i=>i.kategori))];
  const filtered = inventory.filter(i=>(filterKat==="Semua"||i.kategori===filterKat)&&(i.nama?.toLowerCase().includes(search.toLowerCase())||i.kode?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      {showCSV && <CSVImportModal moduleName="Inventory" requiredHeaders={["kode","nama","kategori","satuan","stok","hargaBeli","hargaJual","minimum"]} templateRows={[{kode:"BB-001",nama:"Baja Plat",kategori:"Bahan Baku",satuan:"Lembar",stok:"100",hargaBeli:"350000",hargaJual:"0",minimum:"20"}]} onImport={(rows,mode)=>{onImport(rows.map((r,i)=>({...r,id:Date.now()+i,stok:Number(r.stok)||0,hargaBeli:Number(r.hargaBeli)||0,hargaJual:Number(r.hargaJual)||0,minimum:Number(r.minimum)||0})),mode);toast("Import berhasil");}} onClose={()=>setShowCSV(false)}/>}
      {adj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="font-bold text-gray-700 mb-1">Penyesuaian Stok</div>
            <div className="text-sm text-gray-500 mb-3">{adj.nama} · Stok: {adj.stok} {adj.satuan}</div>
            <div className="flex gap-2 mb-4">{[["masuk","📥 Masuk"],["keluar","📤 Keluar"]].map(([v,l])=><button key={v} onClick={()=>setTipe(v)} className={`flex-1 py-2 rounded-lg text-sm ${tipe===v?"bg-blue-700 text-white":"border text-gray-600"}`}>{l}</button>)}</div>
            <input type="number" className="w-full border rounded-lg p-3 text-sm mb-4" placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} autoFocus/>
            <div className="flex gap-2">
              <button onClick={()=>{setAdj(null);setQty("");}} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button>
              <button onClick={saveAdj} disabled={!qty||saving} className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-40">{saving?"Menyimpan...":"Simpan"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Inventory</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSV(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">📂</button>
          <button onClick={()=>setShow(true)} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Item</button>
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari nama atau kode..."/>
      <div className="flex gap-2 mb-4 overflow-x-auto">{katList.map(k=><button key={k} onClick={()=>setFilterKat(k)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${filterKat===k?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{k}</button>)}</div>
      {show && (
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm grid grid-cols-2 gap-3">
          {[["kode","Kode","text"],["nama","Nama Item","text"],["satuan","Satuan","text"],["stok","Stok Awal","number"],["hargaBeli","Harga Beli","number"],["hargaJual","Harga Jual","number"],["minimum","Stok Min","number"]].map(([k,l,t])=>(
            <div key={k}><label className="text-xs text-gray-500">{l}</label><input type={t} className="w-full border rounded p-2 text-sm mt-1" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>
          ))}
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}><option>Bahan Baku</option><option>Barang Jadi</option><option>Spare Part</option><option>WIP</option></select></div>
          <div className="col-span-2 flex gap-2"><button onClick={save} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":"Simpan"}</button><button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button></div>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map(i=>(
          <div key={i.id} className={`bg-white rounded-xl border shadow-sm p-4 ${i.stok<=i.minimum?"border-red-200 bg-red-50":""}`}>
            <div className="flex justify-between items-start mb-2">
              <div><div className="font-semibold text-gray-800">{i.nama}</div><div className="text-xs text-gray-400 font-mono">{i.kode}</div></div>
              <div className="flex gap-1"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{i.kategori}</span>{i.stok<=i.minimum&&<span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">⚠️</span>}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-3">
              <div><div>Stok</div><div className={`font-bold text-sm ${i.stok<=i.minimum?"text-red-600":"text-gray-800"}`}>{i.stok} {i.satuan}</div></div>
              <div><div>Min</div><div className="font-medium">{i.minimum}</div></div>
              <div><div>H.Beli</div><div className="font-medium">{fmt(i.hargaBeli)}</div></div>
              <div><div>H.Jual</div><div className="font-medium text-green-600">{i.hargaJual?fmt(i.hargaJual):"—"}</div></div>
            </div>
            <button onClick={()=>setAdj(i)} className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg text-sm">⚙️ Penyesuaian Stok</button>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center text-gray-400 py-8">Tidak ada item</div>}
      </div>
    </div>
  );
}

function COA({ accounts, onAdd, onEdit, onDelete, toast }) {
  const [form,setForm]=useState({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});
  const [editId,setEditId]=useState(null);const [search,setSearch]=useState("");const [saving,setSaving]=useState(false);
  const KATEGORI=["Aset","Kewajiban","Ekuitas","Pendapatan","Beban"];
  const SUB={Aset:["Kas & Setara Kas","Piutang","Persediaan","Aset Tetap","Aset Lainnya"],Kewajiban:["Hutang Jangka Pendek","Hutang Jangka Panjang"],Ekuitas:["Modal","Laba Ditahan"],Pendapatan:["Pendapatan Usaha","Pendapatan Lain-lain"],Beban:["Beban Pokok","Beban Operasional","Beban Lain-lain"]};
  const KCOLORS={Aset:"bg-blue-100 text-blue-700",Kewajiban:"bg-red-100 text-red-700",Ekuitas:"bg-purple-100 text-purple-700",Pendapatan:"bg-green-100 text-green-700",Beban:"bg-orange-100 text-orange-700"};
  const SCOLORS={"Kas & Setara Kas":"bg-emerald-100 text-emerald-700","Piutang":"bg-sky-100 text-sky-700","Persediaan":"bg-amber-100 text-amber-700"};
  const filtered=accounts.filter(a=>a.kode?.includes(search)||a.nama?.toLowerCase().includes(search.toLowerCase()));
  const save=async()=>{
    if(!form.kode||!form.nama)return;
    setSaving(true);
    try {
      if(editId){await onEdit(form);toast("Akun diupdate");setEditId(null);}
      else{if(accounts.find(a=>a.kode===form.kode)){toast("Kode sudah ada!","error");return;}await onAdd(form);toast(`Akun ${form.kode} ditambahkan`);}
      setForm({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});
    }catch(e){toast("Gagal: "+e.message,"error");}
    finally{setSaving(false);}
  };
  const grouped=KATEGORI.map(kat=>{const ki=filtered.filter(a=>a.kategori===kat);const subs=[...new Set(ki.map(a=>a.subKategori||"Lainnya"))];return{kategori:kat,subs:subs.map(sub=>({sub,items:ki.filter(a=>(a.subKategori||"Lainnya")===sub)}))};}).filter(g=>g.subs.some(s=>s.items.length>0));
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-700">Chart of Accounts</h2><div className="text-sm text-gray-400">{accounts.length} akun</div></div>
      <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
        <div className="font-semibold text-gray-600 mb-3 text-sm">{editId?"✏️ Edit":"➕ Tambah"} Akun</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Kode</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.kode} disabled={!!editId} onChange={e=>setForm(f=>({...f,kode:e.target.value}))}/></div>
          <div><label className="text-xs text-gray-500">Nama</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value,subKategori:SUB[e.target.value][0]}))}>{KATEGORI.map(k=><option key={k}>{k}</option>)}</select></div>
          <div><label className="text-xs text-gray-500">Sub Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.subKategori} onChange={e=>setForm(f=>({...f,subKategori:e.target.value}))}>{(SUB[form.kategori]||[]).map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={save} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":editId?"Update":"Tambah"}</button>
          {editId&&<button onClick={()=>{setForm({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});setEditId(null);}} className="text-gray-500 px-3 py-1.5 text-sm border rounded">Batal</button>}
        </div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari akun..."/>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-xs text-emerald-700">💡 Akun <strong>Kas & Setara Kas</strong> muncul sebagai pilihan pembayaran.</div>
      {grouped.map(g=>(
        <div key={g.kategori} className="mb-4">
          <div className="flex items-center gap-2 mb-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${KCOLORS[g.kategori]}`}>{g.kategori}</span></div>
          {g.subs.filter(s=>s.items.length>0).map(({sub,items})=>(
            <div key={sub} className="bg-white rounded-xl shadow-sm border mb-2 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${SCOLORS[sub]||"bg-gray-100 text-gray-600"}`}>{sub}</span>
                <span className="text-gray-400 text-xs">{items.length} akun</span>
                {sub==="Kas & Setara Kas"&&<span className="text-xs text-emerald-600 ml-auto">💳 pilihan bayar</span>}
              </div>
              {items.sort((a,b)=>a.kode?.localeCompare(b.kode)).map(ac=>(
                <div key={ac.kode} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div><div className="font-mono text-blue-700 text-sm">{ac.kode}</div><div className="text-sm">{ac.nama}</div></div>
                  <div className="flex gap-3">
                    <button onClick={()=>{setForm({...ac});setEditId(ac.kode);}} className="text-blue-600 text-xs">Edit</button>
                    <button onClick={async()=>{try{await onDelete(ac.kode);toast("Akun dihapus","error");}catch(e){toast("Gagal: "+e.message,"error");}}} className="text-red-400 text-xs">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Laporan({ accounts, journals, inventory, getBalance, labaRugi }) {
  const [view,setView]=useState("laba");
  const [periodeStart,setPeriodeStart]=useState("2025-01-01");
  const [periodeEnd,setPeriodeEnd]=useState(today());
  const [filterKat,setFilterKat]=useState("Semua");
  const byKat=(kat)=>accounts.filter(a=>a.kategori===kat);
  const sum=(kat)=>byKat(kat).reduce((s,a)=>s+getBalance(a.kode,a.kategori),0);
  const totalAset=sum("Aset"),totalKewajiban=sum("Kewajiban"),totalEkuitas=sum("Ekuitas");
  const totalP=sum("Pendapatan"),totalB=sum("Beban");
  const totalKE=totalKewajiban+totalEkuitas+labaRugi;
  const balanced=Math.abs(totalAset-totalKE)<1;
  const katList=["Semua",...new Set(inventory.map(i=>i.kategori))];
  const filteredInv=inventory.filter(i=>filterKat==="Semua"||i.kategori===filterKat);
  const totalNilaiBeli=filteredInv.reduce((s,i)=>s+i.stok*i.hargaBeli,0);
  const totalNilaiJual=filteredInv.reduce((s,i)=>s+i.stok*(i.hargaJual||0),0);
  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[["laba","📊 Laba Rugi"],["neraca","🏦 Neraca"],["persediaan","📦 Persediaan"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>
        ))}
      </div>
      {view==="laba"&&(
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-bold text-gray-700 mb-4">Laporan Laba Rugi</h3>
          {["Pendapatan","Beban"].map(kat=>(
            <div key={kat} className="mb-4">
              <div className="font-semibold text-gray-600 mb-2 text-sm">{kat}</div>
              {byKat(kat).map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span className={kat==="Beban"?"text-red-600":""}>{kat==="Beban"?`(${fmt(getBalance(a.kode,a.kategori))})`:fmt(getBalance(a.kode,a.kategori))}</span></div>)}
              <div className={`flex justify-between font-semibold border-t pt-2 mt-1 text-sm ${kat==="Beban"?"text-red-600":"text-blue-700"}`}><span>Total {kat}</span><span>{kat==="Beban"?`(${fmt(totalB)})`:fmt(totalP)}</span></div>
            </div>
          ))}
          <div className={`flex justify-between font-bold text-base border-t-2 pt-3 ${labaRugi>=0?"text-green-700":"text-red-700"}`}><span>{labaRugi>=0?"Laba Bersih":"Rugi Bersih"}</span><span>{fmt(Math.abs(labaRugi))}</span></div>
        </div>
      )}
      {view==="neraca"&&(
        <div>
          <div className={`rounded-lg p-3 mb-4 text-sm ${balanced?"bg-green-50 border border-green-200 text-green-700":"bg-red-50 border border-red-200 text-red-600"}`}>{balanced?"✓ Neraca balance":"⚠️ Neraca tidak balance"}</div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5"><h3 className="font-bold text-gray-700 mb-3 text-sm">Aset</h3>{byKat("Aset").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700 text-sm"><span>Total Aset</span><span>{fmt(totalAset)}</span></div></div>
            <div className="bg-white rounded-xl shadow-sm border p-5"><h3 className="font-bold text-gray-700 mb-3 text-sm">Kewajiban & Ekuitas</h3><div className="text-xs font-semibold text-gray-400 mb-1">KEWAJIBAN</div>{byKat("Kewajiban").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="text-xs font-semibold text-gray-400 mb-1 mt-3">EKUITAS</div>{byKat("Ekuitas").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="flex justify-between text-sm py-1"><span className="text-gray-500">Laba Ditahan</span><span className={labaRugi>=0?"text-green-600":"text-red-600"}>{fmt(labaRugi)}</span></div><div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700 text-sm"><span>Total K+E</span><span>{fmt(totalKE)}</span></div></div>
          </div>
        </div>
      )}
      {view==="persediaan"&&(
        <div>
          <div className="bg-white border rounded-xl p-4 mb-4 flex flex-wrap gap-3">
            <div><label className="text-xs text-gray-500">Dari</label><input type="date" className="block border rounded p-2 text-sm mt-1" value={periodeStart} onChange={e=>setPeriodeStart(e.target.value)}/></div>
            <div><label className="text-xs text-gray-500">Sampai</label><input type="date" className="block border rounded p-2 text-sm mt-1" value={periodeEnd} onChange={e=>setPeriodeEnd(e.target.value)}/></div>
            <div><label className="text-xs text-gray-500">Kategori</label><select className="block border rounded p-2 text-sm mt-1" value={filterKat} onChange={e=>setFilterKat(e.target.value)}>{katList.map(k=><option key={k}>{k}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Nilai Beli</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiBeli)}</div></div>
            <div className="bg-green-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Nilai Jual</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiJual)}</div></div>
            <div className="bg-purple-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Margin</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiJual-totalNilaiBeli)}</div></div>
          </div>
          <div className="space-y-3">
            {filteredInv.map(i=>{
              const margin=(i.hargaJual||0)-i.hargaBeli;
              const pct=i.hargaBeli>0?((margin/i.hargaBeli)*100).toFixed(1):0;
              return(
                <div key={i.id} className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2"><div><div className="font-semibold text-gray-800">{i.nama}</div><div className="text-xs text-gray-400 font-mono">{i.kode}</div></div><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{i.kategori}</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded p-2"><div className="text-gray-400">Stok</div><div className="font-bold">{i.stok} {i.satuan}</div></div>
                    <div className="bg-gray-50 rounded p-2"><div className="text-gray-400">Margin/unit</div><div className={`font-medium ${margin>=0?"text-green-600":"text-red-600"}`}>{fmt(margin)} ({pct}%)</div></div>
                    <div className="bg-gray-50 rounded p-2"><div className="text-gray-400">H.Beli</div><div className="font-medium">{fmt(i.hargaBeli)}</div></div>
                    <div className="bg-gray-50 rounded p-2"><div className="text-gray-400">H.Jual</div><div className="font-medium text-green-600">{i.hargaJual?fmt(i.hargaJual):"—"}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MasterData({ customers, suppliers, onAddCustomer, onEditCustomer, onDeleteCustomer, onAddSupplier, onEditSupplier, onDeleteSupplier, toast }) {
  const [view,setView]=useState("customer");
  const [showForm,setShowForm]=useState(false);const [editId,setEditId]=useState(null);const [showCSV,setShowCSV]=useState(false);
  const [search,setSearch]=useState("");const [saving,setSaving]=useState(false);
  const emptyC={kode:"",nama:"",kontak:"",telp:"",email:"",alamat:"",npwp:"",limit:"",termin:""};
  const emptyS={kode:"",nama:"",kontak:"",telp:"",email:"",alamat:"",npwp:"",termin:""};
  const [form,setForm]=useState(emptyC);
  const isC=view==="customer";
  const data=isC?customers:suppliers;

  const switchView=(v)=>{setView(v);setShowForm(false);setEditId(null);setForm(v==="customer"?emptyC:emptyS);setSearch("");};
  const save=async()=>{
    if(!form.nama)return;
    setSaving(true);
    try{
      const p={...form,id:editId||Date.now(),limit:Number(form.limit)||0,termin:Number(form.termin)||0};
      if(editId){isC?await onEditCustomer(p):await onEditSupplier(p);toast(`${form.nama} diupdate`);}
      else{isC?await onAddCustomer(p):await onAddSupplier(p);toast(`${form.nama} ditambahkan`);}
      setForm(isC?emptyC:emptyS);setShowForm(false);setEditId(null);
    }catch(e){toast("Gagal: "+e.message,"error");}
    finally{setSaving(false);}
  };

  const fields=isC?[["kode","Kode"],["nama","Nama"],["kontak","Kontak"],["telp","Telp"],["email","Email"],["alamat","Alamat"],["npwp","NPWP"],["limit","Credit Limit"],["termin","Termin (hari)"]]:
                   [["kode","Kode"],["nama","Nama"],["kontak","Kontak"],["telp","Telp"],["email","Email"],["alamat","Alamat"],["npwp","NPWP"],["termin","Termin (hari)"]];
  const filtered=data.filter(d=>d.nama?.toLowerCase().includes(search.toLowerCase())||d.kode?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Master Data</h2>
        <button onClick={()=>{setShowForm(true);setEditId(null);setForm(isC?emptyC:emptyS);}} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Tambah</button>
      </div>
      <div className="flex gap-2 mb-4">
        {[["customer","👤 Customer"],["supplier","🏭 Supplier"]].map(([v,l])=><button key={v} onClick={()=>switchView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>)}
        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length}/{data.length}</span>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder={`🔍 Cari ${isC?"pelanggan":"supplier"}...`}/>
      {showForm&&(
        <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
          <div className="font-semibold text-gray-600 mb-3 text-sm">{editId?"✏️ Edit":"➕ Tambah"} {isC?"Customer":"Supplier"}</div>
          <div className="grid grid-cols-2 gap-3">{fields.map(([k,l])=><div key={k}><label className="text-xs text-gray-500">{l}</label><input className="w-full border rounded p-2 text-sm mt-1" value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>)}</div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">{saving?"Menyimpan...":editId?"Update":"Simpan"}</button>
            <button onClick={()=>{setShowForm(false);setEditId(null);}} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map(item=>(
          <div key={item.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="font-semibold text-gray-800">{item.nama}</div><div className="text-xs font-mono text-blue-600">{item.kode}</div></div>
              <div className="flex gap-2">
                <button onClick={()=>{setForm({...item});setEditId(item.id);setShowForm(true);}} className="text-blue-600 text-xs border border-blue-200 px-2 py-1 rounded">Edit</button>
                <button onClick={async()=>{try{isC?await onDeleteCustomer(item.id):await onDeleteSupplier(item.id);toast(`${item.nama} dihapus`,"error");}catch(e){toast("Gagal: "+e.message,"error");}}} className="text-red-400 text-xs border border-red-200 px-2 py-1 rounded">Hapus</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <div>👤 {item.kontak}</div><div>📞 {item.telp}</div>
              <div className="col-span-2">📧 {item.email}</div>
              {item.alamat&&<div className="col-span-2">📍 {item.alamat}</div>}
              <div>{isC?`💳 ${fmt(item.limit||0)}`:`⏱ ${item.termin} hari`}</div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div className="text-center text-gray-400 py-8">Tidak ada data</div>}
      </div>
    </div>
  );
}

function InvoicePreview({ invoice, template, company }) {
  const printPDF = () => {
    const itemsHTML = (Array.isArray(invoice.items)?invoice.items:JSON.parse(invoice.items||"[]")).map((it,i)=>`
      <tr style="border-bottom:1px solid #f0f0f0">
        <td style="padding:8px 10px;color:#666">${i+1}</td>
        <td style="padding:8px 10px">${it.nama}</td>
        <td style="padding:8px 10px;text-align:center">${it.qty}</td>
        <td style="padding:8px 10px;text-align:right">${fmt(it.harga)}</td>
        <td style="padding:8px 10px;text-align:right;font-weight:500">${fmt(it.subtotal)}</td>
      </tr>`).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${invoice.invoice}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1f2937;padding:30px}@media print{body{padding:0}}</style></head><body>
      <div style="background:${template.primaryColor};color:white;padding:28px;border-radius:10px 10px 0 0">
        <div style="display:flex;justify-content:space-between">
          <div><div style="font-size:20px;font-weight:700">${company?.nama||""}</div><div style="font-size:12px;opacity:0.85">${company?.alamat||""}</div><div style="font-size:12px;opacity:0.85">${company?.telp||""} | ${company?.email||""}</div></div>
          <div style="text-align:right"><div style="font-size:28px;font-weight:900;opacity:0.2;letter-spacing:4px">INVOICE</div><div style="font-size:18px;font-weight:700">${invoice.invoice}</div></div>
        </div>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
          <div><div style="font-size:11px;color:#9ca3af;text-transform:uppercase">KEPADA</div><div style="font-size:18px;font-weight:700">${invoice.pelanggan}</div></div>
          <div style="text-align:right"><div style="font-size:11px;color:#9ca3af">TANGGAL</div><div>${invoice.tanggal}</div><div style="font-size:11px;color:#9ca3af;margin-top:8px">JATUH TEMPO</div><div style="color:#dc2626">${invoice.jatuhTempo||"-"}</div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead><tr style="background:${template.accent}"><th style="padding:10px;text-align:left;font-size:12px;color:${template.primaryColor}">#</th><th style="padding:10px;text-align:left;font-size:12px;color:${template.primaryColor}">Nama Barang</th><th style="padding:10px;text-align:center;font-size:12px;color:${template.primaryColor}">Qty</th><th style="padding:10px;text-align:right;font-size:12px;color:${template.primaryColor}">Harga</th><th style="padding:10px;text-align:right;font-size:12px;color:${template.primaryColor}">Subtotal</th></tr></thead>
          <tbody>${itemsHTML}<tr style="background:${template.primaryColor}"><td colspan="4" style="text-align:right;padding:10px;color:white;font-weight:bold">TOTAL</td><td style="padding:10px;color:white;font-weight:bold">${fmt(invoice.jumlah)}</td></tr></tbody>
        </table>
        ${invoice.catatan?`<div style="background:#f9fafb;padding:12px;border-radius:6px;font-size:13px"><strong>Catatan:</strong> ${invoice.catatan}</div>`:""}
        ${template.showSignature?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px"><div style="text-align:center"><div style="border-top:1px solid #ccc;margin-top:50px;padding-top:8px;font-size:12px;color:#666">Pelanggan<br/><strong>${invoice.pelanggan}</strong></div></div><div style="text-align:center"><div style="border-top:1px solid #ccc;margin-top:50px;padding-top:8px;font-size:12px;color:#666">Hormat Kami<br/><strong>${company?.nama||""}</strong></div></div></div>`:""}
        <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">${template.footerText}</div>
      </div></body></html>`;
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`Invoice_${invoice.invoice}.html`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  };
  const parsedItems = Array.isArray(invoice.items)?invoice.items:(typeof invoice.items==="string"?JSON.parse(invoice.items||"[]"):[]);
  return (
    <div>
      <div className="bg-white rounded-xl overflow-hidden shadow border">
        <div className="p-5 text-white" style={{background:template.primaryColor}}>
          <div className="flex justify-between items-start">
            <div><div className="font-bold text-lg">{company?.nama}</div><div className="text-xs opacity-80">{company?.alamat}</div></div>
            <div className="text-right"><div className="text-xs opacity-30 font-black tracking-widest">INVOICE</div><div className="font-bold">{invoice.invoice}</div></div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><div className="text-xs text-gray-400 uppercase mb-1">Kepada</div><div className="font-bold">{invoice.pelanggan}</div></div>
            <div className="text-right"><div className="text-xs text-gray-400">Tgl: {invoice.tanggal}</div><div className="text-xs text-red-600 mt-1">JT: {invoice.jatuhTempo}</div></div>
          </div>
          <table className="w-full text-sm mb-3">
            <thead><tr className="text-xs font-semibold" style={{background:template.accent,color:template.primaryColor}}><th className="p-2 text-left">#</th><th className="p-2 text-left">Barang</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Harga</th><th className="p-2 text-right">Sub</th></tr></thead>
            <tbody>
              {parsedItems.map((it,i)=><tr key={i} className="border-b"><td className="p-2 text-gray-400">{i+1}</td><td className="p-2">{it.nama}</td><td className="p-2 text-center">{it.qty}</td><td className="p-2 text-right">{fmt(it.harga)}</td><td className="p-2 text-right font-medium">{fmt(it.subtotal)}</td></tr>)}
              <tr style={{background:template.primaryColor}} className="text-white font-bold"><td colSpan={4} className="p-3 text-right">TOTAL</td><td className="p-3 text-right">{fmt(invoice.jumlah)}</td></tr>
            </tbody>
          </table>
          {template.showSignature&&<div className="grid grid-cols-2 gap-8 mt-6"><div className="text-center"><div className="border-t mt-10 pt-2 text-xs text-gray-500">Pelanggan<br/>{invoice.pelanggan}</div></div><div className="text-center"><div className="border-t mt-10 pt-2 text-xs text-gray-500">Hormat Kami<br/>{company?.nama}</div></div></div>}
          <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t">{template.footerText}</div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-xs text-blue-700">💡 File HTML didownload → buka di browser → Ctrl+P → Save as PDF</div>
      <button onClick={printPDF} className="w-full mt-3 bg-blue-700 text-white py-3 rounded-xl font-medium">⬇ Download Invoice</button>
    </div>
  );
}

function InvoiceModule({ ar, templates, setTemplates, company, setCompany, printTarget, toast }) {
  const [view,setView]=useState(printTarget?"preview":"list");
  const [selectedAR,setSelectedAR]=useState(printTarget||null);
  const [selTpl,setSelTpl]=useState(templates[0]||{id:1,nama:"Default",primaryColor:"#1e40af",accent:"#dbeafe",footerText:"Terima kasih.",showSignature:true,logo:""});
  const [search,setSearch]=useState("");
  const filtered=ar.filter(r=>r.pelanggan?.toLowerCase().includes(search.toLowerCase())||r.invoice?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Invoice</h2>
        <div className="flex gap-2">{[["list","📋"],["company","🏢"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} className={`px-3 py-2 rounded-lg text-sm ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>)}</div>
      </div>
      {view==="list"&&(
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="🔍 Cari pelanggan atau invoice..."/>
          <div className="space-y-3">
            {filtered.map(r=>(
              <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div><div className="font-semibold text-gray-800">{r.pelanggan}</div><div className="text-xs font-mono text-blue-600">{r.invoice}</div></div>
                  <span className={`px-2 py-1 rounded-full text-xs ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">Total: <strong>{fmt(r.jumlah)}</strong></div>
                <button onClick={()=>{setSelectedAR(r);setView("preview");}} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">🖨️ Cetak Invoice</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {view==="preview"&&selectedAR&&(
        <div>
          <button onClick={()=>setView("list")} className="text-blue-600 text-sm mb-4 hover:underline">← Kembali</button>
          <InvoicePreview invoice={selectedAR} template={selTpl} company={company}/>
        </div>
      )}
      {view==="company"&&(
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="font-bold text-gray-700 mb-4">🏢 Data Perusahaan</div>
          <div className="space-y-3">{[["nama","Nama"],["alamat","Alamat"],["telp","Telepon"],["email","Email"],["npwp","NPWP"]].map(([k,l])=><div key={k}><label className="text-xs text-gray-500">{l}</label><input className="w-full border rounded p-2 text-sm mt-1" value={company?.[k]||""} onChange={e=>setCompany(c=>({...c,[k]:e.target.value}))}/></div>)}</div>
          <button onClick={async()=>{try{await API.updateCompany(company);toast("Data perusahaan disimpan");}catch(e){toast("Gagal: "+e.message,"error");}}} className="mt-4 bg-blue-700 text-white px-4 py-2 rounded text-sm">Simpan</button>
        </div>
      )}
    </div>
  );
}

// ================================================================
// APP ROOT
// ================================================================
export default function App() {
  const [user, setUser]       = useState(null);
  const [tab, setTab]         = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [csvModal, setCSVModal] = useState(null);
  const { toasts, addToast } = useToast();
  csvCb.set = setCSVModal;

  // Data state — semua dari Sheets
  const [accounts,  setAccounts]  = useState([]);
  const [journals,  setJournals]  = useState([]);
  const [ar,        setAr]        = useState([]);
  const [ap,        setAp]        = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [templates, setTemplates] = useState([{id:1,nama:"Standard",primaryColor:"#1e40af",accent:"#dbeafe",footerText:"Terima kasih.",showSignature:true,logo:""}]);
  const [company,   setCompany]   = useState({nama:"",alamat:"",telp:"",email:"",npwp:""});

  // Load data dari Sheets
  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [acc,jrn,arData,apData,inv,cust,supp,comp] = await Promise.all([
        API.getAll("accounts"), API.getAll("journals"),
        API.getAll("ar"),       API.getAll("ap"),
        API.getAll("inventory"),API.getAll("customers"),
        API.getAll("suppliers"),API.getCompany(),
      ]);
      setAccounts(acc||[]);  setJournals(jrn||[]);
      setAr(arData||[]);     setAp(apData||[]);
      setInventory(inv||[]); setCustomers(cust||[]);
      setSuppliers(supp||[]);
      if(comp) setCompany(comp);
    } catch(e){ setError("Gagal load data: "+e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if(user) loadAll(); }, [user, loadAll]);

  // Refresh saat pindah tab
  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [tab]); // eslint-disable-line

  // Helper: wrap dengan syncing indicator
  const sync = async (fn) => { setSyncing(true); try{ await fn(); }finally{ setSyncing(false); } };

  // Journal helpers
  const addJournal = (j) => sync(async()=>{ await API.insert("journals",j); setJournals(js=>[...js,j]); });
  const deleteJournal = (id) => sync(async()=>{ await API.delete("journals",id); setJournals(js=>js.filter(j=>j.id!==id)); });
  const clearJournals = () => sync(async()=>{ await API.replaceAll("journals",[]); setJournals([]); });

  // AR helpers
  const addAR = (d) => sync(async()=>{ await API.insert("ar",d); setAr(a=>[...a,d]); });
  const updateAR = (d) => sync(async()=>{ await API.update("ar",d); setAr(a=>a.map(r=>r.id===d.id?d:r)); });
  const importAR = (rows,mode) => sync(async()=>{ mode==="replace"?await API.replaceAll("ar",rows):await API.batchInsert("ar",rows); mode==="replace"?setAr(rows):setAr(a=>[...a,...rows]); });

  // AP helpers
  const addAP = (d) => sync(async()=>{ await API.insert("ap",d); setAp(a=>[...a,d]); });
  const updateAP = (d) => sync(async()=>{ await API.update("ap",d); setAp(a=>a.map(r=>r.id===d.id?d:r)); });

  // Inventory helpers
  const addInv = (d) => sync(async()=>{ await API.insert("inventory",d); setInventory(i=>[...i,d]); });
  const updateInv = (d) => sync(async()=>{ await API.update("inventory",d); setInventory(i=>i.map(x=>x.id===d.id?d:x)); });
  const importInv = (rows,mode) => sync(async()=>{ mode==="replace"?await API.replaceAll("inventory",rows):await API.batchInsert("inventory",rows); mode==="replace"?setInventory(rows):setInventory(i=>[...i,...rows]); });

  // Customer/Supplier helpers
  const addCust   = (d) => sync(async()=>{ await API.insert("customers",d);   setCustomers(c=>[...c,d]); });
  const editCust  = (d) => sync(async()=>{ await API.update("customers",d);   setCustomers(c=>c.map(x=>x.id===d.id?d:x)); });
  const delCust   = (id)=> sync(async()=>{ await API.delete("customers",id);  setCustomers(c=>c.filter(x=>x.id!==id)); });
  const addSupp   = (d) => sync(async()=>{ await API.insert("suppliers",d);   setSuppliers(s=>[...s,d]); });
  const editSupp  = (d) => sync(async()=>{ await API.update("suppliers",d);   setSuppliers(s=>s.map(x=>x.id===d.id?d:x)); });
  const delSupp   = (id)=> sync(async()=>{ await API.delete("suppliers",id);  setSuppliers(s=>s.filter(x=>x.id!==id)); });

  // COA helpers
  const addAcc = (d) => sync(async()=>{ await API.insert("accounts",d); setAccounts(a=>[...a,d]); });
  const editAcc= (d) => sync(async()=>{ await API.update("accounts",d); setAccounts(a=>a.map(x=>x.kode===d.kode?d:x)); });
  const delAcc = (kode)=>sync(async()=>{ await API.delete("accounts",kode); setAccounts(a=>a.filter(x=>x.kode!==kode)); });

  // Balance calculation
  const balances = useMemo(() => {
    const b = {};
    accounts.forEach(a => b[a.kode]={debit:0,kredit:0});
    journals.forEach(j => {
      const entries = Array.isArray(j.entries)?j.entries:(typeof j.entries==="string"?JSON.parse(j.entries||"[]"):[]);
      entries.forEach(e => {
        if(!b[e.akun]) b[e.akun]={debit:0,kredit:0};
        if(e.posisi==="D") b[e.akun].debit+=Number(e.nominal)||0;
        else b[e.akun].kredit+=Number(e.nominal)||0;
      });
    });
    return b;
  }, [journals, accounts]);

  const getBalance = (kode, kategori) => {
    const b = balances[kode]||{debit:0,kredit:0};
    return ["Aset","Beban"].includes(kategori)?b.debit-b.kredit:b.kredit-b.debit;
  };

  const labaRugi = accounts.filter(a=>a.kategori==="Pendapatan").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0)
                 - accounts.filter(a=>a.kategori==="Beban").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0);
  const totalAset = accounts.filter(a=>a.kategori==="Aset").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0);
  const akunKas   = accounts.filter(a=>a.subKategori==="Kas & Setara Kas");

  const currentGroup   = NAV_GROUPS.find(g=>g.tabs.some(t=>t.id===tab));
  const currentTabMeta = NAV_GROUPS.flatMap(g=>g.tabs).find(t=>t.id===tab);

  // ── RENDER ──────────────────────────────────────────────────
  if (!user) return <Login onLogin={setUser}/>;
  if (loading) return <LoadingScreen message="Memuat data dari Google Sheets..."/>;
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <div className="text-white text-lg font-medium mb-2">Gagal terhubung</div>
        <div className="text-gray-400 text-sm mb-6">{error}</div>
        <button onClick={loadAll} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">Coba Lagi</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      <Toast toasts={toasts}/>
      <SyncBadge syncing={syncing}/>
      {csvModal && <CSVOutputModal data={csvModal} onClose={()=>setCSVModal(null)}/>}

      <Sidebar tab={tab} setTab={setTab} company={company} isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} user={user} onLogout={()=>{ setUser(null); setAccounts([]); setJournals([]); setAr([]); setAp([]); setInventory([]); setCustomers([]); setSuppliers([]); }}/>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={()=>setSidebarOpen(o=>!o)} className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <span>{currentGroup?.icon}</span><span>{currentGroup?.label}</span><span>›</span>
              <span className="text-gray-700 font-medium">{currentTabMeta?.label||tab}</span>
            </div>
          </div>
          <button onClick={loadAll} className="text-gray-400 hover:text-blue-600 p-1 rounded" title="Refresh data">🔄</button>
          <div className="text-xs text-gray-400 hidden sm:block">{today()}</div>
        </div>

        <div className="flex-1 p-4 max-w-3xl w-full mx-auto">
          {tab==="Dashboard" && <Dashboard accounts={accounts} journals={journals} ar={ar} ap={ap} inventory={inventory} getBalance={getBalance} labaRugi={labaRugi} totalAset={totalAset}/>}
          {tab==="Jurnal"    && <Jurnal journals={journals} accounts={accounts} onAdd={addJournal} onDelete={deleteJournal} onClear={clearJournals} toast={addToast}/>}
          {tab==="Buku Besar"&& <BukuBesar accounts={accounts} journals={journals} getBalance={getBalance}/>}
          {tab==="Piutang"   && <Piutang ar={ar} accounts={accounts} inventory={inventory} customers={customers} akunKas={akunKas} onAdd={addAR} onUpdate={updateAR} onImport={importAR} onPrint={r=>{setPrintTarget(r);setTab("Invoice");}} onAddJournal={addJournal} toast={addToast}/>}
          {tab==="Hutang"    && <Hutang ap={ap} inventory={inventory} suppliers={suppliers} akunKas={akunKas} onAdd={addAP} onUpdate={updateAP} onImport={(rows,mode)=>sync(async()=>{ mode==="replace"?await API.replaceAll("ap",rows):await API.batchInsert("ap",rows); mode==="replace"?setAp(rows):setAp(a=>[...a,...rows]); })} onAddJournal={addJournal} toast={addToast}/>}
          {tab==="Inventory" && <Inventory inventory={inventory} onAdd={addInv} onUpdate={updateInv} onImport={importInv} onAddJournal={addJournal} toast={addToast}/>}
          {tab==="Laporan"   && <Laporan accounts={accounts} journals={journals} inventory={inventory} getBalance={getBalance} labaRugi={labaRugi}/>}
          {tab==="COA"       && <COA accounts={accounts} onAdd={addAcc} onEdit={editAcc} onDelete={delAcc} toast={addToast}/>}
          {tab==="Invoice"   && <InvoiceModule ar={ar} templates={templates} setTemplates={setTemplates} company={company} setCompany={setCompany} printTarget={printTarget} toast={addToast}/>}
          {tab==="Master"    && <MasterData customers={customers} suppliers={suppliers} onAddCustomer={addCust} onEditCustomer={editCust} onDeleteCustomer={delCust} onAddSupplier={addSupp} onEditSupplier={editSupp} onDeleteSupplier={delSupp} toast={addToast}/>}
        </div>
      </div>
    </div>
  );
}