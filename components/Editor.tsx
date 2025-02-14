"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import Sandbox from "./Sandbox";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface EditorProps {
  code: string;
  setCode: (value: string) => void;
  setOutput: (value: string) => void;
  setLogs: (logs: string[]) => void;
}

const Editor = ({ code, setCode, setOutput, setLogs }: EditorProps) => {
  const editorRef = useRef<any>(null);
  const sandbox = new Sandbox();

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("editorCode");
    if (savedCode) setCode(savedCode);
  }, []);

  // Handle editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      localStorage.setItem("editorCode", value);
    }
  };

  // Format Code using Prettier
  const formatCode = async () => {
    try {
      const formatted = await prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel, parserEstree],
        semi: true,
        singleQuote: false,
      });

      setCode(formatted);
      localStorage.setItem("editorCode", formatted);
    } catch (error) {
      console.error("Prettier formatting error:", error);
    }
  };

  // Run Code Securely
  const runCode = () => {
    sandbox.executeCode(code, (result) => {
      if (result.error) {
        setOutput(`❌ Error: ${result.error}`);
        setLogs([]);
      } else {
        setOutput(result.output);
        setLogs(result.logs || []);
      }
    });
  };

  return (
    <div className="relative bg-[#12121a] rounded-xl border border-white/[0.05] p-4 min-h-[300px] md:h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white text-sm font-medium">Code Editor</div>
        <div className="flex gap-2">
          <button onClick={formatCode} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Format
          </button>
          <button onClick={runCode} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">
            Run
          </button>
        </div>
      </div>

      <MonacoEditor
        height="500px"
        language="javascript"
        theme="vs-dark"
        value={code}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor; // Store editor instance in ref
        }}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default Editor;
