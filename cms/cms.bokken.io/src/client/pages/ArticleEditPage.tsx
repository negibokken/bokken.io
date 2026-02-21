import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../components/Header.js";
import { FrontmatterForm } from "../components/FrontmatterForm.js";
import { MarkdownEditor } from "../components/MarkdownEditor.js";
import { MarkdownPreview } from "../components/MarkdownPreview.js";
import { ImageUploader } from "../components/ImageUploader.js";
import { SaveIcon } from "../components/icons/SaveIcon.js";
import { PublishIcon } from "../components/icons/PublishIcon.js";
import { RefreshIcon } from "../components/icons/RefreshIcon.js";
import { useArticle } from "../hooks/useArticle.js";
import { createArticle, saveArticle, publishArticle } from "../api/articles.js";
import type { Frontmatter } from "../../server/articles/frontmatter.js";
import styles from "./ArticleEditPage.module.css";

type ViewMode = "editor" | "preview";

export const ArticleEditPage = () => {
  const { "*": branchParam } = useParams<{ "*": string }>();
  const branchName = decodeURIComponent(branchParam ?? "");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filePathParam = searchParams.get("filePath") ?? undefined;

  // Branch used for initial fetch: if no branchName but filePath exists, fetch from main
  const fetchBranch = branchName || (filePathParam ? "main" : "");
  const fetchFilePath =
    fetchBranch === "main"
      ? filePathParam
      : branchName
        ? filePathParam
        : undefined;

  const { data, loading, error, refresh } = useArticle(
    fetchBranch,
    fetchFilePath,
  );

  // Active branch for save/publish — lazily created if empty
  const activeBranchRef = useRef(branchName);
  const [displayBranch, setDisplayBranch] = useState(
    branchName || "New Article",
  );

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
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

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

  const ensureBranch = async (): Promise<string> => {
    if (activeBranchRef.current) return activeBranchRef.current;
    const { branchName: newBranch } = await createArticle();
    activeBranchRef.current = newBranch;
    setDisplayBranch(newBranch);
    return newBranch;
  };

  const handleSave = async () => {
    if (!slug) {
      setMessage("Slug is required");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const branch = await ensureBranch();
      const result = await saveArticle(branch, {
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
      "Publish this article? This will create and merge a PR.",
    );
    if (!confirmed) return;
    setPublishing(true);
    setMessage(null);
    try {
      const branch = await ensureBranch();
      await publishArticle(branch, {
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
        <span className={styles.branch}>{displayBranch}</span>
        <div className={styles.actions}>
          {message && <span className={styles.message}>{message}</span>}
          <button
            onClick={refresh}
            disabled={loading}
            className={styles.refreshBtn}
            title="Refresh from GitHub (bypass cache)"
          >
            <RefreshIcon size={14} />
          </button>
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
              branchName={displayBranch}
              date={getDate()}
              onInsert={handleImageInsert}
            />
          </div>
        </aside>

        <div className={styles.editor}>
          <div className={styles.editorTabs}>
            <button
              className={`${styles.tab} ${viewMode === "editor" ? styles.activeTab : ""}`}
              onClick={() => setViewMode("editor")}
            >
              Editor
            </button>
            <button
              className={`${styles.tab} ${viewMode === "preview" ? styles.activeTab : ""}`}
              onClick={() => setViewMode("preview")}
            >
              Preview
            </button>
          </div>
          <div className={styles.editorContent}>
            {viewMode === "editor" ? (
              <MarkdownEditor value={body} onChange={setBody} />
            ) : (
              <MarkdownPreview frontmatter={frontmatter} body={body} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
