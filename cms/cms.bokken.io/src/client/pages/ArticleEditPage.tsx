import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header.js";
import { FrontmatterForm } from "../components/FrontmatterForm.js";
import { MarkdownEditor } from "../components/MarkdownEditor.js";
import { ImageUploader } from "../components/ImageUploader.js";
import { SaveIcon } from "../components/icons/SaveIcon.js";
import { PublishIcon } from "../components/icons/PublishIcon.js";
import { useArticle } from "../hooks/useArticle.js";
import { saveArticle, publishArticle } from "../api/articles.js";
import type { Frontmatter } from "../../server/articles/frontmatter.js";
import styles from "./ArticleEditPage.module.css";

export const ArticleEditPage = () => {
  const { "*": branchParam } = useParams<{ "*": string }>();
  const branchName = decodeURIComponent(branchParam ?? "");
  const navigate = useNavigate();
  const { data, loading, error } = useArticle(branchName);

  const [frontmatter, setFrontmatter] = useState<Frontmatter>({
    title: "",
    description: "",
    pubDate: "",
    tags: [],
  });
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileSha, setFileSha] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setFrontmatter(data.frontmatter);
    setBody(data.body);
    setFilePath(data.filePath);
    setFileSha(data.fileSha);
    if (data.filePath) {
      const parts = data.filePath.split("/");
      const filename = parts[parts.length - 1];
      setSlug(filename.replace(/\.md$/, ""));
    }
  }, [data]);

  const getDate = () => {
    if (filePath) {
      const parts = filePath.split("/");
      const dateIdx = parts.indexOf("blog") + 1;
      if (dateIdx > 0 && dateIdx < parts.length - 1) return parts[dateIdx];
    }
    return new Date().toISOString().split("T")[0];
  };

  const handleSave = async () => {
    if (!slug) {
      setMessage("Slug is required");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const result = await saveArticle(branchName, {
        frontmatter,
        body,
        slug,
        existingFilePath: filePath,
        existingSha: fileSha,
      });
      setFilePath(result.filePath);
      setMessage("Saved successfully");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!slug) {
      setMessage("Slug is required");
      return;
    }
    const confirmed = window.confirm(
      "Publish this article? This will create and merge a PR."
    );
    if (!confirmed) return;
    setPublishing(true);
    setMessage(null);
    try {
      await publishArticle(branchName, {
        frontmatter,
        body,
        slug,
        existingFilePath: filePath,
        existingSha: fileSha,
        isNew: !data?.frontmatter.pubDate,
      });
      setMessage("Published successfully");
      setTimeout(() => navigate("/"), 1500);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleImageInsert = (markdown: string) => {
    setBody((prev) => prev + `\n${markdown}\n`);
  };

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.toolbar}>
        <span className={styles.branch}>{branchName}</span>
        <div className={styles.actions}>
          {message && <span className={styles.message}>{message}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.saveBtn}
          >
            <SaveIcon size={14} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={styles.publishBtn}
          >
            <PublishIcon size={14} />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <FrontmatterForm
            frontmatter={frontmatter}
            slug={slug}
            onChange={setFrontmatter}
            onSlugChange={setSlug}
          />
          <div className={styles.imageSection}>
            <h3 className={styles.imageSectionTitle}>Upload Image</h3>
            <ImageUploader
              branchName={branchName}
              date={getDate()}
              onInsert={handleImageInsert}
            />
          </div>
        </aside>

        <div className={styles.editor}>
          <MarkdownEditor value={body} onChange={setBody} />
        </div>
      </div>
    </div>
  );
};
