import { useEffect, useState } from "react";
import DashboardCard from "../components/ui/DashboardCard.jsx";
import styles from "../styles/Dashboard.module.css";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    Users: 0,
    Posts: 0,
    Reports: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // جلب عدد المنشورات
        const postsRes = await axios.get("http://localhost:8000/api/v1/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // جلب عدد المستخدمين
        const usersRes = await axios.get("http://localhost:8000/api/v1/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // جلب عدد البلاغات
        const reportsRes = await axios.get("http://localhost:8000/api/v1/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          Users: usersRes.data.length,
          Posts: postsRes.data.total,
          Reports: reportsRes.data.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <div className={styles.cardsContainer}>
        <DashboardCard title="Total Users" value={stats.Users.toLocaleString()} />
        <DashboardCard title="Posts" value={stats.Posts.toLocaleString()} />
        <DashboardCard title="Reports" value={stats.Reports.toLocaleString()} />
      </div>
    </div>
  );
};

export default Dashboard;
