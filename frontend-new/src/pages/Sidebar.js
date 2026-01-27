import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Menu,
  FileText,
  Settings,
  Info,
  LogOut,
  Sun,
  Moon,
  Book,
  MoreHorizontal,
} from "lucide-react";
import Swal from "sweetalert2";
import logo from "../assets/Logo.png";
import "../styles/Sidebar.css";
import { useMaterial } from "../context/MaterialContext";

const Sidebar = ({ darkMode, toggleDarkMode, setLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { materialId } = useMaterial();

  const [collapsed, setCollapsed] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  // "More" anchor + fixed dropdown position
  const moreRef = React.useRef(null);
  const [morePos, setMorePos] = React.useState({ top: 0, left: 0 });

  // track viewport height (for deciding which items go to More)
  const [vh, setVh] = React.useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  React.useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setLoggedIn(false);
    navigate("/login");
  }, [navigate, setLoggedIn]);

  const confirmLogout = React.useCallback(async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Log out?",
      text: "Are you sure you want to log out?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#7b2cbf",
    });
    if (result.isConfirmed) handleLogout();
  }, [handleLogout]);

  const isActive = React.useCallback(
    (path) => (location.pathname.startsWith(path) ? "active" : ""),
    [location.pathname]
  );

  const handleNavigation = React.useCallback(
    (path) => {
      setMoreOpen(false);
      if (path === "/summary") {
        if (materialId) navigate(`/summary/${materialId}`);
        else navigate("/summary");
      } else {
        navigate(path);
      }
    },
    [materialId, navigate]
  );

  // ✅ Clamp dropdown position so it NEVER creates horizontal scrolling
  const updateMorePos = React.useCallback(() => {
    if (!moreRef.current) return;

    const r = moreRef.current.getBoundingClientRect();

    const DROPDOWN_W = 260; // safe (includes padding/shadow)
    const SIDE_GAP = 12;

    let left = r.right + SIDE_GAP;
    let top = r.top + r.height / 2;

    const maxLeft = window.innerWidth - DROPDOWN_W - SIDE_GAP;
    if (left > maxLeft) left = Math.max(SIDE_GAP, maxLeft);

    const minTop = 60;
    const maxTop = window.innerHeight - 60;
    if (top < minTop) top = minTop;
    if (top > maxTop) top = maxTop;

    setMorePos({ top, left });
  }, []);

  // close More on outside click + keep dropdown position updated
  React.useEffect(() => {
    const onDocClick = () => setMoreOpen(false);
    const onResize = () => updateMorePos();
    const onScroll = () => updateMorePos();

    document.addEventListener("click", onDocClick);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [updateMorePos]);

  const menuItems = React.useMemo(
    () => [
      { key: "home", name: "Home", icon: <Home size={20} />, path: "/home" },
      { key: "summary", name: "Summary", icon: <Menu size={20} />, path: "/summary" },
      {
        key: "readings",
        name: "Reading Materials",
        icon: <FileText size={20} />,
        path: "/readings",
      },
      { key: "vocab", name: "Vocabulary", icon: <Book size={20} />, path: "/vocabulary" },
      { key: "settings", name: "Settings", icon: <Settings size={20} />, path: "/settings" },
      { key: "about", name: "About", icon: <Info size={20} />, path: "/about" },
    ],
    []
  );

  // ✅ Dark Mode goes inside More, Logout stays pinned bottom
  const { visibleItems, overflowItems } = React.useMemo(() => {
    const visible = [...menuItems];
    const overflow = [];

    // keep Home + Summary always visible
    if (vh < 760) overflow.unshift(visible.pop()); // About
    if (vh < 700) overflow.unshift(visible.pop()); // Settings
    if (vh < 640) overflow.unshift(visible.pop()); // Vocabulary
    if (vh < 590) overflow.unshift(visible.pop()); // Reading Materials

    return { visibleItems: visible, overflowItems: overflow };
  }, [vh, menuItems]);

  // ✅ Always show More because Dark Mode lives there
  const showMore = true;

  return (
    <div className={`sidebar ${darkMode ? "dark" : ""} ${collapsed ? "collapsed" : ""}`}>
      <div className="collapse-btn" onClick={() => setCollapsed((v) => !v)}>
        {collapsed ? "➤" : "⬅"}
      </div>

      {/* Logo */}
      <div className="sidebar-avatar">
        <div className="avatar-circle">
          <img src={logo} alt="PARAREAD Logo" className="avatar-logo" />
        </div>
        {!collapsed && <span className="avatar-name">PARAREAD</span>}
      </div>

      {/* Top menu */}
      <div className="sidebar-top">
        <ul className="sidebar-menu">
          {visibleItems.map((item) => (
            <li
              key={item.key}
              className={isActive(item.path)}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation(item.path);
              }}
            >
              <div className="icon-circle">{item.icon}</div>
              {!collapsed && <span className="menu-text">{item.name}</span>}
              {collapsed && <span className="tooltip">{item.name}</span>}
            </li>
          ))}

          {showMore && (
            <li
              ref={moreRef}
              className={`more-item ${moreOpen ? "open" : ""}`}
              onMouseEnter={() => {
                updateMorePos();
                setMoreOpen(true);
              }}
              onMouseLeave={() => setMoreOpen(false)}
              onClick={(e) => {
                e.stopPropagation();
                updateMorePos();
                setMoreOpen((v) => !v);
              }}
            >
              <div className="icon-circle">
                <MoreHorizontal size={20} />
              </div>
              {!collapsed && <span className="menu-text">More</span>}
              {collapsed && <span className="tooltip">More</span>}
            </li>
          )}
        </ul>
      </div>

      {/* Bottom pinned (ONLY logout) */}
      <div className="sidebar-bottom">
        <ul className="sidebar-menu">
          <li
            onClick={(e) => {
              e.stopPropagation();
              confirmLogout();
            }}
          >
            <div className="icon-circle">
              <LogOut size={20} />
            </div>
            {!collapsed && <span className="menu-text">Log Out</span>}
            {collapsed && <span className="tooltip">Log Out</span>}
          </li>
        </ul>
      </div>

      {/* Fixed dropdown (clamped) */}
      <div
        className={`more-dropdown ${moreOpen ? "open" : ""} ${darkMode ? "dark" : ""}`}
        style={{
          top: morePos.top,
          left: morePos.left,
          transform: "translateY(-50%)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setMoreOpen(true)}
        onMouseLeave={() => setMoreOpen(false)}
      >
        {/* Overflow nav items */}
        {overflowItems.map((m) => (
          <div
            key={m.key}
            className="more-link"
            onClick={() => handleNavigation(m.path)}
          >
            <span className="more-icon">{m.icon}</span>
            <span className="more-text">{m.name}</span>
          </div>
        ))}

        <div className="more-divider" />

        {/* Dark mode inside More */}
        <div className="more-link more-darkmode" onClick={(e) => e.stopPropagation()}>
          <span className="more-icon">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          <span className="more-text">Dark Mode</span>

          <label className="switch" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
