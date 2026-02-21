import { useRef, DragEvent } from "react";
import { uploadImage } from "../api/articles.js";
import styles from "./ImageUploader.module.css";

interface Props {
  branchName: string;
  date: string;
  onInsert: (markdown: string) => void;
}

export const ImageUploader = ({ branchName, date, onInsert }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const path = await uploadImage(branchName, date, file);
      onInsert(`![${file.name}](${path})`);
    } catch {
      alert("Failed to upload image");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = () => {
    const file = inputRef.current?.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={styles.dropzone}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleChange}
      />
      <span className={styles.label}>Drop image or click to upload</span>
    </div>
  );
};
