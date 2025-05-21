import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styles from "../styles/Posts.module.css";
import { FiTrash2, FiPaperclip, FiHeart } from "react-icons/fi";

// تهيئة axios لإضافة token تلقائياً
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Posts = () => {
  const API_URL = "http://localhost:8000/api/v1/posts";
  const observer = useRef();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pageRef = useRef(1);

  const fetchPosts = useCallback(
    async (initialLoad = true) => {
      if (!hasMore && !initialLoad) return;

      setIsLoading(initialLoad);
      setLoadingMore(!initialLoad);

      try {
        const response = await axios.get(
          `${API_URL}?page=${pageRef.current}&limit=10`
        );

        setPosts((prevPosts) => {
          const merged = [...prevPosts, ...response.data.data];
          const unique = Array.from(
            new Map(merged.map((p) => [p.id, p])).values()
          );
          return unique;
        });

        const hasMoreData = response.data.data.length === 10;
        setHasMore(hasMoreData);

        if (hasMoreData) pageRef.current += 1;
      } catch (err) {
        console.error("Error in uploading the post :(", err);
        setError("Failed to upload the post");
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [hasMore]
  );

  const confirmDeletePost = (id) => {
    setPostToDelete(id);
    setShowDeleteModal(true);
  };

  // delete post
  const handleDeleteConfirmed = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(`${API_URL}/${postToDelete}`);
      setPosts(posts.filter((post) => post.id !== postToDelete));
      setError("Post deleted successfully");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError(err.response?.data?.message || "Failed to delete post");
      }
    } finally {
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const lastPostRef = useCallback(
    (node) => {
      if (loadingMore || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts(false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, fetchPosts]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchPosts();
    } else {
      window.location.href = "/login";
    }
  }, [fetchPosts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  if (!isAuthenticated) {
    return <div className={styles.loading}>Redirecting to login...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Posts Management</h1>
      </div>

      {error && (
        <div
          className={error.includes("success") ? styles.success : styles.error}
        >
          {error}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}></div>
        </div>
      )}

      {isLoading && !showModal ? (
        <div className={styles.loading}>Loading posts...</div>
      ) : (
        <div className={styles.postsContainer}>
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={styles.postCard}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <div className={styles.postHeader}>
                <h3>{post.title || "Untitled Post"}</h3>
                <div className={styles.postActions}>
                  <button
                    onClick={() => confirmDeletePost(post.id)}
                    className={styles.deleteBtn}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className={styles.postMeta}>
                <span>By: {post.profile.displayName}</span>
                <span>Branch: {post.profile.branch}</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>

              <div className={styles.postContent}>
                <p>{post.body}</p>

                {post.attachment_url && (
                  <div className={styles.attachment}>
                    <a
                      href={post.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiPaperclip /> View Attachment
                    </a>
                  </div>
                )}
              </div>

              <div className={styles.commentsSection}>
                <h4>Comments ({post.comments.length})</h4>

                <div className={styles.commentsList}>
                  {post.comments.map((comment) => (
                    <div key={comment.id} className={styles.comment}>
                      <div className={styles.commentHeader}>
                        <strong>{comment.user.displayName}</strong>
                        <span>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loadingMore && (
            <div className={styles.loading}>Loading more posts...</div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.modalHeader}>
              <FiTrash2 className={styles.modalIcon} />
              <h3>Confirm Deletion</h3>
            </div>
            <p>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className={styles.deleteConfirmBtn}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
