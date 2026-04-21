import { useState, useMemo, useRef } from "react";

const fmt = (n) => "Rp " + Number(n||0).toLocaleString("id-ID");
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d ? String(d).slice(0, 10) : "-";

// ─── SVG ICONS ───────────────────────────────────────────────
const ICONS = {
  home:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  barchart:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  printer:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  card:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  filetext:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  box:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  list:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  trendingup:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  layers:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  settings:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  refresh:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

// ─── NAVIGATION CONFIG ───────────────────────────────────────
const NAV_GROUPS = [
  { id:"laporan",   label:"Laporan",           icon:"trendingup", tabs:[{id:"Dashboard",label:"Dashboard",icon:"home"},{id:"Buku Besar",label:"Buku Besar",icon:"book"},{id:"Laporan",label:"Laporan",icon:"barchart"},{id:"Invoice",label:"Invoice",icon:"printer"}] },
  { id:"transaksi", label:"Transaksi",          icon:"layers",     tabs:[{id:"Piutang",label:"Piutang",icon:"card"},{id:"Hutang",label:"Hutang",icon:"filetext"},{id:"Jurnal",label:"Jurnal",icon:"clipboard"}] },
  { id:"master",    label:"Master & Pengaturan",icon:"settings",   tabs:[{id:"Inventory",label:"Inventory",icon:"box"},{id:"Master",label:"Master Data",icon:"users"},{id:"COA",label:"Chart of Accounts",icon:"list"}] },
];

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ tab, setTab, company, isOpen, onClose, user }) {
  const [expanded, setExpanded] = useState({ laporan:true, transaksi:true, master:false });
  const toggleGroup = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const handleTab = (t) => { setTab(t); if (window.innerWidth < 768) onClose(); };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={onClose}/>}
      <aside className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 flex flex-col transition-all duration-300 flex-shrink-0 ${isOpen?"w-56":"w-0 md:w-14"} md:relative overflow-hidden`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-700/60 min-h-[56px]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm shadow">E</div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <div className="font-bold text-sm leading-tight text-white">{company.nama}</div>
              <div className="text-gray-500 text-xs">Mini ERP v9</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {NAV_GROUPS.map(g => (
            <div key={g.id}>
              <button onClick={() => { toggleGroup(g.id); handleTab(g.tabs[0].id); }} title={g.label}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors group relative">
                <span className="flex-shrink-0 w-8 flex justify-center">{ICONS[g.icon]}</span>
                {isOpen && <>
                  <span className="text-[11px] font-semibold uppercase tracking-widest flex-1 text-left">{g.label}</span>
                  <span className="text-gray-600 text-xs">{expanded[g.id]?"▾":"▸"}</span>
                </>}
                {!isOpen && (
                  <div className="absolute left-14 bg-gray-800 border border-gray-700 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 hidden md:block shadow-lg">{g.label}</div>
                )}
              </button>

              {(expanded[g.id] || !isOpen) && g.tabs.map(t => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => handleTab(t.id)} title={t.label}
                    className={`w-full flex items-center gap-3 px-3 py-2 transition-colors relative group ${active?"bg-blue-600/90 text-white":"text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"}`}>
                    {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-300 rounded-r"/>}
                    <span className={`flex-shrink-0 w-8 flex justify-center ${isOpen?"ml-1":""}`}>{ICONS[t.icon]}</span>
                    {isOpen && <span className="text-sm flex-1 text-left whitespace-nowrap">{t.label}</span>}
                    {!isOpen && (
                      <div className="absolute left-14 bg-gray-800 border border-gray-700 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 hidden md:block shadow-lg">{t.label}</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-700/60 p-2">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 px-1 py-1.5 mb-1">
                <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">A</div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium text-white truncate">Administrator</div>
                  <div className="text-xs text-gray-500">admin</div>
                </div>
              </div>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800/60 rounded-lg transition-colors text-xs">
                {ICONS.logout}<span>Keluar</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">A</div>
              <button title="Keluar" className="text-gray-500 hover:text-red-400 transition-colors p-1">{ICONS.logout}</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

const KAS="1-101", BCA="1-102", MANDIRI="1-103", BNI="1-104";
const PIUTANG="1-105", PERSBB="1-201", PERSBJ="1-202", ASETTETAP="1-301";
const HUTANG_U="2-101", HUTANG_B="2-102", MODAL="3-101";
const PENJUALAN="4-101", HPP="5-101", GAJI="5-102", UTILITAS="5-103", BAHAN_BAKU="5-104";

const genInvNo = (ar) => { const n=ar.map(r=>parseInt((r.invoice||"").replace(/\D/g,""))).filter(Boolean); return `INV-${String(n.length?Math.max(...n)+1:1).padStart(3,"0")}`; };
const genPONo  = (ap) => { const n=ap.map(r=>parseInt((r.invoice||"").replace(/\D/g,""))).filter(Boolean); return `PO-${String(n.length?Math.max(...n)+1:1).padStart(4,"0")}`; };

const initAccounts = [
  {kode:KAS,     nama:"Kas Tunai",            kategori:"Aset",       subKategori:"Kas & Setara Kas"},
  {kode:BCA,     nama:"Bank BCA",              kategori:"Aset",       subKategori:"Kas & Setara Kas"},
  {kode:MANDIRI, nama:"Bank Mandiri",           kategori:"Aset",       subKategori:"Kas & Setara Kas"},
  {kode:BNI,     nama:"Bank BNI",              kategori:"Aset",       subKategori:"Kas & Setara Kas"},
  {kode:PIUTANG, nama:"Piutang Usaha",          kategori:"Aset",       subKategori:"Piutang"},
  {kode:PERSBB,  nama:"Persediaan Bahan Baku",  kategori:"Aset",       subKategori:"Persediaan"},
  {kode:PERSBJ,  nama:"Persediaan Barang Jadi", kategori:"Aset",       subKategori:"Persediaan"},
  {kode:ASETTETAP,nama:"Mesin & Peralatan",     kategori:"Aset",       subKategori:"Aset Tetap"},
  {kode:HUTANG_U,nama:"Hutang Usaha",           kategori:"Kewajiban",  subKategori:"Hutang Jangka Pendek"},
  {kode:HUTANG_B,nama:"Hutang Bank",            kategori:"Kewajiban",  subKategori:"Hutang Jangka Panjang"},
  {kode:MODAL,   nama:"Modal",                  kategori:"Ekuitas",    subKategori:"Modal"},
  {kode:PENJUALAN,nama:"Pendapatan Penjualan",  kategori:"Pendapatan", subKategori:"Pendapatan Usaha"},
  {kode:HPP,     nama:"HPP",                    kategori:"Beban",      subKategori:"Beban Pokok"},
  {kode:GAJI,    nama:"Beban Gaji",             kategori:"Beban",      subKategori:"Beban Operasional"},
  {kode:UTILITAS,nama:"Beban Utilitas",          kategori:"Beban",      subKategori:"Beban Operasional"},
  {kode:BAHAN_BAKU,nama:"Beban Bahan Baku",     kategori:"Beban",      subKategori:"Beban Pokok"},
];

const initJournals = [
  {id:1,tanggal:"2025-01-05",keterangan:"Setoran Modal Awal",        auto:false,entries:[{akun:BCA,    posisi:"D",nominal:500000000},{akun:MODAL,   posisi:"K",nominal:500000000}]},
  {id:2,tanggal:"2025-01-10",keterangan:"Pembelian [PO-0001]",       auto:true, entries:[{akun:PERSBB, posisi:"D",nominal:80000000}, {akun:HUTANG_U,posisi:"K",nominal:80000000}]},
  {id:3,tanggal:"2025-01-15",keterangan:"Penjualan [INV-001]",       auto:true, entries:[{akun:PIUTANG,posisi:"D",nominal:150000000},{akun:PENJUALAN,posisi:"K",nominal:150000000}]},
  {id:4,tanggal:"2025-01-20",keterangan:"Beban Gaji Januari",        auto:false,entries:[{akun:GAJI,   posisi:"D",nominal:25000000}, {akun:BCA,     posisi:"K",nominal:25000000}]},
  {id:5,tanggal:"2025-01-22",keterangan:"Terima Pembayaran [INV-001]",auto:true,entries:[{akun:BCA,    posisi:"D",nominal:50000000}, {akun:PIUTANG, posisi:"K",nominal:50000000}]},
  {id:6,tanggal:"2025-01-22",keterangan:"Bayar Hutang [PO-0001]",    auto:true, entries:[{akun:HUTANG_U,posisi:"D",nominal:30000000},{akun:BCA,     posisi:"K",nominal:30000000}]},
];

const initAR = [
  {id:1,tanggal:"2025-01-15",pelanggan:"PT Maju Jaya",invoice:"INV-001",jumlah:150000000,dibayar:50000000,jatuhTempo:"2025-02-15",status:"Sebagian",items:[{nama:"Komponen Mesin A",qty:100,harga:1200000,subtotal:120000000},{nama:"Komponen Mesin B",qty:15,harga:2000000,subtotal:30000000}],catatan:""},
  {id:2,tanggal:"2025-01-20",pelanggan:"CV Sejahtera",invoice:"INV-002",jumlah:75000000,dibayar:0,jatuhTempo:"2025-02-20",status:"Belum",items:[{nama:"Baja Plat 2mm",qty:150,harga:500000,subtotal:75000000}],catatan:""},
];

const initAP = [
  {id:1,tanggal:"2025-01-10",supplier:"PT Bahan Prima",invoice:"PO-0001",jumlah:80000000,dibayar:30000000,jatuhTempo:"2025-02-10",status:"Sebagian"},
  {id:2,tanggal:"2025-01-18",supplier:"CV Logam Utama",invoice:"PO-0002",jumlah:45000000,dibayar:0,jatuhTempo:"2025-02-18",status:"Belum"},
];

const initInventory = [
  {id:1,kode:"BB-001",nama:"Baja Plat 2mm",   kategori:"Bahan Baku", satuan:"Lembar",stok:200,hargaBeli:350000, hargaJual:500000, minimum:50},
  {id:2,kode:"BJ-001",nama:"Komponen Mesin A",kategori:"Barang Jadi",satuan:"Unit",  stok:45, hargaBeli:750000, hargaJual:1200000,minimum:10},
  {id:3,kode:"BJ-002",nama:"Komponen Mesin B",kategori:"Barang Jadi",satuan:"Unit",  stok:8,  hargaBeli:1200000,hargaJual:2000000,minimum:10},
];

const initTemplates = [
  {id:1,nama:"Standard",layout:"standard",headerText:"PT Contoh Industri\nJl. Industri No. 1, Jakarta",footerText:"Terima kasih atas kepercayaan Anda.",showSignature:true,showStamp:false,logo:"",primaryColor:"#1e40af",accent:"#dbeafe"},
  {id:2,nama:"Compact", layout:"compact", headerText:"PT Contoh Industri",                              footerText:"Pembayaran dalam 30 hari.",         showSignature:false,showStamp:false,logo:"",primaryColor:"#065f46",accent:"#d1fae5"},
];

const initCompany   = {nama:"PT Contoh Industri",alamat:"Jl. Industri No. 1, Jakarta 12345",telp:"021-1234567",email:"info@contoh.co.id",npwp:"01.234.567.8-901.000"};
const initCustomers = [
  {id:1,kode:"CUST-001",nama:"PT Maju Jaya",kontak:"Budi",telp:"021-1111111",email:"budi@majujaya.co.id", alamat:"Jakarta",npwp:"",limit:500000000,termin:30},
  {id:2,kode:"CUST-002",nama:"CV Sejahtera",kontak:"Siti",telp:"022-2222222",email:"siti@sejahtera.co.id",alamat:"Bandung",npwp:"",limit:200000000,termin:14},
];
const initSuppliers = [
  {id:1,kode:"SUPP-001",nama:"PT Bahan Prima",kontak:"Anton",telp:"021-3333333",email:"anton@bahanprima.co.id",alamat:"Bekasi",  npwp:"",termin:30},
  {id:2,kode:"SUPP-002",nama:"CV Logam Utama",kontak:"Rudi", telp:"021-4444444",email:"rudi@logamutama.co.id",  alamat:"Cikarang",npwp:"",termin:45},
];

const csvCb = {set:null};
const showCSV = (filename,headers,rows) => {
  const csv=[headers.join(","),...rows.map(r=>headers.map(h=>`"${r[h]??""}"`).join(","))].join("\n");
  if(typeof csvCb.set==="function")csvCb.set({filename,csv});
};

function CSVOutputModal({data,onClose}){
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(data.csv).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col" style={{maxHeight:"80vh"}}>
        <div className="flex justify-between items-center p-4 border-b"><div><div className="font-bold text-gray-700">{data.filename}</div><div className="text-xs text-gray-400 mt-0.5">Copy → Notepad → Save As "{data.filename}"</div></div><button onClick={onClose} className="text-gray-400 text-xl ml-3">✕</button></div>
        <div className="overflow-auto flex-1 p-4"><pre className="text-xs bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap break-all font-mono">{data.csv}</pre></div>
        <div className="p-4 border-t flex gap-2">
          <button onClick={copy} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${copied?"bg-green-600 text-white":"bg-blue-700 text-white"}`}>{copied?"✓ Tersalin!":"Copy CSV"}</button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded-lg text-sm text-gray-600">Tutup</button>
        </div>
      </div>
    </div>
  );
}

