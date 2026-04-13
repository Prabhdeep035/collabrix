import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  const [code, setCode] = useState("");

  return (
    <Editor
      height="500px"
      defaultLanguage="javascript"
      theme="vs-dark"
      onChange={(value) => setCode(value)}
    />
  );
}