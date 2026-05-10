import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  getAllUsers,
  promoteToAdmin,
  demoteFromAdmin,
  blockUser,
  unblockUser,
  deleteUser,
  addAdminByEmail,
  getUserRole,        // <-- NEW: to check superadmin status
} from "../services/userService";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

// ── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return "Never";
  const d   = date?.toDate ? date.toDate() : new Date(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)     return "Just now";
  if (sec < 3600)   return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400)  return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
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

// ── Confirm Dialog ────────────────────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, user, action, loading, dark }) {
  if (!isOpen || !user) return null;

  const configs = {
    promote: { color: "#1d4ed8", bg: dark ? "#1e3a5f" : "#dbeafe", label: "Promote to Admin",  icon: "⭐", desc: `${user.displayName || user.email} will gain admin privileges.` },
    demote:  { color: "#dc2626", bg: dark ? "#3b0f14" : "#fee2e2", label: "Remove Admin",       icon: "👤", desc: `${user.displayName || user.email} will revert to a regular user.` },
    block:   { color: "#f59e0b", bg: dark ? "#2d1f07" : "#fffbeb", label: "Block User",         icon: "🚫", desc: `${user.displayName || user.email} will be blocked from signing in.` },
    unblock: { color: "#22c55e", bg: dark ? "#14301f" : "#f0fdf4", label: "Unblock User",       icon: "✅", desc: `${user.displayName || user.email} will be allowed to sign in again.` },
    delete:  { color: "#dc2626", bg: dark ? "#3b0f14" : "#fee2e2", label: "Delete User",        icon: "🗑️", desc: `This will permanently delete ${user.email}. This cannot be undone.` },
  };
  const cfg = configs[action] || configs.promote;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif", animation: "um-fadeIn 0.15s ease" }}>
      <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 16,
        width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: "um-scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)", overflow: "hidden" }}>

        <div style={{ padding: "28px 28px 20px", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 12,
          borderBottom: `1px solid ${dark ? "#334155" : "#f3f4f6"}` }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%",
            background: cfg.bg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22 }}>
            {cfg.icon}
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 700,
              color: dark ? "#f1f5f9" : "#111827" }}>{cfg.label}?</p>
            <p style={{ margin: 0, fontSize: 13, color: dark ? "#94a3b8" : "#6b7280", lineHeight: 1.5 }}>
              {cfg.desc}
            </p>
          </div>
        </div>

        <div style={{ padding: "14px 28px", borderBottom: `1px solid ${dark ? "#334155" : "#f3f4f6"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            borderRadius: 10, background: dark ? "#0f172a" : "#f8fafc",
            border: `1px solid ${dark ? "#334155" : "#e5e7eb"}` }}>
            <Avatar user={user} size={32} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600,
                color: dark ? "#f1f5f9" : "#111827",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            background: cfg.color, color: "#fff", fontSize: 13, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 7 }}>
            {loading && (
              <span style={{ width: 12, height: 12,
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                borderRadius: "50%", display: "inline-block",
                animation: "um-spin 0.7s linear infinite" }} />
            )}
            {loading ? "Saving…" : cfg.label}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Add Admin Modal ───────────────────────────────────────────────────────
function AddAdminModal({ isOpen, onClose, onAdded, dark }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed)                          { setError("Email is required."); return; }
    if (!trimmed.endsWith("@neu.edu.ph")) { setError("Only @neu.edu.ph emails allowed."); return; }

    setLoading(true);
    setError("");

    try {
      // Check if the user already exists and is a superadmin
      const role = await getUserRole(trimmed);
      if (role === "superadmin") {
        setError("This user is a Superadmin and cannot be changed via this action.");
        setLoading(false);
        return;
      }
      await addAdminByEmail(trimmed);
      onAdded(trimmed);
      setEmail("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif", animation: "um-fadeIn 0.15s ease" }}>
      <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 16,
        width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        animation: "um-scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)" }}>

        <div style={{ padding: "20px 24px 16px",
          borderBottom: `1px solid ${dark ? "#334155" : "#f3f4f6"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
              textTransform: "uppercase", color: dark ? "#475569" : "#9ca3af" }}>Superadmin</p>
            <h3 style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 700,
              color: dark ? "#f1f5f9" : "#111827" }}>Add Admin by Email</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none",
            color: dark ? "#475569" : "#9ca3af", fontSize: 22, cursor: "pointer",
            padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 13,
            color: dark ? "#94a3b8" : "#6b7280", lineHeight: 1.5 }}>
            Enter a <strong style={{ color: dark ? "#f1f5f9" : "#111827" }}>@neu.edu.ph</strong> email.
            If the user hasn't logged in yet, they'll have admin access when they do.
          </p>

          {error && (
            <div style={{ background: dark ? "rgba(220,38,38,0.1)" : "#fef2f2",
              border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`,
              color: dark ? "#fca5a5" : "#b91c1c",
              borderRadius: 8, padding: "9px 12px", fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. juan.delacruz@neu.edu.ph"
            style={{ width: "100%", height: 40, padding: "0 12px",
              borderRadius: 10, fontSize: 13, fontFamily: "inherit",
              border: `1.5px solid ${dark ? "#334155" : "#e5e7eb"}`,
              background: dark ? "#0f172a" : "#f9fafb",
              color: dark ? "#f1f5f9" : "#111827",
              outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
            onFocus={e  => e.target.style.borderColor = "#2563eb"}
            onBlur={e   => e.target.style.borderColor = dark ? "#334155" : "#e5e7eb"}
          />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10,
              border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
              background: dark ? "#1f2937" : "#f9fafb",
              color: dark ? "#94a3b8" : "#374151",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} style={{
              padding: "9px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
              color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", opacity: loading ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: 7 }}>
              {loading && (
                <span style={{ width: 12, height: 12,
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "50%", display: "inline-block",
                  animation: "um-spin 0.7s linear infinite" }} />
              )}
              {loading ? "Adding…" : "Add Admin"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const { user: currentUser, role, authLoading } = useAuth();

  // ── All hooks first — no exceptions ───────────────────────────────────
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [filterRole,    setFilterRole]    = useState("all");
  const [sortBy,        setSortBy]        = useState("lastLogin");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg,      setToastMsg]      = useState(null);
  const [toastType,     setToastType]     = useState("success");
  const [addAdminOpen,  setAddAdminOpen]  = useState(false);

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

  const isSA        = role === "superadmin";
  const isAdminOrSA = role === "admin" || role === "superadmin";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdminOrSA) fetchUsers();
  }, [authLoading, isAdminOrSA, fetchUsers]);

  // ── Guard — after all hooks ────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36, border: "2px solid #dbeafe",
          borderTop: "2px solid #2563eb", borderRadius: "50%",
          margin: "0 auto 12px", animation: "um-spin 0.8s linear infinite" }} />
        <style>{`@keyframes um-spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 13, color: "#6b7280" }}>Verifying session…</p>
      </div>
    </div>
  );

  if (role && !isAdminOrSA) return <Navigate to="/home" replace />;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", background: dark ? "#0f172a" : "#f9fafb" }}>
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36,
          border: `2px solid ${dark ? "#1f2937" : "#dbeafe"}`,
          borderTop: "2px solid #2563eb", borderRadius: "50%",
          margin: "0 auto 12px", animation: "um-spin 0.8s linear infinite" }} />
        <style>{`@keyframes um-spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 13, color: dark ? "#9ca3af" : "#6b7280" }}>Loading users…</p>
      </div>
    </div>
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToastMsg(msg); setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openConfirm = (user, action) =>
    setConfirmDialog({ open: true, user, action });

  // ── What can the current user do to a target? ──────────────────────────
  // Rules:
  //   superadmin → can promote/demote/block/unblock/delete anyone EXCEPT other superadmins
  //   admin      → can block/unblock/delete regular students ONLY
  //   neither can touch themselves
  const getAvailableActions = (target) => {
    if (!target) return {};
    const isMe          = target.email === currentUser?.email;
    const isTargetSA    = target.role === "superadmin";
    if (isMe || isTargetSA) return {};          // protected: yourself & superadmins

    const targetIsAdmin   = target.role === "admin";
    const targetIsUser    = target.role === "user";
    const targetBlocked   = !!target.isBlocked;

    if (isSA) {
      return {
        canPromote:  targetIsUser,              // only promote students → admin
        canDemote:   targetIsAdmin,             // demote admin → student
        canBlock:    !targetBlocked,
        canUnblock:  targetBlocked,
        canDelete:   true,                      // superadmin can delete anyone (except SAs)
      };
    }

    if (role === "admin") {
      return {
        canPromote:  false,                     // admins cannot promote
        canDemote:   false,                     // admins cannot demote
        canBlock:    targetIsUser && !targetBlocked,
        canUnblock:  targetIsUser && targetBlocked,
        canDelete:   targetIsUser,              // admins can delete regular students
      };
    }

    return {};
  };

  const handleAction = async () => {
    if (!confirmDialog.user) return;
    setActionLoading(true);
    const { email } = confirmDialog.user;
    try {
      switch (confirmDialog.action) {
        case "promote":  await promoteToAdmin(email);  showToast(`${email} promoted to Admin.`); break;
        case "demote":   await demoteFromAdmin(email); showToast(`${email} removed from Admin.`); break;
        case "block":    await blockUser(email);       showToast(`${email} has been blocked.`,   "warn"); break;
        case "unblock":  await unblockUser(email);     showToast(`${email} has been unblocked.`); break;
        case "delete":   await deleteUser(email);      showToast(`${email} has been deleted.`,   "warn"); break;
        default: break;
      }
      await fetchUsers();
      setConfirmDialog({ open: false, user: null, action: null });
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q);
      const matchRole =
        filterRole === "all"        ? true :
        filterRole === "superadmin" ? u.role === "superadmin" :
        filterRole === "admin"      ? u.role === "admin" :
        filterRole === "blocked"    ? u.isBlocked === true :
                                      u.role === "user";
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "name")  return (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "role")  {
        const order = { superadmin: 0, admin: 1, user: 2 };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
      }
      const da  = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0);
      const db_ = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0);
      return db_ - da;
    });

  const saCount      = users.filter(u => u.role === "superadmin").length;
  const adminCount   = users.filter(u => u.role === "admin").length;
  const studentCount = users.filter(u => u.role === "user").length;
  const blockedCount = users.filter(u => u.isBlocked).length;

  // ── Theme ──────────────────────────────────────────────────────────────
  const bg        = dark ? "#0f172a" : "#f9fafb";
  const cardBg    = dark ? "#111827" : "#fff";
  const border    = dark ? "#1f2937" : "#e5e7eb";
  const text      = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#9ca3af" : "#6b7280";
  const rowHover  = dark ? "#1a2234" : "#f8fafc";
  const theadBg   = dark ? "#1a2234" : "#f8fafc";
  const filterBg  = dark ? "#161f2e" : "#fafafa";

  const roleBadge = (u) => {
    if (u.role === "superadmin") return {
      bg: dark ? "#1e1040" : "#f5f3ff", color: dark ? "#c084fc" : "#7c3aed",
      border: dark ? "#6d28d9" : "#ddd6fe", label: "⚡ Superadmin",
    };
    if (u.role === "admin") return {
      bg: dark ? "#2d1f07" : "#fffbeb", color: dark ? "#fcd34d" : "#b45309",
      border: dark ? "#854d0e" : "#fde68a", label: "⭐ Admin",
    };
    if (u.isBlocked) return {
      bg: dark ? "#3b0f14" : "#fff1f2", color: dark ? "#fca5a5" : "#be123c",
      border: dark ? "#7f1d1d" : "#fecdd3", label: "🚫 Blocked",
    };
    return {
      bg: dark ? "#1f2937" : "#f3f4f6", color: dark ? "#6b7280" : "#6b7280",
      border: dark ? "#374151" : "#e5e7eb", label: "👤 Student",
    };
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px",
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
        .um-row  { transition: background 0.12s; }
        .um-row:hover { background: ${rowHover} !important; }
        .um-action-btn {
          padding: 4px 11px; border-radius: 7px; font-size: 11px;
          font-weight: 600; font-family: inherit; cursor: pointer;
          border: none; transition: all 0.15s; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .um-action-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.92); }
        .um-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .um-select {
          appearance: none; -webkit-appearance: none;
          padding: 7px 28px 7px 10px; border-radius: 9px;
          border: 1px solid ${border};
          background: ${cardBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;
          color: ${text}; font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer; outline: none;
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toastType === "error" ? "#dc2626" : toastType === "warn" ? "#f59e0b" : (dark ? "#1e293b" : "#111827"),
          color: "#fff", fontSize: 13, fontWeight: 500, padding: "10px 18px",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          animation: "um-toastIn 0.25s ease", display: "flex", alignItems: "center", gap: 8 }}>
          {toastType === "success" ? "✅" : toastType === "warn" ? "⚠️" : "❌"}
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="um-anim um-d1" style={{ display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
            textTransform: "uppercase",
            color: isSA ? "#7c3aed" : "#2563eb", margin: "0 0 4px" }}>
            {isSA ? "⚡ Superadmin Portal" : "Admin Portal"}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: text, margin: 0, letterSpacing: "-0.02em" }}>
            User Management
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "5px 0 0" }}>
            {isSA
              ? "Full access — manage roles, block, unblock, and delete users."
              : "You can block, unblock, and delete regular students."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isSA && (
            <button onClick={() => setAddAdminOpen(true)} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(124,58,237,0.35)", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Admin
            </button>
          )}
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
      </div>

      {/* Stat cards */}
      <div className="um-anim um-d1" style={{ display: "grid",
        gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { label: "Total Users",  value: users.length,  iconBg: dark ? "#1e3a5f" : "#eff6ff",
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="#1d4ed8" strokeWidth="1.4"/><path d="M2.5 16c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="#1d4ed8" strokeWidth="1.4" strokeLinecap="round"/></svg> },
          { label: "Superadmins",  value: saCount,       iconBg: dark ? "#1e1040" : "#f5f3ff",
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 4H15l-3.5 2.5 1.3 4L9 10l-3.8 2.5 1.3-4L3 6h4.5L9 2Z" stroke="#7c3aed" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
          { label: "Admins",       value: adminCount,    iconBg: dark ? "#2d1f07" : "#fffbeb",
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.5 3H14l-3 2.2 1 3.3L9 8.5l-3 2 1-3.3L4 5h3.5L9 2Z" stroke="#d97706" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
          { label: "Blocked",      value: blockedCount,  iconBg: dark ? "#3b0f14" : "#fff1f2",
            icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#dc2626" strokeWidth="1.4"/><line x1="4" y1="4" x2="14" y2="14" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round"/></svg> },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`,
            borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: text, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: textMuted, fontWeight: 500 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: 10, padding: "0 12px", height: 38, width: 240 }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke={textMuted} strokeWidth="1.4"/>
              <path d="M11.5 11.5l2.5 2.5" stroke={textMuted} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 13,
                background: "transparent", width: "100%",
                fontFamily: "inherit", color: text }} />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none",
                border: "none", cursor: "pointer", color: textMuted, padding: 0, display: "flex" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select className="um-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="superadmin">Superadmins</option>
              <option value="admin">Admins</option>
              <option value="user">Students</option>
              <option value="blocked">Blocked</option>
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
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
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
                  {["User", "Role", "Email", "Last Login", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: textMuted,
                      letterSpacing: ".07em", textTransform: "uppercase",
                      borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const isMe       = u.email === currentUser?.email;
                  const isTargetSA = u.role === "superadmin";
                  const badge      = roleBadge(u);
                  const actions    = getAvailableActions(u);

                  return (
                    <tr key={u.id || u.email} className="um-row" style={{
                      borderBottom: `1px solid ${border}`,
                      animation: "um-slideUp 0.3s ease both",
                      animationDelay: `${idx * 0.025}s`,
                      opacity: u.isBlocked ? 0.75 : 1 }}>

                      {/* User */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <Avatar user={u} size={36} />
                            {isTargetSA && (
                              <div style={{ position: "absolute", bottom: -2, right: -2,
                                width: 14, height: 14, borderRadius: "50%",
                                background: "#7c3aed", border: `2px solid ${cardBg}`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 8 }}>⚡</div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: text,
                                whiteSpace: "nowrap", overflow: "hidden",
                                textOverflow: "ellipsis", maxWidth: 160 }}>
                                {u.displayName || "—"}
                              </span>
                              {isMe && (
                                <span style={{ fontSize: 9, fontWeight: 700,
                                  padding: "1px 6px", borderRadius: 999,
                                  background: dark ? "#1e3a5f" : "#dbeafe",
                                  color: dark ? "#93c5fd" : "#1d4ed8",
                                  letterSpacing: ".05em", textTransform: "uppercase",
                                  whiteSpace: "nowrap" }}>
                                  You
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: textMuted,
                              fontFamily: "'DM Mono','Fira Code',monospace" }}>
                              {u.uid ? `${u.uid.slice(0, 10)}…` : "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center",
                          padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
                          background: badge.bg, color: badge.color,
                          border: `1px solid ${badge.border}` }}>
                          {badge.label}
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
                        {isMe ? (
                          <span style={{ fontSize: 11.5, color: dark ? "#475569" : "#d1d5db",
                            fontStyle: "italic" }}>(you)</span>
                        ) : isTargetSA ? (
                          <span style={{ fontSize: 11.5, color: dark ? "#475569" : "#d1d5db",
                            fontStyle: "italic" }}>Protected</span>
                        ) : (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {actions.canPromote && (
                              <button className="um-action-btn"
                                onClick={() => openConfirm(u, "promote")}
                                style={{ background: dark ? "#1e3a5f" : "#eff6ff",
                                  color: dark ? "#93c5fd" : "#1d4ed8",
                                  border: `1px solid ${dark ? "#1d4ed8" : "#bfdbfe"}` }}>
                                ⭐ Make Admin
                              </button>
                            )}
                            {actions.canDemote && (
                              <button className="um-action-btn"
                                onClick={() => openConfirm(u, "demote")}
                                style={{ background: dark ? "#2d1f07" : "#fffbeb",
                                  color: dark ? "#fcd34d" : "#b45309",
                                  border: `1px solid ${dark ? "#854d0e" : "#fde68a"}` }}>
                                👤 Remove Admin
                              </button>
                            )}
                            {actions.canBlock && (
                              <button className="um-action-btn"
                                onClick={() => openConfirm(u, "block")}
                                style={{ background: dark ? "#2d1f07" : "#fffbeb",
                                  color: dark ? "#fbbf24" : "#b45309",
                                  border: `1px solid ${dark ? "#92400e" : "#fde68a"}` }}>
                                🚫 Block
                              </button>
                            )}
                            {actions.canUnblock && (
                              <button className="um-action-btn"
                                onClick={() => openConfirm(u, "unblock")}
                                style={{ background: dark ? "#14301f" : "#f0fdf4",
                                  color: dark ? "#86efac" : "#15803d",
                                  border: `1px solid ${dark ? "#166534" : "#bbf7d0"}` }}>
                                ✅ Unblock
                              </button>
                            )}
                            {actions.canDelete && (
                              <button className="um-action-btn"
                                onClick={() => openConfirm(u, "delete")}
                                style={{ background: dark ? "#2d0a14" : "#fff1f2",
                                  color: dark ? "#fca5a5" : "#be123c",
                                  border: `1px solid ${dark ? "#7f1d1d" : "#fecdd3"}` }}>
                                🗑️ Delete
                              </button>
                            )}
                            {!actions.canPromote && !actions.canDemote &&
                             !actions.canBlock && !actions.canUnblock && !actions.canDelete && (
                              <span style={{ fontSize: 11.5,
                                color: dark ? "#475569" : "#d1d5db",
                                fontStyle: "italic" }}>No actions</span>
                            )}
                          </div>
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
      <AddAdminModal
        isOpen={addAdminOpen}
        onClose={() => setAddAdminOpen(false)}
        onAdded={(email) => { showToast(`${email} added as Admin.`); fetchUsers(); }}
        dark={dark}
      />
    </div>
  );
}