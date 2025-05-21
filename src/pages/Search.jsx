import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiUser, FiFileText } from "react-icons/fi";
import axios from "axios";
import styles from "../styles/Search.module.css";

// Constants for student majors and staff roles to avoid hardcoding in components
const STUDENT_MAJORS = [
  { id: 1, name: "Information Technology" },
  { id: 2, name: "Cyber Security" },
  { id: 3, name: "Architecture" },
  { id: 4, name: "Business Management" },
  { id: 5, name: "Accounting" },
  { id: 6, name: "Pharmacy" },
  { id: 7, name: "Therapeutic Nutrition" },
];

const STAFF_ROLES = [
  { id: 1, name: "Lecturer" },
  { id: 2, name: "Head of department" },
  { id: 3, name: "Accountant" },
  { id: 4, name: "Student Affairs" },
  { id: 5, name: "Public Relations" },
  { id: 6, name: "Secretary" },
  { id: 7, name: "Branch Manager" },
  { id: 8, name: "Deputy Branch Manager" },
  { id: 9, name: "Admission and Registration" },
];

const Search = ({ isModal = false, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    students: [],
    staff: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  /**
   * Handles the search functionality
   * @param {Event} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate search query
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/admin/search/users",
        {
          params: { text: searchQuery },
          timeout: 10000, // Increased timeout to 10 seconds
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Validate response data
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from server");
      }

      const results = response.data;
      const students = results.filter((user) => user.type === "student");
      const staff = results.filter((user) => user.type === "staff");

      setSearchResults({
        students,
        staff,
      });

      // Show message if no results found
      if (students.length === 0 && staff.length === 0) {
        setError("No results found. Try different keywords.");
      }
    } catch (error) {
      let errorMessage = "An error occurred during search.";

      // Handle different error scenarios
      if (error.response) {
        // Server responded with a status code outside 2xx
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (error.response.status === 404) {
          errorMessage = "Search service unavailable. Please try later.";
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // No response received
        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please check your connection.";
        } else {
          errorMessage = "Network error. Please check your connection.";
        }
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || "Unknown error occurred.";
      }

      console.error("Search error:", error);
      setError(errorMessage);
      setSearchResults({ posts: [], students: [], staff: [] });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filters and formats search results based on active tab
   * @returns {Array} - Array of formatted results
   */
  const getFilteredResults = () => {
    // Return all results with proper formatting
    if (activeTab === "all") {
      return [
        // ...searchResults.posts.map((post) => ({ ...post, type: "post" })),
        ...searchResults.students.map((student) => ({
          ...student,
          type: "student",
          displayName: student.displayName || "No Name",
          major:
            STUDENT_MAJORS.find((m) => m.id === student.major_id)?.name ||
            "Undefined",
          level: student.level ?? "Undefined",
        })),
        ...searchResults.staff.map((staff) => ({
          ...staff,
          type: "staff",
          displayName: staff.displayName || "No Name",
          role:
            STAFF_ROLES.find((r) => r.id === staff.role_id)?.name ||
            "Undefined",
        })),
      ];
    }

    // Return results for specific tab with proper formatting
    return searchResults[activeTab].map((item) => ({
      ...item,
      type: activeTab.slice(0, -1),
      displayName: item.displayName || "No Name",
      ...(activeTab === "students" && {
        major:
          STUDENT_MAJORS.find((m) => m.id === item.major_id)?.name ||
          "Undefined",
        level: item.level ?? "Undefined",
      }),
      ...(activeTab === "staff" && {
        role:
          STAFF_ROLES.find((r) => r.id === item.role_id)?.name || "Undefined",
      }),
    }));
  };

  /**
   * Effect to handle click outside modal when in modal mode
   */
  useEffect(() => {
    if (!isModal) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              placeholder={
                isModal
                  ? "Search by name..."
                  : "Search in posts, students, or staff..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null); // Clear error when user types
              }}
              className={styles.searchInput}
              autoFocus={isModal}
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Display error message if exists */}
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {!isModal && (
          <div className={styles.tabs}>
            {["all", "students", "staff"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.activeTab : ""}
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
                  {result.type === "student" &&
                    `Student • Level ${result.level}`}
                  {result.type === "staff" && `Staff • ${result.role}`}
                </p>
                {result.type === "student" && result.major && (
                  <p className={styles.resultMeta}>Major: {result.major}</p>
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
