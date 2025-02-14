interface RecentFilesProps {
    onLoadRecentFile: (name: string, content: string) => void;
  }
  
  const RecentFiles = ({ onLoadRecentFile }: RecentFilesProps) => {
    const recentFiles = JSON.parse(localStorage.getItem("recentFiles") || "[]");
  
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Recent Files</h3>
        {recentFiles.length === 0 ? (
          <p className="text-gray-400">No recent files.</p>
        ) : (
          <ul className="space-y-2">
            {recentFiles.map((file: { name: string; content: string }, index: number) => (
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
  