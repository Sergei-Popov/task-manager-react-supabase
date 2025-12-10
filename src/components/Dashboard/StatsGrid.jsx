import styles from "../../pages/DashboardPage/DashboardPage.module.css";

function StatsGrid({ stats }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: "#6366f1" }}>
          📝
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>{stats.todo}</span>
          <span className={styles.statLabel}>К выполнению</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: "#f97316" }}>
          ⏳
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>{stats.inProgress}</span>
          <span className={styles.statLabel}>В работе</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: "#22c55e" }}>
          ✅
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Завершено</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ background: "#ef4444" }}>
          ⚠️
        </div>
        <div className={styles.statInfo}>
          <span className={styles.statValue}>{stats.overdue}</span>
          <span className={styles.statLabel}>Просрочено</span>
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;
