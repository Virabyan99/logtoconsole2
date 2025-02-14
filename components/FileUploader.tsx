import { useRef } from "react";

interface FileUploaderProps {
  onFileLoad: (name: string, content: string) => void;
}

const FileUploader = ({ onFileLoad }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ["js", "json", "txt"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert("❌ Error: Only .js, .json, and .txt files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || (e.target.result as string).trim() === "") {
        alert("❌ Error: File is empty or invalid.");
        return;
      }

      const content = e.target.result as string;
      saveToRecentFiles(file.name, content);
      onFileLoad(file.name, content);
    };
    reader.readAsText(file);
  };

  const saveToRecentFiles = (name: string, content: string) => {
    const recentFiles = JSON.parse(localStorage.getItem("recentFiles") || "[]");
    const updatedFiles = [{ name, content }, ...recentFiles].slice(0, 5);
    localStorage.setItem("recentFiles", JSON.stringify(updatedFiles));
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
      >
        Upload File
      </button>
    </div>
  );
};

export default FileUploader;
