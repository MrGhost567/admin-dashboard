import React, { useState } from "react";
import styles from "../../styles/Header.module.css";
import { FiSearch } from "react-icons/fi";
import Search from "../../pages/Search";
import { Auth } from "../../services/api";
import { useLocation } from "react-router-dom";

const Header = ({ user, isSidebarCollapsed }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const isAdmin = Auth.isAdmin();

  if (!user) {
    return <div className={styles.header}>Loading...</div>;
  }

  // هنا تحدد في أي صفحات تظهر شريط البحث (مثلاً في صفحة /users)
  const showSearchBar = location.pathname === "/users";

  return (
    <header
      className={`${styles.header} ${
        isSidebarCollapsed ? styles["sidebar-collapsed"] : ""
      }`}
    >
      {/* شريط البحث يظهر فقط إذا كان showSearchBar = true */}
      {showSearchBar && (
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            onClick={isAdmin ? toggleSearch : undefined}
            readOnly
            disabled={!isAdmin}
            aria-label="Open search"
            style={{
              color: "#000",
              opacity: !isAdmin ? 0.5 : 1,
              cursor: !isAdmin ? "not-allowed" : "pointer",
            }}
          />
        </div>
      )}

      {/* قسم المستخدم */}
      <div className={styles.profile}>
        <span className={styles.username}>{user.name}</span>
      </div>

      {isSearchOpen && <Search isModal={true} onClose={toggleSearch} />}
    </header>
  );
};

export default Header;
