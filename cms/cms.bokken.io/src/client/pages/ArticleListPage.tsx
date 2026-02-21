import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header.js";
import { ArticleTable } from "../components/ArticleTable.js";
import { PlusIcon } from "../components/icons/PlusIcon.js";
import { useArticles } from "../hooks/useArticles.js";
import styles from "./ArticleListPage.module.css";

export const ArticleListPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useArticles();

  const handleCreate = () => {
    navigate("/edit");
  };

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h1 className={styles.heading}>Articles</h1>
          <button onClick={handleCreate} className={styles.createBtn}>
            <PlusIcon size={14} />
            Create Article
          </button>
        </div>

        {loading && <p className={styles.status}>Loading articles...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {data && (
          <ArticleTable
            published={data.published}
            drafts={data.drafts}
            onDraftDeleted={refetch}
          />
        )}
      </main>
    </div>
  );
};
