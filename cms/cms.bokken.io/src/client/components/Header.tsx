import { useAuth } from "../hooks/useAuth.js";
import { logout } from "../api/auth.js";
import styles from "./Header.module.css";

export const Header = () => {
  const { user, refetch } = useAuth();

  const handleLogout = async () => {
    await logout();
    refetch();
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>bokken.io CMS</div>
      {user && (
        <div className={styles.userArea}>
          <img
            src={user.avatarUrl}
            alt={user.username}
            className={styles.avatar}
          />
          <span className={styles.username}>{user.username}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
