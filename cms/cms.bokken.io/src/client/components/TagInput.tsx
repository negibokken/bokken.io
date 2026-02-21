import { useState, KeyboardEvent } from "react";
import styles from "./TagInput.module.css";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export const TagInput = ({ tags, onChange }: Props) => {
  const [input, setInput] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={styles.container}>
      {tags.map((tag, i) => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeTag(i)}
          >
            x
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder="Add tag..."
        className={styles.input}
      />
    </div>
  );
};
