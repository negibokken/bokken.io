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
    <div className={styles.prose}>
      <div className={styles.titleBlock}>
        {frontmatter.title && <h1>{frontmatter.title}</h1>}
        <div className={styles.meta}>
          {frontmatter.pubDate && <span>{frontmatter.pubDate}</span>}
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
        <hr className={styles.separator} />
      </div>
      <div className={styles.body}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </div>
  </div>
);
