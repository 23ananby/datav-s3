const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bodegaUploadUI = `
            {/* Bodega Central Upload Area */}
            {data.length > 0 && !bodegaCentralData.length && !isParsingBodegaCentral && (
              <label className="relative flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex items-center space-x-2">
                  <Warehouse className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Subir Bodega Central</span>
                </div>
                <input type="file" accept=".xlsx" className="sr-only" onChange={handleBodegaCentralFileUpload} />
              </label>
            )}

            {isParsingBodegaCentral && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-md border border-gray-200 shadow-sm">
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Procesando...</span>
              </div>
            )}

            {bodegaCentralData.length > 0 && (
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
                <Warehouse className="h-5 w-5 text-purple-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Bodega Central</span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] leading-none">{bodegaCentralFileName}</span>
                </div>
                <button onClick={removeBodegaCentralFile} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors" title="Quitar bodega central">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
`;

code = code.replace("{/* Aux Upload Area */}", bodegaUploadUI + "\n            {/* Aux Upload Area */}");

fs.writeFileSync('src/App.tsx', code);
