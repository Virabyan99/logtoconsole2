"use client";
import { useState } from "react";
import Editor from "../components/Editor";
import FileUploader from "../components/FileUploader";
import RecentFiles from "../components/RecentFiles";
import ChatView from "@/components/ChatView";

export default function Home() {
  const [code, setCode] = useState("// Write JavaScript here...");
  const [fileName, setFileName] = useState("Untitled.js");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const handleFileLoad = (name: string, content: string) => {
    setFileName(name);
    setCode(content);
  };

  return (
    <div className="p-6 grid md:grid-cols-2 gap-2">
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <FileUploader onFileLoad={handleFileLoad} />
          <RecentFiles onLoadRecentFile={handleFileLoad} />
        </div>
        <p className="text-sm text-gray-400"><strong>Editing File:</strong> {fileName}</p>
        <Editor code={code} setCode={setCode} setOutput={setOutput} setLogs={setLogs} />
      </div>

      <div className="bg-black text-white p-3 rounded-lg min-h-[100px] h-[600px] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Console Output:</h2>
        
        {/* Display console logs */}
        <div className="text-green-400">
          {logs.length > 0 ? logs.map((log, index) => (
            <p key={index}>✅ {log}</p>
          )) : <p>No console output</p>}
        </div>

        {/* Display final output */}
        <p className="mt-2  text-blue-400">🔹 Output: {output}</p>
      </div>
      <ChatView/>
    </div>
  );
}
