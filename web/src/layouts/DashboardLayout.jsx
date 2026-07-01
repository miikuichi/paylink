import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import "./DashboardLayout.css";

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 21a2.5 2.5 0 0 0 5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function initialsOf(user) {
  if (!user) return "?";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;

  return (user.username?.[0] ?? user.email?.[0] ?? "?").toUpperCase();
}

function fullNameOf(user) {
  if (!user) return "User";
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.username || user.email || "User";
}

/**
 * navItems: [{ key, label, icon, active }]
 */
const DashboardLayout = ({
  navItems,
  activeKey,
  onNavigate,
  pageTitle,
  pageSubtitle,
  headerActions,
  children,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dash">
      <aside
        className={`dash__sidebar ${sidebarOpen ? "dash__sidebar--open" : ""}`}
      >
        <div className="dash__sidebar-brand">
          <Logo light size={36} />
        </div>

        <nav className="dash__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`dash__nav-item ${activeKey === item.key ? "dash__nav-item--active" : ""}`}
              onClick={() => {
                onNavigate?.(item.key);
                setSidebarOpen(false);
              }}
            >
              <span className="dash__nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash__sidebar-footer">
          <div className="dash__sidebar-user">
            <span
              className="dash__avatar"
              style={{ background: user?.avatarColor || "var(--gold-500)" }}
            >
              {initialsOf(user)}
            </span>
            <div className="dash__sidebar-user-info">
              <p className="dash__sidebar-user-name">{fullNameOf(user)}</p>
              <p className="dash__sidebar-user-role">{user?.position}</p>
            </div>
          </div>
          <button className="dash__logout" onClick={handleLogout}>
            <LogoutIcon />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="dash__scrim" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="dash__main">
        <header className="dash__topbar">
          <button
            className="dash__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="dash__topbar-title">
            <h1>{pageTitle}</h1>
            {pageSubtitle && <p>{pageSubtitle}</p>}
          </div>

          <div className="dash__topbar-actions">
            {headerActions}
            <button className="dash__icon-btn" aria-label="Notifications">
              <BellIcon />
              <span className="dash__icon-dot" />
            </button>
            <span
              className="dash__avatar dash__avatar--sm"
              style={{ background: user?.avatarColor || "var(--gold-500)" }}
            >
              {initialsOf(user)}
            </span>
          </div>
        </header>

        <main className="dash__content animate-in">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
