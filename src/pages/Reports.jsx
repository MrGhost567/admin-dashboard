import { useState, useEffect, useCallback } from 'react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiSlash,
} from 'react-icons/fi';
import axios from 'axios';
import styles from '../styles/Reports.module.css';

const ReportsAdmin = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // تغيير نظام الفلاتر

  const API_URL = 'http://localhost:8000/api/v1/admin/reports';

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      // تحسين نظام الفلاتر
      switch (activeFilter) {
        case 'reviewed':
          params.isReviewed = true;
          break;
        default: // all
          break;
      }

      const response = await axios.get(API_URL, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setReports(data);

      // إظهار رسالة عندما لا توجد تقارير
      if (data.length === 0) {
        setError('No reports found matching your criteria');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const handleValidation = async (reportId, isValid) => {
    try {
      await axios.put(
        `${API_URL}/${reportId}`,
        {
          isValid,
          isReviewed: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error('Error validating report:', err);
      setError(err.response?.data?.message || 'Failed to validate report');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeFilter, fetchReports]);

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.pageTitle}>Reports Management</h1>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertTriangle /> {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {/* تحسين واجهة الفلاتر */}
      <div className={styles.filterControls}>
        <button
          className={activeFilter === 'all' ? styles.activeFilter : ''}
          onClick={() => setActiveFilter('all')}
        >
          All Reports
        </button>

        <button
          className={activeFilter === 'reviewed' ? styles.activeFilter : ''}
          onClick={() => setActiveFilter('reviewed')}
        >
          Reviewed
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 && !error ? (
        <div className={styles.emptyState}>
          <p>No reports available</p>
        </div>
      ) : (
        <div className={styles.reportsTableContainer}>
          <table className={styles.reportsTable}>
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
                  <td data-label="Report Details" className={styles.reportText}>
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
                      {report.isReviewed ? 'Reviewed' : 'Pending'}
                    </span>
                  </td>
                  <td data-label="Validity">
                    {report.isReviewed ? (
                      <span
                        className={`${styles.validity} ${
                          report.isValid ? styles.valid : styles.invalid
                        }`}
                      >
                        {report.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    ) : (
                      <span className={styles.notReviewed}>Not Reviewed</span>
                    )}
                  </td>
                  <td data-label="Date">
                    {report.created_at
                      ? new Date(report.created_at).toLocaleDateString()
                      : '—'}
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
                <h4>:Report Content</h4>
                <div className={styles.reportText}>
                  {selectedReport.report_text}
                </div>
              </div>

              <div className={styles.validationSection}>
                <h4>?Is this report valid</h4>
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