function parseCSV(text){
  const lines=text.trim().split("\n").map(l=>l.trim()).filter(Boolean);
  if(lines.length<2)return{headers:[],rows:[]};
  const headers=lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  const rows=lines.slice(1).map(line=>{const vals=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));const obj={};headers.forEach((h,i)=>obj[h]=vals[i]||"");return obj;});
  return{headers,rows};
}

function CSVImportModal({moduleName,requiredHeaders,onImport,onClose,templateRows=[]}){
  const [mode,setMode]=useState("tambah");const [preview,setPreview]=useState(null);const [error,setError]=useState("");const fileRef=useRef();
  const dlTemplate=()=>showCSV(`template_${moduleName}.csv`,requiredHeaders,templateRows);
  const handleFile=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{const{headers,rows}=parseCSV(ev.target.result);const missing=requiredHeaders.filter(h=>!headers.includes(h));if(missing.length){setError(`Kolom kurang: ${missing.join(", ")}`);setPreview(null);}else{setError("");setPreview({headers,rows});}};reader.readAsText(file);};
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b"><div className="font-bold text-gray-700">Import — {moduleName}</div><button onClick={onClose} className="text-gray-400 text-xl">✕</button></div>
        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex justify-between items-center"><span className="text-sm text-blue-700">Download template CSV</span><button onClick={dlTemplate} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm">Template</button></div>
          <div className="flex gap-2 mb-3">{[["tambah","Tambah"],["replace","Replace"]].map(([v,l])=>(<label key={v} className={`flex-1 text-center px-3 py-2 rounded-lg border cursor-pointer text-sm ${mode===v?"border-blue-600 bg-blue-50 text-blue-700":"border-gray-200 text-gray-600"}`}><input type="radio" name="mode" checked={mode===v} onChange={()=>setMode(v)} className="hidden"/>{l}</label>))}</div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 mb-3" onClick={()=>fileRef.current.click()}><div className="text-sm text-gray-500">Klik pilih file CSV</div><input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile}/></div>
          {error&&<div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600 mb-2">{error}</div>}
          {preview&&<div className="text-sm text-green-600">✓ {preview.rows.length} baris siap diimport</div>}
        </div>
        <div className="flex gap-2 p-4 border-t">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button>
          <button onClick={()=>{if(preview){onImport(preview.rows,mode);onClose();}}} disabled={!preview||!!error} className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-40">Import</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({message,onConfirm,onCancel}){
  return(<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-5 shadow-xl max-w-sm w-full"><div className="text-gray-700 mb-5">{message}</div><div className="flex gap-3 justify-end"><button onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg text-gray-600">Batal</button><button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Hapus</button></div></div></div>);
}

