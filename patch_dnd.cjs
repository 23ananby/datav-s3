const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert states
code = code.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [dragActive, setDragActive] = useState(false);\n  const [droppedFile, setDroppedFile] = useState<File | null>(null);"
);

// Insert handlers before handleFileUpload
code = code.replace(
  "const handleFileUpload = async ",
  `const handleDrag = function(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDroppedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async `
);

// Add handlers to root div
code = code.replace(
  '<div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">',
  '<div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>'
);

// Add drag overlay and modal inside the root div
const uiToAdd = `
      {dragActive && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 border-4 border-dashed border-blue-500 pointer-events-none rounded-xl m-4 flex items-center justify-center">
           <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <UploadCloud className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-medium text-blue-700">Suelta el archivo aquí</span>
           </div>
        </div>
      )}
      {droppedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              ¿Este archivo es para Tienda o Bodega Central?
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center truncate" title={droppedFile.name}>
              {droppedFile.name}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const ev = { target: { files: [droppedFile] } };
                  handleFileUpload(ev as any);
                  setDroppedFile(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Store className="h-5 w-5" />
                Tienda (General)
              </button>
              <button 
                onClick={() => {
                  const ev = { target: { files: [droppedFile] } };
                  handleBodegaCentralFileUpload(ev as any);
                  setDroppedFile(null);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Warehouse className="h-5 w-5" />
                Bodega Central
              </button>
              <button 
                onClick={() => setDroppedFile(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded transition-colors mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '<div className="max-w-7xl mx-auto space-y-6">',
  uiToAdd + '\n      <div className="max-w-7xl mx-auto space-y-6">'
);

fs.writeFileSync('src/App.tsx', code);
