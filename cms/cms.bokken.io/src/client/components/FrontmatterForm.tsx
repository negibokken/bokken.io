import type { Frontmatter } from "../../server/articles/frontmatter.js";
import { TagInput } from "./TagInput.js";
import styles from "./FrontmatterForm.module.css";

interface Props {
  frontmatter: Frontmatter;
  slug: string;
  onChange: (fm: Frontmatter) => void;
  onSlugChange: (slug: string) => void;
}

export const FrontmatterForm = ({
  frontmatter,
  slug,
  onChange,
  onSlugChange,
}: Props) => {
  const update = (field: keyof Frontmatter, value: string | string[]) =>
    onChange({ ...frontmatter, [field]: value });

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Slug *</label>
        <input
          className={styles.input}
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="my-article-slug"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          className={styles.input}
          type="text"
          value={frontmatter.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={frontmatter.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tags</label>
        <TagInput
          tags={frontmatter.tags ?? []}
          onChange={(tags) => update("tags", tags)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Hero Image</label>
        <input
          className={styles.input}
          type="text"
          value={frontmatter.heroImage ?? ""}
          onChange={(e) => update("heroImage", e.target.value)}
          placeholder="./img/hero.png"
        />
      </div>
    </div>
  );
};
