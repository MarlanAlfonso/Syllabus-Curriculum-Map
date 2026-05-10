import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAllUsers, promoteToAdmin, demoteFromAdmin } from "../services/userService";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

function timeAgo(date) {
  if (!date) return "Never";
  const d   = date?.toDate ? date.toDate() : new Date(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)    return "Just now";
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800)return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ user, size = 36 }) {
  const [imgErr, setImgErr] = useState(false);
  const initial = (user.displayName || user.email || "?")[0].toUpperCase();
  if (user.photoURL && !imgErr) {
    return (
      <img src={user.photoURL} alt={user.displayName}
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.38 }}>{initial}</span>
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, user, action, loading, dark }) {
  if (!isOpen || !user) return null;
  const isPromote = action === "promote";
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      animation: "um-fadeIn 0.15s ease" }}>
      <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 16,
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: "um-scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)", overflow: "hidden" }}>

        <div style={{ padding: "28px 28px 20px", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 12,
          borderBottom: `1px solid ${dark ? "#334155" : "#f3f4f6"}` }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%",
            background: isPromote ? (dark ? "#1e3a5f" : "#dbeafe") : (dark ? "#3b0f14" : "#fee2e2"),
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isPromote ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3v16M3 11h16" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 11h12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 700,
              color: dark ? "#f1f5f9" : "#111827" }}>
              {isPromote ? "Promote to Admin?" : "Remove Admin Access?"}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: dark ? "#94a3b8" : "#6b7280", lineHeight: 1.5 }}>
              {isPromote
                ? `${user.displayName || user.email} will be able to add, edit, and manage courses.`
                : `${user.displayName || user.email} will lose admin privileges and revert to a regular user.`}
            </p>
          </div>
        </div>

        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${dark ? "#334155" : "#f3f4f6"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            borderRadius: 10, background: dark ? "#0f172a" : "#f8fafc",
            border: `1px solid ${dark ? "#334155" : "#e5e7eb"}` }}>
            <Avatar user={user} size={32} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600,
                color: dark ? "#f1f5f9" : "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.displayName || "—"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: dark ? "#64748b" : "#9ca3af",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 28px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={loading} style={{
            padding: "9px 20px", borderRadius: 10,
            border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
            background: dark ? "#1f2937" : "#f9fafb",
            color: dark ? "#94a3b8" : "#374151",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: isPromote
              ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
              : "linear-gradient(135deg,#dc2626,#ef4444)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 7 }}>
            {loading && (
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
                animation: "um-spin 0.7s linear infinite" }} />
            )}
            {loading ? "Saving…" : isPromote ? "Promote" : "Remove Admin"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const { user: currentUser, role, authLoading } = useAuth();

  // ── ALL hooks must come before any conditional return ──────────────────
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [filterRole,    setFilterRole]    = useState("all");
  const [sortBy,        setSortBy]        = useState("lastLogin");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg,      setToastMsg]      = useState(null);
  const [visible,       setVisible]       = useState(false);

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
      setTimeout(() => setVisible(true), 50);
    } catch (err) {
      setError("Failed to load users. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ This useEffect is now BEFORE the conditional return
  useEffect(() => {
    if (!authLoading && role === "admin") fetchUsers();
  }, [authLoading, role, fetchUsers]);
  // ──────────────────────────────────────────────────────────────────────

  // Admin-only guard — safe to do AFTER all hooks
  if (role && role !== "admin") return <Navigate to="/home" replace />;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAction = async () => {
    if (!confirmDialog.user) return;
    setActionLoading(true);
    try {
      if (confirmDialog.action === "promote") {
        await promoteToAdmin(confirmDialog.user.email);
        showToast(`${confirmDialog.user.displayName || confirmDialog.user.email} promoted to Admin.`);
      } else {
        await demoteFromAdmin(confirmDialog.user.email);
        showToast(`${confirmDialog.user.displayName || confirmDialog.user.email} removed from Admin.`);
      }
      await fetchUsers();
      setConfirmDialog({ open: false, user: null, action: null });
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q);
      const matchRole =
        filterRole === "all" ||
        (filterRole === "admin" && u.role === "admin") ||
        (filterRole === "user"  && u.role !== "admin");
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "name")  return (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "role")  return (b.role === "admin" ? 1 : 0) - (a.role === "admin" ? 1 : 0);
      const da  = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0);
      const db_ = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0);
      return db_ - da;
    });

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount  = users.length - adminCount;

  const bg        = dark ? "#0f172a" : "#f9fafb";
  const cardBg    = dark ? "#111827" : "#fff";
  const border    = dark ? "#1f2937" : "#e5e7eb";
  const text      = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#9ca3af" : "#6b7280";
  const rowHover  = dark ? "#1a2234" : "#f8fafc";
  const theadBg   = dark ? "#1a2234" : "#f8fafc";
  const filterBg  = dark ? "#161f2e" : "#fafafa";

    // Add this BEFORE the loading spinner return
  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh" }}>
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36,
            border: "2px solid #dbeafe", borderTop: "2px solid #2563eb",
            borderRadius: "50%", margin: "0 auto 12px",
            animation: "um-spin 0.8s linear infinite" }} />
        <style>{`@keyframes um-spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 13, color: "#6b7280" }}>Verifying session…</p>
        </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", background: bg }}>
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36,
          border: `2px solid ${dark ? "#1f2937" : "#dbeafe"}`,
          borderTop: "2px solid #2563eb", borderRadius: "50%",
          margin: "0 auto 12px", animation: "um-spin 0.8s linear infinite" }} />
        <style>{`@keyframes um-spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 13, color: textMuted }}>Loading users…</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px",
      fontFamily: "'DM Sans', system-ui, sans-serif", background: bg, minHeight: "100vh" }}>
      <style>{`
        @keyframes um-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes um-scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes um-spin    { to{transform:rotate(360deg)} }
        @keyframes um-slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes um-toastIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .um-anim { animation: um-slideUp 0.35s ease both; }
        .um-d1   { animation-delay: 0.03s; }
        .um-d2   { animation-delay: 0.07s; }

        .um-row { transition: background 0.12s; }
        .um-row:hover { background: ${rowHover} !important; }

        .um-sort-btn {
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 11px; font-weight: 700;
          color: ${textMuted}; letter-spacing: .07em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 4px; padding: 0;
          transition: color 0.15s;
        }
        .um-sort-btn:hover  { color: #2563eb; }
        .um-sort-btn.active { color: #2563eb; }

        .um-select {
          appearance: none; -webkit-appearance: none;
          padding: 7px 28px 7px 10px; border-radius: 9px;
          border: 1px solid ${border};
          background: ${cardBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;
          color: ${text}; font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer; outline: none;
          transition: border-color 0.15s;
        }
        .um-select:focus { border-color: #2563eb; }

        .um-action-btn {
          padding: 5px 12px; border-radius: 7px; font-size: 11.5px;
          font-weight: 600; font-family: inherit; cursor: pointer;
          border: none; transition: all 0.15s; white-space: nowrap;
        }
        .um-action-btn:hover:not(:disabled) { transform: translateY(-1px); }

        .um-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: ${cardBg}; border: 1px solid ${border};
          border-radius: 10px; padding: 0 12px; height: 38px; width: 240px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .um-search-wrap:focus-within {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.2);
        }
        .um-search-wrap input {
          border: none; outline: none; font-size: 13px;
          background: transparent; width: 100%;
          font-family: inherit; color: ${text};
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: dark ? "#1e293b" : "#111827", color: "#fff",
          fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)", animation: "um-toastIn 0.25s ease",
          display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" fill="#22c55e"/>
            <path d="M4.5 7l2 2 3-3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="um-anim um-d1" style={{ display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
            textTransform: "uppercase", color: "#2563eb", margin: "0 0 4px" }}>
            Admin Portal
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: text, margin: 0, letterSpacing: "-0.02em" }}>
            User Management
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "5px 0 0" }}>
            Manage student and admin access to the Knowledge Map.
          </p>
        </div>
        <button onClick={fetchUsers} style={{ display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 10, border: `1px solid ${border}`,
          background: cardBg, color: textMuted, fontSize: 13, fontWeight: 600,
          fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <polyline points="10,1 10,4 13,4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="um-anim um-d1" style={{ display: "grid",
        gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          {
            label: "Total Users", value: users.length,
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3.5" stroke="#1d4ed8" strokeWidth="1.4"/>
              <path d="M2.5 16c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="#1d4ed8" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>,
            iconBg: dark ? "#1e3a5f" : "#eff6ff",
          },
          {
            label: "Admins", value: adminCount,
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11.5 7H16.5L12.5 10.3L14 15.5L9 12.5L4 15.5L5.5 10.3L1.5 7H6.5L9 2Z"
                stroke="#d97706" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>,
            iconBg: dark ? "#2d1f07" : "#fffbeb",
          },
          {
            label: "Students", value: userCount,
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2l7 3.5-7 3.5-7-3.5L9 2Z" stroke="#15803d" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M16 5.5v5M4 9v4.5c0 1.5 2.2 3 5 3s5-1.5 5-3V9"
                stroke="#15803d" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>,
            iconBg: dark ? "#14301f" : "#f0fdf4",
          },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`,
            borderRadius: 12, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: text, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: textMuted, fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="um-anim um-d2" style={{ background: cardBg, border: `1px solid ${border}`,
        borderRadius: 14, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: `1px solid ${border}`,
          background: filterBg, flexWrap: "wrap", gap: 10 }}>
          <div className="um-search-wrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke={textMuted} strokeWidth="1.4"/>
              <path d="M11.5 11.5l2.5 2.5" stroke={textMuted} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none",
                cursor: "pointer", color: textMuted, padding: 0, display: "flex" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select className="um-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Students only</option>
            </select>
            <select className="um-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="lastLogin">Last Login</option>
              <option value="name">Name (A–Z)</option>
              <option value="email">Email (A–Z)</option>
              <option value="role">Role</option>
            </select>
            <span style={{ fontSize: 12, color: textMuted }}>
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ margin: 16, padding: "12px 16px", borderRadius: 10,
            background: dark ? "rgba(220,38,38,0.1)" : "#fef2f2",
            border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`,
            color: dark ? "#fca5a5" : "#b91c1c", fontSize: 13 }}>
            {error}
          </div>
        )}

        {!error && filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 24px", color: textMuted }}>
            <div style={{ width: 52, height: 52, borderRadius: 14,
              background: dark ? "#1f2937" : "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke={dark ? "#4b5563" : "#d1d5db"} strokeWidth="1.5"/>
                <path d="M3 20c0-4 2.7-6 6-6s6 2 6 6"
                  stroke={dark ? "#4b5563" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>
              {search || filterRole !== "all" ? "No users match your filters" : "No users found"}
            </p>
            <p style={{ fontSize: 12, color: dark ? "#4b5563" : "#9ca3af" }}>
              {search || filterRole !== "all"
                ? "Try clearing your search or filter"
                : "Users appear here after they log in for the first time."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theadBg }}>
                  {[
                    { key: "name",      label: "User"       },
                    { key: "role",      label: "Role"       },
                    { key: "email",     label: "Email"      },
                    { key: "lastLogin", label: "Last Login" },
                    { key: null,        label: "Actions"    },
                  ].map(col => (
                    <th key={col.label} style={{ padding: "10px 16px", textAlign: "left",
                      borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>
                      {col.key ? (
                        <button className={`um-sort-btn${sortBy === col.key ? " active" : ""}`}
                          onClick={() => setSortBy(col.key)}>
                          {col.label}
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
                            style={{ opacity: sortBy === col.key ? 1 : 0.35 }}>
                            <path d="M1 3l3-2 3 2M1 5l3 2 3-2"
                              stroke="currentColor" strokeWidth="1.3"
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: textMuted,
                          letterSpacing: ".07em", textTransform: "uppercase" }}>
                          {col.label}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const isCurrentUser = u.email === currentUser?.email;
                  const isAdmin       = u.role === "admin";
                  return (
                    <tr key={u.id} className="um-row" style={{
                      borderBottom: `1px solid ${border}`,
                      animation: "um-slideUp 0.3s ease both",
                      animationDelay: `${idx * 0.025}s` }}>

                      {/* User */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <Avatar user={u} size={36} />
                            {isAdmin && (
                              <div style={{ position: "absolute", bottom: -2, right: -2,
                                width: 14, height: 14, borderRadius: "50%", background: "#f59e0b",
                                border: `2px solid ${cardBg}`, display: "flex",
                                alignItems: "center", justifyContent: "center" }}>
                                <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                                  <path d="M5 1l1.5 3H10L7.5 6l1 3.5L5 8l-3.5 1.5 1-3.5L0 4h3.5L5 1Z" fill="#fff"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: text,
                                whiteSpace: "nowrap", overflow: "hidden",
                                textOverflow: "ellipsis", maxWidth: 180 }}>
                                {u.displayName || "—"}
                              </span>
                              {isCurrentUser && (
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px",
                                  borderRadius: 999,
                                  background: dark ? "#1e3a5f" : "#dbeafe",
                                  color: dark ? "#93c5fd" : "#1d4ed8",
                                  letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                  You
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: textMuted,
                              fontFamily: "'DM Mono','Fira Code',monospace" }}>
                              {u.uid?.slice(0, 10)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                          background: isAdmin
                            ? (dark ? "#2d1f07" : "#fffbeb") : (dark ? "#1f2937" : "#f3f4f6"),
                          color: isAdmin
                            ? (dark ? "#fcd34d" : "#b45309") : (dark ? "#6b7280" : "#6b7280"),
                          border: `1px solid ${isAdmin
                            ? (dark ? "#854d0e" : "#fde68a") : (dark ? "#374151" : "#e5e7eb")}` }}>
                          {isAdmin ? "⭐ Admin" : "👤 Student"}
                        </span>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: 13, color: textMuted,
                          fontFamily: "'DM Mono','Fira Code',monospace" }}>
                          {u.email}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: 12.5, color: textMuted }}>
                          {timeAgo(u.lastLogin)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        {isCurrentUser ? (
                          <span style={{ fontSize: 11.5,
                            color: dark ? "#475569" : "#d1d5db", fontStyle: "italic" }}>
                            (current session)
                          </span>
                        ) : isAdmin ? (
                          <button className="um-action-btn"
                            onClick={() => setConfirmDialog({ open: true, user: u, action: "demote" })}
                            style={{ background: dark ? "#2d0a14" : "#fff1f2",
                              color: dark ? "#fca5a5" : "#be123c",
                              border: `1px solid ${dark ? "#7f1d1d" : "#fecdd3"}` }}>
                            Remove Admin
                          </button>
                        ) : (
                          <button className="um-action-btn"
                            onClick={() => setConfirmDialog({ open: true, user: u, action: "promote" })}
                            style={{ background: dark ? "#1e3a5f" : "#eff6ff",
                              color: dark ? "#93c5fd" : "#1d4ed8",
                              border: `1px solid ${dark ? "#1d4ed8" : "#bfdbfe"}` }}>
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${border}`, background: filterBg }}>
            <p style={{ margin: 0, fontSize: 11, color: textMuted }}>
              Showing {filtered.length} of {users.length} registered user{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, user: null, action: null })}
        onConfirm={handleAction}
        user={confirmDialog.user}
        action={confirmDialog.action}
        loading={actionLoading}
        dark={dark}
      />
    </div>
  );
}