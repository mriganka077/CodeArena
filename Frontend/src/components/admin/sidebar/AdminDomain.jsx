import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, X, ChevronRight, ChevronDown,
  Edit3, Trash2, Tag, Hash, FolderOpen, AlertCircle,
  MoreHorizontal, Filter, RefreshCw, Download, Copy,
  Layers, ArrowUpRight, CheckCircle2, Clock, Zap,
  ChevronLeft, SlidersHorizontal, Grid, List,
  Globe, Code, Database, Cpu, Briefcase, Atom,
  Shield, TrendingUp, BookMarked, GraduationCap,
} from "lucide-react";



// ── Simulated async backend calls ─────────────────────────────────────────────

const API_URL = "http://localhost:4000/api/domains";
const api = {

    getAll: async () => {

        const res = await fetch(API_URL);

        return await res.json();
    },

    createCategory: async (category) => {

        const res = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                category,
            }),
        });

        return await res.json();
    },

    updateCategory: async (id, category) => {

        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                category,
            }),
        });

        return await res.json();
    },

    deleteCategory: async (id) => {

        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        return await res.json();
    },

    addItem: async (catId, item) => {

        const res = await fetch(
            `${API_URL}/${catId}/domains`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(item),
            }
        );

        return await res.json();
    },

    updateItem: async (
        catId,
        itemId,
        item
    ) => {

        const res = await fetch(
            `${API_URL}/${catId}/domains/${itemId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(item),
            }
        );

        return await res.json();
    },

    deleteItem: async (
        catId,
        itemId
    ) => {

        const res = await fetch(
            `${API_URL}/${catId}/domains/${itemId}`,
            {
                method: "DELETE",
            }
        );

        return await res.json();
    },
};

// ── ICON MAP ──────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  "Core CS":         Cpu,
  "Web Development": Code,
  "Machine Learning":Atom,
  "DevOps & Cloud":  Globe,
  "System Design":   Database,
  "Marketing":       TrendingUp,
  "Data Science":    Layers,
  "Security":        Shield,
};
const catIcon = (name) => CATEGORY_ICONS[name] ?? BookOpen;

const ACCENT_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9","#f43f5e"];
const catColor = (name) => ACCENT_COLORS[name.charCodeAt(0) % ACCENT_COLORS.length];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const toast = (msg) => {
  // lightweight in-app toast — rendered via ToastBus below
  window.__toastQueue?.push?.(msg);
};

// ── TOAST BUS (global) ────────────────────────────────────────────────────────
const ToastBus = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const queue = [];
    window.__toastQueue = queue;
    const iv = setInterval(() => {
      if (queue.length) {
        const msg = queue.shift();
        const id  = Date.now();
        setToasts((p) => [...p, { id, msg }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
      }
    }, 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white border border-white/10 shadow-2xl"
            style={{ background: "rgba(20,18,36,0.97)", backdropFilter: "blur(20px)" }}>
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ── CONFIRM DIALOG ────────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-sm rounded-2xl border border-white/8 p-6 shadow-2xl"
      style={{ background: "rgba(10,8,22,0.99)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
        <Trash2 size={18} className="text-rose-400" />
      </div>
      <p className="text-white font-bold text-sm mb-1.5">Are you sure?</p>
      <p className="text-white/40 text-xs leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

// ── CATEGORY MODAL ────────────────────────────────────────────────────────────
const CategoryModal = ({ editing, onClose, onSuccess }) => {
  const [category, setCategory] = useState(editing?.category || "");
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.updateCategory(editing._id, category.trim());
        toast("Category renamed");
      } else {
        await api.createCategory(category.trim());
        toast("Category created");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-white/8 p-6 shadow-2xl"
        style={{ background: "rgba(10,8,22,0.99)" }}>
        {/* top accent */}
        <div className="h-[3px] absolute top-0 left-0 right-0 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,transparent)" }} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
              {editing ? "Edit Category" : "New Category"}
            </p>
            <h3 className="text-white font-bold text-base">
              {editing ? "Rename Category" : "Create Category"}
            </h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">
              Category Name
            </label>
            <div className="relative">
              <FolderOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                autoFocus required
                type="text" value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Core CS, Web Development…"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 border border-white/6 outline-none focus:border-indigo-500/40 transition"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          </div>

          {!editing && (
            <div className="px-3 py-2.5 rounded-xl border border-indigo-500/15 flex items-start gap-2"
              style={{ background: "rgba(99,102,241,0.05)" }}>
              <Zap size={12} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-indigo-300/70 text-[10px] leading-relaxed">
                You can add individual domains to this category after creating it.
              </p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── DOMAIN ITEM MODAL ─────────────────────────────────────────────────────────
const ItemModal = ({ catId, editing, onClose, onSuccess }) => {
  const [name, setName] = useState(
    editing?.value || ""
);
  const [description, setDesc]  = useState(editing?.description || "");
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.updateItem(
          catId,
          editing.index,
          {
              name: name.trim()
          }
      );
        toast("Domain updated");
      } else {
        await api.addItem(catId, {
          name: name.trim()
      });
        toast("Domain added");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-white/8 p-6 shadow-2xl"
        style={{ background: "rgba(10,8,22,0.99)" }}>
        <div className="h-[3px] absolute top-0 left-0 right-0 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg,#8b5cf6,#a855f7,transparent)" }} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
              {editing ? "Edit Domain" : "Add Domain"}
            </p>
            <h3 className="text-white font-bold text-base">
              {editing ? "Update Domain" : "New Domain"}
            </h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">
              Domain Name
            </label>
            <div className="relative">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                autoFocus required
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures, React…"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 border border-white/6 outline-none focus:border-purple-500/40 transition"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">
              Description <span className="text-white/20 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description of this domain…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-xs text-white/70 placeholder-white/20 border border-white/6 outline-none focus:border-purple-500/40 resize-none transition"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#a855f7)" }}>
            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
            {saving ? "Saving…" : editing ? "Update Domain" : "Add Domain"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── CATEGORY DRAWER ───────────────────────────────────────────────────────────
const CategoryDrawer = ({ cat, onClose, onRefresh, onEditCat }) => {
  const [confirm, setConfirm]       = useState(null); // { type, itemId }
  const [itemModal, setItemModal]   = useState(null); // null | "add" | item-obj
  const [deleting, setDeleting]     = useState(false);

  if (!cat) return null;

  const color = catColor(cat.category);
  const Icon  = catIcon(cat.category);

  const handleDeleteItem = async (itemId) => {
    setDeleting(true);
    await api.deleteItem(cat._id, itemId);
    toast("Domain removed");
    setDeleting(false);
    setConfirm(null);
    onRefresh();
  };

  const handleDeleteCat = async () => {
    await api.deleteCategory(cat._id);
    toast("Category deleted");
    onClose();
    onRefresh();
  };

  return (
    <>
      <AnimatePresence>
        <motion.div key="ov"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.aside key="dr"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
          style={{ background: "rgba(10,8,22,0.99)" }}
          onClick={(e) => e.stopPropagation()}>

          {/* sticky header */}
          <div className="sticky top-0 z-10 border-b border-white/6"
            style={{ background: "rgba(10,8,22,0.96)" }}>
            {/* accent bar */}
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${color},${color}55,transparent)` }} />
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/5 transition"
                >
                  <X size={15} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{cat.category}</p>
                    <p className="text-white/35 text-[11px] mt-0.5">{cat.domains ?.length || 0} domain{(cat.domains ?.length || 0) !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
            {/* section heading */}
            <div className="flex items-center justify-between">
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Domains</p>
              <button
                onClick={() => setItemModal("add")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition"
              >
                <Plus size={12} />
                Add Domain
              </button>
            </div>

            {/* domain list */}
            {(cat.domains?.length || 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Tag size={20} style={{ color }} />
                </div>
                <p className="text-white font-semibold text-sm">No domains yet</p>
                <p className="text-white/30 text-xs max-w-[180px]">Add the first domain to this category.</p>
                <button onClick={() => setItemModal("add")}
                  className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  <Plus size={12} /> Add Domain
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence>
                 {cat.domains?.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                      className="group rounded-xl border border-white/5 p-4 hover:border-white/10 transition"
                      style={{ background: "rgba(255,255,255,0.025)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                          <div>
                            <p className="text-white font-semibold text-xs">{item}</p>
                            {item.description && (
                              <p className="text-white/35 text-[10px] mt-1 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                         <button
                           onClick={() =>
                             setItemModal({
                               value: item,
                               index: i,
                             })
                           }
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-indigo-400 hover:bg-indigo-500/10 transition">
                            <Edit3 size={11} />
                          </button>
                          <button onClick={() => setConfirm({ type: "item", itemId: i, itemName: item })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div
            className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
            style={{ background: "rgba(10,8,22,0.96)" }}
          >
            <button
              onClick={() => setConfirm({ type: "cat" })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/40 transition"
            >
              <Trash2 size={13} />
              Delete Category
            </button>

            <button
              onClick={() => {
                onEditCat(cat);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
              style={{
                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
              }}
            >
              <Edit3 size={13} />
              Edit Category
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Confirm dialogs */}
      {confirm?.type === "item" && (
        <ConfirmDialog
          message={`Remove "${confirm.itemName}" from this category? This cannot be undone.`}
          onConfirm={() => handleDeleteItem(confirm.itemId)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "cat" && (
        <ConfirmDialog
          message={`Delete the entire "${cat.category}" category and all ${cat.domains ?.length || 0} domains? This cannot be undone.`}
          onConfirm={handleDeleteCat}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Item modal */}
      {itemModal && (
        <ItemModal
          catId={cat._id}
          editing={itemModal === "add" ? null : itemModal}
          onClose={() => setItemModal(null)}
          onSuccess={() => { setItemModal(null); onRefresh(); }}
        />
      )}
    </>
  );
};

// ── CATEGORY CARD ─────────────────────────────────────────────────────────────
const CategoryCard = ({ cat, onClick }) => {
  const color = catColor(cat.category);
  const Icon  = catIcon(cat.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      onClick={onClick}
      className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group"
      style={{ background: "rgba(255,255,255,0.025)" }}>
      {/* accent bar */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${color},${color}55,transparent)` }} />

      <div className="p-5 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition">{cat.category}</p>
              <p className="text-white/35 text-[10px] mt-0.5">{cat.domains ?.length || 0} domain{cat.domains ?.length || 0 !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
        </div>

        {/* domain tags preview */}
        {(cat.domains ?.length || 0) > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {(cat.domains || []).slice(0, 4).map((item, i) => (
              <span key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                style={{ background: `${color}10`, borderColor: `${color}28`, color }}>
                {item}
              </span>
            ))}
            {cat.domains ?.length || 0 > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/8 text-white/30">
                +{(cat.domains ?.length || 0) - 4} more
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="w-1 h-1 rounded-full bg-white/15" />
            <p className="text-white/20 text-[10px]">No domains yet</p>
          </div>
        )}

        {/* bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((((cat.domains ?.length || 0) / 6)) * 100, 100)}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg,${color},${color}88)` }}
            />
          </div>
          <span className="text-white/25 text-[9px] shrink-0">{cat.domains ?.length || 0}/6</span>
        </div>
      </div>
    </motion.div>
  );
};

// ── TABLE ROW ─────────────────────────────────────────────────────────────────
const DomainTableRow = ({ cat, i, onClick }) => {
  const color = catColor(cat.category);
  const Icon  = catIcon(cat.category);
  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
      onClick={onClick}
      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
            <Icon size={12} style={{ color }} />
          </div>
          <p className="text-white font-semibold text-xs">{cat.category}</p>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap gap-1">
          {(cat.domains || []).slice(0, 3).map((item, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] border"
              style={{ background: `${color}10`, borderColor: `${color}28`, color }}>
              {item}
            </span>
          ))}
          {cat.domains ?.length || 0 > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/8 text-white/30">+{cat.domains ?.length || 0 - 3}</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{cat.domains ?.length || 0}</td>
      <td className="px-5 py-3.5">
        <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </td>
    </motion.tr>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const AdminDomain = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState("grid");
  const [catModal, setCatModal]     = useState(null); // null | "new" | cat-obj
  const [selected, setSelected]     = useState(null);
  const [confirm, setConfirm]       = useState(null);

  const load = async () => {

    try {

        setLoading(true);

        const data = await api.getAll();

        console.log(data);

        setCategories(
            Array.isArray(data) ? data : []
        );

        setSelected((prev) =>
            prev
                ? data.find(
                      (c) =>
                          c._id === prev._id
                  ) ?? null
                : null
        );

    } catch (error) {

        console.log(error);

        setCategories([]);

    } finally {

        setLoading(false);
    }
};

  useEffect(() => { load(); }, []);

  const filtered = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
        !q ||
        cat.category
            .toLowerCase()
            .includes(q) ||
            (cat.domains || []).some((i) =>
              i.toLowerCase().includes(q)
          )
    );
  });

  // summary stats
  const totalCats    = categories.length;
  const totalDomains = categories.reduce(
    (s, c) => s + (c.domains?.length || 0),
    0
);

const largest = categories.reduce(
    (m, c) =>
        (c.domains?.length || 0) >
        (m?.domains?.length || 0)
            ? c
            : m,
    null
);
  const avgDomains   = totalCats ? (totalDomains / totalCats).toFixed(1) : 0;

  return (
    <>
      <div className="w-full flex flex-col space-y-4">

        {/* page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={15} className="text-indigo-400" />
              <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Domains</p>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Domain Manager</h2>
            <p className="text-white/35 text-xs mt-0.5">
              {totalCats} categories · {totalDomains} domains
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCatModal("new")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Plus size={13} /> New Category
          </motion.button>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Categories",    value: totalCats,    color: "#818cf8", Icon: FolderOpen },
            { label: "Total Domains", value: totalDomains, color: "#4ade80", Icon: Tag },
            { label: "Avg / Category",value: avgDomains,   color: "#facc15", Icon: Layers },
            { label: "Largest",       value: largest?.category ?? "—", color: "#38bdf8", Icon: GraduationCap },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.025)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                <s.Icon size={16} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-xl leading-none truncate">{s.value}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or domains…"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
              style={{ background: "rgba(255,255,255,0.04)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                <X size={12} />
              </button>
            )}
          </div>

          {/* view toggle */}
          <div className="flex gap-1 p-1 rounded-xl border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
            {[{ key: "grid", Icon: Grid }, { key: "table", Icon: List }].map(({ key, Icon }) => (
              <button key={key} onClick={() => setViewMode(key)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode === key ? "bg-indigo-500/25 text-indigo-300" : "text-white/25 hover:text-white/60"}`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" className="flex items-center justify-center py-24 gap-3 text-white/30">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Loading domains…</span>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.length === 0
                ? <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2">
                    <AlertCircle size={28} />
                    <p className="text-sm">No categories match your search.</p>
                  </div>
                : filtered.map((cat) => (
                    <CategoryCard key={cat._id} cat={cat} onClick={() => setSelected(cat)} />
                  ))}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      {["Category", "Domains", "Count", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={4} className="px-5 py-12 text-center text-white/25">No categories match your search.</td></tr>
                      : filtered.map((cat, i) => (
                          <DomainTableRow key={cat._id} cat={cat} i={i} onClick={() => setSelected(cat)} />
                        ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {categories.length} categories</p>
                    <button
                      onClick={() => {

                        const rows = [];

                        categories.forEach((cat) => {

                          (cat.domains || []).forEach(
                            (domain) => {

                              rows.push({
                                Category: cat.category,
                                Domain: domain,
                              });
                            }
                          );

                          if (
                            (cat.domains || []).length === 0
                          ) {

                            rows.push({
                              Category: cat.category,
                              Domain: "",
                            });
                          }
                        });

                        const csv = [
                          ["Category", "Domain"],

                          ...rows.map((r) => [
                            r.Category,
                            r.Domain,
                          ]),
                        ]
                          .map((e) =>
                            e
                              .map((x) => `"${x}"`)
                              .join(",")
                          )
                          .join("\n");

                        const blob = new Blob(
                          [csv],
                          {
                            type:
                              "text/csv;charset=utf-8;",
                          }
                        );

                        const url =
                          window.URL.createObjectURL(
                            blob
                          );

                        const link =
                          document.createElement("a");

                        link.href = url;

                        link.setAttribute(
                          "download",
                          "domains.csv"
                        );

                        document.body.appendChild(
                          link
                        );

                        link.click();

                        document.body.removeChild(
                          link
                        );

                        toast(
                          "CSV exported successfully"
                        );
                      }}
                      className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition"
                    >
                      Export CSV
                      <Download size={11} />
                    </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Drawer */}
      <CategoryDrawer
        cat={selected}
        onClose={() => setSelected(null)}
        onRefresh={load}
        onEditCat={(cat) => setCatModal(cat)}
      />

      {/* Category Modal (new / edit) */}
      {catModal && (
        <CategoryModal
          editing={catModal === "new" ? null : catModal}
          onClose={() => setCatModal(null)}
          onSuccess={() => { setCatModal(null); load(); }}
        />
      )}

      <ToastBus />
    </>
  );
};

export default AdminDomain;