function BayarModal({item,tipe,akunKas,onSave,onClose}){
  const safe=akunKas&&akunKas.length>0?akunKas:[{kode:BCA,nama:"Bank BCA"}];
  const [bayar,setBayar]=useState("");const [akunDipilih,setAkunDipilih]=useState(safe[0].kode);
  const sisa=item.jumlah-item.dibayar;
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b"><div className="font-bold text-gray-700">{tipe==="piutang"?"Terima Pembayaran":"Bayar Hutang"}</div><button onClick={onClose} className="text-gray-400 text-xl">✕</button></div>
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-0.5">{tipe==="piutang"?item.pelanggan:item.supplier}</div>
          <div className="font-mono text-blue-600 text-sm mb-3">{item.invoice}</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-400">Total</div><div className="font-medium text-sm">{fmt(item.jumlah)}</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-400">Sisa</div><div className="font-medium text-sm text-orange-600">{fmt(sisa)}</div></div>
          </div>
          <label className="text-xs text-gray-500">{tipe==="piutang"?"Diterima ke Akun":"Dibayar dari Akun"}</label>
          <select className="w-full border rounded-lg p-2.5 text-sm mt-1 mb-3" value={akunDipilih} onChange={e=>setAkunDipilih(e.target.value)}>{safe.map(a=><option key={a.kode} value={a.kode}>{a.kode} — {a.nama}</option>)}</select>
          <label className="text-xs text-gray-500">Nominal</label>
          <input type="number" className="w-full border rounded-lg p-3 text-sm mt-1" placeholder="Masukkan nominal" value={bayar} onChange={e=>setBayar(e.target.value)} autoFocus/>
          {bayar&&Number(bayar)>sisa&&<div className="text-xs text-red-500 mt-1">Melebihi sisa</div>}
        </div>
        <div className="flex gap-3 p-4 border-t">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button>
          <button onClick={()=>{if(Number(bayar)>0){onSave(Number(bayar),akunDipilih);onClose();}}} disabled={!bayar||Number(bayar)<=0} className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-40 ${tipe==="piutang"?"bg-amber-500":"bg-red-600"}`}>Catat & Jurnal</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({labaRugi,totalAset,totalPiutang,totalHutang,lowStock,ar,ap}){
  const cards=[
    {label:"Total Aset", value:fmt(totalAset),   color:"bg-blue-600"},
    {label:"Laba/Rugi",  value:fmt(labaRugi),    color:labaRugi>=0?"bg-green-600":"bg-red-600"},
    {label:"Piutang",    value:fmt(totalPiutang), color:"bg-amber-500"},
    {label:"Hutang",     value:fmt(totalHutang),  color:"bg-red-500"},
  ];
  return(
    <div>
      <h2 className="text-lg font-bold text-gray-700 mb-4">Ringkasan</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {cards.map(c=><div key={c.label} className={`${c.color} text-white rounded-xl p-4 shadow`}><div className="text-xs opacity-75 mb-1">{c.label}</div><div className="font-bold text-sm">{c.value}</div></div>)}
      </div>
      {lowStock.length>0&&<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"><div className="font-semibold text-red-700 mb-2 text-sm">Stok Menipis</div>{lowStock.map(i=><div key={i.id} className="text-sm text-red-600">{i.nama} — {i.stok} {i.satuan}</div>)}</div>}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="font-semibold text-gray-700 mb-3 text-sm">Piutang Terbaru</div>
          {ar.slice(0,3).map((r,i)=>(
            <div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0 items-start">
              <div><div className="text-xs text-gray-400 mb-0.5">{i+1}. {r.invoice}</div><div className="font-medium text-gray-800">{r.pelanggan}</div><div className="text-gray-400 text-xs">JT: {fmtDate(r.jatuhTempo)}</div></div>
              <div className="text-right"><div className="text-amber-600 font-medium">{fmt(r.jumlah-r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div>
            </div>
          ))}
          {ar.length===0&&<div className="text-gray-400 text-sm text-center py-3">Belum ada data</div>}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="font-semibold text-gray-700 mb-3 text-sm">Hutang Terbaru</div>
          {ap.slice(0,3).map((r,i)=>(
            <div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0 items-start">
              <div><div className="text-xs text-gray-400 mb-0.5">{i+1}. {r.invoice}</div><div className="font-medium text-gray-800">{r.supplier}</div><div className="text-gray-400 text-xs">JT: {fmtDate(r.jatuhTempo)}</div></div>
              <div className="text-right"><div className="text-red-600 font-medium">{fmt(r.jumlah-r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div>
            </div>
          ))}
          {ap.length===0&&<div className="text-gray-400 text-sm text-center py-3">Belum ada data</div>}
        </div>
      </div>
    </div>
  );
}

// ─── JURNAL ──────────────────────────────────────────────────
function Jurnal({journals,setJournals,accounts}){
  const empty={tanggal:today(),keterangan:"",entries:[{akun:"",posisi:"D",nominal:""},{akun:"",posisi:"K",nominal:""}]};
  const [form,setForm]=useState(empty);const [show,setShow]=useState(false);const [confirm,setConfirm]=useState(null);
  const addEntry=()=>setForm(f=>({...f,entries:[...f.entries,{akun:"",posisi:"D",nominal:""}]}));
  const updEntry=(i,k,v)=>setForm(f=>{const e=[...f.entries];e[i]={...e[i],[k]:v};return{...f,entries:e};});
  const totD=form.entries.filter(e=>e.posisi==="D").reduce((s,e)=>s+(Number(e.nominal)||0),0);
  const totK=form.entries.filter(e=>e.posisi==="K").reduce((s,e)=>s+(Number(e.nominal)||0),0);
  const ok=totD===totK&&totD>0;
  const save=()=>{if(!ok||!form.keterangan)return;setJournals(j=>[...j,{...form,id:Date.now(),auto:false,entries:form.entries.map(e=>({...e,nominal:Number(e.nominal)}))}]);setForm(empty);setShow(false);};
  const doConfirm=()=>{if(!confirm)return;if(confirm.type==="all")setJournals([]);else setJournals(js=>js.filter(j=>j.id!==confirm.id));setConfirm(null);};
  return(
    <div>
      {confirm&&<ConfirmDialog message={confirm.type==="all"?"Hapus semua jurnal?":"Hapus jurnal ini?"} onConfirm={doConfirm} onCancel={()=>setConfirm(null)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Jurnal Umum</h2>
        <div className="flex gap-2">
          <button onClick={()=>setConfirm({type:"all"})} className="bg-red-100 text-red-600 border border-red-300 px-3 py-2 rounded-lg text-xs">Hapus</button>
          <button onClick={()=>setShow(true)} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Tambah</button>
        </div>
      </div>
      {show&&(
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
            <button onClick={save} disabled={!ok||!form.keterangan} className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-40">Simpan</button>
            <button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-1.5 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {journals.length===0&&<div className="p-8 text-center text-gray-400">Belum ada jurnal</div>}
        {journals.map((j,idx)=>(
          <div key={j.id} className="border-b last:border-0 p-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">#{idx+1}</span>
                <span className="font-medium text-gray-700 text-sm">{j.keterangan}</span>
                {j.auto&&<span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">auto</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{fmtDate(j.tanggal)}</span>
                <button onClick={()=>setConfirm({type:"single",id:j.id})} className="text-red-400 text-xs border border-red-200 px-1.5 py-0.5 rounded">Hapus</button>
              </div>
            </div>
            <table className="w-full text-xs"><tbody>{j.entries.map((e,i)=>{const acc=accounts.find(a=>a.kode===e.akun);return(<tr key={i} className="text-gray-600"><td className={`py-0.5 ${e.posisi==="K"?"pl-6":""}`}>{acc?`${acc.kode} - ${acc.nama}`:e.akun}</td><td className="text-right text-blue-700">{e.posisi==="D"?fmt(e.nominal):""}</td><td className="text-right text-green-700">{e.posisi==="K"?fmt(e.nominal):""}</td></tr>);})}</tbody></table>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUKU BESAR ──────────────────────────────────────────────
function BukuBesar({accounts,journals,getBalance}){
  const [sel,setSel]=useState(BCA);
  const acc=accounts.find(a=>a.kode===sel);
  const lines=[];let run=0;
  journals.forEach(j=>j.entries.forEach(e=>{if(e.akun===sel){const isD=["Aset","Beban"].includes(acc?.kategori);run+=isD?(e.posisi==="D"?e.nominal:-e.nominal):(e.posisi==="K"?e.nominal:-e.nominal);lines.push({tanggal:j.tanggal,keterangan:j.keterangan,debit:e.posisi==="D"?e.nominal:0,kredit:e.posisi==="K"?e.nominal:0,saldo:run});}}));
  return(
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-700">Buku Besar</h2><select className="border rounded-lg px-2 py-2 text-sm" value={sel} onChange={e=>setSel(e.target.value)}>{accounts.map(a=><option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>)}</select></div>
      {acc&&<div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="bg-blue-800 text-white px-4 py-3"><div className="font-bold text-sm">{acc.kode} - {acc.nama}</div><div className="text-blue-200 text-xs">{acc.kategori} · Saldo: {fmt(getBalance(acc.kode,acc.kategori))}</div></div><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-gray-50 text-gray-500 border-b"><th className="p-3 text-left">Tgl</th><th className="p-3 text-left">Ket</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Kredit</th><th className="p-3 text-right">Saldo</th></tr></thead><tbody>{lines.map((l,i)=><tr key={i} className="border-b last:border-0"><td className="p-3 text-gray-500">{fmtDate(l.tanggal)}</td><td className="p-3">{l.keterangan}</td><td className="p-3 text-right text-blue-700">{l.debit?fmt(l.debit):"-"}</td><td className="p-3 text-right text-green-700">{l.kredit?fmt(l.kredit):"-"}</td><td className="p-3 text-right font-medium">{fmt(l.saldo)}</td></tr>)}{lines.length===0&&<tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada transaksi</td></tr>}</tbody></table></div></div>}
    </div>
  );
}

// ─── PIUTANG ─────────────────────────────────────────────────
function Piutang({ar,setAr,setJournals,inventory,customers,akunKas,onPrint}){
  const [show,setShow]=useState(false);const [bayarItem,setBayarItem]=useState(null);const [showCSVModal,setShowCSVModal]=useState(false);
  const [items,setItems]=useState([{nama:"",qty:1,harga:"",subtotal:0}]);
  const [form,setForm]=useState({tanggal:today(),pelanggan:"",invoice:"",jatuhTempo:"",catatan:""});
  const [diskon,setDiskon]=useState(0);const [ppnPct,setPpnPct]=useState(11);const [ppnAktif,setPpnAktif]=useState(false);
  const initForm=()=>{setForm({tanggal:today(),pelanggan:"",invoice:genInvNo(ar),jatuhTempo:"",catatan:""});setItems([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]);setDiskon(0);setPpnPct(11);setPpnAktif(false);setShow(true);};
  const updItem=(i,k,v)=>setItems(its=>its.map((it,idx)=>{if(idx!==i)return it;const u={...it,[k]:v};const qty=Number(k==="qty"?v:u.qty)||0;const harga=Number(k==="harga"?v:u.harga)||0;const disc=Number(k==="diskon"?v:u.diskon)||0;u.subtotal=qty*harga*(1-disc/100);return u;}));
  const subtotal=items.reduce((s,it)=>s+(it.subtotal||0),0);
  const diskonNom=subtotal*(diskon/100);const dpp=subtotal-diskonNom;const ppnNom=ppnAktif?dpp*(ppnPct/100):0;const total=dpp+ppnNom;
  const addJ=(ket,tgl,entries)=>setJournals(js=>[...js,{id:Date.now(),tanggal:tgl,keterangan:ket,auto:true,entries}]);
  const save=()=>{if(!form.pelanggan||!total)return;setAr(a=>[...a,{...form,id:Date.now(),jumlah:total,dibayar:0,status:"Belum",items:items.map(it=>({...it,qty:Number(it.qty),harga:Number(it.harga)})),diskon,ppnPct:ppnAktif?ppnPct:0,ppnNominal:ppnNom,dpp,subtotalSebelumDiskon:subtotal}]);addJ(`Penjualan [${form.invoice}] ${form.pelanggan}`,form.tanggal,[{akun:PIUTANG,posisi:"D",nominal:total},{akun:PENJUALAN,posisi:"K",nominal:dpp},...(ppnAktif?[{akun:"2-103",posisi:"K",nominal:ppnNom}]:[])]);setShow(false);};
  const handleBayar=(nominal,akunDebit)=>{if(!bayarItem)return;setAr(a=>a.map(r=>{if(r.id!==bayarItem.id)return r;const nd=Math.min(r.dibayar+nominal,r.jumlah);return{...r,dibayar:nd,status:nd>=r.jumlah?"Lunas":"Sebagian"};}));addJ(`Terima Pembayaran [${bayarItem.invoice}] ${bayarItem.pelanggan}`,today(),[{akun:akunDebit,posisi:"D",nominal},{akun:PIUTANG,posisi:"K",nominal}]);};
  return(
    <div>
      {bayarItem&&<BayarModal item={bayarItem} tipe="piutang" akunKas={akunKas} onSave={handleBayar} onClose={()=>setBayarItem(null)}/>}
      {showCSVModal&&<CSVImportModal moduleName="Piutang" requiredHeaders={["tanggal","pelanggan","invoice","jumlah","dibayar","jatuhTempo"]} templateRows={[{tanggal:"2025-01-15",pelanggan:"PT Contoh",invoice:"INV-001",jumlah:"10000000",dibayar:"0",jatuhTempo:"2025-02-15",catatan:""}]} onImport={(rows,mode)=>{const d=rows.map((r,i)=>({id:Date.now()+i,tanggal:r.tanggal,pelanggan:r.pelanggan,invoice:r.invoice,jumlah:Number(r.jumlah)||0,dibayar:Number(r.dibayar)||0,jatuhTempo:r.jatuhTempo,catatan:r.catatan||"",items:[],status:Number(r.dibayar)>=Number(r.jumlah)?"Lunas":Number(r.dibayar)>0?"Sebagian":"Belum"}));setAr(a=>mode==="replace"?d:[...a,...d]);}} onClose={()=>setShowCSVModal(false)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Piutang Usaha</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSVModal(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">CSV</button>
          <button onClick={initForm} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Invoice</button>
        </div>
      </div>
      {show&&(
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <div className="font-semibold text-gray-600 mb-3 text-sm">Invoice Baru</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-500">No. Invoice</label><input className="w-full border rounded p-2 text-sm mt-1 bg-gray-50" value={form.invoice} readOnly/></div>
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            <div className="col-span-2"><label className="text-xs text-gray-500">Pelanggan</label><input list="cust-list" className="w-full border rounded p-2 text-sm mt-1" placeholder="Ketik nama pelanggan..." value={form.pelanggan} onChange={e=>{const c=customers.find(x=>x.nama===e.target.value);setForm(f=>({...f,pelanggan:e.target.value,...(c&&f.tanggal&&c.termin?{jatuhTempo:new Date(new Date(f.tanggal).getTime()+c.termin*86400000).toISOString().slice(0,10)}:{})}));}}/><datalist id="cust-list">{customers.map(c=><option key={c.id} value={c.nama}/>)}</datalist></div>
            <div><label className="text-xs text-gray-500">Jatuh Tempo</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.jatuhTempo} onChange={e=>setForm(f=>({...f,jatuhTempo:e.target.value}))}/></div>
            <div><label className="text-xs text-gray-500">Catatan</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))}/></div>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-2">ITEM</div>
          <div className="grid grid-cols-12 gap-1 mb-1 text-xs text-gray-400 px-1"><div className="col-span-4">Nama</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-right">Harga</div><div className="col-span-2 text-right">Disc%</div><div className="col-span-1 text-right">Sub</div><div className="col-span-1"/></div>
          {items.map((it,i)=>(
            <div key={i} className="grid grid-cols-12 gap-1 mb-2 items-center">
              <div className="col-span-4"><input list={`ii-${i}`} className="w-full border rounded p-1.5 text-sm" placeholder="Nama barang" value={it.nama} onChange={e=>{const p=inventory.find(x=>x.nama===e.target.value);updItem(i,"nama",e.target.value);if(p)updItem(i,"harga",p.hargaJual);}}/><datalist id={`ii-${i}`}>{inventory.map(p=><option key={p.id} value={p.nama}/>)}</datalist></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-center" value={it.qty} onChange={e=>updItem(i,"qty",e.target.value)}/></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" value={it.harga} onChange={e=>updItem(i,"harga",e.target.value)}/></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" placeholder="0" value={it.diskon||""} onChange={e=>updItem(i,"diskon",e.target.value)}/></div>
              <div className="col-span-1 text-xs text-gray-500 text-right">{it.subtotal>0?(it.subtotal/1000000).toFixed(1)+"jt":""}</div>
              <div className="col-span-1 text-center"><button onClick={()=>setItems(its=>its.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs">✕</button></div>
            </div>
          ))}
          <button onClick={()=>setItems(its=>[...its,{nama:"",qty:1,harga:"",diskon:0,subtotal:0}])} className="text-blue-600 text-xs border border-blue-200 px-2 py-1 rounded mb-4">+ Item</button>
          <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex items-center gap-2"><span className="text-sm text-gray-500 flex-1">Diskon</span><div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" placeholder="0" value={diskon||""} onChange={e=>setDiskon(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div><span className="text-sm text-red-500 w-24 text-right">({fmt(diskonNom)})</span></div>
            <div className="flex justify-between text-sm font-medium border-t pt-2"><span className="text-gray-600">DPP</span><span>{fmt(dpp)}</span></div>
            <div className="flex items-center gap-2"><label className="flex items-center gap-1.5 cursor-pointer flex-1"><input type="checkbox" checked={ppnAktif} onChange={e=>setPpnAktif(e.target.checked)} className="rounded"/><span className="text-sm text-gray-500">PPN</span></label>{ppnAktif&&<div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" value={ppnPct} onChange={e=>setPpnPct(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div>}<span className="text-sm text-gray-600 w-24 text-right">{ppnAktif?fmt(ppnNom):"-"}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-blue-700">{fmt(total)}</span></div>
          </div>
          <div className="flex gap-2"><button onClick={save} disabled={!form.pelanggan||!total} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">Simpan & Jurnal</button><button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button></div>
        </div>
      )}
      <div className="space-y-3">
        {ar.map((r,idx)=>(
          <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {r.invoice}</div><div className="font-semibold text-gray-800">{r.pelanggan}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
              <div><div>Total</div><div className="font-medium text-gray-700">{fmt(r.jumlah)}</div></div>
              <div><div>Dibayar</div><div className="font-medium text-green-600">{fmt(r.dibayar)}</div></div>
              <div><div>Sisa</div><div className="font-medium text-amber-600">{fmt(r.jumlah-r.dibayar)}</div></div>
            </div>
            {(r.ppnNominal>0||r.diskon>0)&&<div className="flex gap-2 text-xs mb-2">{r.diskon>0&&<span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded">Diskon {r.diskon}%</span>}{r.ppnNominal>0&&<span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">PPN {r.ppnPct}%</span>}</div>}
            <div className="text-xs text-gray-400 mb-3">JT: {fmtDate(r.jatuhTempo)}</div>
            <div className="flex gap-2">
              {r.status!=="Lunas"&&<button onClick={()=>setBayarItem(r)} className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-medium">Bayar</button>}
              <button onClick={()=>onPrint(r)} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Invoice</button>
            </div>
          </div>
        ))}
        {ar.length===0&&<div className="text-center text-gray-400 py-8">Belum ada piutang</div>}
      </div>
    </div>
  );
}

// ─── HUTANG ──────────────────────────────────────────────────
function Hutang({ap,setAp,setJournals,suppliers,akunKas}){
  const [show,setShow]=useState(false);const [bayarItem,setBayarItem]=useState(null);const [showCSVModal,setShowCSVModal]=useState(false);
  const [items,setItems]=useState([{nama:"",qty:1,harga:"",subtotal:0}]);
  const [diskon,setDiskon]=useState(0);const [ppnPct,setPpnPct]=useState(11);const [ppnAktif,setPpnAktif]=useState(false);
  const [form,setForm]=useState({tanggal:today(),supplier:"",invoice:"",jatuhTempo:""});
  const updItem=(i,k,v)=>setItems(its=>its.map((it,idx)=>{if(idx!==i)return it;const u={...it,[k]:v};const qty=Number(k==="qty"?v:u.qty)||0;const harga=Number(k==="harga"?v:u.harga)||0;const disc=Number(k==="diskon"?v:u.diskon)||0;u.subtotal=qty*harga*(1-disc/100);return u;}));
  const subtotal=items.reduce((s,it)=>s+(it.subtotal||0),0);
  const diskonNom=subtotal*(diskon/100);const dpp=subtotal-diskonNom;const ppnNom=ppnAktif?dpp*(ppnPct/100):0;const total=dpp+ppnNom;
  const initForm=()=>{setForm({tanggal:today(),supplier:"",invoice:genPONo(ap),jatuhTempo:""});setItems([{nama:"",qty:1,harga:"",diskon:0,subtotal:0}]);setDiskon(0);setPpnPct(11);setPpnAktif(false);setShow(true);};
  const addJ=(ket,tgl,entries)=>setJournals(js=>[...js,{id:Date.now(),tanggal:tgl,keterangan:ket,auto:true,entries}]);
  const save=()=>{if(!form.supplier||!total)return;setAp(a=>[...a,{...form,id:Date.now(),jumlah:total,dibayar:0,status:"Belum",items:items.map(it=>({...it,qty:Number(it.qty),harga:Number(it.harga)})),diskon,ppnPct:ppnAktif?ppnPct:0,ppnNominal:ppnNom,dpp}]);addJ(`Pembelian [${form.invoice}] ${form.supplier}`,form.tanggal,[{akun:PERSBB,posisi:"D",nominal:dpp},{akun:HUTANG_U,posisi:"K",nominal:total},...(ppnAktif?[{akun:"1-106",posisi:"D",nominal:ppnNom}]:[])]);setShow(false);};
  const handleBayar=(nominal,akunKredit)=>{if(!bayarItem)return;setAp(a=>a.map(r=>{if(r.id!==bayarItem.id)return r;const nd=Math.min(r.dibayar+nominal,r.jumlah);return{...r,dibayar:nd,status:nd>=r.jumlah?"Lunas":"Sebagian"};}));addJ(`Bayar Hutang [${bayarItem.invoice}] ${bayarItem.supplier}`,today(),[{akun:HUTANG_U,posisi:"D",nominal},{akun:akunKredit,posisi:"K",nominal}]);};
  return(
    <div>
      {bayarItem&&<BayarModal item={bayarItem} tipe="hutang" akunKas={akunKas} onSave={handleBayar} onClose={()=>setBayarItem(null)}/>}
      {showCSVModal&&<CSVImportModal moduleName="Hutang" requiredHeaders={["tanggal","supplier","invoice","jumlah","dibayar","jatuhTempo"]} templateRows={[{tanggal:"2025-01-10",supplier:"PT Supplier",invoice:"PO-0001",jumlah:"5000000",dibayar:"0",jatuhTempo:"2025-02-10"}]} onImport={(rows,mode)=>{const d=rows.map((r,i)=>({id:Date.now()+i,tanggal:r.tanggal,supplier:r.supplier,invoice:r.invoice,jumlah:Number(r.jumlah)||0,dibayar:Number(r.dibayar)||0,jatuhTempo:r.jatuhTempo,items:[],status:Number(r.dibayar)>=Number(r.jumlah)?"Lunas":Number(r.dibayar)>0?"Sebagian":"Belum"}));setAp(a=>mode==="replace"?d:[...a,...d]);}} onClose={()=>setShowCSVModal(false)}/>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Hutang Usaha</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSVModal(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">CSV</button>
          <button onClick={initForm} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ PO Baru</button>
        </div>
      </div>
      {show&&(
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm">
          <div className="font-semibold text-gray-600 mb-3 text-sm">PO Baru</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-500">No. PO</label><input className="w-full border rounded p-2 text-sm mt-1 bg-gray-50" value={form.invoice} readOnly/></div>
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            <div className="col-span-2"><label className="text-xs text-gray-500">Supplier</label><input list="supp-list" className="w-full border rounded p-2 text-sm mt-1" placeholder="Ketik nama supplier..." value={form.supplier} onChange={e=>{const s=suppliers.find(x=>x.nama===e.target.value);setForm(f=>({...f,supplier:e.target.value,...(s&&f.tanggal?{jatuhTempo:new Date(new Date(f.tanggal).getTime()+s.termin*86400000).toISOString().slice(0,10)}:{})}));}}/><datalist id="supp-list">{suppliers.map(s=><option key={s.id} value={s.nama}/>)}</datalist></div>
            <div><label className="text-xs text-gray-500">Jatuh Tempo</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.jatuhTempo} onChange={e=>setForm(f=>({...f,jatuhTempo:e.target.value}))}/></div>
          </div>
          <div className="text-xs font-semibold text-gray-500 mb-2">ITEM</div>
          <div className="grid grid-cols-12 gap-1 mb-1 text-xs text-gray-400 px-1"><div className="col-span-4">Nama</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-right">Harga</div><div className="col-span-2 text-right">Disc%</div><div className="col-span-1 text-right">Sub</div><div className="col-span-1"/></div>
          {items.map((it,i)=>(
            <div key={i} className="grid grid-cols-12 gap-1 mb-2 items-center">
              <div className="col-span-4"><input className="w-full border rounded p-1.5 text-sm" placeholder="Nama barang" value={it.nama} onChange={e=>updItem(i,"nama",e.target.value)}/></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-center" value={it.qty} onChange={e=>updItem(i,"qty",e.target.value)}/></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" value={it.harga} onChange={e=>updItem(i,"harga",e.target.value)}/></div>
              <div className="col-span-2"><input type="number" className="w-full border rounded p-1.5 text-sm text-right" placeholder="0" value={it.diskon||""} onChange={e=>updItem(i,"diskon",e.target.value)}/></div>
              <div className="col-span-1 text-xs text-gray-500 text-right">{it.subtotal>0?(it.subtotal/1000000).toFixed(1)+"jt":""}</div>
              <div className="col-span-1 text-center"><button onClick={()=>setItems(its=>its.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs">✕</button></div>
            </div>
          ))}
          <button onClick={()=>setItems(its=>[...its,{nama:"",qty:1,harga:"",diskon:0,subtotal:0}])} className="text-blue-600 text-xs border border-blue-200 px-2 py-1 rounded mb-4">+ Item</button>
          <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex items-center gap-2"><span className="text-sm text-gray-500 flex-1">Diskon</span><div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" placeholder="0" value={diskon||""} onChange={e=>setDiskon(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div><span className="text-sm text-red-500 w-24 text-right">({fmt(diskonNom)})</span></div>
            <div className="flex justify-between text-sm font-medium border-t pt-2"><span className="text-gray-600">DPP</span><span>{fmt(dpp)}</span></div>
            <div className="flex items-center gap-2"><label className="flex items-center gap-1.5 cursor-pointer flex-1"><input type="checkbox" checked={ppnAktif} onChange={e=>setPpnAktif(e.target.checked)} className="rounded"/><span className="text-sm text-gray-500">PPN Masukan</span></label>{ppnAktif&&<div className="flex items-center gap-1"><input type="number" className="w-16 border rounded p-1 text-sm text-right" value={ppnPct} onChange={e=>setPpnPct(Number(e.target.value))}/><span className="text-sm text-gray-400">%</span></div>}<span className="text-sm text-gray-600 w-24 text-right">{ppnAktif?fmt(ppnNom):"-"}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-blue-700">{fmt(total)}</span></div>
          </div>
          <div className="flex gap-2"><button onClick={save} disabled={!form.supplier||!total} className="bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-40">Simpan & Jurnal</button><button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button></div>
        </div>
      )}
      <div className="space-y-3">
        {ap.map((r,idx)=>(
          <div key={r.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {r.invoice}</div><div className="font-semibold text-gray-800">{r.supplier}</div></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
              <div><div>Total</div><div className="font-medium text-gray-700">{fmt(r.jumlah)}</div></div>
              <div><div>Dibayar</div><div className="font-medium text-green-600">{fmt(r.dibayar)}</div></div>
              <div><div>Sisa</div><div className="font-medium text-red-600">{fmt(r.jumlah-r.dibayar)}</div></div>
            </div>
            <div className="text-xs text-gray-400 mb-3">JT: {fmtDate(r.jatuhTempo)}</div>
            {r.status!=="Lunas"&&<button onClick={()=>setBayarItem(r)} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Bayar Hutang</button>}
          </div>
        ))}
        {ap.length===0&&<div className="text-center text-gray-400 py-8">Belum ada hutang</div>}
      </div>
    </div>
  );
}

// ─── INVENTORY ───────────────────────────────────────────────
function Inventory({inventory,setInventory,setJournals}){
  const [show,setShow]=useState(false);const [adj,setAdj]=useState(null);const [showCSVModal,setShowCSVModal]=useState(false);
  const [form,setForm]=useState({kode:"",nama:"",kategori:"Bahan Baku",satuan:"Unit",stok:"",hargaBeli:"",hargaJual:"",minimum:""});
  const [qty,setQty]=useState("");const [tipe,setTipe]=useState("masuk");
  const akunPers=(kat)=>kat==="Barang Jadi"?PERSBJ:PERSBB;
  const save=()=>{if(!form.nama)return;const stok=Number(form.stok),hargaBeli=Number(form.hargaBeli);setInventory(i=>[...i,{...form,id:Date.now(),stok,hargaBeli,hargaJual:Number(form.hargaJual),minimum:Number(form.minimum)}]);if(stok>0&&hargaBeli>0)setJournals(js=>[...js,{id:Date.now()+1,tanggal:today(),keterangan:`Stok Awal - ${form.nama}`,auto:true,entries:[{akun:akunPers(form.kategori),posisi:"D",nominal:stok*hargaBeli},{akun:MODAL,posisi:"K",nominal:stok*hargaBeli}]}]);setForm({kode:"",nama:"",kategori:"Bahan Baku",satuan:"Unit",stok:"",hargaBeli:"",hargaJual:"",minimum:""});setShow(false);};
  const saveAdj=()=>{const q=Number(qty);if(!q||!adj)return;const nilai=q*adj.hargaBeli,akun=akunPers(adj.kategori);setInventory(i=>i.map(it=>it.id!==adj.id?it:{...it,stok:tipe==="masuk"?it.stok+q:Math.max(0,it.stok-q)}));setJournals(js=>[...js,{id:Date.now(),tanggal:today(),keterangan:`Penyesuaian ${tipe==="masuk"?"Masuk":"Keluar"} - ${adj.nama}`,auto:true,entries:tipe==="masuk"?[{akun,posisi:"D",nominal:nilai},{akun:MODAL,posisi:"K",nominal:nilai}]:[{akun:HPP,posisi:"D",nominal:nilai},{akun,posisi:"K",nominal:nilai}]}]);setAdj(null);setQty("");};
  return(
    <div>
      {showCSVModal&&<CSVImportModal moduleName="Inventory" requiredHeaders={["kode","nama","kategori","satuan","stok","hargaBeli","hargaJual","minimum"]} templateRows={[{kode:"BB-001",nama:"Baja Plat",kategori:"Bahan Baku",satuan:"Lembar",stok:"100",hargaBeli:"350000",hargaJual:"0",minimum:"20"}]} onImport={(rows,mode)=>{const d=rows.map((r,i)=>({id:Date.now()+i,kode:r.kode,nama:r.nama,kategori:r.kategori,satuan:r.satuan,stok:Number(r.stok)||0,hargaBeli:Number(r.hargaBeli)||0,hargaJual:Number(r.hargaJual)||0,minimum:Number(r.minimum)||0}));setInventory(i=>mode==="replace"?d:[...i,...d]);}} onClose={()=>setShowCSVModal(false)}/>}
      {adj&&(<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5"><div className="font-bold text-gray-700 mb-3">Penyesuaian Stok — {adj.nama}</div><div className="flex gap-2 mb-4">{[["masuk","Masuk"],["keluar","Keluar"]].map(([v,l])=><button key={v} onClick={()=>setTipe(v)} className={`flex-1 py-2 rounded-lg text-sm ${tipe===v?"bg-blue-700 text-white":"border text-gray-600"}`}>{l}</button>)}</div><input type="number" className="w-full border rounded-lg p-3 text-sm mb-4" placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} autoFocus/><div className="flex gap-2"><button onClick={()=>{setAdj(null);setQty("");}} className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600">Batal</button><button onClick={saveAdj} disabled={!qty} className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-40">Simpan</button></div></div></div>)}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Inventory</h2>
        <div className="flex gap-2">
          <button onClick={()=>setShowCSVModal(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">CSV</button>
          <button onClick={()=>setShow(true)} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Item</button>
        </div>
      </div>
      {show&&(
        <div className="bg-white border rounded-xl p-4 mb-5 shadow-sm grid grid-cols-2 gap-3">
          {[["kode","Kode","text"],["nama","Nama Item","text"],["satuan","Satuan","text"],["stok","Stok Awal","number"],["hargaBeli","Harga Beli","number"],["hargaJual","Harga Jual","number"],["minimum","Stok Min","number"]].map(([k,l,t])=>(<div key={k}><label className="text-xs text-gray-500">{l}</label><input type={t} className="w-full border rounded p-2 text-sm mt-1" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>))}
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}><option>Bahan Baku</option><option>Barang Jadi</option><option>Spare Part</option><option>WIP</option></select></div>
          <div className="col-span-2 flex gap-2"><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Simpan</button><button onClick={()=>setShow(false)} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button></div>
        </div>
      )}
      <div className="space-y-3">
        {inventory.map((i,idx)=>(
          <div key={i.id} className={`bg-white rounded-xl border shadow-sm p-4 ${i.stok<=i.minimum?"border-red-200 bg-red-50":""}`}>
            <div className="flex justify-between items-start mb-2">
              <div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {i.kode}</div><div className="font-semibold text-gray-800">{i.nama}</div></div>
              <div className="flex gap-1"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{i.kategori}</span>{i.stok<=i.minimum&&<span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">Min</span>}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-3">
              <div><div>Stok</div><div className={`font-bold text-sm ${i.stok<=i.minimum?"text-red-600":"text-gray-800"}`}>{i.stok} {i.satuan}</div></div>
              <div><div>Min</div><div className="font-medium">{i.minimum}</div></div>
              <div><div>H.Beli</div><div className="font-medium">{fmt(i.hargaBeli)}</div></div>
              <div><div>H.Jual</div><div className="font-medium text-green-600">{i.hargaJual?fmt(i.hargaJual):"—"}</div></div>
            </div>
            <button onClick={()=>setAdj(i)} className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg text-sm">Penyesuaian Stok</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COA ─────────────────────────────────────────────────────
function COA({accounts,setAccounts}){
  const [form,setForm]=useState({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});
  const [editId,setEditId]=useState(null);const [search,setSearch]=useState("");
  const KATEGORI=["Aset","Kewajiban","Ekuitas","Pendapatan","Beban"];
  const SUB={Aset:["Kas & Setara Kas","Piutang","Persediaan","Aset Tetap","Aset Lainnya"],Kewajiban:["Hutang Jangka Pendek","Hutang Jangka Panjang"],Ekuitas:["Modal","Laba Ditahan"],Pendapatan:["Pendapatan Usaha","Pendapatan Lain-lain"],Beban:["Beban Pokok","Beban Operasional","Beban Lain-lain"]};
  const KCOLORS={Aset:"bg-blue-100 text-blue-700",Kewajiban:"bg-red-100 text-red-700",Ekuitas:"bg-purple-100 text-purple-700",Pendapatan:"bg-green-100 text-green-700",Beban:"bg-orange-100 text-orange-700"};
  const SCOLORS={"Kas & Setara Kas":"bg-emerald-100 text-emerald-700","Piutang":"bg-sky-100 text-sky-700","Persediaan":"bg-amber-100 text-amber-700","Aset Tetap":"bg-indigo-100 text-indigo-700"};
  const filtered=accounts.filter(a=>a.kode.includes(search)||a.nama.toLowerCase().includes(search.toLowerCase()));
  const save=()=>{if(!form.kode||!form.nama)return;if(editId){setAccounts(a=>a.map(ac=>ac.kode===editId?{...form}:ac));setEditId(null);}else{if(accounts.find(a=>a.kode===form.kode)){alert("Kode sudah ada!");return;}setAccounts(a=>[...a,{...form}]);}setForm({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});};
  const grouped=KATEGORI.map(kat=>{const ki=filtered.filter(a=>a.kategori===kat);const subs=[...new Set(ki.map(a=>a.subKategori||"Lainnya"))];return{kategori:kat,subs:subs.map(sub=>({sub,items:ki.filter(a=>(a.subKategori||"Lainnya")===sub)}))};}).filter(g=>g.subs.some(s=>s.items.length>0));
  return(
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-700">Chart of Accounts</h2><div className="text-sm text-gray-400">{accounts.length} akun</div></div>
      <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
        <div className="font-semibold text-gray-600 mb-3 text-sm">{editId?"Edit":"Tambah"} Akun</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Kode</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.kode} disabled={!!editId} onChange={e=>setForm(f=>({...f,kode:e.target.value}))}/></div>
          <div><label className="text-xs text-gray-500">Nama Akun</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))}/></div>
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value,subKategori:SUB[e.target.value][0]}))}>{KATEGORI.map(k=><option key={k}>{k}</option>)}</select></div>
          <div><label className="text-xs text-gray-500">Sub Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.subKategori} onChange={e=>setForm(f=>({...f,subKategori:e.target.value}))}>{(SUB[form.kategori]||[]).map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="flex gap-2 mt-3"><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">{editId?"Update":"Tambah"}</button>{editId&&<button onClick={()=>{setForm({kode:"",nama:"",kategori:"Aset",subKategori:"Kas & Setara Kas"});setEditId(null);}} className="text-gray-500 px-3 py-1.5 text-sm border rounded">Batal</button>}</div>
      </div>
      <input className="w-full border rounded-lg p-2.5 text-sm mb-3 bg-white" placeholder="Cari akun..." value={search} onChange={e=>setSearch(e.target.value)}/>
      {grouped.map(g=>(
        <div key={g.kategori} className="mb-4">
          <div className="flex items-center gap-2 mb-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${KCOLORS[g.kategori]}`}>{g.kategori}</span></div>
          {g.subs.filter(s=>s.items.length>0).map(({sub,items})=>(
            <div key={sub} className="bg-white rounded-xl shadow-sm border mb-2 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${SCOLORS[sub]||"bg-gray-100 text-gray-600"}`}>{sub}</span><span className="text-gray-400 text-xs">{items.length} akun</span>{sub==="Kas & Setara Kas"&&<span className="text-xs text-emerald-600 ml-auto">pilihan bayar</span>}</div>
              {items.sort((a,b)=>a.kode.localeCompare(b.kode)).map(ac=>(
                <div key={ac.kode} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div><div className="font-mono text-blue-700 text-sm">{ac.kode}</div><div className="text-sm">{ac.nama}</div></div>
                  <div className="flex gap-3"><button onClick={()=>{setForm({...ac});setEditId(ac.kode);}} className="text-blue-600 text-xs">Edit</button><button onClick={()=>setAccounts(a=>a.filter(x=>x.kode!==ac.kode))} className="text-red-400 text-xs">Hapus</button></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── LAPORAN ─────────────────────────────────────────────────
function Laporan({accounts,getBalance,labaRugi,inventory,journals}){
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
  return(
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[["laba","Laba Rugi"],["neraca","Neraca"],["persediaan","Persediaan"]].map(([v,l])=>(<button key={v} onClick={()=>setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>))}
      </div>
      {view==="laba"&&(<div className="bg-white rounded-xl shadow-sm border p-5"><h3 className="font-bold text-gray-700 mb-1">Laporan Laba Rugi</h3><p className="text-xs text-gray-400 mb-4">Periode berjalan</p>{["Pendapatan","Beban"].map(kat=>(<div key={kat} className="mb-4"><div className="font-semibold text-gray-600 mb-2 text-sm">{kat}</div>{byKat(kat).map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span className={kat==="Beban"?"text-red-600":""}>{kat==="Beban"?`(${fmt(getBalance(a.kode,a.kategori))})`:fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className={`flex justify-between font-semibold border-t pt-2 mt-1 text-sm ${kat==="Beban"?"text-red-600":"text-blue-700"}`}><span>Total {kat}</span><span>{kat==="Beban"?`(${fmt(totalB)})`:fmt(totalP)}</span></div></div>))}<div className={`flex justify-between font-bold text-base border-t-2 pt-3 ${labaRugi>=0?"text-green-700":"text-red-700"}`}><span>{labaRugi>=0?"Laba Bersih":"Rugi Bersih"}</span><span>{fmt(Math.abs(labaRugi))}</span></div></div>)}
      {view==="neraca"&&(<div><div className={`rounded-lg p-3 mb-4 text-sm ${balanced?"bg-green-50 border border-green-200 text-green-700":"bg-red-50 border border-red-200 text-red-600"}`}>{balanced?"✓ Neraca balance":"Neraca tidak balance"}</div><div className="grid grid-cols-1 gap-4"><div className="bg-white rounded-xl shadow-sm border p-5"><h3 className="font-bold text-gray-700 mb-3 text-sm">Aset</h3>{byKat("Aset").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700 text-sm"><span>Total Aset</span><span>{fmt(totalAset)}</span></div></div><div className="bg-white rounded-xl shadow-sm border p-5"><h3 className="font-bold text-gray-700 mb-3 text-sm">Kewajiban & Ekuitas</h3><div className="text-xs font-semibold text-gray-400 mb-1">KEWAJIBAN</div>{byKat("Kewajiban").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="text-xs font-semibold text-gray-400 mb-1 mt-3">EKUITAS</div>{byKat("Ekuitas").map(a=><div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}<div className="flex justify-between text-sm py-1"><span className="text-gray-500">Laba Ditahan</span><span className={labaRugi>=0?"text-green-600":"text-red-600"}>{fmt(labaRugi)}</span></div><div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700 text-sm"><span>Total K + E</span><span>{fmt(totalKE)}</span></div></div></div></div>)}
      {view==="persediaan"&&(<div><div className="bg-white border rounded-xl p-4 mb-4 flex flex-wrap gap-3"><div><label className="text-xs text-gray-500">Dari</label><input type="date" className="block border rounded p-2 text-sm mt-1" value={periodeStart} onChange={e=>setPeriodeStart(e.target.value)}/></div><div><label className="text-xs text-gray-500">Sampai</label><input type="date" className="block border rounded p-2 text-sm mt-1" value={periodeEnd} onChange={e=>setPeriodeEnd(e.target.value)}/></div><div><label className="text-xs text-gray-500">Kategori</label><select className="block border rounded p-2 text-sm mt-1" value={filterKat} onChange={e=>setFilterKat(e.target.value)}>{katList.map(k=><option key={k}>{k}</option>)}</select></div></div><div className="grid grid-cols-3 gap-3 mb-4"><div className="bg-blue-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Nilai Beli</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiBeli)}</div></div><div className="bg-green-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Nilai Jual</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiJual)}</div></div><div className="bg-purple-600 text-white rounded-xl p-3"><div className="text-xs opacity-75">Margin</div><div className="font-bold text-sm mt-1">{fmt(totalNilaiJual-totalNilaiBeli)}</div></div></div><div className="space-y-3">{filteredInv.map((i,idx)=>{const margin=(i.hargaJual||0)-i.hargaBeli;const pct=i.hargaBeli>0?((margin/i.hargaBeli)*100).toFixed(1):0;return(<div key={i.id} className="bg-white rounded-xl border shadow-sm p-4"><div className="flex justify-between items-start mb-2"><div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {i.kode}</div><div className="font-semibold text-gray-800">{i.nama}</div></div><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{i.kategori}</span></div><div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-gray-50 rounded p-2"><div className="text-gray-400">Stok</div><div className="font-bold">{i.stok} {i.satuan}</div></div><div className="bg-gray-50 rounded p-2"><div className="text-gray-400">Margin/unit</div><div className={`font-medium ${margin>=0?"text-green-600":"text-red-600"}`}>{fmt(margin)} ({pct}%)</div></div><div className="bg-gray-50 rounded p-2"><div className="text-gray-400">H.Beli</div><div className="font-medium">{fmt(i.hargaBeli)}</div></div><div className="bg-gray-50 rounded p-2"><div className="text-gray-400">H.Jual</div><div className="font-medium text-green-600">{i.hargaJual?fmt(i.hargaJual):"—"}</div></div></div></div>);})}</div></div>)}
    </div>
  );
}

// ─── MASTER DATA ─────────────────────────────────────────────
function MasterData({customers,setCustomers,suppliers,setSuppliers}){
  const [view,setView]=useState("customer");const [showForm,setShowForm]=useState(false);const [editId,setEditId]=useState(null);const [showCSVModal,setShowCSVModal]=useState(false);
  const emptyC={kode:"",nama:"",kontak:"",telp:"",email:"",alamat:"",npwp:"",limit:""};
  const emptyS={kode:"",nama:"",kontak:"",telp:"",email:"",alamat:"",npwp:"",termin:""};
  const [form,setForm]=useState(emptyC);
  const isC=view==="customer";const data=isC?customers:suppliers;const setData=isC?setCustomers:setSuppliers;
  const switchView=(v)=>{setView(v);setShowForm(false);setEditId(null);setForm(v==="customer"?emptyC:emptyS);};
  const save=()=>{if(!form.nama)return;const p={...form,limit:Number(form.limit)||0,termin:Number(form.termin)||0};if(editId){setData(d=>d.map(x=>x.id===editId?{...p,id:editId}:x));setEditId(null);}else setData(d=>[...d,{...p,id:Date.now()}]);setForm(isC?emptyC:emptyS);setShowForm(false);};
  const fields=isC?[["kode","Kode"],["nama","Nama"],["kontak","Kontak"],["telp","Telp"],["email","Email"],["alamat","Alamat"],["npwp","NPWP"],["limit","Credit Limit"]]:[["kode","Kode"],["nama","Nama"],["kontak","Kontak"],["telp","Telp"],["email","Email"],["alamat","Alamat"],["npwp","NPWP"],["termin","Termin (hari)"]];
  return(
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-700">Master Data</h2><div className="flex gap-2"><button onClick={()=>setShowCSVModal(true)} className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-lg text-xs">CSV</button><button onClick={()=>{setShowForm(true);setEditId(null);setForm(isC?emptyC:emptyS);}} className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+ Tambah</button></div></div>
      <div className="flex gap-2 mb-4">{[["customer","Customer"],["supplier","Supplier"]].map(([v,l])=><button key={v} onClick={()=>switchView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>)}<span className="ml-auto text-sm text-gray-400 self-center">{data.length} data</span></div>
      {showForm&&(<div className="bg-white border rounded-xl p-4 mb-4 shadow-sm"><div className="font-semibold text-gray-600 mb-3 text-sm">{editId?"Edit":"Tambah"} {isC?"Customer":"Supplier"}</div><div className="grid grid-cols-2 gap-3">{fields.map(([k,l])=><div key={k}><label className="text-xs text-gray-500">{l}</label><input className="w-full border rounded p-2 text-sm mt-1" value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>)}</div><div className="flex gap-2 mt-4"><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">{editId?"Update":"Simpan"}</button><button onClick={()=>{setShowForm(false);setEditId(null);}} className="text-gray-500 px-3 py-2 text-sm border rounded">Batal</button></div></div>)}
      <div className="space-y-3">
        {data.map((item,idx)=>(
          <div key={item.id} className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {item.kode}</div><div className="font-semibold text-gray-800">{item.nama}</div></div>
              <div className="flex gap-2"><button onClick={()=>{setForm({...item});setEditId(item.id);setShowForm(true);}} className="text-blue-600 text-xs border border-blue-200 px-2 py-1 rounded">Edit</button><button onClick={()=>setData(d=>d.filter(x=>x.id!==item.id))} className="text-red-400 text-xs border border-red-200 px-2 py-1 rounded">Hapus</button></div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <div>{item.kontak}</div><div>{item.telp}</div>
              <div className="col-span-2">{item.email}</div>
              <div className="col-span-2">{item.alamat}</div>
              <div>{isC?`Limit: ${fmt(item.limit||0)}`:`Termin: ${item.termin} hari`}</div>
            </div>
          </div>
        ))}
        {data.length===0&&<div className="text-center text-gray-400 py-8">Belum ada data</div>}
      </div>
    </div>
  );
}

// ─── INVOICE ─────────────────────────────────────────────────
function InvoicePreview({invoice,template,company}){
  const printPDF=()=>{
    const win=window.open("","_blank");
    win.document.write(`<html><head><title>Invoice ${invoice.invoice}</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#1f2937}.hdr{background:${template.primaryColor};color:white;padding:24px;border-radius:8px 8px 0 0}.bdy{padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px}table{width:100%;border-collapse:collapse;margin:16px 0}thead tr{background:${template.accent}}th{padding:10px;text-align:left;font-size:12px;color:${template.primaryColor}}td{padding:10px;font-size:13px;border-bottom:1px solid #f3f4f6}.tot{background:${template.primaryColor};color:white}.ftr{margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center}</style></head><body><div class="hdr"><h2 style="margin:0">${company.nama}</h2><p style="margin:4px 0;font-size:12px">${company.alamat}</p></div><div class="bdy"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px"><div><div style="font-size:11px;color:#6b7280">KEPADA</div><div style="font-size:16px;font-weight:700">${invoice.pelanggan}</div></div><div style="text-align:right"><div style="font-size:11px;color:#6b7280">NO. INVOICE</div><div style="font-size:16px;color:${template.primaryColor};font-weight:700">${invoice.invoice}</div><div style="font-size:11px;color:#6b7280;margin-top:8px">TANGGAL</div><div>${fmtDate(invoice.tanggal)}</div><div style="font-size:11px;color:#6b7280;margin-top:8px">JATUH TEMPO</div><div style="color:#dc2626">${fmtDate(invoice.jatuhTempo)}</div></div></div><table><thead><tr><th>#</th><th>Nama Barang</th><th>Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${(invoice.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.nama}</td><td>${it.qty}</td><td style="text-align:right">${fmt(it.harga)}</td><td style="text-align:right">${fmt(it.subtotal)}</td></tr>`).join("")}<tr class="tot"><td colspan="4" style="text-align:right;font-weight:bold;padding-right:10px">TOTAL</td><td style="font-weight:bold">${fmt(invoice.jumlah)}</td></tr></tbody></table>${invoice.catatan?`<div style="background:#f9fafb;padding:12px;border-radius:6px;font-size:13px"><strong>Catatan:</strong> ${invoice.catatan}</div>`:""}<div class="ftr">${template.footerText}</div></div></body></html>`);
    win.document.close();setTimeout(()=>win.print(),500);
  };
  return(
    <div>
      <div className="bg-white rounded-xl overflow-hidden shadow border">
        <div className="p-5 text-white" style={{background:template.primaryColor}}>
          <div className="flex justify-between items-start">
            <div><div className="font-bold text-lg">{company.nama}</div><div className="text-xs opacity-80">{company.alamat}</div></div>
            <div className="text-right"><div className="text-xs opacity-40 font-black tracking-widest">INVOICE</div><div className="font-bold">{invoice.invoice}</div></div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><div className="text-xs text-gray-400 uppercase mb-1">Kepada</div><div className="font-bold">{invoice.pelanggan}</div></div>
            <div className="text-right"><div className="text-xs text-gray-400">Tgl: {fmtDate(invoice.tanggal)}</div><div className="text-xs text-red-600 mt-1">JT: {fmtDate(invoice.jatuhTempo)}</div></div>
          </div>
          <table className="w-full text-sm mb-4">
            <thead><tr className="text-xs font-semibold" style={{background:template.accent,color:template.primaryColor}}><th className="p-2 text-left">#</th><th className="p-2 text-left">Barang</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Harga</th><th className="p-2 text-right">Subtotal</th></tr></thead>
            <tbody>
              {(invoice.items||[]).map((it,i)=><tr key={i} className="border-b"><td className="p-2 text-gray-400">{i+1}</td><td className="p-2">{it.nama}</td><td className="p-2 text-center">{it.qty}</td><td className="p-2 text-right">{fmt(it.harga)}</td><td className="p-2 text-right font-medium">{fmt(it.subtotal)}</td></tr>)}
              <tr style={{background:template.primaryColor}} className="text-white font-bold"><td colSpan={4} className="p-3 text-right">TOTAL</td><td className="p-3 text-right">{fmt(invoice.jumlah)}</td></tr>
            </tbody>
          </table>
          {invoice.catatan&&<div className="bg-gray-50 rounded p-3 text-sm text-gray-600 mb-4"><strong>Catatan:</strong> {invoice.catatan}</div>}
          {template.showSignature&&<div className="grid grid-cols-2 gap-8 mt-6"><div className="text-center"><div className="border-t mt-10 pt-2 text-xs text-gray-500">Pelanggan<br/>{invoice.pelanggan}</div></div><div className="text-center"><div className="border-t mt-10 pt-2 text-xs text-gray-500">Hormat Kami<br/>{company.nama}</div></div></div>}
          <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t">{template.footerText}</div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-xs text-blue-700">Setelah klik Print, pilih Save as PDF di dialog print browser.</div>
      <button onClick={printPDF} className="w-full mt-3 bg-blue-700 text-white py-3 rounded-xl font-medium">Print / Download PDF</button>
    </div>
  );
}

function InvoiceModule({ar,templates,setTemplates,company,setCompany,printTarget}){
  const [view,setView]=useState(printTarget?"preview":"list");
  const [selectedAR,setSelectedAR]=useState(printTarget||null);
  const [selTpl,setSelTpl]=useState(templates[0]);
  const [editTpl,setEditTpl]=useState(null);
  const logoRef=useRef();
  const saveTpl=()=>{setTemplates(ts=>ts.find(t=>t.id===editTpl.id)?ts.map(t=>t.id===editTpl.id?editTpl:t):[...ts,{...editTpl,id:Date.now()}]);setEditTpl(null);setView("template");};
  const handleLogo=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setEditTpl(t=>({...t,logo:ev.target.result}));r.readAsDataURL(f);};
  return(
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-700">Invoice</h2>
        <div className="flex gap-2">{[["list","Daftar"],["template","Template"],["company","Perusahaan"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} className={`px-3 py-2 rounded-lg text-sm ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600"}`}>{l}</button>)}</div>
      </div>
      {view==="list"&&(<div><div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap"><span className="text-sm text-blue-700">Template:</span>{templates.map(t=><button key={t.id} onClick={()=>setSelTpl(t)} className="px-3 py-1 rounded-full text-xs border" style={selTpl.id===t.id?{background:t.primaryColor,color:"white",border:"none"}:{}}>{t.nama}</button>)}</div><div className="space-y-3">{ar.map((r,idx)=>(<div key={r.id} className="bg-white rounded-xl border shadow-sm p-4"><div className="flex justify-between items-start mb-2"><div><div className="text-xs text-gray-400 mb-0.5">#{idx+1} · {r.invoice}</div><div className="font-semibold text-gray-800">{r.pelanggan}</div></div><span className={`px-2 py-1 rounded-full text-xs ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span></div><div className="text-sm text-gray-600 mb-3">Total: <span className="font-medium">{fmt(r.jumlah)}</span></div><button onClick={()=>{setSelectedAR(r);setView("preview");}} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Print Invoice</button></div>))}</div></div>)}
      {view==="preview"&&selectedAR&&(<div><button onClick={()=>setView("list")} className="text-blue-600 text-sm mb-4 hover:underline">← Kembali</button><div className="flex gap-2 mb-4 overflow-x-auto pb-1">{templates.map(t=><button key={t.id} onClick={()=>setSelTpl(t)} className="px-3 py-1.5 rounded-full text-xs border whitespace-nowrap" style={selTpl.id===t.id?{background:t.primaryColor,color:"white",border:"none"}:{}}>{t.nama}</button>)}</div><InvoicePreview invoice={selectedAR} template={selTpl} company={company}/></div>)}
      {view==="template"&&!editTpl&&(<div className="space-y-3">{templates.map(t=>(<div key={t.id} className="bg-white rounded-xl border shadow-sm overflow-hidden"><div className="p-4 text-white" style={{background:t.primaryColor}}><div className="font-bold">{t.nama}</div></div><div className="p-4 flex gap-2"><button onClick={()=>setEditTpl({...t})} className="flex-1 border border-blue-600 text-blue-600 text-sm py-2 rounded">Edit</button><button onClick={()=>setSelTpl(t)} className={`flex-1 text-sm py-2 rounded ${selTpl.id===t.id?"bg-green-600 text-white":"border text-gray-600"}`}>{selTpl.id===t.id?"Aktif":"Pilih"}</button></div></div>))}<div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8 cursor-pointer" onClick={()=>setEditTpl({id:null,nama:"Template Baru",layout:"standard",headerText:company.nama,footerText:"Terima kasih.",showSignature:true,showStamp:false,logo:"",primaryColor:"#1e40af",accent:"#dbeafe"})}><div className="text-center text-gray-400"><div className="text-3xl mb-1">+</div><div className="text-sm">Tambah Template</div></div></div></div>)}
      {view==="template"&&editTpl&&(<div className="bg-white rounded-xl border shadow-sm p-5"><div className="font-bold text-gray-700 mb-4">Edit Template</div><div className="space-y-3"><div><label className="text-xs text-gray-500">Nama</label><input className="w-full border rounded p-2 text-sm mt-1" value={editTpl.nama} onChange={e=>setEditTpl(t=>({...t,nama:e.target.value}))}/></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-500">Warna Utama</label><div className="flex gap-2 mt-1"><input type="color" className="h-9 w-12 border rounded" value={editTpl.primaryColor} onChange={e=>setEditTpl(t=>({...t,primaryColor:e.target.value}))}/><input className="flex-1 border rounded p-2 text-sm" value={editTpl.primaryColor} onChange={e=>setEditTpl(t=>({...t,primaryColor:e.target.value}))}/></div></div><div><label className="text-xs text-gray-500">Warna Aksen</label><div className="flex gap-2 mt-1"><input type="color" className="h-9 w-12 border rounded" value={editTpl.accent} onChange={e=>setEditTpl(t=>({...t,accent:e.target.value}))}/><input className="flex-1 border rounded p-2 text-sm" value={editTpl.accent} onChange={e=>setEditTpl(t=>({...t,accent:e.target.value}))}/></div></div></div><div><label className="text-xs text-gray-500">Footer</label><input className="w-full border rounded p-2 text-sm mt-1" value={editTpl.footerText} onChange={e=>setEditTpl(t=>({...t,footerText:e.target.value}))}/></div><div><label className="text-xs text-gray-500">Logo</label><div className="flex items-center gap-2 mt-1">{editTpl.logo&&<img src={editTpl.logo} alt="logo" className="h-8 border rounded"/>}<button onClick={()=>logoRef.current.click()} className="border px-3 py-1.5 rounded text-sm text-gray-600">Upload</button>{editTpl.logo&&<button onClick={()=>setEditTpl(t=>({...t,logo:""}))} className="text-red-400 text-sm">Hapus</button>}<input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo}/></div></div><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={editTpl.showSignature} onChange={e=>setEditTpl(t=>({...t,showSignature:e.target.checked}))}/>Tanda Tangan</label></div><div className="flex gap-2 mt-4"><button onClick={saveTpl} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Simpan</button><button onClick={()=>setEditTpl(null)} className="border text-gray-600 px-4 py-2 rounded text-sm">Batal</button>{editTpl.id&&<button onClick={()=>{setTemplates(ts=>ts.filter(t=>t.id!==editTpl.id));setEditTpl(null);}} className="text-red-500 px-4 py-2 text-sm">Hapus</button>}</div></div>)}
      {view==="company"&&(<div className="bg-white rounded-xl border shadow-sm p-5"><div className="font-bold text-gray-700 mb-4">Data Perusahaan</div><div className="space-y-3">{[["nama","Nama"],["alamat","Alamat"],["telp","Telepon"],["email","Email"],["npwp","NPWP"]].map(([k,l])=><div key={k}><label className="text-xs text-gray-500">{l}</label><input className="w-full border rounded p-2 text-sm mt-1" value={company[k]} onChange={e=>setCompany(c=>({...c,[k]:e.target.value}))}/></div>)}</div><div className="mt-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">Tersimpan otomatis</div></div>)}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("Dashboard");
  const [accounts,setAccounts]=useState(initAccounts);
  const [journals,setJournals]=useState(initJournals);
  const [ar,setAr]=useState(initAR);
  const [ap,setAp]=useState(initAP);
  const [inventory,setInventory]=useState(initInventory);
  const [templates,setTemplates]=useState(initTemplates);
  const [company,setCompany]=useState(initCompany);
  const [customers,setCustomers]=useState(initCustomers);
  const [suppliers,setSuppliers]=useState(initSuppliers);
  const [csvModal,setCSVModal]=useState(null);
  const [printTarget,setPrintTarget]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  csvCb.set=setCSVModal;

  const akunKas=accounts.filter(a=>a.subKategori==="Kas & Setara Kas");

  const balances=useMemo(()=>{
    const b={};
    accounts.forEach(a=>b[a.kode]={debit:0,kredit:0});
    journals.forEach(j=>j.entries.forEach(e=>{if(!b[e.akun])b[e.akun]={debit:0,kredit:0};if(e.posisi==="D")b[e.akun].debit+=e.nominal;else b[e.akun].kredit+=e.nominal;}));
    return b;
  },[journals,accounts]);

  const getBalance=(kode,kategori)=>{const b=balances[kode]||{debit:0,kredit:0};return["Aset","Beban"].includes(kategori)?b.debit-b.kredit:b.kredit-b.debit;};
  const labaRugi=accounts.filter(a=>a.kategori==="Pendapatan").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0)-accounts.filter(a=>a.kategori==="Beban").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0);
  const totalAset=accounts.filter(a=>a.kategori==="Aset").reduce((s,a)=>s+getBalance(a.kode,a.kategori),0);
  const totalPiutang=ar.reduce((s,r)=>s+(r.jumlah-r.dibayar),0);
  const totalHutang=ap.reduce((s,r)=>s+(r.jumlah-r.dibayar),0);
  const lowStock=inventory.filter(i=>i.stok<=i.minimum);
  const handlePrint=(record)=>{setPrintTarget(record);setTab("Invoice");};

  const currentTabMeta=NAV_GROUPS.flatMap(g=>g.tabs).find(t=>t.id===tab);
  const currentGroup=NAV_GROUPS.find(g=>g.tabs.some(t=>t.id===tab));

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex overflow-hidden">
      {csvModal&&<CSVOutputModal data={csvModal} onClose={()=>setCSVModal(null)}/>}

      <Sidebar tab={tab} setTab={setTab} company={company} isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={()=>setSidebarOpen(o=>!o)} className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <span className="text-gray-500">{currentGroup?.label}</span><span>›</span>
              <span className="text-gray-700 font-medium">{currentTabMeta?.label||tab}</span>
            </div>
          </div>
          <button onClick={()=>{}} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh">
            {ICONS.refresh}
          </button>
          <div className="text-xs text-gray-400 hidden sm:block">{today()}</div>
        </div>

        <div className="flex-1 p-4 max-w-3xl w-full mx-auto overflow-y-auto">
          {tab==="Dashboard"&&<Dashboard labaRugi={labaRugi} totalAset={totalAset} totalPiutang={totalPiutang} totalHutang={totalHutang} lowStock={lowStock} ar={ar} ap={ap}/>}
          {tab==="Jurnal"&&<Jurnal journals={journals} setJournals={setJournals} accounts={accounts}/>}
          {tab==="Buku Besar"&&<BukuBesar accounts={accounts} journals={journals} getBalance={getBalance}/>}
          {tab==="Piutang"&&<Piutang ar={ar} setAr={setAr} setJournals={setJournals} inventory={inventory} customers={customers} akunKas={akunKas} onPrint={handlePrint}/>}
          {tab==="Hutang"&&<Hutang ap={ap} setAp={setAp} setJournals={setJournals} suppliers={suppliers} akunKas={akunKas}/>}
          {tab==="Inventory"&&<Inventory inventory={inventory} setInventory={setInventory} setJournals={setJournals}/>}
          {tab==="Laporan"&&<Laporan accounts={accounts} getBalance={getBalance} labaRugi={labaRugi} inventory={inventory} journals={journals}/>}
          {tab==="COA"&&<COA accounts={accounts} setAccounts={setAccounts}/>}
          {tab==="Invoice"&&<InvoiceModule ar={ar} templates={templates} setTemplates={setTemplates} company={company} setCompany={setCompany} printTarget={printTarget}/>}
          {tab==="Master"&&<MasterData customers={customers} setCustomers={setCustomers} suppliers={suppliers} setSuppliers={setSuppliers}/>}
        </div>
      </div>
    </div>
  );
}
