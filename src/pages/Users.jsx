import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Users.module.css';
// icons used
import { FiEdit, FiTrash2, FiUserPlus, FiX, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const Users = ({ isSidebarCollapsed }) => {
  // Majors
  const STUDENT_MAJORS = [
    { id: 1, name: 'Information Technology' },
    { id: 2, name: 'Cyber Security' },
    { id: 3, name: 'Architecture' },
    { id: 4, name: 'Business Management' },
    { id: 5, name: 'Accounting' },
    { id: 6, name: 'Pharmacy' },
    { id: 7, name: 'Therapeutic Nutrition' },
  ];

  const BRANCHES = ['Hadhramaut'];

  // Staff Roles
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

  // State of Users
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // State of Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Add Form Variable
  const initialAddForm = {
    username: '',
    displayName: '',
    name: '',
    password: '',
    user_type_id: '1',
    branch: 'Hadhramaut',
    major_id: '',
    level: '',
    role_id: '',
  };

  // Edit form Variable
  const initialEditForm = {
    password: '',
    isAdmin: 0,
  };

  const [addFormData, setAddFormData] = useState(initialAddForm);
  const [editFormData, setEditFormData] = useState(initialEditForm);
  const [errors, setErrors] = useState({});

  // Token function
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };
  };

  // Get user from database (Read)
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:8000/api/v1/admin/users',
        getAuthHeader()
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setApiError('Failed to fetch users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // validation function of adding new user
  const validateAddForm = () => {
    const errors = {};
    const {
      username,
      displayName,
      password,
      branch,
      user_type_id,
      major_id,
      level,
      role_id,
    } = addFormData;

    // Account number Validations
    if (!username.trim()) {
      errors.username = 'Account number is required';
    } else if (!/^\d+$/.test(username)) {
      errors.username =
        'Account number must contain numbers only (no letters or symbols)';
    } else if (username.length < 8) {
      errors.username = 'Account number must be at least 8 digits';
    } else if (username.length > 12) {
      errors.username = 'Account number must not exceed 12 digits';
    }

    // Display Name Validations
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (/^\d+$/.test(displayName)) {
      errors.displayName = 'Display name must not contain only numbers';
    } else if (/[!@#$%^&*()\-_=+{}[\]|;:'",.<>?/`~]/.test(displayName)) {
      errors.displayName = 'Display name must not contain symbols';
    } else if (displayName.length < 3) {
      errors.displayName = 'Display name must be at least 3 characters';
    }

    // Password Validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Branch Validation
    if (!branch) {
      errors.branch = 'Branch is required';
    }

    // Validation Based on User Type
    if (user_type_id === '1') {
      if (!major_id) errors.major_id = 'Major is required';
      if (!level) errors.level = 'Level is required';
    } else {
      if (!role_id) errors.role_id = 'Role is required';
    }

    return errors;
  };

  // Add Submit Function
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAddForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const endpoint =
        addFormData.user_type_id === '1'
          ? 'api/v1/admin/register/student'
          : 'api/v1/admin/register/staff';

      // Payload functions
      const payload = {
        username: addFormData.username,
        displayName: addFormData.displayName,
        password: addFormData.password,
        branch: addFormData.branch,
      };

      if (addFormData.user_type_id === '1') {
        payload.major_id = addFormData.major_id;
        payload.level = addFormData.level;
      } else {
        payload.role_id = addFormData.role_id;
      }

      await axios.post(
        `http://localhost:8000/${endpoint}`,
        payload,
        getAuthHeader()
      );

      // Success Message of adding new user
      setSuccessMessage('User added successfully!');
      await fetchUsers();
      setShowAddForm(false);
      setAddFormData(initialAddForm);
    } catch (error) {
      const data = error.response?.data || {};
      const serverErrors = data.errors ? { ...data.errors } : {};

      // لو السيرفر رجع رسالة عامة
      if (data.message && !data.errors) {
        if (data.message.toLowerCase().includes('exists')) {
          serverErrors.username = [data.message];
        } else {
          setApiError(data.message);
        }
      }

      setErrors(serverErrors);
      if (Object.keys(serverErrors).length > 0) setApiError('');
    }
  };

  // Validate Edit user form
  const validateEditForm = (editFormData) => {
    const errors = {};
    const { username, password } = editFormData;

    // Username is required
    if (!username.trim()) {
      errors.username = 'Account number is required';
    } else if (!/^\d+$/.test(username)) {
      errors.username =
        'Account number must contain numbers only (no letters or symbols)';
    } else if (username.length > 12) {
      errors.username = 'Account number must not exceed 12 digits';
    }

    // Password is optional but if present, must be valid
    if (password && password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return errors;
  };

  // Edit function of a user
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateEditForm(editFormData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        username: editFormData.username.toString(), // ensure it's a string
        user_type_id: parseInt(editFormData.user_type_id),
        isAdmin: editFormData.isAdmin,
      };

      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      await axios.put(
        `http://localhost:8000/api/v1/admin/user/${editId}`,
        payload,
        getAuthHeader()
      );

      setSuccessMessage('User updated successfully!');
      await fetchUsers();
      setShowEditForm(false);
    } catch (error) {
      const serverErrors = error.response?.data?.errors || {};
      setErrors(serverErrors);
      setApiError(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Managing changes
  const handleEdit = (user) => {
    setEditFormData({
      username: user.username.toString(), // When loading data change user to string
      user_type_id: user.user_type_id.toString(),
      isAdmin: user.isAdmin || 0,
      password: '',
    });
    setEditId(user.id);
    setShowEditForm(true);
  };

  // managing deleting
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/admin/users/${userToDelete}`,
        getAuthHeader()
      );
      setSuccessMessage('User deleted successfully!');
      await fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setApiError('Failed to delete user. Please try again.');
    }
  };

  // Display table
  const getUserType = (user_type_id) => {
    return user_type_id === 1 ? 'Student' : 'Staff';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // manage changing form
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div
      className={`${styles.container} ${
        isSidebarCollapsed ? styles.sidebarCollapsed : ''
      }`}
    >
      {/* Modal of deleting user */}
      {showDeleteModal && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalHeader}>
              <h3>Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.closeButton}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.deleteModalContent}>
              <p>? Are you sure you want to delete this user</p>
              <p>This action cannot be undone</p>
            </div>
            <div className={styles.deleteModalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelDeleteButton}
              >
                <FiX /> Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={styles.confirmDeleteButton}
              >
                <FiCheck /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Head of the page  */}
      <header className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          <FiUserPlus /> Add User
        </button>
      </header>

      {/* Message of success or failure */}
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      {apiError && <div className={styles.errorMessage}>{apiError}</div>}

      {/* Modal of adding new users  */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h2>New User</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ padding: '0 15px' }}>
                <div className={styles.formGroup}>
                  <label>
                    Account number <span style={{ color: 'red' }}>*</span>
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={addFormData.username}
                    onChange={handleAddFormChange}
                    className={errors.username ? styles.errorInput : ''}
                  />
                  {errors.username && (
                    <span className={styles.error}>
                      {Array.isArray(errors.username)
                        ? errors.username[0]
                        : errors.username}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Display Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={addFormData.displayName}
                    onChange={handleAddFormChange}
                    className={errors.displayName ? styles.errorInput : ''}
                  />
                  {errors.displayName && (
                    <span className={styles.error}>{errors.displayName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddFormChange}
                    className={errors.password ? styles.errorInput : ''}
                  />
                  {errors.password && (
                    <span className={styles.error}>{errors.password}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Branch <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="branch"
                    value={addFormData.branch}
                    onChange={handleAddFormChange}
                    className={errors.branch ? styles.errorInput : ''}
                  >
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <span className={styles.error}>{errors.branch}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    User Type <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="user_type_id"
                    value={addFormData.user_type_id}
                    onChange={handleAddFormChange}
                  >
                    <option value="1">Student</option>
                    <option value="2">Staff</option>
                  </select>
                </div>

                {addFormData.user_type_id === '1' ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>
                        Major <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="major_id"
                        value={addFormData.major_id}
                        onChange={handleAddFormChange}
                        className={errors.major_id ? styles.errorInput : ''}
                      >
                        <option value="">Select Major</option>
                        {STUDENT_MAJORS.map((major) => (
                          <option key={major.id} value={major.id}>
                            {major.name}
                          </option>
                        ))}
                      </select>
                      {errors.major_id && (
                        <span className={styles.error}>{errors.major_id}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        Level <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name="level"
                        value={addFormData.level}
                        onChange={handleAddFormChange}
                        className={errors.level ? styles.errorInput : ''}
                      >
                        <option value="">Select Level</option>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>
                            Level {level}
                          </option>
                        ))}
                      </select>
                      {errors.level && (
                        <span className={styles.error}>{errors.level}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.formGroup}>
                    <label>
                      Role <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      name="role_id"
                      value={addFormData.role_id}
                      onChange={handleAddFormChange}
                      className={errors.role_id ? styles.errorInput : ''}
                    >
                      <option value="">Select Role</option>
                      {STAFF_ROLES.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {errors.role_id && (
                      <span className={styles.error}>{errors.role_id}</span>
                    )}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddFormData(initialAddForm);
                      setErrors({});
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Add User
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal of editing user info */}
      {showEditForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ padding: '0 15px' }}>
                <div className={styles.formGroup}>
                  <label>Account number</label>
                  <input
                    type="text" // تأكد أنه من نوع text وليس number
                    name="username"
                    value={editFormData.username}
                    disabled
                    onChange={(e) => {
                      // تقبل الأرقام وتحولها إلى string
                      const value = e.target.value;
                      setEditFormData((prev) => ({
                        ...prev,
                        username:
                          typeof value === 'number' ? value.toString() : value,
                      }));
                    }}
                  />
                  {errors.username && (
                    <span className={styles.error}>
                      {Array.isArray(errors.username)
                        ? errors.username[0]
                        : errors.username}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Is Admin</label>
                  <select
                    name="isAdmin"
                    value={editFormData.isAdmin}
                    onChange={handleEditFormChange}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>New Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setErrors({});
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table of users */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <table className={styles.responsiveTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Account number</th>
                <th>Display Name</th>
                <th>User Type</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Username">{user.username}</td>
                  <td data-label="Display Name">
                    {user.display_name || '-'}
                  </td>{' '}
                  <td data-label="User Type">
                    {getUserType(user.user_type_id)}
                  </td>
                  <td data-label="Created At">{formatDate(user.created_at)}</td>
                  <td data-label="Updated At">{formatDate(user.updated_at)}</td>
                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(user)}
                        className={styles.editBtn}
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user.id);
                          setShowDeleteModal(true);
                        }}
                        className={styles.deleteBtn}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
