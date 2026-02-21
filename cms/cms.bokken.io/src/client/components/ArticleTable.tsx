import { useNavigate } from "react-router-dom";
import { PublishedArticle, DraftArticle } from "../api/articles.js";
import styles from "./ArticleTable.module.css";

interface Props {
  published: PublishedArticle[];
  drafts: DraftArticle[];
}

export const ArticleTable = ({ published, drafts }: Props) => {
  const navigate = useNavigate();

  const handleDraftClick = (branchName: string) => {
    navigate(`/edit/${encodeURIComponent(branchName)}`);
  };

  const handlePublishedClick = (article: PublishedArticle) => {
    navigate(`/edit-published/${encodeURIComponent(article.path)}`);
  };

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Drafts ({drafts.length})</h2>
        {drafts.length === 0 ? (
          <p className={styles.empty}>No drafts</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr
                  key={d.branchName}
                  className={styles.row}
                  onClick={() => handleDraftClick(d.branchName)}
                >
                  <td>{d.title || "(untitled)"}</td>
                  <td className={styles.branch}>{d.branchName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Published ({published.length})</h2>
        {published.length === 0 ? (
          <p className={styles.empty}>No published articles</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Slug</th>
              </tr>
            </thead>
            <tbody>
              {published.map((a) => (
                <tr
                  key={a.path}
                  className={styles.row}
                  onClick={() => handlePublishedClick(a)}
                >
                  <td>{a.title}</td>
                  <td>{a.date}</td>
                  <td>{a.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
