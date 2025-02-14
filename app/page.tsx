"use client";
import { useState } from "react";
import Editor from "../components/Editor";

export default function Home() {
  const [code, setCode] = useState("// Write JavaScript here...");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  return (
    <div className="p-6 grid md:grid-cols-2 gap-2">
      <Editor code={code} setCode={setCode} setOutput={setOutput} setLogs={setLogs} />

      <div className="bg-black text-white p-3 rounded-lg min-h-[100px] h-[600px] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Console Output:</h2>
        
        {/* Display console logs */}
        <div className="text-green-400 ">
          {logs.length > 0 ? logs.map((log, index) => (
            <p key={index}>✅ {log}</p>
          )) : <p>No console output</p>}
        </div>

        {/* Display final output */}
        <p className="mt-2 text-blue-400 ">🔹 Output: {output}</p>
      </div>
    </div>
  );
}
