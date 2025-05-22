import DashboardCard from "../components/ui/DashboardCard.jsx";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  // بيانات افتراضية فقط، لا يوجد API
  const stats = {
    totalUsers: 1200,
    Posts: 456,
    Reports: 8,
  };
  // لازم تكون بيانات حقيقة
  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <div className={styles.cardsContainer}>
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
        />
        <DashboardCard
          title="Posts"
          value={stats.Posts.toLocaleString()}
        />
        <DashboardCard
          title="Reports"
          value={stats.Reports.toLocaleString()}
        />
      </div>
    </div>
  );
};

export default Dashboard;
