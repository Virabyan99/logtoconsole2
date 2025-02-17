import { useRef } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileLoad: (name: string, content: string) => void;
}

const FileUploader = ({ onFileLoad }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const CHUNK_SIZE = 1024 * 100; // 100KB chunks

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    let offset = 0;
    let content = "";

    reader.onload = (e) => {
      content += e.target.result as string;
      offset += CHUNK_SIZE;

      if (offset < file.size) {
        readNextChunk();
      } else {
        onFileLoad(file.name, content);
      }
    };

    const readNextChunk = () => {
      const blob = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsText(blob);
    };

    readNextChunk();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2   rounded-full bg-transparent  transition duration-300 "
      >
        
       <Upload/>
      </Button>
    </div>
  );
};

export default FileUploader;
