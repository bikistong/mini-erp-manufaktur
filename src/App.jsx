import { useState, useMemo } from "react";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const today = () => new Date().toISOString().slice(0, 10);
const TABS = ["Dashboard", "Jurnal", "Buku Besar", "Piutang", "Hutang", "Inventory", "Laporan", "COA"];

const initAccounts = [
  { kode: "1101", nama: "Kas", kategori: "Aset" },
  { kode: "1102", nama: "Bank", kategori: "Aset" },
  { kode: "1103", nama: "Piutang Usaha", kategori: "Aset" },
  { kode: "1201", nama: "Persediaan Bahan Baku", kategori: "Aset" },
  { kode: "1202", nama: "Persediaan Barang Jadi", kategori: "Aset" },
  { kode: "1301", nama: "Mesin & Peralatan", kategori: "Aset" },
  { kode: "2101", nama: "Hutang Usaha", kategori: "Kewajiban" },
  { kode: "2102", nama: "Hutang Bank", kategori: "Kewajiban" },
  { kode: "3101", nama: "Modal", kategori: "Ekuitas" },
  { kode: "4101", nama: "Pendapatan Penjualan", kategori: "Pendapatan" },
  { kode: "5101", nama: "HPP", kategori: "Beban" },
  { kode: "5102", nama: "Beban Gaji", kategori: "Beban" },
  { kode: "5103", nama: "Beban Utilitas", kategori: "Beban" },
  { kode: "5104", nama: "Beban Bahan Baku", kategori: "Beban" },
];

// Jurnal awal sudah include transaksi piutang & hutang default
const initJournals = [
  { id: 1, tanggal: "2025-01-05", keterangan: "Setoran Modal Awal", auto: false, entries: [{ akun: "1102", posisi: "D", nominal: 500000000 }, { akun: "3101", posisi: "K", nominal: 500000000 }] },
  { id: 2, tanggal: "2025-01-10", keterangan: "Pembelian Bahan Baku [PO-001]", auto: true, entries: [{ akun: "1201", posisi: "D", nominal: 80000000 }, { akun: "2101", posisi: "K", nominal: 80000000 }] },
  { id: 3, tanggal: "2025-01-15", keterangan: "Penjualan Barang Jadi [INV-001]", auto: true, entries: [{ akun: "1103", posisi: "D", nominal: 150000000 }, { akun: "4101", posisi: "K", nominal: 150000000 }] },
  { id: 4, tanggal: "2025-01-15", keterangan: "HPP Penjualan [INV-001]", auto: true, entries: [{ akun: "5101", posisi: "D", nominal: 90000000 }, { akun: "1202", posisi: "K", nominal: 90000000 }] },
  { id: 5, tanggal: "2025-01-20", keterangan: "Beban Gaji Januari", auto: false, entries: [{ akun: "5102", posisi: "D", nominal: 25000000 }, { akun: "1102", posisi: "K", nominal: 25000000 }] },
  { id: 6, tanggal: "2025-01-20", keterangan: "Penjualan Barang Jadi [INV-002]", auto: true, entries: [{ akun: "1103", posisi: "D", nominal: 75000000 }, { akun: "4101", posisi: "K", nominal: 75000000 }] },
  { id: 7, tanggal: "2025-01-21", keterangan: "Pembelian Bahan Baku [PO-002]", auto: true, entries: [{ akun: "1201", posisi: "D", nominal: 45000000 }, { akun: "2101", posisi: "K", nominal: 45000000 }] },
  { id: 8, tanggal: "2025-01-22", keterangan: "Terima Pembayaran Piutang [INV-001] PT Maju Jaya", auto: true, entries: [{ akun: "1102", posisi: "D", nominal: 50000000 }, { akun: "1103", posisi: "K", nominal: 50000000 }] },
  { id: 9, tanggal: "2025-01-22", keterangan: "Bayar Hutang [PO-001] PT Bahan Prima", auto: true, entries: [{ akun: "2101", posisi: "D", nominal: 30000000 }, { akun: "1102", posisi: "K", nominal: 30000000 }] },
];

const initAR = [
  { id: 1, tanggal: "2025-01-15", pelanggan: "PT Maju Jaya", invoice: "INV-001", jumlah: 150000000, dibayar: 50000000, jatuhTempo: "2025-02-15", status: "Sebagian" },
  { id: 2, tanggal: "2025-01-20", pelanggan: "CV Sejahtera", invoice: "INV-002", jumlah: 75000000, dibayar: 0, jatuhTempo: "2025-02-20", status: "Belum" },
];

const initAP = [
  { id: 1, tanggal: "2025-01-10", supplier: "PT Bahan Prima", invoice: "PO-001", jumlah: 80000000, dibayar: 30000000, jatuhTempo: "2025-02-10", status: "Sebagian" },
  { id: 2, tanggal: "2025-01-18", supplier: "CV Logam Utama", invoice: "PO-002", jumlah: 45000000, dibayar: 0, jatuhTempo: "2025-02-18", status: "Belum" },
];

