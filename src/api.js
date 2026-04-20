// ================================================================
// api.js — Semua komunikasi ke Google Apps Script ada di sini
// ================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbygufiV9WYsb6eslnNW-45stx2fC2t4NzQtKyGyTLmsVDMGGj-AfzrzMs3U3x_Qo7PD/exec";

// ── Helper: GET request ──────────────────────────────────────
async function apiGet(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}?${query}`);
  const json = await res.json();
  if (json.status !== 200) throw new Error(json.data?.error || "API Error");
  return json.data;
}

// ── Helper: POST request ─────────────────────────────────────
async function apiPost(body = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // pakai text/plain untuk bypass CORS preflight
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.status !== 200) throw new Error(json.data?.error || "API Error");
  return json.data;
}

// ================================================================
// AUTH
// ================================================================
export const login = (username, password) =>
  apiGet({ action: "login", username, password });

// ================================================================
// READ — ambil semua data dari sheet
// ================================================================
export const getAll = (sheet) =>
  apiGet({ action: "getAll", sheet });

export const getCompany = () =>
  apiGet({ action: "getCompany" });

// ================================================================
// WRITE — insert / update / delete
// ================================================================
export const insertRow = (sheet, data) =>
  apiPost({ action: "insert", sheet, data });

export const updateRow = (sheet, data) =>
  apiPost({ action: "update", sheet, data });

export const deleteRow = (sheet, id) =>
  apiPost({ action: "delete", sheet, id });

// Batch insert banyak baris sekaligus (import CSV)
export const batchInsert = (sheet, data) =>
  apiPost({ action: "batchInsert", sheet, data });

// Replace semua data di sheet
export const replaceAll = (sheet, data) =>
  apiPost({ action: "replaceAll", sheet, data });

export const updateCompany = (data) =>
  apiPost({ action: "updateCompany", data });

// ================================================================
// SHORTCUT per modul — supaya kode di komponen lebih bersih
// ================================================================

// Accounts / COA
export const getAccounts  = () => getAll("accounts");
export const saveAccount  = (d) => d.kode ? updateRow("accounts", d) : insertRow("accounts", d);
export const deleteAccount= (id) => deleteRow("accounts", id);

// Journals
export const getJournals  = () => getAll("journals");
export const saveJournal  = (d) => insertRow("journals", d);
export const deleteJournal= (id) => deleteRow("journals", id);

// AR (Piutang)
export const getAR  = () => getAll("ar");
export const saveAR = (d) => d.id && typeof d.id === "number" && d.id < Date.now() - 1000
  ? updateRow("ar", d)
  : insertRow("ar", d);
export const updateAR = (d) => updateRow("ar", d);
export const importAR = (data, mode) =>
  mode === "replace" ? replaceAll("ar", data) : batchInsert("ar", data);

// AP (Hutang)
export const getAP  = () => getAll("ap");
export const saveAP = (d) => insertRow("ap", d);
export const updateAP = (d) => updateRow("ap", d);
export const importAP = (data, mode) =>
  mode === "replace" ? replaceAll("ap", data) : batchInsert("ap", data);

// Inventory
export const getInventory  = () => getAll("inventory");
export const saveInventory = (d) => insertRow("inventory", d);
export const updateInventory=(d) => updateRow("inventory", d);
export const importInventory=(data, mode) =>
  mode === "replace" ? replaceAll("inventory", data) : batchInsert("inventory", data);

// Customers
export const getCustomers  = () => getAll("customers");
export const saveCustomer  = (d) => d.id ? updateRow("customers", d) : insertRow("customers", d);
export const deleteCustomer= (id) => deleteRow("customers", id);
export const importCustomers=(data,mode) =>
  mode === "replace" ? replaceAll("customers", data) : batchInsert("customers", data);

// Suppliers
export const getSuppliers  = () => getAll("suppliers");
export const saveSupplier  = (d) => d.id ? updateRow("suppliers", d) : insertRow("suppliers", d);
export const deleteSupplier= (id) => deleteRow("suppliers", id);
export const importSuppliers=(data,mode) =>
  mode === "replace" ? replaceAll("suppliers", data) : batchInsert("suppliers", data);

// Templates
export const getTemplates  = () => getAll("templates");
export const saveTemplate  = (d) => d.id ? updateRow("templates", d) : insertRow("templates", d);
export const deleteTemplate= (id) => deleteRow("templates", id);