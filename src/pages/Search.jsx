import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiUser, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import styles from '../styles/Search.module.css';

// used to display majors
const STUDENT_MAJORS = [
  { id: 1, name: 'Information Technology' },
  { id: 2, name: 'Cyber Security' },
  { id: 3, name: 'Architecture' },
  { id: 4, name: 'Business Management' },
  { id: 5, name: 'Accounting' },
  { id: 6, name: 'Pharmacy' },
  { id: 7, name: 'Therapeutic Nutrition' },
];

// used to display staff roles
const STAFF_ROLES = [
  { id: 1, name: 'Lecturer' },
  { id: 2, name: 'Head of department' },
  { id: 3, name: 'Accountant' },
  { id: 4, name: 'Student Affairs' },
  { id: 5, name: 'Public Relations' },
  { id: 6, name: 'Secretary' },
  { id: 7, name: 'Branch Manager' },
  { id: 8, name: 'Deputy Branch Manager' },
  { id: 9, name: 'Admission and Registration' },
];

const Search = ({ isModal = false, onClose }) => {
  // what's the user enter
  const [searchQuery, setSearchQuery] = useState('');
  // results after search
  const [searchResults, setSearchResults] = useState({
    students: [],
    staff: [],
  });
  // is loading the search status
  const [isLoading, setIsLoading] = useState(false);
  // the active tab
  const [activeTab, setActiveTab] = useState('all');
  // error storage
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  // search function
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/admin/search/users',
        {
          params: { text: searchQuery },
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // تحسين معالجة النتائج القادمة من Backend
      const results = response.data || [];

      // تصنيف النتائج إلى طلاب وموظفين بناءً على وجود الحقول المميزة
      const students = results.filter(
        (user) =>
          Object.prototype.hasOwnProperty.call(user, 'major_id') ||
          Object.prototype.hasOwnProperty.call(user, 'level')
      );

      const staff = results.filter(
        (user) =>
          Object.prototype.hasOwnProperty.call(user, 'role_id') &&
          !students.includes(user)
      );

      setSearchResults({
        students,
        staff,
      });

      if (students.length === 0 && staff.length === 0) {
        setError('No results found. Try different keywords.');
      }
    } catch (error) {
      let errorMessage = 'An error occurred during search.';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 404) {
          errorMessage = 'Search service unavailable. Please try later.';
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else {
          errorMessage = 'Network error. Please check your connection.';
        }
      } else {
        errorMessage = error.message || 'Unknown error occurred.';
      }

      console.error('Search error:', error);
      setError(errorMessage);
      setSearchResults({ students: [], staff: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // filtered the results
  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [
        ...searchResults.students.map((student) => ({
          ...student,
          type: 'student',
          displayName: student.displayName || 'No Name',
          major:
            STUDENT_MAJORS.find((m) => m.id === student.major_id)?.name ||
            'Undefined',
          level: student.level ?? 'Undefined',
        })),
        ...searchResults.staff.map((staff) => ({
          ...staff,
          type: 'staff',
          displayName: staff.displayName || 'No Name',
          role:
            STAFF_ROLES.find((r) => r.id === staff.role_id)?.name ||
            'Undefined',
        })),
      ];
    }

    return searchResults[activeTab].map((item) => ({
      ...item,
      type: activeTab.slice(0, -1),
      displayName: item.displayName || 'No Name',
      ...(activeTab === 'students' && {
        major:
          STUDENT_MAJORS.find((m) => m.id === item.major_id)?.name ||
          'Undefined',
        level: item.level ?? 'Undefined',
      }),
      ...(activeTab === 'staff' && {
        role:
          STAFF_ROLES.find((r) => r.id === item.role_id)?.name || 'Undefined',
      }),
    }));
  };

  // closing the search modal
  useEffect(() => {
    if (!isModal) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModal, onClose]);

  const filteredResults = getFilteredResults();

  return (
    <div
      className={isModal ? styles.modalOverlay : styles.searchPage}
      onClick={isModal ? onClose : null}
    >
      <div
        className={isModal ? styles.modalContent : styles.pageContent}
        ref={isModal ? modalRef : null}
        onClick={isModal ? (e) => e.stopPropagation() : null}
      >
        {!isModal && (
          <div className={styles.header}>
            <h1>Search</h1>
          </div>
        )}

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null);
              }}
              className={styles.searchInput}
              autoFocus={isModal}
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {!isModal && (
          <div className={styles.tabs}>
            {['all', 'students', 'staff'].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.activeTab : ''}
                onClick={() => setActiveTab(tab)}
                disabled={isLoading}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Searching...</p>
          </div>
        )}

        <div className={styles.searchResults}>
          {!isLoading &&
            filteredResults.length === 0 &&
            searchQuery &&
            !error && (
              <p className={styles.noResults}>
                No results found for "{searchQuery}"
              </p>
            )}

          {filteredResults.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className={styles.resultCard}
            >
              <div className={styles.resultIcon}>
                <FiUser />
              </div>
              <div className={styles.resultContent}>
                <h3>{result.displayName}</h3>
                <p className={styles.resultType}>
                  {result.type === 'student' &&
                    `Student • Level ${result.level}`}
                  {result.type === 'staff' && `Staff`}
                </p>
                {result.type === 'student' && (
                  <p className={styles.resultMeta}>Major: {result.major}</p>
                )}
                {result.type === 'staff' && (
                  <p className={styles.resultMeta}>Role: {result.role}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
