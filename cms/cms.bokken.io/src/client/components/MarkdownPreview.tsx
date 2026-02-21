import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Frontmatter } from "../../server/articles/frontmatter.js";
import styles from "./MarkdownPreview.module.css";

interface Props {
  frontmatter: Frontmatter;
  body: string;
}

export const MarkdownPreview = ({ frontmatter, body }: Props) => (
  <div className={styles.container}>
    <div className={styles.meta}>
      {frontmatter.title && (
        <h1 className={styles.title}>{frontmatter.title}</h1>
      )}
      {frontmatter.pubDate && (
        <p className={styles.date}>{frontmatter.pubDate}</p>
      )}
      {frontmatter.tags.length > 0 && (
        <div className={styles.tags}>
          {frontmatter.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className={styles.body}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  </div>
);
