import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PublishedArticle,
  DraftArticle,
  deleteDraft,
} from "../api/articles.js";
import { TrashIcon } from "./icons/TrashIcon.js";
import styles from "./ArticleTable.module.css";

interface Props {
  published: PublishedArticle[];
  drafts: DraftArticle[];
  onDraftDeleted: () => void;
}

export const ArticleTable = ({ published, drafts, onDraftDeleted }: Props) => {
  const navigate = useNavigate();
  const [deletingBranch, setDeletingBranch] = useState<string | null>(null);

  const handleDraftClick = (branchName: string) => {
    navigate(`/edit/${encodeURIComponent(branchName)}`);
  };

  const handlePublishedClick = (article: PublishedArticle) => {
    navigate(`/edit?filePath=${encodeURIComponent(article.path)}`);
  };

  const handleDelete = async (e: React.MouseEvent, branchName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete draft "${branchName}"?`)) return;
    setDeletingBranch(branchName);
    try {
      await deleteDraft(branchName);
      onDraftDeleted();
    } catch {
      alert("Failed to delete draft");
    } finally {
      setDeletingBranch(null);
    }
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
                <th></th>
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
                  <td className={styles.actionCell}>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(e, d.branchName)}
                      disabled={deletingBranch === d.branchName}
                      title="Delete draft"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </td>
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
