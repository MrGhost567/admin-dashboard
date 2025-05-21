import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Auth } from "../../services/api";
import styles from "../../styles/Sidebar.module.css";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiArchive,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Sidebar = ({ setUser = () => {}, onToggleCollapse }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Memoize handleResize to avoid unnecessary re-renders
  const handleResize = useCallback(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    setIsCollapsed(isMobile);
    if (onToggleCollapse) onToggleCollapse(isMobile);
  }, [onToggleCollapse]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await Auth.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof setUser === "function") {
        setUser(null);
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof setUser === "function") {
        setUser(null);
      }

      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) onToggleCollapse(newCollapsedState);
  };

  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.logo}>
        {isCollapsed ? <span>UST</span> : <span>UST Community Admin</span>}
      </div>

      <ul className={styles.menuItems}>
        <li>
          <Link to="/dashboard">
            <FiHome className={styles.icon} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link to="/users">
            <FiUsers className={styles.icon} />
            {!isCollapsed && <span>Users</span>}
          </Link>
        </li>
        <li>
          <Link to="/posts">
            <FiFileText className={styles.icon} />
            {!isCollapsed && <span>Posts</span>}
          </Link>
        </li>
        <li>
          <Link to="/reports">
            <FiArchive className={styles.icon} />
            {!isCollapsed && <span>Reports</span>}
          </Link>
        </li>
      </ul>

      <button className={styles.toggleButton} onClick={toggleSidebar}>
        {isCollapsed ? (
          <FiChevronRight className={styles.icon} />
        ) : (
          <FiChevronLeft className={styles.icon} />
        )}
      </button>

      <div className={styles.logoutContainer}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          <FiLogOut className={styles.icon} />
          {!isCollapsed && (
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
