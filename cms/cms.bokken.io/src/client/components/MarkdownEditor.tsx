import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = ({ value, onChange }: Props) => (
  <Editor
    height="100%"
    defaultLanguage="markdown"
    value={value}
    onChange={(v) => onChange(v ?? "")}
    options={{
      wordWrap: "on",
      minimap: { enabled: false },
      lineNumbers: "off",
      fontSize: 14,
    }}
  />
);
