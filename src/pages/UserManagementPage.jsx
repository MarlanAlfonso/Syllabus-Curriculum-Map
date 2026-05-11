// src/pages/UserManagementPage.jsx
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  getAllUsers,
  promoteToAdmin,
  demoteFromAdmin,
  blockUser,
  unblockUser,
  addAdminByEmail,
  getUserRole,
} from "../services/userService";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

// ---------- Professional SVG Icons ----------
const IconShield = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v7c0 5 9 8 9 8s9-3 9-8V7l-9-5z" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBan = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.21-2.48L23 12" />
    <path d="M20.49 15a9 9 0 0 1-14.21 2.48L1 12" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ---------- Helper Functions ----------
function timeAgo(date) {
  if (!date) return "Never";
  const d = date?.toDate ? date.toDate() : new Date(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ user, size = 36 }) {
  const [imgErr, setImgErr] = useState(false);
  const initial = (user.displayName || user.email || "?")[0].toUpperCase();
  if (user.photoURL && !imgErr) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName}
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.38 }}>{initial}</span>
    </div>
  );
}

// ---------- Confirm Dialog ----------
function ConfirmDialog({ isOpen, onClose, onConfirm, user, action, loading, dark }) {
  if (!isOpen || !user) return null;

  const configs = {
    promote: {
      color: "#1d4ed8",
      label: "Promote to Admin",
      icon: <IconShield />,
      title: "Promote User",
      message: `${user.displayName || user.email} will gain full admin privileges. They will be able to manage courses, users, and system settings.`,
      confirmText: "Promote",
      hint: "This action can be reversed later.",
    },
    demote: {
      color: "#dc2626",
      label: "Remove Admin",
      icon: <IconUser />,
      title: "Remove Admin Privileges",
      message: `${user.displayName || user.email} will lose all admin access and become a regular student.`,
      confirmText: "Remove",
      hint: "This action can be reversed by promoting again.",
    },
    block: {
      color: "#f59e0b",
      label: "Block User",
      icon: <IconBan />,
      title: "Block User Account",
      message: `${user.displayName || user.email} will be unable to sign in. All their data remains intact.`,
      confirmText: "Block",
      hint: "You can unblock them later.",
    },
    unblock: {
      color: "#22c55e",
      label: "Unblock User",
      icon: <IconCheck />,
      title: "Unblock User Account",
      message: `${user.displayName || user.email} will be able to sign in again.`,
      confirmText: "Unblock",
      hint: "Their account will be restored to normal.",
    },
  };
  const cfg = configs[action] || configs.promote;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: dark ? "#1e293b" : "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "um-scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 12px",
            borderBottom: `1px solid ${dark ? "#334155" : "#f1f5f9"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: cfg.color + "15",
              color: cfg.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {cfg.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a" }}>
              {cfg.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: dark ? "#94a3b8" : "#475569" }}>
              {cfg.label}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: dark ? "#64748b" : "#94a3b8",
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
              borderRadius: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = dark ? "#334155" : "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div style={{ padding: "20px 24px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: dark ? "#cbd5e1" : "#334155" }}>
            {cfg.message}
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: cfg.color, fontWeight: 500 }}>
            {cfg.hint}
          </p>
        </div>

        {/* User info card */}
        <div
          style={{
            margin: "0 24px 16px",
            padding: "12px 16px",
            borderRadius: 12,
            background: dark ? "#0f172a" : "#f8fafc",
            border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar user={user} size={40} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: dark ? "#f1f5f9" : "#0f172a" }}>
              {user.displayName || user.email.split("@")[0]}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: dark ? "#94a3b8" : "#64748b" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px 24px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: `1px solid ${dark ? "#475569" : "#cbd5e1"}`,
              background: "transparent",
              color: dark ? "#cbd5e1" : "#475569",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = dark ? "#1e293b" : "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: cfg.color,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {loading && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "um-spin 0.7s linear infinite",
                }}
              />
            )}
            {loading ? "Processing..." : cfg.confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------- Add Admin Modal ----------
function AddAdminModal({ isOpen, onClose, onAdded, dark }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Email is required.");
      return;
    }
    if (!trimmed.endsWith("@neu.edu.ph")) {
      setError("Only @neu.edu.ph emails are allowed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: dark ? "#1e293b" : "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "um-scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        <div
          style={{
            padding: "20px 24px 12px",
            borderBottom: `1px solid ${dark ? "#334155" : "#f1f5f9"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#7c3aed15",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPlus />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a" }}>
              Add Admin
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: dark ? "#94a3b8" : "#475569" }}>
              Grant administrator access
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: dark ? "#64748b" : "#94a3b8",
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
              borderRadius: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = dark ? "#334155" : "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: dark ? "#cbd5e1" : "#334155" }}>
            Enter a <strong>@neu.edu.ph</strong> email address. If the user hasn't logged in before,
            they will be created with admin privileges. If they already exist, their role will be
            upgraded to admin.
          </p>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                borderRadius: 10,
                background: dark ? "#7f1d1d20" : "#fef2f2",
                border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`,
                color: dark ? "#fca5a5" : "#b91c1c",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconBan style={{ width: 14, height: 14, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: dark ? "#cbd5e1" : "#334155",
              }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g., juan.delacruz@neu.edu.ph"
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "inherit",
                border: `1.5px solid ${error ? "#dc2626" : dark ? "#475569" : "#cbd5e1"}`,
                background: dark ? "#0f172a" : "#fff",
                color: dark ? "#f1f5f9" : "#0f172a",
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = dark ? "#475569" : "#cbd5e1";
              }}
            />
          </div>
        </div>

        <div style={{ padding: "16px 24px 24px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: `1px solid ${dark ? "#475569" : "#cbd5e1"}`,
              background: "transparent",
              color: dark ? "#cbd5e1" : "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading && <span className="um-spinner-small" />}
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------- Main Page ----------
export default function UserManagementPage() {
  const { user: currentUser, role, authLoading } = useAuth();
  const isSA = role === "superadmin";
  const isAdminOrSA = role === "admin" || role === "superadmin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("lastLogin");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [addAdminOpen, setAddAdminOpen] = useState(false);

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
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
    } catch (err) {
      setError("Failed to load users. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdminOrSA) fetchUsers();
  }, [authLoading, isAdminOrSA, fetchUsers]);

  if (role && !isAdminOrSA) return <Navigate to="/home" replace />;

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getAvailableActions = (target) => {
    if (!target) return {};
    const isMe = target.email === currentUser?.email;
    const isTargetSA = target.role === "superadmin";
    if (isMe) return {};
    if (isTargetSA) return {};

    const targetRole = target.role;
    const targetBlocked = target.isBlocked;

    if (isSA) {
      return {
        canPromote: targetRole !== "admin" && targetRole !== "superadmin",
        canDemote: targetRole === "admin",
        canBlock: !targetBlocked,
        canUnblock: targetBlocked,
      };
    }

    if (role === "admin") {
      return {
        canPromote: false,
        canDemote: false,
        // Admins can only block/unblock students
        canBlock: targetRole === "student" && !targetBlocked,
        canUnblock: targetRole === "student" && targetBlocked,
      };
    }

    return {};
  };

  const handleAction = async () => {
    if (!confirmDialog.user) return;
    setActionLoading(true);
    const email = confirmDialog.user.email;
    try {
      switch (confirmDialog.action) {
        case "promote":
          await promoteToAdmin(email);
          showToast(`${email} promoted to Admin.`);
          break;
        case "demote":
          await demoteFromAdmin(email);
          showToast(`${email} removed from Admin.`);
          break;
        case "block":
          await blockUser(email);
          showToast(`${email} has been blocked.`, "warn");
          break;
        case "unblock":
          await unblockUser(email);
          showToast(`${email} has been unblocked.`);
          break;
        default:
          break;
      }
      await fetchUsers();
      setConfirmDialog({ open: false, user: null, action: null });
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (user, action) => setConfirmDialog({ open: true, user, action });

  const filtered = users
    .filter((u) => {
      // Admin can only see student accounts, not other admins or superadmins
      if (role === "admin" && (u.role === "admin" || u.role === "superadmin")) {
        return false;
      }
      const q = search.toLowerCase();
      const matchSearch =
        u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
      const matchRole =
        filterRole === "all"
          ? true
          : filterRole === "superadmin"
          ? u.role === "superadmin"
          : filterRole === "admin"
          ? u.role === "admin"
          : filterRole === "blocked"
          ? u.isBlocked
          : u.role === "student"; // "student" filter tab
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "email") return a.email.localeCompare(b.email);
      if (sortBy === "role") {
        // superadmin → admin → student
        const order = { superadmin: 0, admin: 1, student: 2 };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
      }
      const da = a.lastLogin?.toDate?.() ?? new Date(a.lastLogin ?? 0);
      const db = b.lastLogin?.toDate?.() ?? new Date(b.lastLogin ?? 0);
      return db - da;
    });

  const saCount = users.filter((u) => u.role === "superadmin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "student").length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  // Theme colors
  const bg = dark ? "#0f172a" : "#f9fafb";
  const cardBg = dark ? "#111827" : "#fff";
  const border = dark ? "#1f2937" : "#e5e7eb";
  const text = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#9ca3af" : "#6b7280";
  const rowHover = dark ? "#1a2234" : "#f8fafc";
  const theadBg = dark ? "#1a2234" : "#f8fafc";
  const filterBg = dark ? "#161f2e" : "#fafafa";

  // Role badge — returns display config per role
  const roleBadge = (u) => {
    if (u.role === "superadmin")
      return {
        bg: dark ? "#1e3a5f" : "#dbeafe",
        color: dark ? "#93c5fd" : "#1d4ed8",
        label: "Superadmin",
        icon: <IconShield />,
      };
    if (u.role === "admin")
      return {
        bg: dark ? "#2d1f07" : "#fffbeb",
        color: dark ? "#fcd34d" : "#b45309",
        label: "Admin",
        icon: <IconUser />,
      };
    if (u.isBlocked)
      return {
        bg: dark ? "#3b0f14" : "#fff1f2",
        color: dark ? "#fca5a5" : "#be123c",
        label: "Blocked",
        icon: <IconBan />,
      };
    // Default: student
    return {
      bg: dark ? "#1f2937" : "#f3f4f6",
      color: dark ? "#6b7280" : "#6b7280",
      label: "Student",
      icon: <IconUsers />,
    };
  };

  if (authLoading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "2px solid #dbeafe",
              borderTop: "2px solid #2563eb",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "um-spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: "#6b7280" }}>Verifying session…</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          background: bg,
        }}
      >
        <div style={{ textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: `2px solid ${dark ? "#1f2937" : "#dbeafe"}`,
              borderTop: "2px solid #2563eb",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "um-spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: textMuted }}>Loading users…</p>
        </div>
      </div>
    );

  return (
    <div
      className="um-container"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "28px 24px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: bg,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes um-spin { to { transform: rotate(360deg); } }
        @keyframes um-slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes um-toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .um-anim { animation: um-slideUp 0.35s ease both; }
        .um-d1 { animation-delay: 0.03s; }
        .um-d2 { animation-delay: 0.07s; }
        .um-row { transition: background 0.12s; }
        .um-row:hover { background: ${rowHover} !important; }
        .um-action-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
          background: transparent;
          color: ${textMuted};
        }
        .um-action-icon:hover { transform: translateY(-1px); filter: brightness(0.92); background: ${rowHover}; }
        .um-select {
          appearance: none;
          padding: 7px 28px 7px 10px;
          border-radius: 9px;
          border: 1px solid ${border};
          background: ${cardBg};
          color: ${text};
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3.5l3 3 3-3' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }
        .um-spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: um-spin 0.7s linear infinite;
        }
        @media (max-width: 640px) {
          .um-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .um-header { flex-direction: column !important; align-items: flex-start !important; }
          .um-header-actions { width: 100% !important; justify-content: flex-start !important; }
          .um-toolbar { flex-direction: column !important; align-items: stretch !important; }
          .um-search { width: 100% !important; }
          .um-sort { justify-content: space-between !important; width: 100% !important; }
          .um-action-icon { width: 28px !important; height: 28px !important; }
          .um-stat-card { padding: 10px 12px !important; }
          .um-stat-value { font-size: 18px !important; }
        }
      `}</style>

      {/* Toast */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background:
              toastType === "error"
                ? "#dc2626"
                : toastType === "warn"
                ? "#f59e0b"
                : dark
                ? "#1e293b"
                : "#111827",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            animation: "um-toastIn 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toastType === "success" && <IconCheck />}
          {toastType === "warn" && <IconBan />}
          {toastType === "error" && <IconBan />}
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div
        className="um-anim um-d1 um-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: isSA ? "#7c3aed" : "#2563eb",
              margin: "0 0 4px",
            }}
          >
            {isSA ? "Superadmin Portal" : "Admin Portal"}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: text, margin: 0, letterSpacing: "-0.02em" }}>
            User Management
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "5px 0 0" }}>
            {isSA
              ? "Full access — manage roles, block, and unblock users."
              : "You can block or unblock regular students."}
          </p>
        </div>
        <div className="um-header-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isSA && (
            <button
              onClick={() => setAddAdminOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 2px 10px rgba(124,58,237,0.35)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <IconPlus /> Add Admin
            </button>
          )}
          <button
            onClick={fetchUsers}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: cardBg,
              color: textMuted,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
          >
            <IconRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        className="um-anim um-d1 um-stats-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}
      >
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: <IconUsers />,
            iconBg: dark ? "#1e3a5f" : "#eff6ff",
            color: "#1d4ed8",
          },
          {
            label: "Superadmins",
            value: saCount,
            icon: <IconShield />,
            iconBg: dark ? "#1e1040" : "#f5f3ff",
            color: "#7c3aed",
          },
          {
            label: "Admins",
            value: adminCount,
            icon: <IconUser />,
            iconBg: dark ? "#2d1f07" : "#fffbeb",
            color: "#d97706",
          },
          {
            label: "Blocked",
            value: blockedCount,
            icon: <IconBan />,
            iconBg: dark ? "#3b0f14" : "#fff1f2",
            color: "#dc2626",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="um-stat-card"
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: s.iconBg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p
                className="um-stat-value"
                style={{ margin: 0, fontSize: 22, fontWeight: 700, color: text, lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: textMuted, fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div
        className="um-anim um-d2"
        style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}
      >
        {/* Toolbar */}
        <div
          className="um-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${border}`,
            background: filterBg,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            className="um-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 10,
              padding: "0 12px",
              height: 38,
              width: 240,
            }}
          >
            <IconSearch />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                background: "transparent",
                width: "100%",
                fontFamily: "inherit",
                color: text,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: textMuted,
                  padding: 0,
                  display: "flex",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div className="um-sort" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select className="um-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="superadmin">Superadmins</option>
              <option value="admin">Admins</option>
              <option value="student">Students</option>
              <option value="blocked">Blocked</option>
            </select>
            <select className="um-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
          <div
            style={{
              margin: 16,
              padding: "12px 16px",
              borderRadius: 10,
              background: dark ? "rgba(220,38,38,0.1)" : "#fef2f2",
              border: `1px solid ${dark ? "#7f1d1d" : "#fecaca"}`,
              color: dark ? "#fca5a5" : "#b91c1c",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {!error && filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 24px",
              color: textMuted,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {search || filterRole !== "all" ? "No users match your filters" : "No users found"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theadBg }}>
                  {["User", "Role", "Email", "Last Login", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: textMuted,
                        letterSpacing: ".07em",
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const isMe = u.email === currentUser?.email;
                  const isTargetSA = u.role === "superadmin";
                  const badge = roleBadge(u);
                  const actions = getAvailableActions(u);

                  return (
                    <tr
                      key={u.id || u.email}
                      className="um-row"
                      style={{
                        borderBottom: `1px solid ${border}`,
                        animation: "um-slideUp 0.3s ease both",
                        animationDelay: `${idx * 0.025}s`,
                        opacity: u.isBlocked ? 0.7 : 1,
                      }}
                    >
                      {/* User */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <Avatar user={u} size={36} />
                            {isTargetSA && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  background: "#7c3aed",
                                  border: `2px solid ${cardBg}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <IconShield style={{ width: 10, height: 10, color: "#fff" }} />
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: text,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: 160,
                                }}
                              >
                                {u.displayName || "—"}
                              </span>
                              {isMe && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: "1px 6px",
                                    borderRadius: 999,
                                    background: dark ? "#1e3a5f" : "#dbeafe",
                                    color: dark ? "#93c5fd" : "#1d4ed8",
                                    letterSpacing: ".05em",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: textMuted,
                                fontFamily: "'DM Mono','Fira Code',monospace",
                              }}
                            >
                              {u.uid ? `${u.uid.slice(0, 10)}…` : "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.color}40`,
                          }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            fontSize: 13,
                            color: textMuted,
                            fontFamily: "'DM Mono','Fira Code',monospace",
                          }}
                        >
                          {u.email}
                        </span>
                      </td>

                      {/* Last login */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: 12.5, color: textMuted }}>{timeAgo(u.lastLogin)}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        {isMe ? (
                          <span style={{ fontSize: 11.5, color: dark ? "#475569" : "#d1d5db", fontStyle: "italic" }}>
                            (you)
                          </span>
                        ) : isTargetSA ? (
                          <span style={{ fontSize: 11.5, color: dark ? "#475569" : "#d1d5db", fontStyle: "italic" }}>
                            Protected
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {actions.canPromote && (
                              <button
                                className="um-action-icon"
                                onClick={() => openConfirm(u, "promote")}
                                title="Promote to Admin"
                                style={{ color: "#b45309" }}
                              >
                                <IconUser />
                              </button>
                            )}
                            {actions.canDemote && (
                              <button
                                className="um-action-icon"
                                onClick={() => openConfirm(u, "demote")}
                                title="Revert to Student"
                                style={{ color: "#b45309" }}
                              >
                                <IconUser />
                              </button>
                            )}
                            {actions.canBlock && (
                              <button
                                className="um-action-icon"
                                onClick={() => openConfirm(u, "block")}
                                title="Block User"
                                style={{ color: "#b45309" }}
                              >
                                <IconBan />
                              </button>
                            )}
                            {actions.canUnblock && (
                              <button
                                className="um-action-icon"
                                onClick={() => openConfirm(u, "unblock")}
                                title="Unblock User"
                                style={{ color: "#15803d" }}
                              >
                                <IconCheck />
                              </button>
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
        onAdded={(email) => {
          showToast(`${email} added as Admin.`);
          fetchUsers();
        }}
        dark={dark}
      />
    </div>
  );
}