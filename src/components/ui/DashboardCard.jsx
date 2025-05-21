// src/components/ui/DashboardCard.jsx
import React from "react";
import styles from "../../styles/DashboardCard.module.css";

const DashboardCard = ({
  title,
  value,
  icon,
  loading = false,
  error = false,
}) => {
  return (
    <div className={styles.card}>
      {icon && (
        <div className={styles.iconWrapper}>
          {loading ? "⏳" : error ? "❌" : icon}
        </div>
      )}

      <h3 className={styles.cardTitle}>{title}</h3>

      {loading ? (
        <div className={styles.loadingPulse}></div>
      ) : error ? (
        <p className={styles.errorValue}>Error</p>
      ) : (
        <p className={styles.cardValue}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
    </div>
  );
};

export default DashboardCard;
