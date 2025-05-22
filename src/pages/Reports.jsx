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
  // State management for reports, loading, and error states
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for selected report and filters
  const [selectedReport, setSelectedReport] = useState(null);
  const [isValidFilter, setIsValidFilter] = useState("");
  const [filter, setFilter] = useState("");
  
  const API_URL = "http://localhost:8000/api/v1/admin/reports";

  /**
   * Fetches reports from the backend with current filters
   * @function fetchReports
   * @async
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepare query parameters based on current filters
      const params = {};
      if (filter !== "") params.isReviewed = filter;
      if (isValidFilter !== "") params.isValid = isValidFilter;

      // Make API request
      const response = await axios.get(API_URL, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Handle different response formats (array or object with data property)
      setReports(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter, isValidFilter]);

  /**
   * Handles report validation (mark as valid/invalid)
   * @function handleValidation
   * @async
   * @param {string} reportId - ID of the report to validate
   * @param {boolean} isValid - Whether the report is valid
   */
  const handleValidation = async (reportId, isValid) => {
    try {
      // Send validation request to backend
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
      
      // Refresh reports list after validation
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error("Error validating report:", err);
      setError(err.response?.data?.message || "Failed to validate report");
    }
  };

  // Fetch reports when component mounts or filters change
  useEffect(() => {
    fetchReports();
  }, [filter, isValidFilter, fetchReports]);

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.pageTitle}>Reports Management</h1>

      {/* Error display */}
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertTriangle /> {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* Filter controls */}
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
            setFilter("true");
            setIsValidFilter("true");
          }}
        >
          Valid Reports
        </button>

        <button
          className={isValidFilter === "false" ? styles.activeFilter : ""}
          onClick={() => {
            setFilter("true");
            setIsValidFilter("false");
          }}
        >
          Invalid Reports
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? ( // Empty state
        <div className={styles.emptyState}>
          <p>No reports found matching your criteria</p>
        </div>
      ) : ( // Reports table
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
                    <td data-label="User">
                      {/* Display user ID or name if available */}
                      {report.user_id}
                    </td>
                    <td data-label="Post">
                      {/* Display post ID or title if available */}
                      {report.post_id}
                    </td>
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
                      {/* Show validate button only for pending reports */}
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

      {/* Validation modal */}
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
                <h4>Is this report valid?</h4>
                <div className={styles.validationButtons}>
                  <button
                    onClick={() => handleValidation(selectedReport.id, true)}
                    className={styles.validButton}
                  >
                    <FiCheck /> Yes, Valid Report
                  </button>
                  <button
                    onClick={() => handleValidation(selectedReport.id, false)}
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