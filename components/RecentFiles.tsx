"use client"
import { useEffect, useState } from "react";

interface RecentFilesProps {
  onLoadRecentFile: (name: string, content: string) => void;
}

const RecentFiles = ({ onLoadRecentFile }: RecentFilesProps) => {
  const [recentFiles, setRecentFiles] = useState<{ name: string; content: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFiles = JSON.parse(localStorage.getItem("recentFiles") || "[]");
      setRecentFiles(storedFiles);
    }
  }, []);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Recent Files</h3>
      {recentFiles.length === 0 ? (
        <p className="text-gray-400">No recent files.</p>
      ) : (
        <ul className="space-y-2">
          {recentFiles.map((file, index) => (
            <li key={index}>
              <button
                onClick={() => onLoadRecentFile(file.name, file.content)}
                className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentFiles;