const initInventory = [
  { id: 1, kode: "BB-001", nama: "Baja Plat 2mm", kategori: "Bahan Baku", satuan: "Lembar", stok: 200, hargaBeli: 350000, hargaJual: 0, minimum: 50 },
  { id: 2, kode: "BB-002", nama: "Aluminium Batang", kategori: "Bahan Baku", satuan: "Kg", stok: 150, hargaBeli: 85000, hargaJual: 0, minimum: 30 },
  { id: 3, kode: "BJ-001", nama: "Komponen Mesin A", kategori: "Barang Jadi", satuan: "Unit", stok: 45, hargaBeli: 750000, hargaJual: 1200000, minimum: 10 },
  { id: 4, kode: "BJ-002", nama: "Komponen Mesin B", kategori: "Barang Jadi", satuan: "Unit", stok: 8, hargaBeli: 1200000, hargaJual: 1900000, minimum: 10 },
  { id: 5, kode: "SP-001", nama: "Baut & Mur Set", kategori: "Spare Part", satuan: "Set", stok: 500, hargaBeli: 15000, hargaJual: 0, minimum: 100 },
];

// ─── CONFIRM DIALOG ──────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="text-gray-700 mb-5">{message}</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── COA ─────────────────────────────────────────────────────
function COA({ accounts, setAccounts }) {
  const emptyForm = { kode: "", nama: "", kategori: "Aset" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const KATEGORI = ["Aset", "Kewajiban", "Ekuitas", "Pendapatan", "Beban"];
  const COLORS = { Aset: "bg-blue-100 text-blue-700", Kewajiban: "bg-red-100 text-red-700", Ekuitas: "bg-purple-100 text-purple-700", Pendapatan: "bg-green-100 text-green-700", Beban: "bg-orange-100 text-orange-700" };
  const filtered = accounts.filter(a => a.kode.includes(search) || a.nama.toLowerCase().includes(search.toLowerCase()) || a.kategori.toLowerCase().includes(search.toLowerCase()));
  const save = () => {
    if (!form.kode || !form.nama) return;
    if (editId) { setAccounts(a => a.map(ac => ac.kode === editId ? { ...form } : ac)); setEditId(null); }
    else { if (accounts.find(a => a.kode === form.kode)) { alert("Kode akun sudah ada!"); return; } setAccounts(a => [...a, { ...form }]); }
    setForm(emptyForm);
  };
  const startEdit = (ac) => { setForm({ ...ac }); setEditId(ac.kode); };
  const cancel = () => { setForm(emptyForm); setEditId(null); };
  const grouped = KATEGORI.map(k => ({ kategori: k, items: filtered.filter(a => a.kategori === k) })).filter(g => g.items.length > 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-700">Chart of Accounts</h2><div className="text-sm text-gray-400">{accounts.length} akun</div></div>
      <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm">
        <div className="font-semibold text-gray-600 mb-3">{editId ? "✏️ Edit Akun" : "➕ Tambah Akun"}</div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500">Kode</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.kode} disabled={!!editId} onChange={e => setForm(f => ({ ...f, kode: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Nama Akun</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></div>
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}>{KATEGORI.map(k => <option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={save} className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm">{editId ? "Update" : "Tambah"}</button>
          {editId && <button onClick={cancel} className="text-gray-500 px-3 py-1.5 text-sm border rounded">Batal</button>}
        </div>
      </div>
      <input className="w-full border rounded-lg p-2.5 text-sm mb-4 bg-white" placeholder="🔍 Cari akun..." value={search} onChange={e => setSearch(e.target.value)} />
      {grouped.map(g => (
        <div key={g.kategori} className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden">
          <div className="px-5 py-2.5 flex items-center gap-2 border-b bg-gray-50">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${COLORS[g.kategori]}`}>{g.kategori}</span>
            <span className="text-gray-500 text-sm">{g.items.length} akun</span>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b"><th className="p-3 text-left">Kode</th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Normal Balance</th><th className="p-3"></th></tr></thead>
            <tbody>
              {g.items.sort((a, b) => a.kode.localeCompare(b.kode)).map(ac => (
                <tr key={ac.kode} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-mono text-blue-700">{ac.kode}</td>
                  <td className="p-3">{ac.nama}</td>
                  <td className="p-3 text-gray-400 text-xs">{["Aset","Beban"].includes(ac.kategori) ? "Debit" : "Kredit"}</td>
                  <td className="p-3 text-right"><button onClick={() => startEdit(ac)} className="text-blue-600 text-xs hover:underline mr-3">Edit</button><button onClick={() => setAccounts(a => a.filter(x => x.kode !== ac.kode))} className="text-red-400 text-xs hover:underline">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ fmt, labaRugi, totalAset, totalPiutang, totalHutang, lowStock, ar, ap }) {
  const cards = [
    { label: "Total Aset", value: fmt(totalAset), color: "bg-blue-600", icon: "🏦" },
    { label: "Laba / Rugi", value: fmt(labaRugi), color: labaRugi >= 0 ? "bg-green-600" : "bg-red-600", icon: "📈" },
    { label: "Piutang Belum Lunas", value: fmt(totalPiutang), color: "bg-yellow-500", icon: "💳" },
    { label: "Hutang Belum Lunas", value: fmt(totalHutang), color: "bg-red-500", icon: "📋" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-700 mb-4">Ringkasan Perusahaan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (<div key={c.label} className={`${c.color} text-white rounded-xl p-5 shadow`}><div className="text-2xl mb-1">{c.icon}</div><div className="text-xs opacity-80">{c.label}</div><div className="text-lg font-bold mt-1">{c.value}</div></div>))}
      </div>
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="font-semibold text-red-700 mb-2">⚠️ Stok di Bawah Minimum ({lowStock.length} item)</div>
          {lowStock.map(i => <div key={i.id} className="text-sm text-red-600">{i.nama} — Stok: {i.stok} {i.satuan} (min: {i.minimum})</div>)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="font-semibold text-gray-700 mb-3">📥 Piutang Terbaru</div>
          {ar.map(r => (<div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0"><div><div className="font-medium">{r.pelanggan}</div><div className="text-gray-400">{r.invoice} · {r.jatuhTempo}</div></div><div className="text-right"><div className="font-medium text-orange-600">{fmt(r.jumlah - r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div></div>))}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="font-semibold text-gray-700 mb-3">📤 Hutang Terbaru</div>
          {ap.map(r => (<div key={r.id} className="flex justify-between text-sm py-2 border-b last:border-0"><div><div className="font-medium">{r.supplier}</div><div className="text-gray-400">{r.invoice} · {r.jatuhTempo}</div></div><div className="text-right"><div className="font-medium text-red-600">{fmt(r.jumlah - r.dibayar)}</div><div className="text-xs text-gray-400">{r.status}</div></div></div>))}
        </div>
      </div>
    </div>
  );
}

// ─── JURNAL ──────────────────────────────────────────────────
function Jurnal({ journals, setJournals, accounts, fmt }) {
  const empty = { tanggal: today(), keterangan: "", entries: [{ akun: "", posisi: "D", nominal: "" }, { akun: "", posisi: "K", nominal: "" }] };
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const addEntry = () => setForm(f => ({ ...f, entries: [...f.entries, { akun: "", posisi: "D", nominal: "" }] }));
  const updateEntry = (i, k, v) => setForm(f => { const e = [...f.entries]; e[i] = { ...e[i], [k]: v }; return { ...f, entries: e }; });
  const removeEntry = (i) => setForm(f => ({ ...f, entries: f.entries.filter((_, idx) => idx !== i) }));
  const totalD = form.entries.filter(e => e.posisi === "D").reduce((s, e) => s + (Number(e.nominal) || 0), 0);
  const totalK = form.entries.filter(e => e.posisi === "K").reduce((s, e) => s + (Number(e.nominal) || 0), 0);
  const balanced = totalD === totalK && totalD > 0;
  const save = () => {
    if (!balanced || !form.keterangan) return;
    setJournals(j => [...j, { ...form, id: Date.now(), auto: false, entries: form.entries.map(e => ({ ...e, nominal: Number(e.nominal) })) }]);
    setForm(empty); setShow(false);
  };
  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "all") setJournals([]);
    else setJournals(js => js.filter(j => j.id !== confirm.id));
    setConfirm(null);
  };
  return (
    <div>
      {confirm && <ConfirmDialog message={confirm.type === "all" ? "Hapus semua jurnal? Tindakan ini tidak bisa dibatalkan." : "Hapus jurnal ini?"} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Jurnal Umum</h2>
        <div className="flex gap-2">
          <button onClick={() => setConfirm({ type: "all" })} className="bg-red-100 text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-200">🗑 Hapus Semua</button>
          <button onClick={() => setShow(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Tambah Jurnal</button>
        </div>
      </div>
      {show && (
        <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" className="w-full border rounded p-2 text-sm mt-1" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></div>
            <div><label className="text-xs text-gray-500">Keterangan</label><input className="w-full border rounded p-2 text-sm mt-1" value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} /></div>
          </div>
          <table className="w-full text-sm mb-3">
            <thead><tr className="bg-gray-50 text-gray-500 text-xs"><th className="p-2 text-left">Akun</th><th className="p-2">D/K</th><th className="p-2 text-right">Nominal</th><th></th></tr></thead>
            <tbody>
              {form.entries.map((e, i) => (
                <tr key={i}>
                  <td className="p-1"><select className="w-full border rounded p-1" value={e.akun} onChange={v => updateEntry(i, "akun", v.target.value)}><option value="">-- Pilih Akun --</option>{accounts.map(a => <option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>)}</select></td>
                  <td className="p-1 text-center"><select className="border rounded p-1" value={e.posisi} onChange={v => updateEntry(i, "posisi", v.target.value)}><option value="D">Debit</option><option value="K">Kredit</option></select></td>
                  <td className="p-1"><input type="number" className="w-full border rounded p-1 text-right" placeholder="0" value={e.nominal} onChange={v => updateEntry(i, "nominal", v.target.value)} /></td>
                  <td className="p-1"><button onClick={() => removeEntry(i)} className="text-red-400 px-2">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`text-xs mb-3 ${balanced ? "text-green-600" : "text-red-500"}`}>Debit: {fmt(totalD)} | Kredit: {fmt(totalK)} {balanced ? "✓ Balance" : "✗ Tidak Balance"}</div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm">+ Baris</button>
            <button onClick={save} disabled={!balanced || !form.keterangan} className="bg-blue-700 text-white px-4 py-1 rounded text-sm disabled:opacity-40">Simpan</button>
            <button onClick={() => setShow(false)} className="text-gray-500 px-3 py-1 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {journals.length === 0 && <div className="p-8 text-center text-gray-400">Belum ada jurnal</div>}
        {journals.map(j => (
          <div key={j.id} className="border-b last:border-0 p-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{j.keterangan}</span>
                {j.auto && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">otomatis</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{j.tanggal}</span>
                <button onClick={() => setConfirm({ type: "single", id: j.id })} className="text-red-400 hover:text-red-600 text-xs border border-red-200 px-2 py-0.5 rounded hover:bg-red-50">🗑 Hapus</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {j.entries.map((e, i) => {
                  const acc = accounts.find(a => a.kode === e.akun);
                  return (<tr key={i} className="text-gray-600"><td className={`py-0.5 ${e.posisi === "K" ? "pl-8" : ""}`}>{acc ? `${acc.kode} - ${acc.nama}` : e.akun}</td><td className="text-right text-blue-700">{e.posisi === "D" ? fmt(e.nominal) : ""}</td><td className="text-right text-green-700">{e.posisi === "K" ? fmt(e.nominal) : ""}</td></tr>);
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUKU BESAR ──────────────────────────────────────────────
function BukuBesar({ accounts, journals, getBalance, fmt }) {
  const [sel, setSel] = useState("1102");
  const acc = accounts.find(a => a.kode === sel);
  const lines = []; let running = 0;
  journals.forEach(j => j.entries.forEach(e => {
    if (e.akun === sel) {
      const isD = ["Aset","Beban"].includes(acc?.kategori);
      running += isD ? (e.posisi === "D" ? e.nominal : -e.nominal) : (e.posisi === "K" ? e.nominal : -e.nominal);
      lines.push({ tanggal: j.tanggal, keterangan: j.keterangan, debit: e.posisi === "D" ? e.nominal : 0, kredit: e.posisi === "K" ? e.nominal : 0, saldo: running });
    }
  }));
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Buku Besar</h2>
        <select className="border rounded-lg px-3 py-2 text-sm" value={sel} onChange={e => setSel(e.target.value)}>{accounts.map(a => <option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>)}</select>
      </div>
      {acc && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-blue-800 text-white px-5 py-3"><div className="font-bold">{acc.kode} - {acc.nama}</div><div className="text-blue-200 text-sm">{acc.kategori} · Saldo: {fmt(getBalance(acc.kode, acc.kategori))}</div></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-500 text-xs border-b"><th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">Keterangan</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Kredit</th><th className="p-3 text-right">Saldo</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (<tr key={i} className="border-b last:border-0 hover:bg-gray-50"><td className="p-3 text-gray-500">{l.tanggal}</td><td className="p-3">{l.keterangan}</td><td className="p-3 text-right text-blue-700">{l.debit ? fmt(l.debit) : "-"}</td><td className="p-3 text-right text-green-700">{l.kredit ? fmt(l.kredit) : "-"}</td><td className="p-3 text-right font-medium">{fmt(l.saldo)}</td></tr>))}
              {lines.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada transaksi</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── PIUTANG ─────────────────────────────────────────────────
function Piutang({ ar, setAr, setJournals, fmt }) {
  const [show, setShow] = useState(false);
  const [pay, setPay] = useState(null);
  const [form, setForm] = useState({ tanggal: today(), pelanggan: "", invoice: "", jumlah: "", jatuhTempo: "" });
  const [bayar, setBayar] = useState("");

  const addJournal = (keterangan, tanggal, entries) => {
    setJournals(js => [...js, { id: Date.now(), tanggal, keterangan, auto: true, entries }]);
  };

  const save = () => {
    if (!form.pelanggan || !form.jumlah) return;
    const jml = Number(form.jumlah);
    setAr(a => [...a, { ...form, id: Date.now(), jumlah: jml, dibayar: 0, status: "Belum" }]);
    // Auto jurnal: Piutang (D) / Pendapatan (K)
    addJournal(`Penjualan [${form.invoice}] ${form.pelanggan}`, form.tanggal, [
      { akun: "1103", posisi: "D", nominal: jml },
      { akun: "4101", posisi: "K", nominal: jml },
    ]);
    setForm({ tanggal: today(), pelanggan: "", invoice: "", jumlah: "", jatuhTempo: "" });
    setShow(false);
  };

  const savePayment = () => {
    const b = Number(bayar);
    if (!b || !pay) return;
    setAr(a => a.map(r => {
      if (r.id !== pay.id) return r;
      const nd = Math.min(r.dibayar + b, r.jumlah);
      return { ...r, dibayar: nd, status: nd >= r.jumlah ? "Lunas" : "Sebagian" };
    }));
    // Auto jurnal: Bank (D) / Piutang (K)
    addJournal(`Terima Pembayaran [${pay.invoice}] ${pay.pelanggan}`, today(), [
      { akun: "1102", posisi: "D", nominal: b },
      { akun: "1103", posisi: "K", nominal: b },
    ]);
    setPay(null); setBayar("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Piutang Usaha</h2>
        <button onClick={() => setShow(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Invoice Baru</button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">💡 Setiap invoice dan pembayaran otomatis membuat jurnal akuntansi.</div>
      {show && (
        <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm grid grid-cols-2 gap-3">
          {[["tanggal","Tanggal","date"],["pelanggan","Pelanggan","text"],["invoice","No. Invoice","text"],["jumlah","Jumlah","number"],["jatuhTempo","Jatuh Tempo","date"]].map(([k,l,t]) => (
            <div key={k}><label className="text-xs text-gray-500">{l}</label><input type={t} className="w-full border rounded p-2 text-sm mt-1" value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} /></div>
          ))}
          <div className="col-span-2 flex gap-2 mt-1">
            <button onClick={save} className="bg-blue-700 text-white px-4 py-1 rounded text-sm">Simpan & Buat Jurnal</button>
            <button onClick={() => setShow(false)} className="text-gray-500 px-3 py-1 text-sm">Batal</button>
          </div>
        </div>
      )}
      {pay && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-5">
          <div className="font-semibold text-yellow-800 mb-1">Terima Pembayaran — {pay.pelanggan}</div>
          <div className="text-sm text-gray-500 mb-3">Sisa: {fmt(pay.jumlah - pay.dibayar)} · Jurnal: Bank (D) / Piutang Usaha (K)</div>
          <div className="flex gap-2">
            <input type="number" className="border rounded p-2 text-sm flex-1" placeholder="Nominal bayar" value={bayar} onChange={e => setBayar(e.target.value)} />
            <button onClick={savePayment} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm">Catat & Jurnal</button>
            <button onClick={() => setPay(null)} className="text-gray-500 px-3 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-gray-500 text-xs border-b">{["Tanggal","Pelanggan","Invoice","Jumlah","Dibayar","Sisa","Jatuh Tempo","Status",""].map(h => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {ar.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 text-gray-500">{r.tanggal}</td><td className="p-3 font-medium">{r.pelanggan}</td><td className="p-3 text-gray-500">{r.invoice}</td>
                <td className="p-3">{fmt(r.jumlah)}</td><td className="p-3 text-green-600">{fmt(r.dibayar)}</td><td className="p-3 text-orange-600 font-medium">{fmt(r.jumlah - r.dibayar)}</td>
                <td className="p-3 text-gray-500">{r.jatuhTempo}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span></td>
                <td className="p-3">{r.status !== "Lunas" && <button onClick={() => setPay(r)} className="text-blue-600 text-xs hover:underline">Bayar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── HUTANG ──────────────────────────────────────────────────
function Hutang({ ap, setAp, setJournals, fmt }) {
  const [show, setShow] = useState(false);
  const [pay, setPay] = useState(null);
  const [form, setForm] = useState({ tanggal: today(), supplier: "", invoice: "", jumlah: "", jatuhTempo: "" });
  const [bayar, setBayar] = useState("");

  const addJournal = (keterangan, tanggal, entries) => {
    setJournals(js => [...js, { id: Date.now(), tanggal, keterangan, auto: true, entries }]);
  };

  const save = () => {
    if (!form.supplier || !form.jumlah) return;
    const jml = Number(form.jumlah);
    setAp(a => [...a, { ...form, id: Date.now(), jumlah: jml, dibayar: 0, status: "Belum" }]);
    // Auto jurnal: Persediaan (D) / Hutang Usaha (K)
    addJournal(`Pembelian [${form.invoice}] ${form.supplier}`, form.tanggal, [
      { akun: "1201", posisi: "D", nominal: jml },
      { akun: "2101", posisi: "K", nominal: jml },
    ]);
    setForm({ tanggal: today(), supplier: "", invoice: "", jumlah: "", jatuhTempo: "" });
    setShow(false);
  };

  const savePayment = () => {
    const b = Number(bayar);
    if (!b || !pay) return;
    setAp(a => a.map(r => {
      if (r.id !== pay.id) return r;
      const nd = Math.min(r.dibayar + b, r.jumlah);
      return { ...r, dibayar: nd, status: nd >= r.jumlah ? "Lunas" : "Sebagian" };
    }));
    // Auto jurnal: Hutang Usaha (D) / Bank (K)
    addJournal(`Bayar Hutang [${pay.invoice}] ${pay.supplier}`, today(), [
      { akun: "2101", posisi: "D", nominal: b },
      { akun: "1102", posisi: "K", nominal: b },
    ]);
    setPay(null); setBayar("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Hutang Usaha</h2>
        <button onClick={() => setShow(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ PO Baru</button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">💡 Setiap PO dan pembayaran otomatis membuat jurnal akuntansi.</div>
      {show && (
        <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm grid grid-cols-2 gap-3">
          {[["tanggal","Tanggal","date"],["supplier","Supplier","text"],["invoice","No. PO/Invoice","text"],["jumlah","Jumlah","number"],["jatuhTempo","Jatuh Tempo","date"]].map(([k,l,t]) => (
            <div key={k}><label className="text-xs text-gray-500">{l}</label><input type={t} className="w-full border rounded p-2 text-sm mt-1" value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} /></div>
          ))}
          <div className="col-span-2 flex gap-2 mt-1">
            <button onClick={save} className="bg-blue-700 text-white px-4 py-1 rounded text-sm">Simpan & Buat Jurnal</button>
            <button onClick={() => setShow(false)} className="text-gray-500 px-3 py-1 text-sm">Batal</button>
          </div>
        </div>
      )}
      {pay && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-5">
          <div className="font-semibold text-red-800 mb-1">Bayar Hutang — {pay.supplier}</div>
          <div className="text-sm text-gray-500 mb-3">Sisa: {fmt(pay.jumlah - pay.dibayar)} · Jurnal: Hutang Usaha (D) / Bank (K)</div>
          <div className="flex gap-2">
            <input type="number" className="border rounded p-2 text-sm flex-1" placeholder="Nominal bayar" value={bayar} onChange={e => setBayar(e.target.value)} />
            <button onClick={savePayment} className="bg-red-600 text-white px-4 py-2 rounded text-sm">Catat & Jurnal</button>
            <button onClick={() => setPay(null)} className="text-gray-500 px-3 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-gray-500 text-xs border-b">{["Tanggal","Supplier","Invoice","Jumlah","Dibayar","Sisa","Jatuh Tempo","Status",""].map(h => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {ap.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3 text-gray-500">{r.tanggal}</td><td className="p-3 font-medium">{r.supplier}</td><td className="p-3 text-gray-500">{r.invoice}</td>
                <td className="p-3">{fmt(r.jumlah)}</td><td className="p-3 text-green-600">{fmt(r.dibayar)}</td><td className="p-3 text-red-600 font-medium">{fmt(r.jumlah - r.dibayar)}</td>
                <td className="p-3 text-gray-500">{r.jatuhTempo}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${r.status==="Lunas"?"bg-green-100 text-green-700":r.status==="Sebagian"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{r.status}</span></td>
                <td className="p-3">{r.status !== "Lunas" && <button onClick={() => setPay(r)} className="text-blue-600 text-xs hover:underline">Bayar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INVENTORY ───────────────────────────────────────────────
function Inventory({ inventory, setInventory, setJournals, fmt }) {
  const [show, setShow] = useState(false);
  const [adj, setAdj] = useState(null);
  const [form, setForm] = useState({ kode: "", nama: "", kategori: "Bahan Baku", satuan: "Unit", stok: "", hargaBeli: "", hargaJual: "", minimum: "" });
  const [qty, setQty] = useState("");
  const [tipe, setTipe] = useState("masuk");

  const akunPersediaan = (kat) => kat === "Barang Jadi" ? "1202" : "1201";

  const save = () => {
    if (!form.nama) return;
    const stok = Number(form.stok), hargaBeli = Number(form.hargaBeli);
    setInventory(i => [...i, { ...form, id: Date.now(), stok, hargaBeli, hargaJual: Number(form.hargaJual), minimum: Number(form.minimum) }]);
    // Auto jurnal stok awal jika ada nilai
    if (stok > 0 && hargaBeli > 0) {
      const nilai = stok * hargaBeli;
      setJournals(js => [...js, { id: Date.now() + 1, tanggal: today(), keterangan: `Stok Awal - ${form.nama}`, auto: true, entries: [{ akun: akunPersediaan(form.kategori), posisi: "D", nominal: nilai }, { akun: "3101", posisi: "K", nominal: nilai }] }]);
    }
    setForm({ kode: "", nama: "", kategori: "Bahan Baku", satuan: "Unit", stok: "", hargaBeli: "", hargaJual: "", minimum: "" }); setShow(false);
  };

  const saveAdj = () => {
    const q = Number(qty);
    if (!q || !adj) return;
    const nilai = q * adj.hargaBeli;
    const akun = akunPersediaan(adj.kategori);
    setInventory(i => i.map(item => item.id !== adj.id ? item : { ...item, stok: tipe === "masuk" ? item.stok + q : Math.max(0, item.stok - q) }));
    // Auto jurnal penyesuaian stok
    setJournals(js => [...js, {
      id: Date.now(), tanggal: today(), keterangan: `Penyesuaian Stok ${tipe === "masuk" ? "Masuk" : "Keluar"} - ${adj.nama}`, auto: true,
      entries: tipe === "masuk"
        ? [{ akun, posisi: "D", nominal: nilai }, { akun: "3101", posisi: "K", nominal: nilai }]
        : [{ akun: "5101", posisi: "D", nominal: nilai }, { akun, posisi: "K", nominal: nilai }]
    }]);
    setAdj(null); setQty("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Inventory & Stok</h2>
        <button onClick={() => setShow(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Item Baru</button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">💡 Penyesuaian stok otomatis membuat jurnal ke akun Persediaan.</div>
      {show && (
        <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm grid grid-cols-3 gap-3">
          {[["kode","Kode","text"],["nama","Nama Item","text"],["satuan","Satuan","text"],["stok","Stok Awal","number"],["hargaBeli","Harga Beli","number"],["hargaJual","Harga Jual","number"],["minimum","Stok Min","number"]].map(([k,l,t]) => (
            <div key={k}><label className="text-xs text-gray-500">{l}</label><input type={t} className="w-full border rounded p-2 text-sm mt-1" value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} /></div>
          ))}
          <div><label className="text-xs text-gray-500">Kategori</label><select className="w-full border rounded p-2 text-sm mt-1" value={form.kategori} onChange={e => setForm(f => ({...f,kategori:e.target.value}))}><option>Bahan Baku</option><option>Barang Jadi</option><option>Spare Part</option><option>WIP</option></select></div>
          <div className="col-span-3 flex gap-2 mt-1">
            <button onClick={save} className="bg-blue-700 text-white px-4 py-1 rounded text-sm">Simpan & Jurnal</button>
            <button onClick={() => setShow(false)} className="text-gray-500 px-3 py-1 text-sm">Batal</button>
          </div>
        </div>
      )}
      {adj && (
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 mb-5">
          <div className="font-semibold text-blue-800 mb-1">Penyesuaian Stok — {adj.nama}</div>
          <div className="text-sm text-gray-500 mb-3">Harga Beli: {fmt(adj.hargaBeli)} · Jurnal otomatis ke akun Persediaan</div>
          <div className="flex gap-2">
            <select className="border rounded p-2 text-sm" value={tipe} onChange={e => setTipe(e.target.value)}><option value="masuk">Masuk</option><option value="keluar">Keluar</option></select>
            <input type="number" className="border rounded p-2 text-sm flex-1" placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} />
            <button onClick={saveAdj} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Simpan & Jurnal</button>
            <button onClick={() => setAdj(null)} className="text-gray-500 px-3 text-sm">Batal</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-gray-500 text-xs border-b">{["Kode","Nama","Kategori","Satuan","Stok","Min","Harga Beli","Harga Jual","Nilai Stok",""].map(h => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id} className={`border-b last:border-0 hover:bg-gray-50 ${i.stok <= i.minimum ? "bg-red-50" : ""}`}>
                <td className="p-3 text-gray-500 font-mono text-xs">{i.kode}</td><td className="p-3 font-medium">{i.nama}</td>
                <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{i.kategori}</span></td>
                <td className="p-3 text-gray-500">{i.satuan}</td>
                <td className={`p-3 font-bold ${i.stok <= i.minimum ? "text-red-600" : "text-gray-700"}`}>{i.stok}</td>
                <td className="p-3 text-gray-400">{i.minimum}</td>
                <td className="p-3">{fmt(i.hargaBeli)}</td><td className="p-3">{i.hargaJual ? fmt(i.hargaJual) : "-"}</td>
                <td className="p-3 font-medium text-blue-700">{fmt(i.stok * i.hargaBeli)}</td>
                <td className="p-3"><button onClick={() => setAdj(i)} className="text-blue-600 text-xs hover:underline">Adj</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── LAPORAN ─────────────────────────────────────────────────
function Laporan({ accounts, getBalance, labaRugi, fmt }) {
  const [view, setView] = useState("laba");
  const aset = accounts.filter(a => a.kategori === "Aset");
  const kewajiban = accounts.filter(a => a.kategori === "Kewajiban");
  const ekuitas = accounts.filter(a => a.kategori === "Ekuitas");
  const pendapatan = accounts.filter(a => a.kategori === "Pendapatan");
  const beban = accounts.filter(a => a.kategori === "Beban");
  const totalAset = aset.reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalKewajiban = kewajiban.reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalEkuitas = ekuitas.reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalPendapatan = pendapatan.reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalBeban = beban.reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalKE = totalKewajiban + totalEkuitas + labaRugi;
  const balanced = Math.abs(totalAset - totalKE) < 1;

  return (
    <div>
      <div className="flex gap-3 mb-6">
        {[["laba","Laba Rugi"],["neraca","Neraca"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)} className={`px-5 py-2 rounded-lg text-sm font-medium ${view===v?"bg-blue-700 text-white":"bg-white border text-gray-600 hover:bg-gray-50"}`}>{l}</button>
        ))}
      </div>
      {view === "laba" && (
        <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-1">Laporan Laba Rugi</h3>
          <p className="text-sm text-gray-400 mb-5">Periode berjalan</p>
          <div className="mb-4">
            <div className="font-semibold text-gray-600 mb-2">Pendapatan</div>
            {pendapatan.map(a => <div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}
            <div className="flex justify-between font-semibold border-t pt-2 mt-1 text-blue-700"><span>Total Pendapatan</span><span>{fmt(totalPendapatan)}</span></div>
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-600 mb-2">Beban</div>
            {beban.map(a => <div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span className="text-red-600">({fmt(getBalance(a.kode,a.kategori))})</span></div>)}
            <div className="flex justify-between font-semibold border-t pt-2 mt-1 text-red-600"><span>Total Beban</span><span>({fmt(totalBeban)})</span></div>
          </div>
          <div className={`flex justify-between font-bold text-lg border-t-2 pt-3 ${labaRugi >= 0 ? "text-green-700" : "text-red-700"}`}>
            <span>{labaRugi >= 0 ? "Laba Bersih" : "Rugi Bersih"}</span><span>{fmt(Math.abs(labaRugi))}</span>
          </div>
        </div>
      )}
      {view === "neraca" && (
        <div>
          {!balanced && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">⚠️ Neraca tidak balance — periksa jurnal Anda.</div>}
          {balanced && <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">✓ Neraca balance</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-700 mb-4">Aset</h3>
              {aset.map(a => <div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}
              <div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700"><span>Total Aset</span><span>{fmt(totalAset)}</span></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-700 mb-4">Kewajiban & Ekuitas</h3>
              <div className="text-xs font-semibold text-gray-400 mb-1">KEWAJIBAN</div>
              {kewajiban.map(a => <div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}
              <div className="text-xs font-semibold text-gray-400 mb-1 mt-3">EKUITAS</div>
              {ekuitas.map(a => <div key={a.kode} className="flex justify-between text-sm py-1"><span className="text-gray-500">{a.nama}</span><span>{fmt(getBalance(a.kode,a.kategori))}</span></div>)}
              <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Laba Ditahan</span><span className={labaRugi>=0?"text-green-600":"text-red-600"}>{fmt(labaRugi)}</span></div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2 text-blue-700"><span>Total K + E</span><span>{fmt(totalKE)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [accounts, setAccounts] = useState(initAccounts);
  const [journals, setJournals] = useState(initJournals);
  const [ar, setAr] = useState(initAR);
  const [ap, setAp] = useState(initAP);
  const [inventory, setInventory] = useState(initInventory);

  const balances = useMemo(() => {
    const b = {};
    accounts.forEach(a => b[a.kode] = { debit: 0, kredit: 0 });
    journals.forEach(j => j.entries.forEach(e => {
      if (!b[e.akun]) b[e.akun] = { debit: 0, kredit: 0 };
      if (e.posisi === "D") b[e.akun].debit += e.nominal;
      else b[e.akun].kredit += e.nominal;
    }));
    return b;
  }, [journals, accounts]);

  const getBalance = (kode, kategori) => {
    const b = balances[kode] || { debit: 0, kredit: 0 };
    return ["Aset","Beban"].includes(kategori) ? b.debit - b.kredit : b.kredit - b.debit;
  };

  const totalPendapatan = accounts.filter(a => a.kategori === "Pendapatan").reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalBeban = accounts.filter(a => a.kategori === "Beban").reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const labaRugi = totalPendapatan - totalBeban;
  const totalAset = accounts.filter(a => a.kategori === "Aset").reduce((s, a) => s + getBalance(a.kode, a.kategori), 0);
  const totalPiutang = ar.reduce((s, r) => s + (r.jumlah - r.dibayar), 0);
  const totalHutang = ap.reduce((s, r) => s + (r.jumlah - r.dibayar), 0);
  const lowStock = inventory.filter(i => i.stok <= i.minimum);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
        <div><div className="font-bold text-xl">⚙️ Mini ERP Manufaktur</div><div className="text-blue-200 text-xs">PT Contoh Industri — Rupiah (IDR)</div></div>
        <div className="text-blue-200 text-sm">{today()}</div>
      </div>
      <div className="bg-white border-b flex overflow-x-auto">
        {TABS.map(t => (<button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab===t?"border-blue-700 text-blue-700":"border-transparent text-gray-500 hover:text-gray-800"}`}>{t}</button>))}
      </div>
      <div className="p-6">
        {tab === "Dashboard" && <Dashboard fmt={fmt} labaRugi={labaRugi} totalAset={totalAset} totalPiutang={totalPiutang} totalHutang={totalHutang} lowStock={lowStock} ar={ar} ap={ap} />}
        {tab === "Jurnal" && <Jurnal journals={journals} setJournals={setJournals} accounts={accounts} fmt={fmt} />}
        {tab === "Buku Besar" && <BukuBesar accounts={accounts} journals={journals} getBalance={getBalance} fmt={fmt} />}
        {tab === "Piutang" && <Piutang ar={ar} setAr={setAr} setJournals={setJournals} fmt={fmt} />}
        {tab === "Hutang" && <Hutang ap={ap} setAp={setAp} setJournals={setJournals} fmt={fmt} />}
        {tab === "Inventory" && <Inventory inventory={inventory} setInventory={setInventory} setJournals={setJournals} fmt={fmt} />}
        {tab === "Laporan" && <Laporan accounts={accounts} getBalance={getBalance} labaRugi={labaRugi} fmt={fmt} />}
        {tab === "COA" && <COA accounts={accounts} setAccounts={setAccounts} />}
      </div>
    </div>
  );
}
