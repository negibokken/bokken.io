import styles from "./LoginPage.module.css";

export const LoginPage = () => (
  <div className={styles.container}>
    <div className={styles.card}>
      <h1 className={styles.title}>bokken.io CMS</h1>
      <p className={styles.description}>Sign in to manage your blog content.</p>
      <a href="/api/auth/github" className={styles.loginBtn}>
        Login with GitHub
      </a>
    </div>
  </div>
);
