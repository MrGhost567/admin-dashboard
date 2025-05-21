import DashboardCard from "../components/ui/DashboardCard.jsx";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  // بيانات افتراضية فقط، لا يوجد API
  const stats = {
    totalStudents: 1200,
    activePosts: 456,
    newReports: 8,
  };
  // لازم تكون بيانات حقيقة
  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <div className={styles.cardsContainer}>
        <DashboardCard
          title="Total Users"
          value={stats.totalStudents.toLocaleString()}
        />
        <DashboardCard
          title="Posts"
          value={stats.activePosts.toLocaleString()}
        />
        <DashboardCard
          title="Reports"
          value={stats.newReports.toLocaleString()}
        />
      </div>
    </div>
  );
};

export default Dashboard;
