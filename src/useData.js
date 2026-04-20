// ================================================================
// useData.js — Central data store yang sync ke Google Sheets
// ================================================================
import { useState, useEffect, useCallback } from "react";
import * as api from "./api";

// Data default kalau Sheets kosong
const DEFAULTS = {
  accounts:  [],
  journals:  [],
  ar:        [],
  ap:        [],
  inventory: [],
  customers: [],
  suppliers: [],
  templates: [
    { id:1, nama:"Standard", headerText:"PT Contoh Industri", footerText:"Terima kasih.", showSignature:true, logo:"", primaryColor:"#1e40af", accent:"#dbeafe" },
  ],
  company: { nama:"PT Contoh Industri", alamat:"Jakarta", telp:"021-0000000", email:"info@perusahaan.co.id", npwp:"" },
};

export function useData() {
  const [data, setData]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [syncing, setSyncing] = useState(false); // loading saat write

  // ── Load semua data dari Sheets ─────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accounts, journals, ar, ap, inventory, customers, suppliers, templates, company] = await Promise.all([
        api.getAccounts(),
        api.getJournals(),
        api.getAR(),
        api.getAP(),
        api.getInventory(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getTemplates(),
        api.getCompany(),
      ]);
      setData({ accounts, journals, ar, ap, inventory, customers, suppliers, templates, company });
    } catch (err) {
      setError("Gagal load data: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saat pertama buka
  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-refresh setiap 30 detik (untuk multi-user sync)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!syncing) loadAll();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAll, syncing]);

  // ── Helper: wrap API call dengan loading state ───────────────
  const withSync = useCallback(async (fn) => {
    setSyncing(true);
    try {
      await fn();
    } catch (err) {
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  // ── ACCOUNTS ─────────────────────────────────────────────────
  const addAccount = async (account) => {
    await withSync(async () => {
      await api.insertRow("accounts", account);
      setData(d => ({ ...d, accounts: [...d.accounts, account] }));
    });
  };

  const editAccount = async (account) => {
    await withSync(async () => {
      await api.updateRow("accounts", account);
      setData(d => ({ ...d, accounts: d.accounts.map(a => a.kode === account.kode ? account : a) }));
    });
  };

  const removeAccount = async (kode) => {
    await withSync(async () => {
      await api.deleteRow("accounts", kode);
      setData(d => ({ ...d, accounts: d.accounts.filter(a => a.kode !== kode) }));
    });
  };

  // ── JOURNALS ─────────────────────────────────────────────────
  const addJournal = async (journal) => {
    await withSync(async () => {
      await api.insertRow("journals", journal);
      setData(d => ({ ...d, journals: [...d.journals, journal] }));
    });
  };

  const removeJournal = async (id) => {
    await withSync(async () => {
      await api.deleteRow("journals", id);
      setData(d => ({ ...d, journals: d.journals.filter(j => j.id !== id) }));
    });
  };

  const clearJournals = async () => {
    await withSync(async () => {
      await api.replaceAll("journals", []);
      setData(d => ({ ...d, journals: [] }));
    });
  };

  // ── AR (PIUTANG) ─────────────────────────────────────────────
  const addAR = async (ar) => {
    await withSync(async () => {
      await api.insertRow("ar", ar);
      setData(d => ({ ...d, ar: [...d.ar, ar] }));
    });
  };

  const updateARItem = async (ar) => {
    await withSync(async () => {
      await api.updateRow("ar", ar);
      setData(d => ({ ...d, ar: d.ar.map(r => r.id === ar.id ? ar : r) }));
    });
  };

  const importARData = async (rows, mode) => {
    await withSync(async () => {
      await api.importAR(rows, mode);
      if (mode === "replace") setData(d => ({ ...d, ar: rows }));
      else setData(d => ({ ...d, ar: [...d.ar, ...rows] }));
    });
  };

  // ── AP (HUTANG) ──────────────────────────────────────────────
  const addAP = async (ap) => {
    await withSync(async () => {
      await api.insertRow("ap", ap);
      setData(d => ({ ...d, ap: [...d.ap, ap] }));
    });
  };

  const updateAPItem = async (ap) => {
    await withSync(async () => {
      await api.updateRow("ap", ap);
      setData(d => ({ ...d, ap: d.ap.map(r => r.id === ap.id ? ap : r) }));
    });
  };

  const importAPData = async (rows, mode) => {
    await withSync(async () => {
      await api.importAP(rows, mode);
      if (mode === "replace") setData(d => ({ ...d, ap: rows }));
      else setData(d => ({ ...d, ap: [...d.ap, ...rows] }));
    });
  };

  // ── INVENTORY ────────────────────────────────────────────────
  const addInventory = async (item) => {
    await withSync(async () => {
      await api.insertRow("inventory", item);
      setData(d => ({ ...d, inventory: [...d.inventory, item] }));
    });
  };

  const updateInventoryItem = async (item) => {
    await withSync(async () => {
      await api.updateRow("inventory", item);
      setData(d => ({ ...d, inventory: d.inventory.map(i => i.id === item.id ? item : i) }));
    });
  };

  const importInventoryData = async (rows, mode) => {
    await withSync(async () => {
      await api.importInventory(rows, mode);
      if (mode === "replace") setData(d => ({ ...d, inventory: rows }));
      else setData(d => ({ ...d, inventory: [...d.inventory, ...rows] }));
    });
  };

  // ── CUSTOMERS ────────────────────────────────────────────────
  const addCustomer = async (c) => {
    await withSync(async () => {
      await api.insertRow("customers", c);
      setData(d => ({ ...d, customers: [...d.customers, c] }));
    });
  };

  const editCustomer = async (c) => {
    await withSync(async () => {
      await api.updateRow("customers", c);
      setData(d => ({ ...d, customers: d.customers.map(x => x.id === c.id ? c : x) }));
    });
  };

  const removeCustomer = async (id) => {
    await withSync(async () => {
      await api.deleteRow("customers", id);
      setData(d => ({ ...d, customers: d.customers.filter(x => x.id !== id) }));
    });
  };

  const importCustomersData = async (rows, mode) => {
    await withSync(async () => {
      await api.importCustomers(rows, mode);
      if (mode === "replace") setData(d => ({ ...d, customers: rows }));
      else setData(d => ({ ...d, customers: [...d.customers, ...rows] }));
    });
  };

  // ── SUPPLIERS ────────────────────────────────────────────────
  const addSupplier = async (s) => {
    await withSync(async () => {
      await api.insertRow("suppliers", s);
      setData(d => ({ ...d, suppliers: [...d.suppliers, s] }));
    });
  };

  const editSupplier = async (s) => {
    await withSync(async () => {
      await api.updateRow("suppliers", s);
      setData(d => ({ ...d, suppliers: d.suppliers.map(x => x.id === s.id ? s : x) }));
    });
  };

  const removeSupplier = async (id) => {
    await withSync(async () => {
      await api.deleteRow("suppliers", id);
      setData(d => ({ ...d, suppliers: d.suppliers.filter(x => x.id !== id) }));
    });
  };

  // ── COMPANY ──────────────────────────────────────────────────
  const saveCompany = async (company) => {
    await withSync(async () => {
      await api.updateCompany(company);
      setData(d => ({ ...d, company }));
    });
  };

  // ── TEMPLATES ────────────────────────────────────────────────
  const saveTemplate = async (tpl) => {
    await withSync(async () => {
      if (tpl.id) await api.updateRow("templates", tpl);
      else await api.insertRow("templates", { ...tpl, id: Date.now() });
      const exists = data.templates.find(t => t.id === tpl.id);
      if (exists) setData(d => ({ ...d, templates: d.templates.map(t => t.id === tpl.id ? tpl : t) }));
      else setData(d => ({ ...d, templates: [...d.templates, tpl] }));
    });
  };

  const removeTemplate = async (id) => {
    await withSync(async () => {
      await api.deleteRow("templates", id);
      setData(d => ({ ...d, templates: d.templates.filter(t => t.id !== id) }));
    });
  };

  return {
    // State
    data, loading, error, syncing,

    // Actions
    loadAll,
    addAccount, editAccount, removeAccount,
    addJournal, removeJournal, clearJournals,
    addAR, updateARItem, importARData,
    addAP, updateAPItem, importAPData,
    addInventory, updateInventoryItem, importInventoryData,
    addCustomer, editCustomer, removeCustomer, importCustomersData,
    addSupplier, editSupplier, removeSupplier,
    saveCompany,
    saveTemplate, removeTemplate,
  };
}