import { useState, useEffect, useCallback } from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiSlash,
} from "react-icons/fi";
import axios from "axios";
import styles from "../styles/Reports.module.css";

const ReportsAdmin = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isValidFilter, setIsValidFilter] = useState("");
  const [filter, setFilter] = useState("");
  const API_URL = "http://localhost:8000/api/v1/admin/reports";

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (filter !== "") {
        params.append("isReviewed", filter);
      }

      if (isValidFilter !== "") {
        params.append("isValid", isValidFilter);
      }

      const response = await axios.get(`${API_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter, isValidFilter]);

  const handleValidation = useCallback(
    async (reportId, isValid) => {
      try {
        await axios.put(
          `${API_URL}/${reportId}`,
          {
            isValid,
            isReviewed: true,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        fetchReports(); // استدعاء بدون معاملات لاستخدام القيم الحالية
      } catch (err) {
        console.error("Error validating report:", err);
        setError(err.response?.data?.message || "Failed to validate report");
      }
    },
    [fetchReports]
  );

  useEffect(() => {
    console.log("Current filters:", { filter, isValidFilter });
    console.log(
      "API URL:",
      `${API_URL}?${new URLSearchParams({
        ...(filter !== "" && { isReviewed: filter }),
        ...(isValidFilter !== "" && { isValid: isValidFilter }),
      }).toString()}`
    );
    fetchReports();
  }, [filter, isValidFilter, fetchReports]);

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.pageTitle}>Reports Management</h1>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertTriangle /> {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className={styles.filterControls}>
        <button
          className={
            filter === "" && isValidFilter === "" ? styles.activeFilter : ""
          }
          onClick={() => {
            setFilter("");
            setIsValidFilter("");
          }}
        >
          All Reports
        </button>

        <button
          className={filter === "false" ? styles.activeFilter : ""}
          onClick={() => {
            setFilter("false");
            setIsValidFilter("");
          }}
        >
          Pending Review
        </button>

        <button
          className={
            filter === "true" && isValidFilter === "" ? styles.activeFilter : ""
          }
          onClick={() => {
            setFilter("true");
            setIsValidFilter("");
          }}
        >
          Reviewed
        </button>

        <button
          className={isValidFilter === "true" ? styles.activeFilter : ""}
          onClick={() => {
            setFilter("true"); // Only reviewed reports can be valid/invalid
            setIsValidFilter("true");
          }}
        >
          Valid Reports
        </button>

        <button
          className={isValidFilter === "false" ? styles.activeFilter : ""}
          onClick={() => {
            setFilter("true"); // Only reviewed reports can be valid/invalid
            setIsValidFilter("false");
          }}
        >
          Invalid Reports
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No reports found</p>
        </div>
      ) : (
        <div className={styles.reportsTableContainer}>
          <div className={styles.reportsTable}>
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Details</th>
                  <th>User</th>
                  <th>Post</th>
                  <th>Status</th>
                  <th>Validity</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td data-label="Report ID">{report.id}</td>
                    <td
                      data-label="Report Details"
                      className={styles.reportText}
                    >
                      {report.report_text}
                    </td>
                    <td data-label="User">{report.user_id}</td>
                    <td data-label="Post">{report.post_id}</td>
                    <td data-label="Status">
                      <span
                        className={`${styles.status} ${
                          report.isReviewed ? styles.reviewed : styles.pending
                        }`}
                      >
                        {report.isReviewed ? "Reviewed" : "Pending"}
                      </span>
                    </td>
                    <td data-label="Validity">
                      {report.isReviewed ? (
                        <span
                          className={`${styles.validity} ${
                            report.isValid ? styles.valid : styles.invalid
                          }`}
                        >
                          {report.isValid ? "Valid" : "Invalid"}
                        </span>
                      ) : (
                        <span className={styles.notReviewed}>Not Reviewed</span>
                      )}
                    </td>
                    <td data-label="Date">
                      {report.created_at
                        ? new Date(report.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td data-label="Actions" className={styles.actions}>
                      {!report.isReviewed && (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className={styles.validateButton}
                        >
                          <FiCheckCircle /> Validate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedReport(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Validate Report #{selectedReport.id}</h3>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedReport(null)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.reportPreview}>
                <h4>Report Content:</h4>
                <div className={styles.reportText}>
                  {selectedReport.report_text}
                </div>
              </div>

              <div className={styles.validationSection}>
                <h4>?Is this report valid</h4>
                <div className={styles.validationButtons}>
                  <button
                    onClick={() => {
                      handleValidation(selectedReport.id, true);
                      setSelectedReport(null);
                    }}
                    className={styles.validButton}
                  >
                    <FiCheck /> Yes, Valid Report
                  </button>
                  <button
                    onClick={() => {
                      handleValidation(selectedReport.id, false);
                      setSelectedReport(null);
                    }}
                    className={styles.invalidButton}
                  >
                    <FiSlash /> No, Invalid Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAdmin;
